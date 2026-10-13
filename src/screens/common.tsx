import type { Reading, Rec, Step } from '../../shared/types';
import { CONDITIONS } from '../../shared/types';
import { evaluate } from '../../shared/rules';
import { Icon } from '../components/icons';
import { Prov, VerdictBadge, ago, ask } from '../components/ui';
import { rule } from '../lib/data';
import { get, logEvent, patch, remove } from '../lib/store';
import { PhotoThumb } from './sheets';
import { useState } from 'preact/hooks';

export const condLabel = (c: string) => CONDITIONS.find((x) => x.key === c)?.label ?? c;

export function ReadingRow({ r, showStep }: { r: Rec<Reading>; showStep?: boolean }) {
  const [open, setOpen] = useState(false);
  const d = r.data;
  const ru = rule(d.rule_id)?.data;
  const ev = evaluate(d.value, d.unit, d.condition, ru);
  const step = showStep ? get<Step>(d.step_id) : undefined;
  return (
    <div class="reading-row">
      <div>
        <b>{d.label}</b>
        <div class="small muted">{condLabel(d.condition)} · {d.entered_by} · {ago(r.created_at)}{step ? ` · Step ${step.data.position}` : ''}</div>
      </div>
      <div class="reading-val">{d.value}<small>{d.unit}</small></div>
      <div style="grid-column:1/-1" class="row">
        <button type="button" style="all:unset;cursor:pointer" aria-expanded={open} onClick={() => setOpen(!open)}><VerdictBadge v={ev.result} text={ev.headline} /></button>
        <Prov p={d.provenance} onChange={(p) => patch<Reading>(r.id, { provenance: p })} />
        {d.photo_id && <div class="photo-grid" style="width:56px;grid-template-columns:56px"><PhotoThumb id={d.photo_id} /></div>}
      </div>
      {open && (
        <div style="grid-column:1/-1" class="small">
          <p>{ev.detail}</p>
          {ru && <p class="muted">Rule source: {ru.source}. This compares a number to a rule of thumb; it does not prove any part is bad.</p>}
          {d.note && <p><b>Note:</b> {d.note}</p>}
          <button type="button" class="btn danger sm" onClick={async () => { if (await ask('Delete this reading?')) { await remove(r.id); await logEvent('delete', 'reading', r.id, `Deleted reading "${d.label}"`); } }}><Icon name="trash" />Delete</button>
        </div>
      )}
    </div>
  );
}

export const STEP_ICON: Record<string, string> = { photo: 'camera', horn: 'horn', 'fuse-drop': 'bolt', trailer: 'trailer', scan: 'scan' };
export const ZONE_LABEL: Record<string, string> = { 'zone-engine': 'Engine bay', 'zone-footwell': 'Driver footwell', 'zone-seat': 'Driver seat', 'zone-rear': 'Rear bumper' };
