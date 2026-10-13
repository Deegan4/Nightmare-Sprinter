// Every ground point in the owner's manuals: map + list, with the manual's own location words.
import { useState } from 'preact/hooks';
import type { Photo } from '../../shared/types';
import { G_POINTS, LIKELY_SAME, W_POINTS, type GroundPoint } from '../../shared/grounds';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov } from '../components/ui';
import { GroundMap, OUR_PROBLEM } from '../illus/grounds';
import { list, useStore } from '../lib/store';
import { openSheet } from './sheets';

const HIT: Record<string, string> = { horn: 'Horn', ac: 'A/C', trailer: 'Trailer', sam: 'SAM', ign: 'Ignition', can: 'Network' };

function marked(id: string) {
  const k = id.toLowerCase();
  return list<Photo>('photo').some((p) => p.data.markers?.some((m) => m.label.toLowerCase().includes(k)));
}

function Rows({ list, sel, onPick }: { list: GroundPoint[]; sel?: string; onPick: (id: string) => void }) {
  return (
    <div class="card gr-wrap"><table class="gr-table">
      <thead><tr><th>Ground</th><th>Where (manual’s words)</th><th>Wired to it</th><th>Source</th></tr></thead>
      <tbody>{list.map((g) => {
        const ok = marked(g.id);
        return (
          <tr id={`g-${g.id.replace('/', '-')}`} class={`${sel === g.id ? 'sel' : ''}${OUR_PROBLEM(g) ? ' hot' : ''}`} onClick={() => onPick(g.id)}>
            <td><span class={`xr-code-pill${OUR_PROBLEM(g) ? ' hot' : ''}`}>{g.id}</span>{ok && <><br /><Prov p="CONFIRMED" /></>}</td>
            <td><b>{g.where}</b>{g.hits && <div class="gr-hits">{g.hits.map((h) => <span>{HIT[h]}</span>)}</div>}</td>
            <td class="small"><ul class="gr-parts">{g.parts.map((p) => <li>{p}</li>)}</ul></td>
            <td class="small">{g.fig}
              <button type="button" class="btn ghost sm gr-cam" aria-label={`Photograph ${g.id}`} onClick={(e) => { e.stopPropagation(); openSheet('photo', { caption: `Ground ${g.id} (${g.where})` }); }}><Icon name="camera" /></button>
            </td>
          </tr>
        );
      })}</tbody>
    </table></div>
  );
}

export function Grounds() {
  useStore();
  const [only, setOnly] = useState<'all' | 'ours'>('ours');
  const [sel, setSel] = useState<string | undefined>();
  const pick = (id: string) => { setSel(id); document.getElementById(`g-${id.replace('/', '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const f = (l: GroundPoint[]) => l.filter((g) => only === 'all' || OUR_PROBLEM(g));
  return (
    <div class="anim-in">
      <PageHead title="Ground locations" back="#/more" kicker="Grounds">
        <p class="lede">Every ground point printed in your two wiring manuals, where each manual says it is, and what is wired to it. Red = a ground used by the SAM, horn, A/C, trailer, ignition switch or network.</p>
      </PageHead>
      <Chips label="Show" value={only} onChange={setOnly} options={[{ key: 'ours', label: 'Our problem' }, { key: 'all', label: `All ${G_POINTS.length + W_POINTS.length}` }]} />
      <div class="xr-wrap" style="margin-top:10px"><GroundMap only={only === 'ours'} sel={sel} onPick={pick} confirmed={marked} /></div>
      <div class="legend xr-legend">
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="#13243d" stroke="#ff5a4e" stroke-width="2" /></svg>G-number (System Wiring Diagram)</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><rect x="-7" y="-7" width="14" height="14" rx="2" fill="#13243d" stroke="#ff5a4e" stroke-width="2" /></svg>W-number (Mercedes legend)</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="none" stroke="#9fb3c8" stroke-dasharray="3 2" stroke-width="2" /></svg>On the roof / headliner</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="none" stroke="#2fd27a" stroke-width="2.5" /></svg>Marked on a photo</span>
      </div>
      <p class="small muted xr-hint">Swipe the map sideways to see it all →</p>
      <p class="small muted" style="margin:8px 0 0">Every location below is printed in the manuals. <Prov p="SOURCE" /> The manuals name the area, not the exact bolt: mark the bolt on a photo and it turns CONFIRMED.</p>

      <section class="section">
        <div class="section-head"><h2>G-numbers · System Wiring Diagram</h2></div>
        <p class="small muted" style="margin:0 0 8px">Figs. 25-27 “Ground Distribution Circuit”, plus Figs. 1, 24, 30, 40.</p>
        <Rows list={f(G_POINTS)} sel={sel} onPick={setSel} />
      </section>
      <section class="section">
        <div class="section-head"><h2>W-numbers · Mercedes ground legend</h2></div>
        <p class="small muted" style="margin:0 0 8px">“Wiring diagram for ground points of complete vehicle” (PE54.00-D-2000). Parts are the ones listed on the same page.</p>
        <Rows list={f(W_POINTS)} sel={sel} onPick={setSel} />
        {only === 'all' && <p class="small muted">W33 (tank filler neck): the manual does not say where along the van, so it is not on the map.</p>}
      </section>
      <section class="section">
        <div class="section-head"><h2>Probably the same bolt</h2></div>
        <p class="small muted" style="margin:0 0 8px">The two manuals name grounds differently. Where both list the same parts, they are likely the same point. <Prov p="HYPOTHESIS" /></p>
        <div class="card"><table class="gr-table"><thead><tr><th>System Wiring Diagram</th><th>Mercedes</th><th>Why</th></tr></thead>
          <tbody>{LIKELY_SAME.map(([a, b, why]) => <tr><td><b>{a}</b></td><td><b>{b}</b></td><td class="small">{why}</td></tr>)}</tbody></table></div>
      </section>
      <section class="section">
        <div class="card">
          <h3 style="margin-top:0">How to test a ground</h3>
          <p class="small" style="margin:0">Voltage drop, not ohms: black lead on the battery negative post, red lead on the ground bolt (or the part’s ground pin), with the circuit working. The rule in this app: 0.2 V or less meets the rule. Log it with the + button so both phones see it.</p>
        </div>
      </section>
    </div>
  );
}
