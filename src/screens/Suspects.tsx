import { useState } from 'preact/hooks';
import type { Evidence, Reading, Step, Suspect, SuspectState } from '../../shared/types';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov, Sheet, Status } from '../components/ui';
import { SymptomMap } from '../illus/symptoms';
import { evidence, readings, steps, suspects } from '../lib/data';
import { go, href } from '../lib/router';
import { get, logEvent, patch, remove, save, useStore } from '../lib/store';
import { ReadingRow } from './common';

const STATES: { key: SuspectState; label: string }[] = [
  { key: 'untested', label: 'Untested' }, { key: 'leaning', label: 'Leaning' }, { key: 'ruled_out', label: 'Ruled out' }, { key: 'confirmed', label: 'Confirmed' },
];

export function Suspects() {
  useStore();
  const list = suspects();
  return (
    <div class="anim-in">
      <PageHead title="Suspects" kicker="Possible causes" />
      <p class="lede">Each card is a guess to test, not a verdict. Move it as readings come in.</p>
      <SymptomMap suspects={list} onPick={(id) => go(`/suspect/${id}`)} />
      <div class="stack" style="margin-top:14px">
        {list.map((s) => {
          const ev = evidence(s.id);
          const f = ev.filter((e) => e.data.direction === 'for').length, a = ev.length - f;
          return (
            <a class="item" href={href(`/suspect/${s.id}`)} style={`align-items:flex-start;${s.data.state === 'ruled_out' ? 'opacity:.6' : ''}`}>
              <span class="grow">
                <span class="row"><Status s={s.data.state} /><Prov p={s.data.provenance} /></span>
                <h3 style="margin-top:6px">{s.data.title}</h3>
                <p class="small muted" style="margin:4px 0">{s.data.summary}</p>
                <span class="row small"><span>👍 {f} for</span><span>👎 {a} against</span></span>
              </span>
              <Icon name="chev" class="chev" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function SuspectDetail({ id }: { id: string }) {
  useStore();
  const [adding, setAdding] = useState<'for' | 'against' | null>(null);
  const rec = get<Suspect>(id);
  if (!rec) return <div class="empty">Not found. <a href="#/suspects">Back</a></div>;
  const s = rec.data;
  const ev = evidence(id);
  const linkedSteps = steps().filter((st) => st.data.suspect_ids.includes(id));
  const linkedReadings = readings().filter((r) => linkedSteps.some((st) => st.id === r.data.step_id));

  const setState = async (state: SuspectState) => {
    if (state === s.state) return;
    if (state === 'confirmed' && !confirm('Mark as CONFIRMED? Only do this when measurements on this van prove it.')) return;
    await patch<Suspect>(id, { state, ...(state === 'confirmed' ? { provenance: 'CONFIRMED' as const } : {}) });
    await logEvent('suspect', 'suspect', id, `Suspect "${s.title}" → ${state.replace('_', ' ')}`);
  };

  const Col = ({ dir }: { dir: 'for' | 'against' }) => (
    <div class="card">
      <h3>{dir === 'for' ? '👍 Evidence for' : '👎 Evidence against'}</h3>
      <ul class="list">
        {ev.filter((e) => e.data.direction === dir).map((e) => {
          const r = get<Reading>(e.data.reading_id);
          return (
            <li style="padding:8px 0;border-top:1px solid var(--line)" class="row">
              <span class="grow">{e.data.text}{r && <span class="small muted"><br />Reading: {r.data.label} = {r.data.value} {r.data.unit}</span>}<span class="small muted"><br />{e.created_by}</span></span>
              <button type="button" class="icon-btn" aria-label="Remove evidence" onClick={() => confirm('Remove this evidence?') && remove(e.id)}><Icon name="trash" /></button>
            </li>
          );
        })}
      </ul>
      <button type="button" class="btn ghost block sm" style="margin-top:8px" onClick={() => setAdding(dir)}><Icon name="plus" />Add</button>
    </div>
  );

  return (
    <div class="anim-in">
      <PageHead title={s.title} back="#/suspects" kicker="Suspect">
        <div class="row" style="margin-top:8px"><Prov p={s.provenance} onChange={(p) => patch<Suspect>(id, { provenance: p })} /></div>
      </PageHead>
      <div style="margin:12px 0"><Chips label="Suspect state" value={s.state} onChange={setState} options={STATES} /></div>
      <div class="card"><p style="margin:0">{s.summary}</p></div>
      <div class="card" style="border-color:var(--accent);background:var(--accent-soft)">
        <div class="kicker">What would change my mind</div>
        <p style="margin-bottom:0;font-weight:700">{s.change_my_mind}</p>
      </div>
      <section class="section two-col"><Col dir="for" /><Col dir="against" /></section>
      {linkedSteps.length > 0 && (
        <section class="section">
          <div class="section-head"><h2>Tests for this</h2></div>
          <div class="stack">{linkedSteps.map((st) => <a class="item" href={href(`/step/${st.id}`)}><span class="step-num">{st.data.position}</span><span class="grow"><b>{st.data.title}</b></span><Status s={st.data.status} /></a>)}</div>
        </section>
      )}
      {linkedReadings.length > 0 && (
        <section class="section"><div class="section-head"><h2>Related readings</h2></div><div class="card">{linkedReadings.map((r) => <ReadingRow r={r} showStep />)}</div></section>
      )}
      {adding && <EvidenceSheet sid={id} dir={adding} readingsList={linkedReadings.length ? linkedReadings : readings()} onClose={() => setAdding(null)} />}
    </div>
  );
}

function EvidenceSheet({ sid, dir, readingsList, onClose }: { sid: string; dir: 'for' | 'against'; readingsList: ReturnType<typeof readings>; onClose: () => void }) {
  const [text, setText] = useState('');
  const [rid, setRid] = useState('');
  const submit = async (e: Event) => {
    e.preventDefault();
    const r = get<Reading>(rid);
    const t = text.trim() || (r ? `${r.data.label}: ${r.data.value} ${r.data.unit} (${r.data.result})` : '');
    if (!t) return;
    const ev = await save<Evidence>('evidence', { suspect_id: sid, text: t, reading_id: rid || undefined, direction: dir });
    await logEvent('evidence', 'evidence', ev.id, `Evidence ${dir} "${get<Suspect>(sid)?.data.title}": ${t}`);
    onClose();
  };
  return (
    <Sheet title={dir === 'for' ? 'Evidence for' : 'Evidence against'} onClose={onClose}>
      <form onSubmit={submit}>
        <label class="field"><span>What did you find?</span><textarea class="input" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} /></label>
        {readingsList.length > 0 && (
          <>
            <div class="kicker" style="margin-top:12px">Link a reading (optional)</div>
            <div class="stack" style="margin-top:6px">
              {readingsList.slice(0, 12).map((r) => (
                <button type="button" class="item" aria-pressed={rid === r.id} style={rid === r.id ? 'border-color:var(--ink);background:var(--accent-soft)' : ''} onClick={() => setRid(rid === r.id ? '' : r.id)}>
                  <span class="grow"><b>{r.data.label}</b><br /><span class="small muted">{r.data.value} {r.data.unit} · {get<Step>(r.data.step_id)?.data.short ?? ''}</span></span>
                  {rid === r.id && <Icon name="check" class="chev" />}
                </button>
              ))}
            </div>
          </>
        )}
        <button class="btn primary block" style="margin-top:14px" type="submit"><Icon name="check" />Save</button>
      </form>
    </Sheet>
  );
}
