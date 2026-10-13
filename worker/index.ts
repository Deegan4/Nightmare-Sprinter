import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Rec } from '../shared/types';
import { seedRecords } from '../shared/seed';

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  OWNER_KEY?: string;
}
interface Member { id: string; display_name: string; role: 'owner' | 'collaborator' }
type Ctx = { Bindings: Env; Variables: { member: Member } };

const COOKIE = 'vf_session';
const KINDS = new Set(['vehicle', 'fact', 'step', 'reading', 'rule', 'suspect', 'evidence', 'fault_code', 'reference_page', 'zone', 'photo', 'note', 'event']);
const MAX_PHOTO = 8 * 1024 * 1024;

const enc = new TextEncoder();
export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function randomToken(bytes = 32): string {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function ensureSeeded(db: D1Database) {
  const has = await db.prepare("SELECT 1 FROM records WHERE kind = 'vehicle' LIMIT 1").first();
  if (has) return;
  await upsert(db, seedRecords());
}

/** Last-write-wins upsert. Client-generated ids make retries idempotent (no duplicates). */
async function upsert(db: D1Database, recs: Rec[]): Promise<number> {
  if (!recs.length) return 0;
  // Sequence numbers are assigned inside the same transaction (D1 batch) so a
  // reader can never see seq N+1 committed before seq N.
  const stmts = recs.map((r, i) =>
    db.prepare(
      `INSERT INTO records (id, kind, vehicle_id, data, created_at, updated_at, created_by, deleted, seq)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, (SELECT value FROM counter WHERE name = 'seq') + ?9)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at,
         deleted = excluded.deleted, seq = excluded.seq
       WHERE excluded.updated_at >= records.updated_at AND records.kind <> 'event'`,
    ).bind(r.id, r.kind, r.vehicle_id, JSON.stringify(r.data), r.created_at, r.updated_at, r.created_by, r.deleted ? 1 : 0, i + 1),
  );
  stmts.push(db.prepare("UPDATE counter SET value = value + ? WHERE name = 'seq' RETURNING value").bind(recs.length));
  const res = await db.batch<{ value: number }>(stmts);
  return res[res.length - 1].results[0]?.value ?? 0;
}

async function rateLimited(c: any, limit = 20): Promise<boolean> {
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  const win = Math.floor(Date.now() / 600_000);
  const row = (await c.env.DB.prepare(
    'INSERT INTO rate (ip, win, n) VALUES (?, ?, 1) ON CONFLICT(ip, win) DO UPDATE SET n = n + 1 RETURNING n',
  ).bind(ip, win).first()) as { n: number } | null;
  return (row?.n ?? 0) > limit;
}

async function startSession(c: any, inviteId: string, name: string, role: string) {
  const session = randomToken();
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare('INSERT INTO members (id, display_name, role, invite_id, session_hash, created_at, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, name, role, inviteId, await sha256(session), now, now).run();
  setCookie(c, COOKIE, session, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return { id, display_name: name, role };
}

const cleanName = (s: unknown) => String(s ?? '').trim().slice(0, 40);

const app = new Hono<Ctx>();

app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
  c.header('Cache-Control', c.res.headers.get('Cache-Control') ?? 'no-store');
});

// ---------- public (no session) ----------
app.post('/api/setup', async (c) => {
  if (await rateLimited(c, 10)) return c.json({ error: 'Too many tries. Wait 10 minutes.' }, 429);
  const { key, name } = await c.req.json().catch(() => ({}));
  if (!c.env.OWNER_KEY || !key || !timingSafeEqual(await sha256(String(key)), await sha256(c.env.OWNER_KEY))) {
    return c.json({ error: 'Owner key is not right.' }, 403);
  }
  if (!cleanName(name)) return c.json({ error: 'Enter your name.' }, 400);
  let owner = await c.env.DB.prepare("SELECT id FROM invites WHERE role = 'owner' AND revoked_at IS NULL LIMIT 1").first<{ id: string }>();
  if (!owner) {
    owner = { id: crypto.randomUUID() };
    await c.env.DB.prepare('INSERT INTO invites (id, token_hash, label, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(owner.id, await sha256(randomToken()), 'Owner setup', 'owner', Date.now()).run();
  }
  await ensureSeeded(c.env.DB);
  return c.json({ member: await startSession(c, owner.id, cleanName(name), 'owner') });
});

app.post('/api/join', async (c) => {
  if (await rateLimited(c)) return c.json({ error: 'Too many tries. Wait 10 minutes.' }, 429);
  const { token, name } = await c.req.json().catch(() => ({}));
  if (!token) return c.json({ error: 'This link is missing its code.' }, 400);
  const inv = await c.env.DB.prepare('SELECT id, role, revoked_at FROM invites WHERE token_hash = ?')
    .bind(await sha256(String(token))).first<{ id: string; role: string; revoked_at: number | null }>();
  if (!inv || inv.revoked_at) return c.json({ error: 'This invite link is not valid any more. Ask Kollin for a new one.' }, 403);
  if (!cleanName(name)) return c.json({ error: 'Enter your name.' }, 400);
  await ensureSeeded(c.env.DB);
  return c.json({ member: await startSession(c, inv.id, cleanName(name), 'collaborator') });
});

// ---------- session required ----------
app.use('/api/*', async (c, next) => {
  const token = getCookie(c, COOKIE);
  if (!token) return c.json({ error: 'signed_out' }, 401);
  const m = await c.env.DB.prepare(
    `SELECT m.id, m.display_name, m.role, m.last_seen FROM members m JOIN invites i ON i.id = m.invite_id
     WHERE m.session_hash = ? AND m.revoked = 0 AND i.revoked_at IS NULL`,
  ).bind(await sha256(token)).first<Member & { last_seen: number }>();
  if (!m) {
    deleteCookie(c, COOKIE, { path: '/' });
    return c.json({ error: 'signed_out' }, 401);
  }
  if (Date.now() - m.last_seen > 60_000) {
    c.executionCtx.waitUntil(c.env.DB.prepare('UPDATE members SET last_seen = ? WHERE id = ?').bind(Date.now(), m.id).run());
  }
  c.set('member', { id: m.id, display_name: m.display_name, role: m.role });
  await next();
});

const ownerOnly = async (c: any, next: any) => (c.get('member').role === 'owner' ? next() : c.json({ error: 'Owner only' }, 403));

app.get('/api/me', (c) => c.json({ member: c.get('member') }));

app.post('/api/me', async (c) => {
  const name = cleanName((await c.req.json().catch(() => ({}))).name);
  if (!name) return c.json({ error: 'Enter a name' }, 400);
  await c.env.DB.prepare('UPDATE members SET display_name = ? WHERE id = ?').bind(name, c.get('member').id).run();
  return c.json({ member: { ...c.get('member'), display_name: name } });
});

app.post('/api/logout', async (c) => {
  await c.env.DB.prepare('UPDATE members SET revoked = 1 WHERE id = ?').bind(c.get('member').id).run();
  deleteCookie(c, COOKIE, { path: '/' });
  return c.json({ ok: true });
});

app.get('/api/sync', async (c) => {
  const since = Number(c.req.query('since') ?? 0) || 0;
  const { results } = await c.env.DB.prepare('SELECT * FROM records WHERE seq > ? ORDER BY seq LIMIT 2000').bind(since).all<any>();
  const records = results.map((r) => ({ ...r, data: JSON.parse(r.data), deleted: !!r.deleted }));
  const seq = records.length ? records[records.length - 1].seq : since;
  return c.json({ records, seq, more: records.length === 2000 });
});

app.post('/api/push', async (c) => {
  const body = await c.req.json<{ records: Rec[] }>().catch(() => ({ records: [] as Rec[] }));
  const recs = (body.records ?? []).filter(
    (r) => r && typeof r.id === 'string' && r.id.length <= 80 && KINDS.has(r.kind) && typeof r.data === 'object' && Number.isFinite(r.updated_at),
  ).slice(0, 500);
  const now = Date.now();
  // Clamp clocks so a phone with a wrong date can't win every future write.
  for (const r of recs) {
    r.updated_at = Math.min(r.updated_at, now + 60_000);
    r.created_at = Math.min(r.created_at ?? now, now + 60_000);
    r.created_by = r.created_by || c.get('member').display_name;
    r.vehicle_id = r.vehicle_id || 'v1';
  }
  const seq = await upsert(c.env.DB, recs);
  return c.json({ accepted: recs.map((r) => r.id), seq });
});

app.put('/api/photos/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[\w-]{1,80}$/.test(id)) return c.json({ error: 'bad id' }, 400);
  const len = Number(c.req.header('content-length') ?? 0);
  if (len > MAX_PHOTO) return c.json({ error: 'Photo too large' }, 413);
  const body = await c.req.arrayBuffer();
  if (body.byteLength > MAX_PHOTO) return c.json({ error: 'Photo too large' }, 413);
  await c.env.BUCKET.put(`photos/${id}.jpg`, body, { httpMetadata: { contentType: 'image/jpeg' } });
  return c.json({ ok: true });
});

async function serveObject(c: any, key: string) {
  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.json({ error: 'not found' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
app.get('/api/photos/:id', (c) => serveObject(c, `photos/${c.req.param('id')}.jpg`));
app.get('/api/ref-image/*', (c) => {
  const key = c.req.path.slice('/api/ref-image/'.length);
  if (!/^ref\/[\w./-]+$/.test(key) || key.includes('..')) return c.json({ error: 'bad key' }, 400);
  return serveObject(c, key);
});

app.get('/api/members', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT m.id, m.display_name, m.role, m.last_seen, i.label AS invite_label FROM members m JOIN invites i ON i.id = m.invite_id
     WHERE m.revoked = 0 AND i.revoked_at IS NULL ORDER BY m.last_seen DESC`,
  ).all();
  return c.json({ members: results });
});

app.get('/api/invites', ownerOnly, async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, label, created_at, revoked_at FROM invites WHERE role <> 'owner' ORDER BY created_at DESC").all();
  return c.json({ invites: results });
});

app.post('/api/invites', ownerOnly, async (c) => {
  const label = cleanName((await c.req.json().catch(() => ({}))).label) || 'Invite';
  const token = randomToken();
  const id = crypto.randomUUID();
  await c.env.DB.prepare('INSERT INTO invites (id, token_hash, label, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, await sha256(token), label, 'collaborator', Date.now()).run();
  // The raw token is only ever returned once; only its hash is stored.
  return c.json({ id, label, token });
});

app.post('/api/invites/:id/revoke', ownerOnly, async (c) => {
  await c.env.DB.prepare("UPDATE invites SET revoked_at = ? WHERE id = ? AND role <> 'owner'").bind(Date.now(), c.req.param('id')).run();
  return c.json({ ok: true });
});

async function exportAll(db: D1Database) {
  const { results } = await db.prepare('SELECT * FROM records ORDER BY seq').all<any>();
  return { exported_at: new Date().toISOString(), records: results.map((r) => ({ ...r, data: JSON.parse(r.data), deleted: !!r.deleted })) };
}

app.get('/api/export', async (c) => {
  const data = await exportAll(c.env.DB);
  return new Response(JSON.stringify(data, null, 1), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="van-fix-export-${data.exported_at.slice(0, 10)}.json"` },
  });
});

app.all('/api/*', (c) => c.json({ error: 'not found' }, 404));

export default {
  fetch: app.fetch,
  async scheduled(_e: ScheduledController, env: Env) {
    const data = await exportAll(env.DB);
    await env.BUCKET.put(`backups/${data.exported_at.slice(0, 10)}.json`, JSON.stringify(data), { httpMetadata: { contentType: 'application/json' } });
  },
};
