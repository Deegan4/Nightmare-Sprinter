// See-through wiring view. Parts sit in the area their source names; tap one to see where it is,
// what it does, what connects to it and which figure says so.
import { useState } from 'preact/hooks';
import type { Photo } from '../../shared/types';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov } from '../components/ui';
import { LAYERS, LAYER_COLOR, XLINKS, XNODES, XrayVan, type Layer, type XNode } from '../illus/xray';
import { FindB12 } from '../illus/find-b12';
import { openSheet } from './sheets';
import { href } from '../lib/router';
import { list, useStore } from '../lib/store';

function markedPhoto(n: XNode): Photo | undefined {
  for (const p of list<Photo>('photo')) {
    if (p.data.markers?.some((m) => n.keys.some((k) => m.label.toLowerCase().includes(k)))) return p.data;
  }
  return undefined;
}

export function Xray() {
  useStore();
  const [layers, setLayers] = useState<Set<Layer>>(() => new Set(LAYERS.map((l) => l.key)));
  const [sel, setSel] = useState<string | undefined>('k40');
  const [view, setView] = useState<'top' | 'side'>('top');
  const toggle = (k: Layer) => { const s = new Set(layers); s.has(k) ? s.delete(k) : s.add(k); setLayers(s.size ? s : new Set([k])); };
  const only = (k: Layer) => setLayers(new Set([k]));
  const all = layers.size === LAYERS.length;
  const n = XNODES.find((x) => x.id === sel);
  const links = n ? XLINKS.filter((l) => l.from === n.id || l.to === n.id) : [];
  const ph = n ? markedPhoto(n) : undefined;
  const name = (id: string) => XNODES.find((x) => x.id === id)?.code ?? id;

  return (
    <div class="anim-in">
      <PageHead title="See-through wiring" back="#/more" kicker="X-ray view">
        <p class="lede">The van with the body see-through, from above or from the driver’s side. Each part sits in the area the manuals name; lines show <b>what connects to what</b>, not where the harness runs. Tap a part.</p>
      </PageHead>

      <Chips label="View" value={view} onChange={setView} options={[{ key: 'top', label: 'From above' }, { key: 'side', label: 'Driver’s side' }]} />
      <div class="chips xr-chips" role="group" aria-label="Circuit layers" style="margin-top:10px">
        <button type="button" class="chip sm" aria-pressed={all} onClick={() => setLayers(new Set(LAYERS.map((l) => l.key)))}>All</button>
        {LAYERS.map((l) => (
          <button type="button" class="chip sm" aria-pressed={layers.has(l.key) && !all} onClick={() => (all ? only(l.key) : toggle(l.key))}>
            <i class="xr-swatch" style={`background:${l.color}`} />{l.label}
          </button>
        ))}
      </div>

      <div class="xr-wrap" aria-label="See-through view, scrolls sideways"><XrayVan view={view} layers={layers} sel={sel} onPick={(id) => setSel(id === sel ? undefined : id)} confirmed={(x) => !!markedPhoto(x)} /></div>

      <p class="small muted xr-hint">Swipe the drawing sideways to see the rear of the van →</p>
      <div class="legend xr-legend" aria-label="Key">
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="#13243d" stroke="#4da3ff" stroke-width="2" /></svg>Module</span>
        <span><svg width="22" height="16" viewBox="-11 -8 22 16"><rect x="-10" y="-7" width="20" height="14" rx="3" fill="#0d1726" stroke="#ff5a4e" stroke-width="2" /></svg>Fuses</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="#0d1726" stroke="#9fb3c8" stroke-width="2" /></svg>Ground</span>
        <span><svg width="26" height="10"><path d="M2 5h22" stroke="#ffd23f" stroke-width="3" stroke-dasharray="6 4" /></svg>Data (CAN)</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="none" stroke="#9fb3c8" stroke-dasharray="3 3" /></svg>Spot not known</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="6" fill="#ff5a4e" /></svg>Scan codes</span>
        <span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="7" fill="none" stroke="#2fd27a" stroke-width="2.5" /></svg>Marked on a photo</span>
      </div>

      {n ? (
        <section class="card xr-card" aria-live="polite">
          <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
            <span class="xr-code-pill" style={`border-color:${LAYER_COLOR[n.layers[0]]}`}>{n.code}</span>
            <h2 style="margin:0;font-size:1.2rem" class="grow">{n.name}</h2>
          </div>
          <dl class="xr-dl">
            <dt>Where</dt>
            <dd>{ph ? <>Marked on a photo of this van <Prov p="CONFIRMED" /></> : <>{n.where} <Prov p={n.loc} /></>}</dd>
            <dt>What it does</dt><dd>{n.does}</dd>
            <dt>Source</dt><dd class="small">{n.source}</dd>
            {n.codes && <><dt>Scan</dt><dd><a href="#/codes">{n.codes}</a> <Prov p="REPORTED" /></dd></>}
          </dl>
          {links.length > 0 && (
            <>
              <h3 class="small muted" style="margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em">Connects to</h3>
              <ul class="xr-links">
                {links.map((l) => (
                  <li>
                    <i class="xr-swatch" style={`background:${LAYER_COLOR[l.layer]}`} />
                    <span class="grow">
                      {l.from !== l.to && <button type="button" class="linkish" onClick={() => setSel(l.from === n.id ? l.to : l.from)}>{name(l.from === n.id ? l.to : l.from)}</button>}{' '}
                      {l.label}<br /><span class="small muted">{l.src}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
            {n.zone && <a class="btn sm" href={href(`/zone/${n.zone}`)}><Icon name="map" />Open area & photos</a>}
            <a class="btn sm ghost" href="#/sheet"><Icon name="plan" />Wiring sheet</a>
          </div>
        </section>
      ) : <p class="muted">Tap any part on the drawing.</p>}

      <section class="section" id="find-b12">
        <div class="section-head"><h2>Where to find the A/C pressure sensor (B12)</h2></div>
        <p class="small muted" style="margin:0 0 8px">Manual: “in engine compt” only. Wiring and colours are from Fig. 1 <Prov p="SOURCE" />; the shaded spots are typical places, not manual data.</p>
        <div class="xr-wrap"><FindB12 /></div>
        <button type="button" class="btn sm" style="margin-top:10px" onClick={() => openSheet('photo', { caption: 'A/C pressure sensor B12 (3-wire plug on A/C pipe)' })}><Icon name="camera" />Found it: photograph and mark B12</button>
      </section>
      <section class="section">
        <div class="section-head"><h2>Every part on this view</h2></div>
        <ul class="list stack">
          {XNODES.filter((x) => x.layers.some((l) => layers.has(l))).map((x) => (
            <li><button type="button" class="item" style="min-height:52px" onClick={() => { setSel(x.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <span class="xr-code-pill" style={`border-color:${LAYER_COLOR[x.layers[0]]}`}>{x.code}</span>
              <span class="grow"><b>{x.name}</b><br /><span class="small muted">{x.where}</span></span>
              <Prov p={markedPhoto(x) ? 'CONFIRMED' : x.loc} />
            </button></li>
          ))}
        </ul>
      </section>
      <p class="small muted">Areas come from the owner’s 906 manuals (figure numbers above) and, for the F59 and seat-base fuse boxes, from Mercedes’ 2015 Sprinter fuse supplement. Inside an area the dot position is a drawing choice. Mark the real spot on a photo and it turns green here.</p>
    </div>
  );
}
