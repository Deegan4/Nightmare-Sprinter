// The van, drawn two ways: from the driver's side and from above (x-ray).
// Positions are APPROXIMATE until confirmed by photos on this van.
import { Frame, Pin, type PinKind } from './parts';

export interface MapPin { n: string; label: string; zone: string; kind: PinKind; side: [number, number]; top: [number, number] }
export const PINS: MapPin[] = [
  { n: '1', label: 'Horn & horn plug', zone: 'zone-engine', kind: 'part', side: [78, 238], top: [50, 140] },
  { n: '2', label: 'A/C compressor plug (oil found)', zone: 'zone-engine', kind: 'part', side: [118, 192], top: [104, 180] },
  { n: '3', label: 'Ground W9/6 (left front lamp)', zone: 'zone-engine', kind: 'gnd', side: [44, 202], top: [58, 226] },
  { n: '4', label: 'SAM (body-control module)', zone: 'zone-footwell', kind: 'part', side: [173, 220], top: [176, 222] },
  { n: '5', label: 'Under-seat box & fuse card (big fuses: confirm spot)', zone: 'zone-seat', kind: 'hot', side: [230, 212], top: [236, 196] },
  { n: '6', label: 'Ground W71/3 (seat base)', zone: 'zone-seat', kind: 'gnd', side: [264, 246], top: [264, 240] },
  { n: '7', label: 'Trailer plug', zone: 'zone-rear', kind: 'part', side: [698, 246], top: [704, 150] },
];

const SIDE_ZONES: Record<string, [number, number, number, number]> = {
  'zone-engine': [22, 150, 128, 106], 'zone-footwell': [150, 176, 48, 80], 'zone-seat': [198, 148, 72, 108], 'zone-rear': [646, 190, 68, 76],
};
const TOP_ZONES: Record<string, [number, number, number, number]> = {
  'zone-engine': [28, 52, 122, 196], 'zone-footwell': [150, 170, 60, 80], 'zone-seat': [210, 170, 62, 80], 'zone-rear': [640, 54, 76, 192],
};
const ZONE_NAMES: Record<string, string> = { 'zone-engine': 'Engine bay', 'zone-footwell': 'Driver footwell', 'zone-seat': 'Driver seat', 'zone-rear': 'Rear / trailer plug' };

function Zones({ map, active, onZone }: { map: Record<string, [number, number, number, number]>; active?: string; onZone?: (z: string) => void }) {
  return (
    <>
      {Object.entries(map).map(([id, [x, y, w, h]]) => {
        if (!onZone && id !== active) return null;
        return (
          <g>
            {onZone && (
              <rect x={x} y={y} width={w} height={h} rx="12" class="il-zone-hit" tabIndex={0} role="button" aria-label={`Open ${ZONE_NAMES[id]}`}
                onClick={() => onZone(id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onZone(id)} />
            )}
            <rect x={x} y={y} width={w} height={h} rx="12" class={`il-zone-outline${id === active ? ' on' : ''}`} />
          </g>
        );
      })}
    </>
  );
}

function pinsFor(view: 'side' | 'top', active?: string, only?: string[]) {
  return PINS.filter((p) => !only || only.includes(p.n)).map((p) => {
    const [x, y] = p[view];
    return <Pin x={x} y={y} n={p.n} kind={p.kind} pulse={!!active && p.zone === active} label={p.label} s={1.55} />;
  });
}

/** Driver's side elevation. Front of the van on the left. */
export function VanSide({ active, onZone, pins, caption, tag }: { active?: string; onZone?: (z: string) => void; pins?: string[]; caption?: string; tag?: string }) {
  return (
    <Frame viewBox="0 0 720 310" label="Side view of the Sprinter, driver's side, front on the left, with numbered wiring points" caption={caption ?? 'Driver’s side view · front on the left'} tag={tag ?? 'Approximate'}>
      <line x1="8" y1="297" x2="712" y2="297" class="il-thin" />
      <path class="il-body" d="M32 252 L28 222 Q27 200 42 193 L118 170 Q136 165 146 154 L198 70 Q208 54 232 52 L672 50 Q690 50 692 66 L694 252 L566 252 A46 46 0 0 0 474 252 L178 252 A46 46 0 0 0 86 252 Z" />
      <path class="il-thin" d="M290 150 H680 M290 158 H680" opacity=".5" />
      <path class="il-glass" d="M158 150 L202 82 Q206 76 214 76 L262 76 L262 150 Z" />
      <path class="il-thin" d="M268 58 V250 M150 156 H268" />
      <rect x="238" y="168" width="20" height="6" rx="3" class="il-fill3" />
      <path class="il-fill2" d="M196 104 L178 100 L176 124 L194 126 Z" />
      <path class="il-fill2" d="M34 201 L70 190 L74 204 L37 213 Z" />
      <path class="il-fill3" d="M28 222 L72 222 L76 252 L32 252 Z" />
      <rect x="684" y="228" width="18" height="28" rx="3" class="il-fill3" />
      <rect x="685" y="140" width="8" height="46" rx="2" fill="var(--il-hot)" stroke="var(--il-ink)" stroke-width="2" />
      {/* x-ray interior: steering wheel, seat, seat base box */}
      <ellipse cx="196" cy="128" rx="7" ry="24" class="il-dash" transform="rotate(-24 196 128)" />
      <path class="il-dash" d="M244 84 L232 170 M206 172 L256 172 M208 180 H254 V244 H208 Z" />
      <path class="il-dash" d="M78 196 h56 v38 h-56 Z" />
      <circle cx="132" cy="262" r="34" class="il-dark" /><circle cx="132" cy="262" r="15" class="il-fill2" />
      <circle cx="520" cy="262" r="34" class="il-dark" /><circle cx="520" cy="262" r="15" class="il-fill2" />
      <text x="40" y="34" class="il-text lg">◄ FRONT</text>
      <text x="690" y="34" class="il-text end lg">REAR ►</text>
      <Zones map={SIDE_ZONES} active={active} onZone={onZone} />
      {pinsFor('side', active, pins)}
    </Frame>
  );
}

/** Top-down x-ray. Front on the left, driver's side along the bottom. */
export function VanTop({ active, onZone, pins, caption, tag }: { active?: string; onZone?: (z: string) => void; pins?: string[]; caption?: string; tag?: string }) {
  return (
    <Frame viewBox="0 0 720 300" label="Top-down x-ray of the Sprinter, front on the left, driver's side along the bottom, with tappable zones" caption={caption ?? 'Seen from above · front on the left · driver’s side at the bottom'} tag={tag ?? 'Approximate'}>
      <rect x="98" y="38" width="54" height="14" rx="4" class="il-dark" /><rect x="98" y="248" width="54" height="14" rx="4" class="il-dark" />
      <rect x="466" y="38" width="58" height="14" rx="4" class="il-dark" /><rect x="466" y="248" width="58" height="14" rx="4" class="il-dark" />
      <ellipse cx="184" cy="36" rx="16" ry="8" class="il-fill2" /><ellipse cx="184" cy="264" rx="16" ry="8" class="il-fill2" />
      <path class="il-body" d="M152 50 L676 50 Q692 50 692 66 L692 234 Q692 250 676 250 L152 250 L76 240 Q36 234 34 196 L34 104 Q36 66 76 60 Z" />
      <path class="il-glass" d="M150 56 L196 52 L196 248 L150 244 Q144 150 150 56 Z" />
      <path class="il-thin" d="M44 88 V212" />
      <rect x="58" y="96" width="80" height="108" rx="10" class="il-fill2" />
      <path class="il-thin" d="M70 112 h56 M70 124 h56 M70 176 h56 M70 188 h56" opacity=".6" />
      <circle cx="84" cy="186" r="12" class="il-fill3" />
      <path class="il-fill2" d="M40 222 L66 236 L84 238 L70 224 Z" /><path class="il-fill2" d="M40 78 L66 64 L84 62 L70 76 Z" />
      <path class="il-dash" d="M206 60 V240" />
      <rect x="216" y="64" width="46" height="52" rx="9" class="il-fill2" /><rect x="216" y="184" width="46" height="52" rx="9" class="il-fill2" />
      <ellipse cx="206" cy="210" rx="5" ry="18" class="il-line" />
      <path class="il-thin" d="M274 54 V246" />
      <rect x="290" y="66" width="384" height="168" rx="6" class="il-dash" />
      <path class="il-thin" d="M354 66 V234 M418 66 V234 M482 66 V234 M546 66 V234 M610 66 V234" opacity=".25" />
      <text x="482" y="158" class="il-text mid lg" opacity=".55">CARGO AREA</text>
      <rect x="692" y="70" width="12" height="160" rx="3" class="il-fill3" />
      <text x="34" y="24" class="il-text lg">◄ FRONT</text>
      <text x="420" y="24" class="il-text mid lg">PASSENGER SIDE</text>
      <text x="420" y="292" class="il-text mid lg">DRIVER SIDE (US left)</text>
      <Zones map={TOP_ZONES} active={active} onZone={onZone} />
      {pinsFor('top', active, pins)}
    </Frame>
  );
}

export function PinLegend({ zone, onPick }: { zone?: string; onPick?: (zone: string) => void }) {
  const list = PINS.filter((p) => !zone || p.zone === zone);
  return (
    <ul class="list stack" style="margin-top:10px">
      {list.map((p) => (
        <li>
          <button type="button" class="item" style="min-height:56px" onClick={() => onPick?.(p.zone)} disabled={!onPick}>
            <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true"><Pin x={0} y={0} n={p.n} kind={p.kind} /></svg>
            <span class="grow"><b>{p.label}</b><br /><span class="small muted">{ZONE_NAMES[p.zone]} · {p.kind === 'gnd' ? 'ground point' : p.kind === 'hot' ? 'power / fuses' : 'part / plug'}</span></span>
            {onPick && <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7" /></svg>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function PinKey() {
  return (
    <div class="legend" aria-label="Map key">
      <span><i style="background:var(--accent)" />Part / plug</span>
      <span><i style="background:var(--il-hot)" />Power / fuses</span>
      <span><i style="background:var(--il-fill)" />Ground point</span>
      <span><i style="background:var(--il-zone);border-style:dashed;border-color:var(--accent);border-radius:4px" />Tap a zone</span>
    </div>
  );
}
