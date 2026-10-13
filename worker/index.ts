import { Hono } from 'hono';
import type { Rec } from '../shared/types';
import { RETIRED_SEED_IDS, seedRecords } from '../shared/seed';

export interface Env {
  DB: D1Database;
  /** Optional: without R2, files are stored in D1 (blob_chunks). */
  BUCKET?: R2Bucket;
  ASSETS: Fetcher;
  /** Set to "1" to serve the manual page images. Off by default: the app is open to anyone with the URL,
   *  and the third-party workshop manuals must not be published. */
  SERVE_MANUALS?: string;
}
type Ctx = { Bindings: Env };

const KINDS = new Set(['vehicle', 'fact', 'step', 'reading', 'rule', 'suspect', 'evidence', 'fault_code', 'reference_page', 'zone', 'photo', 'note', 'event', 'fuse']);
const MAX_PHOTO = 8 * 1024 * 1024;


/** Insert any seed records that are missing (new seed content reaches existing installs; edits are never overwritten). */
async function ensureSeeded(db: D1Database) {
  const seed = seedRecords();
  const { results } = await db.prepare("SELECT id FROM records WHERE created_by = 'seed'").all<{ id: string }>();
  const have = new Set(results.map((r) => r.id));
  await upsert(db, seed.filter((r) => !have.has(r.id)));
  // Retire seed records that later seed content replaced, unless someone edited them.
  const retired = await db.prepare(
    `SELECT * FROM records WHERE created_by = 'seed' AND deleted = 0 AND id IN (${RETIRED_SEED_IDS.map(() => '?').join(',')})`,
  ).bind(...RETIRED_SEED_IDS).all<any>();
  const stale = retired.results.filter((r) => r.updated_at === r.created_at);
  if (stale.length) await upsert(db, stale.map((r) => ({ ...r, data: JSON.parse(r.data), deleted: true, updated_at: Date.now() })));
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

// Create tables on first use, so a fresh deploy works even if migrations were never run.
// Mirrors migrations/0001_init.sql (all statements are idempotent).
const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, vehicle_id TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, created_by TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, seq INTEGER NOT NULL)',
  'CREATE INDEX IF NOT EXISTS records_seq ON records(seq)',
  'CREATE INDEX IF NOT EXISTS records_kind ON records(vehicle_id, kind)',
  'CREATE TABLE IF NOT EXISTS counter (name TEXT PRIMARY KEY, value INTEGER NOT NULL)',
  "INSERT OR IGNORE INTO counter (name, value) VALUES ('seq', 0)",
  'CREATE TABLE IF NOT EXISTS rate (ip TEXT NOT NULL, win INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (ip, win))',
  'CREATE TABLE IF NOT EXISTS blob_chunks (key TEXT NOT NULL, idx INTEGER NOT NULL, content_type TEXT NOT NULL, data BLOB NOT NULL, PRIMARY KEY (key, idx))',
];
let schemaReady: Promise<unknown> | null = null;
const ensureSchema = (db: D1Database) => (schemaReady ??= db.batch(SCHEMA.map((q) => db.prepare(q))).catch((e) => { schemaReady = null; throw e; }));

// ---------- file storage: R2 when bound, otherwise chunked rows in D1 ----------
const CHUNK = 1024 * 1024;
export async function putFile(env: Env, key: string, body: ArrayBuffer, type: string) {
  if (env.BUCKET) { await env.BUCKET.put(key, body, { httpMetadata: { contentType: type } }); return; }
  const stmts = [env.DB.prepare('DELETE FROM blob_chunks WHERE key = ?').bind(key)];
  for (let i = 0, n = 0; i < Math.max(body.byteLength, 1); i += CHUNK, n++) {
    stmts.push(env.DB.prepare('INSERT INTO blob_chunks (key, idx, content_type, data) VALUES (?, ?, ?, ?)').bind(key, n, type, body.slice(i, i + CHUNK)));
  }
  await env.DB.batch(stmts);
}
export async function getFile(env: Env, key: string): Promise<{ body: BodyInit; type: string } | null> {
  if (env.BUCKET) {
    const obj = await env.BUCKET.get(key);
    return obj ? { body: obj.body, type: obj.httpMetadata?.contentType ?? 'application/octet-stream' } : null;
  }
  const { results } = await env.DB.prepare('SELECT content_type, data FROM blob_chunks WHERE key = ? ORDER BY idx').bind(key).all<{ content_type: string; data: ArrayBuffer | number[] }>();
  if (!results.length) return null;
  const parts = results.map((r) => (r.data instanceof ArrayBuffer ? new Uint8Array(r.data) : new Uint8Array(r.data)));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return { body: out, type: results[0].content_type };
}

const app = new Hono<Ctx>();

app.use('/api/*', async (c, next) => { await ensureSchema(c.env.DB); await next(); });

app.use('*', async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
  c.header('Cache-Control', c.res.headers.get('Cache-Control') ?? 'no-store');
});

// Open app: no accounts. Writes are rate-limited per IP so a stray script can't flood the database.
app.on(['POST', 'PUT'], '/api/*', async (c, next) => {
  if (await rateLimited(c, 600)) return c.json({ error: 'Too many changes from this connection. Try again in a few minutes.' }, 429);
  await next();
});

app.get('/api/sync', async (c) => {
  if (!Number(c.req.query('since'))) await ensureSeeded(c.env.DB);
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
    r.created_by = String(r.created_by || 'Someone').slice(0, 40);
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
  await putFile(c.env, `photos/${id}.jpg`, body, 'image/jpeg');
  return c.json({ ok: true });
});

async function serveObject(c: any, key: string) {
  const obj = await getFile(c.env, key);
  if (!obj) return c.json({ error: 'not found' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.type,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
app.get('/api/photos/:id', (c) => serveObject(c, `photos/${c.req.param('id')}.jpg`));
app.get('/api/ref-image/*', (c) => {
  if (c.env.SERVE_MANUALS !== '1') return c.json({ error: 'Manual pages are not published on the open app.' }, 403);
  const key = c.req.path.slice('/api/ref-image/'.length);
  if (!/^ref\/[\w./-]+$/.test(key) || key.includes('..')) return c.json({ error: 'bad key' }, 400);
  return serveObject(c, key);
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
    await ensureSchema(env.DB);
    const data = await exportAll(env.DB);
    await putFile(env, `backups/${data.exported_at.slice(0, 10)}.json`, new TextEncoder().encode(JSON.stringify(data)).buffer as ArrayBuffer, 'application/json');
    if (!env.BUCKET) {
      // Keep the last 7 nightly backups when they live in D1.
      const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
      await env.DB.prepare("DELETE FROM blob_chunks WHERE key LIKE 'backups/%' AND key < ?").bind(`backups/${cutoff}`).run();
    }
  },
};
