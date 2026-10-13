import { useState } from 'preact/hooks';
import type { Step, StepStatus, Suspect, ReferencePage } from '../../shared/types';
import { Icon } from '../components/icons';
import { Chips, PageHead, Safety, Sheet, Status, toast } from '../components/ui';
import { METHODS } from '../illus/methods';
import { ZONE_SCENES } from '../illus/scenes';
import { VanTop } from '../illus/van';
import { notes, photos, readings, steps } from '../lib/data';
import { go, href } from '../lib/router';
import { get, logEvent, patch, save, useStore } from '../lib/store';
import { ReadingRow, STEP_ICON, ZONE_LABEL } from './common';
import { PhotoGrid, openSheet } from './sheets';
import { MarkedPhoto } from '../components/MarkedPhoto';
import type { Zone } from '../../shared/types';

const STATUSES: { key: StepStatus; label: string }[] = [
  { key: 'todo', label: 'To do' }, { key: 'doing', label: 'Doing' }, { key: 'done', label: 'Done ✓' }, { key: 'skipped', label: 'Skip' },
];

async function setStepStatus(id: string, s: StepStatus) {
  const st = get<Step>(id);
  if (!st || st.data.status === s) return;
  await patch<Step>(id, { status: s });
  await logEvent('step', 'step', id, `Step ${st.data.position} "${st.data.title}" marked ${s}`);
}

export function Plan() {
  useStore();
  const list = steps();
  const [adding, setAdding] = useState(false);
  const move = async (i: number, dir: -1 | 1) => {
    const a = list[i], b = list[i + dir];
    if (!a || !b) return;
    await patch<Step>(a.id, { position: b.data.position });
    await patch<Step>(b.id, { position: a.data.position });
  };
  return (
    <div class="anim-in">
      <PageHead title="Test plan" kicker={`${list.filter((s) => s.data.status === 'done').length} of ${list.length} done`} />
      <p class="lede">Do them in order. Each one rules something in or out.</p>
      <ol class="list">
        {list.map((s, i) => {
          const n = readings(s.id).length;
          const ph = photos((p) => p.step_id === s.id).length;
          return (
            <li class="item" style="align-items:stretch;padding:0;overflow:hidden">
              <a href={href(`/step/${s.id}`)} class="row grow" style="text-decoration:none;padding:12px;gap:12px;flex-wrap:nowrap">
                <span class="step-num" style={s.data.status === 'done' ? 'background:var(--ink);color:var(--paper)' : ''}>{s.data.status === 'done' ? '✓' : s.data.position}</span>
                <span class="grow">
                  <h3>{s.data.title}</h3>
                  <span class="row small muted" style="margin-top:4px">
                    <Status s={s.data.status} />
                    {s.data.illustration && <Icon name={STEP_ICON[s.data.illustration]} class="chev" />}
                    {s.data.zone_id && <span>{ZONE_LABEL[s.data.zone_id]}</span>}
                    {n > 0 && <span>· {n} reading{n > 1 ? 's' : ''}</span>}
                    {ph > 0 && <span>· {ph} photo{ph > 1 ? 's' : ''}</span>}
                  </span>
                </span>
              </a>
              <span style="display:flex;flex-direction:column;border-left:2px solid var(--line)">
                <button type="button" class="icon-btn" style="border:0;border-radius:0;flex:1" aria-label={`Move step ${s.data.position} up`} disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" /></button>
                <button type="button" class="icon-btn" style="border:0;border-radius:0;flex:1;border-top:2px solid var(--line)" aria-label={`Move step ${s.data.position} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><Icon name="down" /></button>
              </span>
            </li>
          );
        })}
      </ol>
      <button type="button" class="btn ghost block" style="margin-top:14px" onClick={() => setAdding(true)}><Icon name="plus" />Add a step</button>
      {adding && <StepEditor onClose={() => setAdding(false)} position={(list[list.length - 1]?.data.position ?? 0) + 1} />}
    </div>
  );
}

function StepEditor({ onClose, position, id }: { onClose: () => void; position: number; id?: string }) {
  const cur = get<Step>(id)?.data;
  const [title, setTitle] = useState(cur?.title ?? '');
  const [why, setWhy] = useState(cur?.why ?? '');
  const [how, setHow] = useState(cur?.how_to.join('\n') ?? '');
  const submit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim()) return;
    const how_to = how.split('\n').map((x) => x.trim()).filter(Boolean);
    if (cur && id) await patch<Step>(id, { title: title.trim(), why: why.trim(), how_to });
    else {
      const r = await save<Step>('step', { position, title: title.trim(), short: title.trim().split(' ').slice(0, 2).join(' '), why: why.trim(), how_to, status: 'todo', requires_photo: false, safety: [], presets: [], suspect_ids: [], ref_ids: [], notes: '' });
      await logEvent('step', 'step', r.id, `Added step "${title.trim()}"`);
    }
    onClose();
  };
  return (
    <Sheet title={id ? 'Edit step' : 'New step'} onClose={onClose}>
      <form onSubmit={submit}>
        <label class="field"><span>Title</span><input class="input" value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} required /></label>
        <label class="field"><span>Why it matters</span><textarea class="input" value={why} onInput={(e) => setWhy((e.target as HTMLTextAreaElement).value)} /></label>
        <label class="field"><span>How to do it (one line per step)</span><textarea class="input" style="min-height:140px" value={how} onInput={(e) => setHow((e.target as HTMLTextAreaElement).value)} /></label>
        <button class="btn primary block" style="margin-top:14px" type="submit"><Icon name="check" />Save</button>
      </form>
    </Sheet>
  );
}

export function StepDetail({ id }: { id: string }) {
  useStore();
  const [editing, setEditing] = useState(false);
  const rec = get<Step>(id);
  if (!rec || rec.deleted) return <div class="empty">Step not found. <a href="#/plan">Back to plan</a></div>;
  const s = rec.data;
  const rs = readings(id);
  const ph = photos((p) => p.step_id === id && !p.reading_id).map((p) => p.id);
  const ns = notes(id);
  const Scene = s.zone_id ? ZONE_SCENES[s.zone_id] : undefined;
  const methods = s.illustration ? METHODS[s.illustration] ?? [] : [];

  return (
    <div class="anim-in">
      <PageHead title={s.title} back="#/plan" kicker={`Step ${s.position}${s.zone_id ? ` · ${ZONE_LABEL[s.zone_id]}` : ''}`} />
      <div style="margin:12px 0"><Chips label="Step status" value={s.status} onChange={(v) => setStepStatus(id, v)} options={STATUSES} /></div>
      {s.safety.map((k) => <div style="margin-top:10px"><Safety k={k} /></div>)}

      <section class="section">
        <div class="why" style="font-size:18px"><b>Why: </b>{s.why}</div>
      </section>

      {s.zone_id && (
        <section class="section">
          <div class="section-head"><h2>Where</h2><a class="small" href={href(`/zone/${s.zone_id}`)}>Zone details →</a></div>
          <div class="stack">
            {photos((p) => p.zone_id === s.zone_id && !!p.markers?.length).map((p) => <MarkedPhoto id={p.id} zone={get<Zone>(s.zone_id)?.data} />)}
            <VanTop active={s.zone_id} onZone={(z) => go(`/zone/${z}`)} />
            {Scene && <Scene />}
          </div>
        </section>
      )}

      <section class="section">
        <div class="section-head"><h2>How</h2><button type="button" class="btn ghost sm" onClick={() => setEditing(true)}><Icon name="edit" />Edit</button></div>
        <ol class="howto card">{s.how_to.map((h) => <li>{h}</li>)}</ol>
        {methods.map((m) => (
          <div style="margin-top:14px"><h3 style="margin-bottom:6px">{m.title}</h3><m.C /></div>
        ))}
      </section>

      <section class="section">
        <div class="section-head"><h2>Readings</h2><span class="muted small">{rs.length} recorded</span></div>
        {s.presets.length > 0 && (
          <div class="stack" style="margin-bottom:12px">
            {s.presets.map((p) => (
              <button type="button" class="btn block" style="justify-content:flex-start" onClick={() => openSheet('reading', { stepId: id, preset: p })}>
                <Icon name="plus" /><span style="text-align:left">{p.label}</span>
              </button>
            ))}
          </div>
        )}
        {rs.length ? <div class="card">{rs.map((r) => <ReadingRow r={r} />)}</div> : <div class="empty">No readings for this step yet.</div>}
        {!s.presets.length && <button type="button" class="btn ghost block" style="margin-top:10px" onClick={() => openSheet('reading', { stepId: id })}><Icon name="meter" />Add reading</button>}
      </section>

      <section class="section">
        <div class="section-head"><h2>Photos</h2>{s.requires_photo && <span class="status doing">Required</span>}</div>
        <PhotoGrid ids={ph} addLinks={{ step_id: id }} required={s.requires_photo} />
      </section>

      <section class="section">
        <div class="section-head"><h2>Notes</h2></div>
        <StepNotes id={id} value={s.notes} />
        {ns.length > 0 && <ul class="list stack" style="margin-top:10px">{ns.map((n) => <li class="card small"><b>{n.created_by}:</b> {n.data.text}</li>)}</ul>}
        <button type="button" class="btn ghost block" style="margin-top:10px" onClick={() => openSheet('note', { stepId: id })}><Icon name="note" />Add a note to the timeline</button>
      </section>

      {(s.suspect_ids.length > 0 || s.ref_ids.length > 0) && (
        <section class="section">
          <div class="section-head"><h2>Linked</h2></div>
          <div class="stack">
            {s.suspect_ids.map((sid) => { const x = get<Suspect>(sid); return x && <a class="item" href={href(`/suspect/${sid}`)}><Icon name="suspects" class="chev" /><span class="grow"><b>{x.data.title}</b><br /><span class="small muted">Suspect</span></span><Status s={x.data.state} /></a>; })}
            {s.ref_ids.map((rid) => { const x = get<ReferencePage>(rid); return x && <a class="item" href={href(`/ref/${rid}`)}><Icon name="book" class="chev" /><span class="grow"><b>{x.data.title}</b><br /><span class="small muted">{x.data.figure} · reference</span></span><Icon name="chev" class="chev" /></a>; })}
          </div>
        </section>
      )}
      <div class="btn-row" style="margin-top:24px">
        <button type="button" class="btn dark" onClick={async () => { await setStepStatus(id, 'done'); toast('Step marked done'); go('/'); }}><Icon name="check" />Mark done</button>
        <button type="button" class="btn ghost" onClick={() => setStepStatus(id, 'skipped')}>Skip</button>
      </div>
      {editing && <StepEditor id={id} position={s.position} onClose={() => setEditing(false)} />}
    </div>
  );
}

function StepNotes({ id, value }: { id: string; value: string }) {
  const [v, set] = useState(value);
  return (
    <textarea class="input" aria-label="Step notes" value={v} placeholder="Scratch notes for this step (saved when you leave the box)"
      onInput={(e) => set((e.target as HTMLTextAreaElement).value)} onBlur={() => v !== value && patch<Step>(id, { notes: v })} />
  );
}
