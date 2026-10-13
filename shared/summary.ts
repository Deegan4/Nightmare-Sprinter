import type { Rec, Vehicle, Fact, Step, Reading, Rule, Suspect, FaultCode, Evidence, Note, ReferencePage } from './types';
import { CONDITIONS } from './types';

const P = (p: string) => (p === 'SOURCE' ? '[SOURCE, unverified for this VIN]' : `[${p}]`);
const cond = (c: string) => CONDITIONS.find((x) => x.key === c)?.label ?? c;
const day = (t: number) => new Date(t).toISOString().replace('T', ' ').slice(0, 16) + 'Z';

/** Plain-text summary for pasting into a chat with Claude or a mechanic. */
export function buildSummary(all: Rec[]): string {
  const live = all.filter((r) => !r.deleted);
  const of = <T>(k: string) => live.filter((r) => r.kind === k) as Rec<T>[];
  const v = of<Vehicle>('vehicle')[0]?.data;
  const steps = of<Step>('step').sort((a, b) => a.data.position - b.data.position);
  const rules = new Map(of<Rule>('rule').map((r) => [r.id, r.data]));
  const stepTitle = new Map(steps.map((s) => [s.id, s.data.title]));
  const L: string[] = [];

  L.push('VAN FIX SUMMARY', `Generated ${day(Date.now())}`, '');
  L.push('Provenance labels: CONFIRMED = verified on this van; REPORTED = told/scan report; HYPOTHESIS = to test; SOURCE = general manual, unverified for this VIN; UNKNOWN = not yet known.', '');
  if (v) {
    L.push('== VEHICLE ==', `${v.year} ${v.make_model}, ${v.engine}, ${v.mileage} miles [CONFIRMED]`, `VIN ${v.vin} [CONFIRMED]`);
    if (v.notes) L.push(v.notes);
    L.push('');
  }
  L.push('== FACTS ==');
  of<Fact>('fact').forEach((f) => L.push(`- ${P(f.data.provenance)} ${f.data.text}${f.data.source ? ` (source: ${f.data.source})` : ''}`));
  L.push('');

  const next = steps.find((s) => s.data.status !== 'done' && s.data.status !== 'skipped');
  L.push('== TEST PLAN ==');
  steps.forEach((s) => L.push(`${s.data.position}. [${s.data.status.toUpperCase()}] ${s.data.title}${s.data.notes ? ` | notes: ${s.data.notes}` : ''}`));
  L.push(`Current step: ${next ? next.data.title : 'all steps done or skipped'}`, '');

  L.push('== READINGS ==');
  const readings = of<Reading>('reading').sort((a, b) => a.created_at - b.created_at);
  if (!readings.length) L.push('(none yet)');
  readings.forEach((r) => {
    const d = r.data;
    const rule = d.rule_id ? rules.get(d.rule_id) : undefined;
    const verdict = d.result === 'none' ? '' : ` -> ${d.result.toUpperCase()} vs rule "${rule?.label ?? d.rule_id}" (${d.result === 'pass' ? 'meets' : d.result === 'fail' ? 'does not meet' : 'check'} the rule; not a parts verdict)`;
    L.push(`- ${P(d.provenance)} ${d.label}: ${d.value} ${d.unit}, ${cond(d.condition)}${verdict}. By ${d.entered_by}, ${day(r.created_at)}${d.step_id ? `, step "${stepTitle.get(d.step_id) ?? ''}"` : ''}${d.note ? `. Note: ${d.note}` : ''}`);
  });
  L.push('');

  L.push('== SUSPECTS (open) ==');
  const ev = of<Evidence>('evidence');
  of<Suspect>('suspect').filter((s) => s.data.state !== 'ruled_out').sort((a, b) => a.data.position - b.data.position).forEach((s) => {
    L.push(`- ${P(s.data.provenance)} ${s.data.title}: ${s.data.state.replace('_', ' ')}. ${s.data.summary}`);
    ev.filter((e) => e.data.suspect_id === s.id).forEach((e) => L.push(`    evidence ${e.data.direction}: ${e.data.text}`));
    L.push(`    would change my mind: ${s.data.change_my_mind}`);
  });
  const ruled = of<Suspect>('suspect').filter((s) => s.data.state === 'ruled_out');
  if (ruled.length) L.push(`Ruled out: ${ruled.map((s) => s.data.title).join('; ')}`);
  L.push('');

  L.push('== FAULT CODES ==');
  of<FaultCode>('fault_code').forEach((c) => L.push(`- ${P(c.data.provenance)} ${c.data.module} ${c.data.code}${c.data.description ? ` (${c.data.description})` : ''}, status ${c.data.status}, read ${c.data.date_read}, source: ${c.data.source}${c.data.note ? `. ${c.data.note}` : ''}`));
  L.push('');

  const notes = of<Note>('note').sort((a, b) => a.created_at - b.created_at);
  if (notes.length) {
    L.push('== NOTES ==');
    notes.forEach((n) => L.push(`- ${day(n.created_at)} ${n.created_by}: ${n.data.text}`));
    L.push('');
  }
  L.push('== PASS/FAIL RULES ==');
  of<Rule>('rule').forEach((r) => L.push(`- ${P(r.data.provenance)} ${r.data.label}: ${r.data.comparator === 'max' ? `meets at ${r.data.a} V or less` : r.data.comparator === 'min' ? `meets at ${r.data.a} V or more` : `meets between ${r.data.a} and ${r.data.b} V`}. ${r.data.explanation} (${r.data.source})`));
  L.push('');
  L.push('== REFERENCE PAGES ==');
  of<ReferencePage>('reference_page').sort((a, b) => a.data.position - b.data.position)
    .forEach((r) => L.push(`- ${P(r.data.provenance)} ${r.data.title}, ${r.data.figure}, source: ${r.data.source_name}`));
  return L.join('\n');
}
