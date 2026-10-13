// Minimal promise wrapper around IndexedDB. Stores: records, outbox, blobs, meta.
const DB_NAME = 'vanfix';
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of ['records', 'outbox', 'blobs', 'meta']) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

// If IndexedDB is unavailable (private mode, sandboxed preview), keep data in memory for this visit.
const mem: Record<string, Map<string, unknown>> = { records: new Map(), outbox: new Map(), blobs: new Map(), meta: new Map() };
let memOnly = false;
async function ready(): Promise<IDBDatabase | null> {
  if (memOnly) return null;
  try { return await open(); } catch { memOnly = true; return null; }
}

type Store = 'records' | 'outbox' | 'blobs' | 'meta';
const wrap = <T>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function idbGet<T>(store: Store, key: string): Promise<T | undefined> {
  const db = await ready();
  if (!db) return mem[store].get(key) as T | undefined;
  return wrap(db.transaction(store).objectStore(store).get(key));
}
export async function idbAll<T>(store: Store): Promise<T[]> {
  const db = await ready();
  if (!db) return [...mem[store].values()] as T[];
  return wrap(db.transaction(store).objectStore(store).getAll());
}
export async function idbKeys(store: Store): Promise<string[]> {
  const db = await ready();
  if (!db) return [...mem[store].keys()];
  return wrap(db.transaction(store).objectStore(store).getAllKeys()) as Promise<string[]>;
}
export async function idbPutMany(store: Store, entries: [string, unknown][]): Promise<void> {
  if (!entries.length) return;
  const db = await ready();
  if (!db) { entries.forEach(([k, v]) => mem[store].set(k, v)); return; }
  const tx = db.transaction(store, 'readwrite');
  const os = tx.objectStore(store);
  for (const [k, v] of entries) os.put(v, k);
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export const idbPut = (store: Store, key: string, val: unknown) => idbPutMany(store, [[key, val]]);
export async function idbDel(store: Store, keys: string[]): Promise<void> {
  if (!keys.length) return;
  const db = await ready();
  if (!db) { keys.forEach((k) => mem[store].delete(k)); return; }
  const tx = db.transaction(store, 'readwrite');
  for (const k of keys) tx.objectStore(store).delete(k);
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export async function idbClear(): Promise<void> {
  const db = await ready();
  if (!db) { Object.values(mem).forEach((m) => m.clear()); return; }
  const tx = db.transaction(['records', 'outbox', 'blobs', 'meta'], 'readwrite');
  for (const s of ['records', 'outbox', 'blobs', 'meta'] as Store[]) tx.objectStore(s).clear();
  return new Promise((res) => { tx.oncomplete = () => res(); });
}
