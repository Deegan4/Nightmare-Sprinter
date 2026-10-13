// Close-up "where to look" scenes, one per zone. Stylised and APPROXIMATE:
// no fuse numbers, pin positions or wire colours are invented here.
import { Frame, Label, Leader, Pin } from './parts';

export function EngineScene() {
  return (
    <Frame viewBox="0 0 400 300" label="Engine bay seen from the front bumper, driver side on the right" caption="Standing at the front bumper, looking in">
      <path class="il-fill2" d="M14 20 H84 V196 H14 Z M316 20 H386 V196 H316 Z" />
      <rect x="96" y="40" width="208" height="112" rx="14" class="il-fill2" />
      <rect x="108" y="52" width="82" height="88" rx="8" class="il-fill3" />
      <rect x="210" y="52" width="82" height="88" rx="8" class="il-fill3" />
      <path class="il-thin" d="M118 68 h62 M118 84 h62 M118 100 h62 M118 116 h62 M220 68 h62 M220 84 h62 M220 100 h62 M220 116 h62" opacity=".6" />
      <circle cx="268" cy="168" r="20" class="il-fill3" /><circle cx="268" cy="168" r="8" class="il-body" />
      <path d="M248 186 q-4 8 0 12 q4-4 0-12z" fill="#1d1a12" stroke="var(--accent)" stroke-width="2" />
      <rect x="52" y="160" width="296" height="22" rx="4" class="il-fill2" />
      <path class="il-thin" d="M72 162 v18 M92 162 v18 M112 162 v18 M132 162 v18 M152 162 v18 M172 162 v18 M192 162 v18 M212 162 v18 M232 162 v18 M252 162 v18 M272 162 v18 M292 162 v18 M312 162 v18 M332 162 v18" opacity=".45" />
      <path class="il-fill2" d="M22 200 H112 L104 224 H28 Z M288 200 H378 L372 224 H296 Z" />
      <rect x="122" y="198" width="156" height="28" rx="5" class="il-fill2" />
      <rect x="14" y="230" width="372" height="30" rx="12" class="il-fill3" />
      <path d="M150 210 l14 -8 v20 z M164 206 h10 v8 h-10" class="il-fill3" />
      <path d="M96 100 l-12 -6 l8 -6 l-8 -6 l8 -6 l-8 -6" class="il-line" />
      <Pin x={168} y={214} n="1" label="Horn" />
      <Pin x={290} y={190} n="2" label="A/C compressor plug" />
      <Pin x={350} y={212} n="3" kind="gnd" label="Ground W9/6" />
      <Leader d="M168 228 V272 H120" /><Label x={14} y={272}>1 Horn (behind bumper)</Label>
      <Leader d="M290 176 V150 H330" /><Label x={300} y={140} anchor="middle">2 A/C plug · oil</Label>
      <Leader d="M350 226 V272" /><Label x={386} y={272} anchor="end">3 W9/6 ground</Label>
      <Label x={84} y={92}>strap ✓</Label>
      <text x="200" y="292" class="il-text mid sm">▲ YOU STAND HERE ▲</text>
      <text x="386" y="14" class="il-text end sm">DRIVER SIDE ►</text>
      <text x="14" y="14" class="il-text sm">◄ PASSENGER</text>
    </Frame>
  );
}

export function FootwellScene() {
  return (
    <Frame viewBox="0 0 400 290" label="Driver footwell seen through the open driver door, front of van on the left" caption="Driver door open, looking in">
      <rect x="10" y="10" width="380" height="250" rx="16" class="il-line" />
      <path class="il-fill2" d="M10 54 H196 Q232 60 244 100 V122 H10 Z" />
      <path class="il-line" d="M210 120 L232 70" />
      <ellipse cx="214" cy="88" rx="12" ry="44" class="il-line" style="stroke-width:6" transform="rotate(-18 214 88)" />
      <path class="il-fill2" d="M10 122 H64 V244 H10 Z" />
      <rect x="20" y="146" width="36" height="64" rx="4" class="il-dash" />
      <path class="il-fill3" d="M92 124 h10 v52 h-10 z M86 172 h22 v12 h-22 z M128 124 h10 v60 h-10 z M120 180 h26 v12 h-26 z" />
      <path class="il-fill3" d="M150 122 h30 l-4 12 h-22 z" />
      <path class="il-fill2" d="M252 178 H372 V244 H252 Z" />
      <path class="il-fill3" d="M246 150 Q248 140 262 140 H372 V178 H246 Z" />
      <path class="il-fill3" d="M330 140 L352 22 Q356 14 368 16 L378 18 L374 140 Z" />
      <path class="il-fill3" d="M10 244 H390 V260 H10 Z" />
      <Pin x={38} y={178} n="4" label="SAM behind trim" />
      <Pin x={165} y={128} n="D" label="Diagnostic port" />
      <Pin x={30} y={232} n="G" kind="gnd" label="Footwell ground" />
      <Leader d="M52 178 H80 V86" /><Label x={60} y={76}>4 SAM behind kick panel</Label>
      <Leader d="M165 142 V206" /><Label x={165} y={214} anchor="middle">D scanner port (approx.)</Label>
      <Leader d="M44 232 H88" /><Label x={88} y={232}>G footwell ground</Label>
      <text x="16" y="282" class="il-text sm">◄ FRONT</text>
      <text x="384" y="282" class="il-text end sm">SEAT ►</text>
    </Frame>
  );
}

export function SeatScene() {
  return (
    <Frame viewBox="0 0 400 290" label="Driver seat and the box under it, side view, front on the left" caption="Driver seat from the door, front on the left">
      <path class="il-fill3" d="M264 118 L292 20 Q296 12 308 14 L320 16 L304 118 Z" />
      <rect x="70" y="100" width="240" height="26" rx="12" class="il-fill3" />
      <rect x="70" y="126" width="240" height="112" rx="6" class="il-fill2" />
      <rect x="86" y="140" width="208" height="86" rx="6" class="il-body" />
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <rect x={100 + i * 13} y="160" width="9" height="20" rx="2" class="il-fill3" />)}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <rect x={100 + i * 13} y="188" width="9" height="20" rx="2" class="il-fill3" />)}
      </g>
      <rect x="240" y="156" width="22" height="56" rx="3" fill="var(--il-hot)" fill-opacity=".3" stroke="var(--il-hot)" stroke-width="2.5" />
      <rect x="266" y="156" width="22" height="56" rx="3" fill="var(--il-hot)" fill-opacity=".3" stroke="var(--il-hot)" stroke-width="2.5" />
      <rect x="28" y="40" width="88" height="54" rx="4" class="il-body" transform="rotate(-8 72 67)" />
      <path class="il-thin" d="M38 54 h60 M38 64 h68 M38 74 h52 M38 84 h64" transform="rotate(-8 72 67)" />
      <path class="il-thin" d="M10 238 H390" /><path class="il-fill3" d="M10 238 H390 V252 H10 Z" />
      <circle cx="80" cy="244" r="6" class="il-body" />
      <Pin x={72} y={34} n="C" label="Fuse card legend" />
      <Pin x={264} y={146} n="5" kind="hot" label="Big fuses, exact spot to confirm" />
      <Pin x={80} y={266} n="6" kind="gnd" label="Ground W71/3" />
      <Leader d="M86 34 H150" /><Label x={150} y={34}>C fuse-card legend: photograph it</Label>
      <Leader d="M264 132 V112" /><Label x={394} y={100} anchor="end">5 big fuses? confirm spot</Label>
      <Leader d="M94 266 H130" /><Label x={130} y={266}>6 W71/3 seat-base ground</Label>
      <text x="190" y="134" class="il-text mid sm">BOX UNDER SEAT (lid off)</text>
    </Frame>
  );
}

export function RearScene() {
  return (
    <Frame viewBox="0 0 460 290" label="Rear of the van with trailer socket and a zoomed socket face" caption="Standing behind the van">
      <rect x="30" y="16" width="250" height="214" rx="16" class="il-body" />
      <path class="il-thin" d="M155 22 V226" />
      <rect x="50" y="34" width="92" height="64" rx="6" class="il-glass" /><rect x="168" y="34" width="92" height="64" rx="6" class="il-glass" />
      <rect x="34" y="104" width="12" height="80" rx="3" fill="var(--il-hot)" stroke="var(--il-ink)" stroke-width="2" />
      <rect x="264" y="104" width="12" height="80" rx="3" fill="var(--il-hot)" stroke="var(--il-ink)" stroke-width="2" />
      <rect x="20" y="230" width="270" height="22" rx="6" class="il-fill3" />
      <rect x="48" y="252" width="40" height="30" rx="6" class="il-dark" /><rect x="222" y="252" width="40" height="30" rx="6" class="il-dark" />
      <circle cx="200" cy="262" r="11" class="il-fill2" />
      <path d="M210 254 L330 150" class="il-dash" />
      <circle cx="380" cy="120" r="66" class="il-body" />
      <circle cx="380" cy="120" r="50" class="il-fill2" />
      <path d="M330 70 A70 70 0 0 1 430 70" class="il-line" />
      <text x="380" y="114" class="il-text mid">Find the</text>
      <text x="380" y="134" class="il-text mid">molded “4”</text>
      <Pin x={200} y={262} n="7" label="Trailer socket" pulse />
      <Label x={380} y={204} anchor="middle">socket face (zoomed)</Label>
      <Label x={380} y={226} anchor="middle">terminal numbers are on it</Label>
    </Frame>
  );
}

export const ZONE_SCENES: Record<string, () => any> = {
  'zone-engine': EngineScene, 'zone-footwell': FootwellScene, 'zone-seat': SeatScene, 'zone-rear': RearScene,
};
