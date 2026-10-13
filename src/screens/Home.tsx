import type { Step } from '../../shared/types';
import { Icon } from '../components/icons';
import { Safety } from '../components/ui';
import { VanSide } from '../illus/van';
import { CircuitOverview } from '../illus/circuit';
import { nextStep, readings, steps, suspects } from '../lib/data';
import { go, href } from '../lib/router';
import { patch, status, useStore } from '../lib/store';
import { ReadingRow, ZONE_LABEL } from './common';
import { openSheet } from './sheets';

export function Home() {
  useStore();
  const all = steps();
  const next = nextStep();
  const done = all.filter((s) => s.data.status === 'done').length;
  const sus = suspects();
  const ruled = sus.filter((s) => s.data.state === 'ruled_out').length;
  const leaning = sus.filter((s) => s.data.state === 'leaning' || s.data.state === 'confirmed');
  const recent = readings().slice(0, 3);

  return (
    <div class="anim-in">
      <div class="row" style="justify-content:space-between;margin-bottom:4px">
        <span class="kicker">Hi {status.me?.display_name ?? ''} · what’s next</span>
        <span class="strip"><span>{done} of {all.length} done</span></span>
      </div>
      <div class="progress" aria-hidden="true">{all.map((s) => <span class={s.data.status} />)}</div>

      {next ? <NextCard id={next.id} step={next.data} /> : (
        <div class="hero"><div class="hero-body"><h2>All steps done</h2><p>Review the suspects, then copy the summary for Claude or a mechanic.</p>
          <a class="btn primary block" href="#/summary"><Icon name="copy" />Copy summary</a></div></div>
      )}

      <a class="item" href="#/sheet" style="margin-top:16px;border-color:#1f3b63;border-width:3px"><span class="brand-mark" style="width:44px;height:44px;flex:none;background:#1f3b63;color:#fff"><Icon name="plan" /></span><span class="grow"><h3>Wiring sheet</h3><span class="small muted">Components, power flow, fuses and all 3 circuits on one page</span></span><Icon name="chev" class="chev" /></a>
      <a class="item" href="#/xray" style="margin-top:10px;border-color:#0a1220;border-width:3px"><span class="brand-mark" style="width:44px;height:44px;flex:none;background:#0a1220;color:#ffd23f"><Icon name="bolt" /></span><span class="grow"><h3>See-through wiring</h3><span class="small muted">X-ray of the van: where each part is and what connects to it</span></span><Icon name="chev" class="chev" /></a>
      <div class="card" style="margin-top:16px">
        <div class="strip">
          <span><Icon name="check" />{done}/{all.length} steps done</span>
          <span><Icon name="x" />{ruled} suspect{ruled === 1 ? '' : 's'} ruled out</span>
          <span><Icon name="meter" />{readings().length} readings</span>
        </div>
        {leaning.length > 0 && <p class="small" style="margin-bottom:0">Leaning toward: <b>{leaning.map((s) => s.data.short).join(', ')}</b> (still a hypothesis until confirmed).</p>}
      </div>

      <section class="section">
        <div class="section-head"><h2>The problem</h2><a href="#/suspects" class="small">Suspects →</a></div>
        <div class="symptoms">
          <div class="symptom"><Icon name="horn" />Horn<div class="x">dead</div></div>
          <div class="symptom"><Icon name="snow" />A/C comp.<div class="x">dead</div></div>
          <div class="symptom"><Icon name="trailer" />Trailer lights<div class="x">dead</div></div>
        </div>
        <p class="small muted">All three stopped at the same time, <b>before</b> the SAM was replaced. Something they share is the best lead.</p>
        <CircuitOverview />
      </section>

      <section class="section">
        <div class="section-head"><h2>Latest readings</h2><a href="#/timeline" class="small">Timeline →</a></div>
        {recent.length ? <div class="card">{recent.map((r) => <ReadingRow r={r} showStep />)}</div>
          : <div class="empty">No readings yet. Tap the yellow <b>+</b> to add one.</div>}
      </section>

      <section class="section">
        <div class="section-head"><h2>Where everything is</h2><a href="#/map" class="small">Full map →</a></div>
        <VanSide onZone={(z) => go(`/zone/${z}`)} caption="Tap an area to see what’s there" />
      </section>
    </div>
  );
}

function NextCard({ id, step }: { id: string; step: Step }) {
  const zone = step.zone_id;
  return (
    <article class="hero" aria-labelledby="next-title">
      <div class="hero-top">
        <span class="step-num">{step.position}</span>
        <div class="grow">
          <div class="kicker" style="color:inherit;opacity:.8">Next step{step.status === 'doing' ? ' · in progress' : ''}</div>
          {zone && <div class="small" style="font-weight:700"><Icon name="pin" class="chev" /> {ZONE_LABEL[zone]}</div>}
        </div>
      </div>
      <div class="hero-body">
        <h2 id="next-title">{step.title}</h2>
        <div class="why">{step.why}</div>
        <div class="btn-row" style="margin:12px 0">
          {step.requires_photo
            ? <button type="button" class="btn primary" onClick={() => openSheet('photo', { links: { step_id: id } })}><Icon name="camera" />Add photo</button>
            : <button type="button" class="btn primary" onClick={() => openSheet('reading', { stepId: id })}><Icon name="meter" />Add reading</button>}
          <a class="btn" href={href(`/step/${id}`)}>Full step<Icon name="chev" /></a>
        </div>
        <VanSide active={zone} caption={`Where: ${zone ? ZONE_LABEL[zone] : '—'} (glowing)`} />
        {step.safety.slice(0, 1).map((k) => <div style="margin-top:12px"><Safety k={k} /></div>)}
        <ol class="howto">{step.how_to.map((h) => <li>{h}</li>)}</ol>
        {step.status === 'todo' && <button type="button" class="btn ghost block sm" style="margin-top:10px" onClick={() => patch<Step>(id, { status: 'doing' })}>Start this step</button>}
      </div>
    </article>
  );
}
