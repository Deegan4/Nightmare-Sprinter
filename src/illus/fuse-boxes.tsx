// Fuse-box legend cards, redrawn from the manual's fuse legends (shared/fuses.ts). Number order, not the slot layout.
// Blade colours are the standard blade-fuse colour code for each rating, not a photo of this van.
import type { Fuse, FuseBox, Hit } from '../../shared/fuses';
import { HIT_COLOR } from '../../shared/fuses';

const INK = '#cfe0ff', BG = '#0a1220', AMB = '#ffd23f';
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; fill?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} stroke="none" style={`font:${o.w ?? 700} ${o.size ?? 12}px var(--font-body)`} fill={o.fill ?? INK}>{s}</text>
);
const BLADE: Record<string, string> = { '5': '#d2b48c', '7.5': '#8b5a2b', '10': '#e03a2f', '15': '#2f6fe0', '20': '#f2d21b', '25': '#e8e8e8', '30': '#2fae4f', '40': '#f08a24' };
const blade = (amp: string) => BLADE[amp.split(/[ /]/)[0]] ?? '#7f8ea3';

function wrap(s: string, max: number) {
  const out: string[] = [];
  let cur = '';
  for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) out.push(cur);
  return out;
}

const COLS = 4, CW = 236, CH = 104, GAP = 8, X0 = 16;

function Card({ f, x, y, dim, relay }: { f: Fuse; x: number; y: number; dim: boolean; relay?: boolean }) {
  const hot = f.hit?.[0];
  const what = wrap(f.what, 27).slice(0, 2);
  const note = f.note ? wrap(f.note, 34).slice(0, 3) : [];
  return (
    <g transform={`translate(${x} ${y})`} opacity={dim ? 0.32 : 1}>
      <rect width={CW} height={CH} rx="8" fill="#13243d" stroke={hot ? HIT_COLOR[hot] : '#2b4467'} stroke-width={hot ? 2.6 : 1.2} />
      {relay ? (
        <g><rect x="10" y="12" width="40" height="40" rx="4" fill="#26364d" stroke="#9fb3c8" stroke-width="1.4" /><path d="M18 40 l6 -16 l6 10 l6 -14" stroke="#9fb3c8" stroke-width="1.6" fill="none" /></g>
      ) : (
        <g>
          <rect x="14" y="10" width="32" height="30" rx="4" fill={blade(f.amp)} stroke="#121417" stroke-width="1.4" />
          <rect x="19" y="40" width="7" height="12" fill="#c0c8d2" stroke="#121417" /><rect x="34" y="40" width="7" height="12" fill="#c0c8d2" stroke="#121417" />
          {T(30, 30, f.amp.replace(' A', '').split(' ')[0], { size: 11, anchor: 'middle', w: 800, fill: '#121417' })}
        </g>
      )}
      {T(30, 70, f.n, { size: 13, anchor: 'middle', w: 800 })}
      {T(58, 22, f.amp, { size: 12, w: 800, fill: '#ff9f1c' })}
      {what.map((l, i) => T(58, 40 + i * 14, l, { size: 11, w: 600 }))}
      {note.map((l, i) => T(58, 40 + what.length * 14 + 2 + i * 12, l, { size: 9.5, w: 600, fill: '#d1a565' }))}
      {f.hit && <g transform={`translate(10 ${CH - 20})`}>{f.hit.map((h: Hit, i) => <circle cx={8 + i * 14} cy="7" r="5.5" fill={HIT_COLOR[h]} />)}</g>}
    </g>
  );
}

export function FuseBoxDiagram({ box, only }: { box: FuseBox; only: boolean }) {
  const rows = (n: number) => Math.ceil(n / COLS);
  const top = 92;
  const fy = (i: number) => top + Math.floor(i / COLS) * (CH + GAP);
  const relTop = top + rows(box.fuses.length) * (CH + GAP) + (box.relays ? 28 : 0);
  const h = (box.relays ? relTop + rows(box.relays.length) * (CH + GAP) : relTop) + 40;
  const W = X0 * 2 + COLS * CW + (COLS - 1) * GAP;
  return (
    <svg class="xr-svg gm-svg" viewBox={`0 0 ${W} ${h}`} role="img" aria-label={`${box.name}: ${box.fuses.map((f) => `${f.n} ${f.amp} ${f.what}`).join('; ')}`}>
      <rect width={W} height={h} fill={BG} />
      <rect x="8" y="8" width={W - 16} height={h - 16} rx="12" fill="none" stroke="#2b4467" stroke-width="1.5" />
      {T(X0 + 4, 36, box.name, { size: 17, w: 800, fill: '#ffffff' })}
      {T(X0 + 4, 56, `WHERE: ${box.where}`, { size: 11.5, w: 700, fill: AMB })}
      {T(X0 + 4, 74, `Legend: ${box.src}. Number order, not slot layout.`, { size: 10.5, w: 600, fill: '#9fb3c8' })}
      {box.fuses.map((f, i) => <Card f={f} x={X0 + (i % COLS) * (CW + GAP)} y={fy(i)} dim={only && !f.hit} />)}
      {box.relays && T(X0 + 4, relTop - 10, 'RELAYS', { size: 12, w: 800, fill: '#9fb3c8' })}
      {box.relays?.map((f, i) => <Card relay f={f} x={X0 + (i % COLS) * (CW + GAP)} y={relTop + Math.floor(i / COLS) * (CH + GAP)} dim={only && !f.hit} />)}
      {T(X0 + 4, h - 20, 'Redrawn from the owner’s Mercedes fuse legends. Your fuse card in the van wins if it differs.', { size: 10.5, w: 600, fill: '#7f97b4' })}
    </svg>
  );
}
