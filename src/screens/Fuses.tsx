// Every fuse and relay in the manual's legends, box by box, with what each one feeds.
import { useState } from 'preact/hooks';
import { FUSE_BOXES, HIT_COLOR, HIT_LABEL, type Hit } from '../../shared/fuses';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov } from '../components/ui';
import { FuseBoxDiagram } from '../illus/fuse-boxes';
import { openSheet } from './sheets';

export function Fuses() {
  const [only, setOnly] = useState<'ours' | 'all'>('ours');
  return (
    <div class="anim-in">
      <PageHead title="Fuses & relays" back="#/more" kicker="Fuse boxes">
        <p class="lede">Every fuse and relay your Mercedes wiring manual lists for the US 906, box by box: number, amps and what it feeds. Coloured = part of the horn, A/C, rear turn, trailer, ignition or scan-code problems.</p>
      </PageHead>
      <Chips label="Show" value={only} onChange={setOnly} options={[{ key: 'ours', label: 'Highlight our problem' }, { key: 'all', label: 'All fuses' }]} />
      <div class="legend xr-legend" style="margin-top:10px">
        {(Object.keys(HIT_LABEL) as Hit[]).map((h) => <span><svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="6" fill={HIT_COLOR[h]} /></svg>{HIT_LABEL[h]}</span>)}
      </div>
      <p class="small muted" style="margin:8px 0 0">Fuse text is copied from the manual’s legends <Prov p="SOURCE" />. Box locations are from Mercedes’ 2015 Sprinter fuse supplement (same 906 body), because the 2012 manuals don’t say <Prov p="SOURCE" />. Cards are in number order, not the slot layout; blade colours are the standard colour for each rating.</p>
      <section class="card" style="margin-top:12px;border-left:4px solid #ffd23f">
        <b>Rear turn signals: the module fuse is F55/1 fuse 9 (10 A)</b>
        <p class="small" style="margin:4px 0 0">The Mercedes legend for vans built after 4/1/07 (and the 2015 sheet) put the additional turn signal module on <b>fuse block 1, fuse 9</b> in the main box. Fuse block 4 fuse 13 is rear A/C or fuel pump on this van. The System Wiring Diagram’s “fuse block 4 fuse 13” matches the older (up to 3/31/07) legend.</p>
      </section>
      {FUSE_BOXES.map((b) => (
        <section class="section" id={`box-${b.id}`}>
          <div class="section-head"><h2>{b.name}</h2></div>
          <p class="small muted" style="margin:0 0 4px">{b.where} <Prov p="SOURCE" /></p>
          <div class="xr-wrap"><FuseBoxDiagram box={b} only={only === 'ours'} /></div>
          <button type="button" class="btn sm" style="margin-top:10px" onClick={() => openSheet('photo', { caption: `Fuse card: ${b.name}` })}><Icon name="camera" />Photograph this box’s fuse card</button>
        </section>
      ))}
      <p class="small muted xr-hint">Swipe each drawing sideways to see all four columns →</p>
    </div>
  );
}
