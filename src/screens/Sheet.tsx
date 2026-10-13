// The one-page Wiring Sheet: same panel layout as the reference infographic the owner
// asked for, but every value comes from this project's records (PRD facts, manual
// pages, the fuse card, marked photos). Unknowns say "confirm", never a guess.
import { useState } from 'preact/hooks';
import type { Fuse, Photo, Provenance, Zone } from '../../shared/types';
import { Icon } from '../components/icons';
import { Prov, Sheet as Modal, Status, ask } from '../components/ui';
import { AcCircuit, HornCircuit, PowerFlow, TrailerCircuit } from '../illus/sheet-diagrams';
import { Van34 } from '../illus/van34';
import { CircuitOverview } from '../illus/circuit';
import { photos, steps, zones } from '../lib/data';
import { usePhotoUrl } from '../lib/photo';
import { href } from '../lib/router';
import { get, list, logEvent, patch, remove, save, useStore } from '../lib/store';
import { openSheet } from './sheets';

/** Find a marker someone placed on a real photo whose label mentions any keyword. */
function markedOn(keys: string[]): { photo: string; zone?: string } | null {
  for (const p of list<Photo>('photo')) {
    if (p.data.markers?.some((m) => keys.some((k) => m.label.toLowerCase().includes(k)))) return { photo: p.id, zone: p.data.zone_id };
  }
  return null;
}

// Locations as printed in the owner's manuals (SOURCE), or "confirm" where they say nothing.
const COMPONENTS: { name: string; where: string; prov: Provenance; keys: string[]; zone?: string }[] = [
  { name: 'Battery G1', where: 'under the driver-footwell floor · Equipment manual Fig. 2', prov: 'SOURCE', keys: ['battery'], zone: 'zone-footwell' },
  { name: 'F59 fuses (150 A F59.5 · 80 A F59.3)', where: 'confirm on van', prov: 'UNKNOWN', keys: ['f59', '150 a', '80 a'] },
  { name: 'Fuse/relay box K40/9: SAM N10, horn relay k1, horn fuse f1 15 A', where: 'left kick panel · Fig. 30, 39', prov: 'SOURCE', keys: ['sam', 'kick', 'k40', 'horn relay'], zone: 'zone-footwell' },
  { name: 'Fuse blocks 1 & 2 (F55/1, F55/2)', where: 'top of the fuse/relay box · Fig. 39', prov: 'SOURCE', keys: ['fuse block 1', 'fuse block 2', 'f55/1', 'f55/2'], zone: 'zone-footwell' },
  { name: 'Fuse blocks 3 & 4 (trailer fuses)', where: 'confirm on van', prov: 'UNKNOWN', keys: ['fuse block 3', 'fuse block 4', 'f55/3', 'f55/4'] },
  { name: 'Under-seat box & fuse-card legend', where: 'under driver’s seat', prov: 'REPORTED', keys: ['under-seat', 'fuse card', 'fuse-card'], zone: 'zone-seat' },
  { name: 'PSM module N26/15 (not the SAM)', where: 'inside driver seat frame · Equipment manual Fig. 27', prov: 'SOURCE', keys: ['psm', 'n26'], zone: 'zone-seat' },
  { name: 'Horn 1 (H1) · ground G104', where: 'engine compartment, left · Fig. 30', prov: 'SOURCE', keys: ['horn 1', 'g104'], zone: 'zone-engine' },
  { name: 'A/C compressor A9 (oil in plug) · pressure sensor B12', where: 'engine compartment · Fig. 1', prov: 'SOURCE', keys: ['compressor', 'b12', 'pressure sensor'], zone: 'zone-engine' },
  { name: 'Connector X26/38 (compressor wire, pin 7)', where: 'engine harness · Wiring Diagrams Fig. 29', prov: 'SOURCE', keys: ['x26/38'], zone: 'zone-engine' },
  { name: 'A/C heater control S98 · ground G200', where: 'dash; G200 right rear engine compt · Fig. 1', prov: 'SOURCE', keys: ['s98', 'g200'] },
  { name: 'Trailer tow lighting module N28/1 · ground G305', where: 'rear of vehicle · Fig. 24', prov: 'SOURCE', keys: ['trailer module', 'n28', 'g305'], zone: 'zone-rear' },
  { name: 'Trailer socket · pin 8 ground G304', where: 'rear bumper · Fig. 24', prov: 'SOURCE', keys: ['trailer socket', 'socket', 'g304'], zone: 'zone-rear' },
];

function Panel({ title, sub, area, tone, children }: { title: string; sub?: string; area: string; tone?: string; children: any }) {
  return (
    <section class={`ws-panel ${tone ?? ''}`} style={`grid-area:${area}`}>
      <h3 class="ws-h">{title}{sub && <span> {sub}</span>}</h3>
      {children}
    </section>
  );
}

function PhotoTile({ zoneId, title }: { zoneId: string; title: string }) {
  useStore();
  const z = get<Zone>(zoneId);
  const ph = photos((p) => p.zone_id === zoneId);
  const best = ph.find((p) => p.data.markers?.length) ?? ph[0];
  const url = usePhotoUrl(best?.id);
  return (
    <figure class="ws-tile">
      <a href={href(`/zone/${zoneId}`)} class="ws-photo" aria-label={`${title}: open area`}>
        {url ? (
          <span class="marked-wrap" style="border:0;border-radius:0">
            <img src={url} alt={best?.data.caption || title} loading="lazy" />
            {(best?.data.markers ?? []).map((m, i) => <span class="photo-marker" style={`left:${m.x * 100}%;top:${m.y * 100}%;width:24px;height:24px;font-size:13px`}>{i + 1}</span>)}
          </span>
        ) : (
          <span class="ws-photo-empty"><Icon name="camera" /><span>No photo of this van yet</span></span>
        )}
      </a>
      <figcaption>
        <b>{title}</b>
        <span class="small">{z?.data.summary}</span>
        {url ? <Prov p="CONFIRMED" /> : <button type="button" class="btn sm" onClick={() => openSheet('photo', { links: { zone_id: zoneId }, caption: title })}><Icon name="camera" />Photograph it</button>}
      </figcaption>
    </figure>
  );
}

function FuseEditor({ id, box, onClose }: { id?: string; box?: string; onClose: () => void }) {
  const cur = get<Fuse>(id)?.data;
  const [f, setF] = useState<Fuse>(cur ?? { box: box ?? 'Under-seat box (driver’s seat) · from your fuse card', number: '', amps: '', function: '', provenance: 'CONFIRMED', source: 'Fuse card on this van', position: 99 });
  const set = (p: Partial<Fuse>) => setF({ ...f, ...p });
  const fld = (k: keyof Fuse, label: string, ph: string) => (
    <label class="field"><span>{label}</span><input class="input" value={f[k] as string} placeholder={ph} onInput={(e) => set({ [k]: (e.target as HTMLInputElement).value } as any)} /></label>
  );
  return (
    <Modal title={id ? `Fuse ${f.number}` : 'Add a fuse'} onClose={onClose}>
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (!f.number.trim() || !f.function.trim()) return;
        if (id) await patch<Fuse>(id, f); else { const r = await save<Fuse>('fuse', f); await logEvent('fact', 'fuse', r.id, `Added fuse ${f.number} ${f.amps}: ${f.function}`); }
        onClose();
      }}>
        <p class="small muted" style="margin-top:0">Copy it exactly as printed on the fuse card or the manual page. Leave anything you can’t read blank.</p>
        {fld('box', 'Fuse box', 'e.g. Under-seat fuse box')}
        {fld('number', 'Fuse number / position', 'as printed on the card')}
        {fld('amps', 'Amps', 'e.g. 15 A')}
        {fld('function', 'What it feeds', 'as printed on the card')}
        {fld('source', 'Where you read it', 'e.g. fuse card photo')}
        <div class="row" style="margin-top:12px"><span class="kicker">How sure</span><Prov p={f.provenance} onChange={(p) => set({ provenance: p })} /></div>
        <button type="submit" class="btn primary block" style="margin-top:14px"><Icon name="check" />Save fuse</button>
        {id && <button type="button" class="btn danger block" style="margin-top:8px" onClick={async () => { if (await ask('Remove this fuse from the sheet?')) { await remove(id); onClose(); } }}><Icon name="trash" />Remove</button>}
      </form>
    </Modal>
  );
}

function FuseTable({ title, rows, box, photoZone }: { title: string; rows: ReturnType<typeof list<Fuse>>; box: string; photoZone?: string }) {
  const [edit, setEdit] = useState<{ id?: string } | null>(null);
  const ph = photoZone ? photos((p) => p.zone_id === photoZone)[0] : undefined;
  const url = usePhotoUrl(ph?.id);
  return (
    <div class="ws-sub">
      <h4>{title}</h4>
      {photoZone && (url
        ? <button type="button" class="ws-fuse-photo" onClick={() => openSheet('viewer', { photoId: ph!.id })}><img src={url} alt="Photo of the fuse box on this van" /></button>
        : <button type="button" class="ws-photo-empty ws-fuse-photo" onClick={() => openSheet('photo', { links: { zone_id: photoZone, step_id: 'step-1' }, caption: 'Fuse card legend' })}><Icon name="camera" /><span>Add a photo of the fuse card (Step 1)</span></button>)}
      <div class="ws-table-wrap">
        <table class="ws-table">
          <thead><tr><th>Fuse #</th><th>Amps</th><th>Function</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr onClick={() => setEdit({ id: r.id })} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setEdit({ id: r.id })}>
                <td><b>{r.data.number}</b></td><td style="white-space:nowrap">{r.data.amps}</td><td>{r.data.function}<div style="margin-top:4px"><Prov p={r.data.provenance} /></div></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={3} class="muted small">Not filled yet. Read each fuse off this van’s fuse card and add it.</td></tr>}
          </tbody>
        </table>
      </div>
      <button type="button" class="btn ghost sm block" style="margin-top:8px" onClick={() => setEdit({})}><Icon name="plus" />Add fuse from the card</button>
      {edit && <FuseEditor id={edit.id} box={box} onClose={() => setEdit(null)} />}
    </div>
  );
}

export function WiringSheet() {
  useStore();
  const fuses = list<Fuse>('fuse').sort((a, b) => a.data.position - b.data.position || a.created_at - b.created_at);
  const UNDER = 'Under-seat box (driver’s seat) · from your fuse card';
  const groups = [...new Set([...fuses.map((f) => f.data.box), UNDER])];
  const st = steps();
  const z = zones();
  return (
    <div class="ws anim-in">
      <header class="ws-band">
        <h1>2012 Freightliner Sprinter 2500 (3.0L V6 Diesel) · Front A/C Only</h1>
        <p>Electrical Wiring &amp; Fuse Locations · Horn, A/C Compressor and Trailer Lights</p>
      </header>

      <div class="ws-grid">
        <Panel title="Vehicle Overview" sub="(front A/C only)" area="ov">
          <div class="ws-ov">
            <div class="ws-van"><Van34 /></div>
            <div>
              <h4>Key Components <span class="muted">(locations)</span></h4>
              <ol class="ws-keys">
                {COMPONENTS.map((c) => {
                  const m = markedOn(c.keys);
                  return (
                    <li>
                      <a href={href(m?.zone ? `/zone/${m.zone}` : c.zone ? `/zone/${c.zone}` : '/map')}>
                        <b>{c.name}</b> <span class="muted">({c.where})</span>
                      </a>
                      {m ? <Prov p="CONFIRMED" /> : <Prov p={c.prov} />}
                    </li>
                  );
                })}
              </ol>
              <p class="small muted" style="margin:6px 0 0">“Confirm on van” turns into CONFIRMED when someone marks it on a photo.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Main Power and Control Flow" area="flow">
          <div class="ws-flow ws-only-wide"><PowerFlow /></div>
          <div class="ws-only-narrow"><CircuitOverview /></div>
        </Panel>

        <Panel title="Fuse Locations and Assignments" area="fuse">
          <div class="ws-fuses">
            {groups.map((g) => <FuseTable title={g} box={g} rows={fuses.filter((f) => f.data.box === g)} photoZone={g === UNDER ? 'zone-seat' : undefined} />)}
          </div>
        </Panel>

        <Panel title="A/C Compressor Circuit" sub="(front A/C only)" area="ac" tone="ws-green"><AcCircuit /></Panel>
        <Panel title="Horn Circuit" area="horn" tone="ws-blue"><HornCircuit /></Panel>
        <Panel title="Trailer Light Circuit" area="trl" tone="ws-purple"><TrailerCircuit /></Panel>

        <Panel title="Component Locations" sub="(real photos of this van)" area="loc">
          <div class="ws-tiles">
            {z.map((zz) => <PhotoTile zoneId={zz.id} title={zz.data.label} />)}
          </div>
        </Panel>

        <Panel title="Diagram Colour Key" area="key">
          <ul class="ws-colors row">
            {[['#d33a2c', 'Battery feed / fuses'], ['#1f6fd1', 'Horn circuit'], ['#16894a', 'A/C circuit'], ['#8a3fc7', 'Trailer circuit'], ['#c27c00', 'CAN B network (dashed)'], ['var(--il-ink)', 'Ground']].map(([c, t]) => (
              <li><i style={`background:${c}`} />{t}</li>
            ))}
          </ul>
          <p class="small"><b>Note:</b> these colours show the circuit type. They are <b>not</b> the van’s wire colours. Check wire colours on the manual page for your build.</p>
          <ul class="ws-colors row" style="margin-top:8px">
            <li><span class="ws-mp">2</span>Meter test point (plan step)</li>
          </ul>
        </Panel>

        <Panel title="Quick Diagnostic Steps" area="steps" tone="ws-yellow">
          <ol class="ws-steps">
            {st.map((s) => (
              <li><a href={href(`/step/${s.id}`)}><b>{s.data.title}.</b> <span>{s.data.how_to[0]}</span></a> <Status s={s.data.status} /></li>
            ))}
            <li><b>Never</b> clear codes before writing them down. <b>Never</b> jump the compressor plug.</li>
            <li>If all three still fail together: check SAM power, grounds and coding before replacing anything.</li>
          </ol>
        </Panel>
      </div>

      <footer class="ws-band ws-foot">
        Built from the 8 Sprinter 906 manuals in your Google Drive (mainly “System Wiring Diagram.pdf” Figs. 1, 24, 30, 38-40, the US fuse/relay box legend, Equipment &amp; Instructions, Wiring Diagrams Fig. 29, Body Fig. 6), owner measurements and the 2026-10-09 scan.
        Manual data is general 906 (SOURCE) until checked on this van. “Confirm” means the manuals don’t say: nothing is guessed.
      </footer>
    </div>
  );
}
