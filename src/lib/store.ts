import { useEffect, useState } from 'preact/hooks';
import type { Kind, Rec } from '../../shared/types';
import { VEHICLE_ID } from '../../shared/seed';
import { idbAll, idbKeys, idbPut, idbPutMany } from './idb';

export interface Me { display_name: string }
/** 'needsName' = first visit on this phone: ask who is using it. No accounts. */
export type Auth = 'loading' | 'in' | 'needsName' | 'demo';
export interface Status { auth: Auth; me: Me | null; online: boolean; pending: number; syncing: boolean; lastSync: number; error: string; uploads: Record<string, number> }

const records = new Map<string, Rec>();
export const status: Status = { auth: 'loading', me: null, online: navigator.onLine, pending: 0, syncing: false, lastSync: 0, error: '', uploads: {} };
let version = 0;
const listeners = new Set<() => void>();
let kickSync: () => void = () => {};

export function onChange() { version++; listeners.forEach((l) => l()); }
export function setKick(fn: () => void) { kickSync = fn; }
export function setStatus(p: Partial<Status>) { Object.assign(status, p); onChange(); }

/** Re-render the calling component whenever local data or sync status changes. */
export function useStore(): number {
  const [, set] = useState(version);
  useEffect(() => { const l = () => set(version); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return version;
}

export async function loadLocal() {
  const all = await idbAll<Rec>('records');
  records.clear();
  all.forEach((r) => records.set(r.id, r));
  status.pending = (await idbAll('outbox')).length;
  onChange();
}

export function list<T = any>(kind: Kind, includeDeleted = false): Rec<T>[] {
  const out: Rec<T>[] = [];
  records.forEach((r) => { if (r.kind === kind && (includeDeleted || !r.deleted)) out.push(r as Rec<T>); });
  return out;
}
export const get = <T = any>(id?: string | null): Rec<T> | undefined => (id ? (records.get(id) as Rec<T> | undefined) : undefined);
export const allRecords = () => [...records.values()];
export const hasData = () => records.size > 0;

/** Apply records that came from the server. Last write wins by updated_at. */
export async function applyRemote(recs: Rec[], pendingIds: Set<string>) {
  const keep: [string, Rec][] = [];
  for (const r of recs) {
    const cur = records.get(r.id);
    if (pendingIds.has(r.id) && cur && cur.updated_at > r.updated_at) continue; // our unsent edit is newer
    if (cur && cur.updated_at > r.updated_at) continue;
    records.set(r.id, r);
    keep.push([r.id, r]);
  }
  await idbPutMany('records', keep);
  if (keep.length) onChange();
}

export const uid = (p = '') => p + (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
export const myName = () => status.me?.display_name ?? 'Someone';

/** Save locally first (records + outbox), then nudge sync. Never loses a write. */
export async function save<T>(kind: Kind, data: T, id?: string, opts: { deleted?: boolean } = {}): Promise<Rec<T>> {
  const now = Date.now();
  const cur = id ? records.get(id) : undefined;
  const r: Rec<T> = {
    id: id ?? uid(kind.slice(0, 3) + '-'), kind, vehicle_id: VEHICLE_ID, data,
    created_at: cur?.created_at ?? now, updated_at: Math.max(now, (cur?.updated_at ?? 0) + 1),
    created_by: cur?.created_by ?? myName(), deleted: opts.deleted ?? false,
  };
  records.set(r.id, r);
  await idbPutMany('records', [[r.id, r]]);
  if (status.auth !== 'demo') {
    await idbPut('outbox', r.id, r);
    status.pending = (await idbKeys('outbox')).length;
  }
  onChange();
  kickSync();
  return r;
}

export async function patch<T>(id: string, changes: Partial<T>) {
  const cur = records.get(id);
  if (!cur) return;
  return save<T>(cur.kind, { ...(cur.data as T), ...changes }, id);
}
export async function remove(id: string) {
  const cur = records.get(id);
  if (cur) await save(cur.kind, cur.data, id, { deleted: true });
}

/** Append-only timeline entry. */
export function logEvent(type: string, ref_kind: Kind, ref_id: string, summary: string) {
  return save('event', { type, ref_kind, ref_id, summary, actor: myName() });
}
