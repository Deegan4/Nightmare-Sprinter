// Read helpers over the local store.
import type { Reading, Rec, Rule, Step, Suspect, Photo, Zone, ReferencePage, FaultCode, Evidence, Note } from '../../shared/types';
import { get, list } from './store';

export const steps = () => list<Step>('step').sort((a, b) => a.data.position - b.data.position);
export const nextStep = () => steps().find((s) => s.data.status === 'doing') ?? steps().find((s) => s.data.status === 'todo');
export const rules = () => list<Rule>('rule');
export const rule = (id?: string) => get<Rule>(id);
export const readings = (stepId?: string) => list<Reading>('reading').filter((r) => !stepId || r.data.step_id === stepId).sort((a, b) => b.created_at - a.created_at);
export const suspects = () => list<Suspect>('suspect').sort((a, b) => a.data.position - b.data.position);
export const evidence = (sid: string) => list<Evidence>('evidence').filter((e) => e.data.suspect_id === sid).sort((a, b) => a.created_at - b.created_at);
export const photos = (pred: (p: Photo) => boolean) => list<Photo>('photo').filter((p) => pred(p.data)).sort((a, b) => b.created_at - a.created_at);
export const zones = () => list<Zone>('zone').sort((a, b) => a.data.position - b.data.position);
export const refs = () => list<ReferencePage>('reference_page').sort((a, b) => a.data.position - b.data.position);
export const codes = () => list<FaultCode>('fault_code').sort((a, b) => a.data.module.localeCompare(b.data.module) || a.created_at - b.created_at);
export const notes = (stepId?: string) => list<Note>('note').filter((n) => !stepId || n.data.step_id === stepId).sort((a, b) => b.created_at - a.created_at);
export type { Rec };
