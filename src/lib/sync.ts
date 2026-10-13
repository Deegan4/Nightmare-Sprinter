import type { Rec } from '../../shared/types';
import { seedRecords } from '../../shared/seed';
import { idbAll, idbDel, idbGet, idbKeys, idbPut, idbPutMany } from './idb';
import { applyRemote, get, loadLocal, onChange, save, setKick, setStatus, status, type Me } from './store';

export const DEMO = import.meta.env.VITE_DEMO === '1';

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { ...(init.body && typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(init.headers ?? {}) },
  });
  const body: any = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

let timer: number | undefined;
let running = false;
let again = false;

async function pushOutbox() {
  const out = await idbAll<Rec>('outbox');
  for (let i = 0; i < out.length; i += 200) {
    const batch = out.slice(i, i + 200);
    const res = await api<{ accepted: string[] }>('/api/push', { method: 'POST', body: JSON.stringify({ records: batch }) });
    // Only clear entries that were not edited again while the request was in flight.
    const done: string[] = [];
    for (const r of batch) {
      const now = await idbGet<Rec>('outbox', r.id);
      if (now && now.updated_at === r.updated_at && res.accepted.includes(r.id)) done.push(r.id);
    }
    await idbDel('outbox', done);
  }
}

async function uploadBlobs() {
  const keys = await idbKeys('blobs');
  for (const id of keys) {
    const entry = await idbGet<{ blob: Blob; uploaded: boolean }>('blobs', id);
    if (!entry || entry.uploaded) continue;
    await uploadWithProgress(id, entry.blob);
    await idbPut('blobs', id, { ...entry, uploaded: true });
    const rec = get(id);
    if (rec && !rec.data.uploaded) await save('photo', { ...rec.data, uploaded: true }, id);
  }
}

function uploadWithProgress(id: string, blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/photos/${encodeURIComponent(id)}`);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setStatus({ uploads: { ...status.uploads, [id]: e.loaded / e.total } }); };
    xhr.onload = () => {
      const { [id]: _, ...rest } = status.uploads;
      setStatus({ uploads: rest });
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed: no connection'));
    xhr.send(blob);
  });
}

async function pull() {
  let since = (await idbGet<number>('meta', 'seq')) ?? 0;
  for (;;) {
    const res = await api<{ records: Rec[]; seq: number; more: boolean }>(`/api/sync?since=${since}`);
    const pending = new Set(await idbKeys('outbox'));
    await applyRemote(res.records, pending);
    since = res.seq;
    await idbPut('meta', 'seq', since);
    if (!res.more) break;
  }
}

export async function syncNow() {
  if (DEMO || status.auth !== 'in') return;
  if (running) { again = true; return; }
  running = true;
  setStatus({ syncing: true });
  try {
    await pushOutbox();
    // Photo upload problems (no connection, storage not set up) must never block readings and notes.
    await uploadBlobs().catch(() => {});
    await pull();
    setStatus({ online: true, error: '', lastSync: Date.now(), pending: (await idbKeys('outbox')).length });
  } catch (e) {
    setStatus({ online: !(e instanceof TypeError) && navigator.onLine, error: (e as Error).message, pending: (await idbKeys('outbox')).length });
  } finally {
    running = false;
    setStatus({ syncing: false });
    if (again) { again = false; syncNow(); }
  }
}

function schedule() {
  clearInterval(timer);
  timer = window.setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 5000);
}

export async function boot() {
  await loadLocal();
  if (DEMO) {
    if (!get('v1')) await idbPutMany('records', seedRecords().map((r) => [r.id, r] as [string, Rec]));
    await loadLocal();
    setStatus({ auth: 'demo', me: { display_name: (await idbGet<string>('meta', 'demoName')) ?? 'Kollin' } });
    return;
  }
  setKick(() => { window.setTimeout(syncNow, 50); });
  const me = await idbGet<Me | null>('meta', 'me');
  if (!me?.display_name) { setStatus({ auth: 'needsName', me: null }); return; }
  setStatus({ auth: 'in', me });
  startLoop();
}

let started = false;
function startLoop() {
  syncNow();
  if (started) return;
  started = true;
  schedule();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', () => { setStatus({ online: true }); syncNow(); });
  window.addEventListener('offline', () => setStatus({ online: false }));
}

/** Remember who is using this phone (shown on their readings and notes). */
export async function setName(name: string) {
  const me = { display_name: name.trim().slice(0, 40) };
  await idbPut('meta', 'me', me);
  const first = status.auth !== 'in';
  setStatus({ auth: 'in', me });
  if (first) { location.hash = '#/'; startLoop(); }
  onChange();
}
