// "How to hook up the meter" concept drawings. These teach the METHOD only.
// Red/black are the meter-lead colours, not the van's wire colours.
import { Frame, GroundSym, Label, Meter, Probe } from './parts';

const TAG = 'Concept drawing';
const leadsNote = 'Red/black = meter leads, not van wires';

function Battery({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="10" width="70" height="52" rx="6" class="il-fill2" />
      <rect x="10" y="2" width="14" height="10" rx="2" fill="var(--il-hot)" stroke="var(--il-ink)" stroke-width="2" />
      <rect x="46" y="2" width="14" height="10" rx="2" class="il-dark" />
      <text x="17" y="40" class="il-text mid lg">+</text><text x="53" y="40" class="il-text mid lg">−</text>
      <text x="35" y="56" class="il-text mid sm">BATTERY</text>
    </g>
  );
}

function Fuse({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-14" width="70" height="28" rx="5" class="il-accent" style="fill:#f2c94c" />
      <path d="M8 0 H24 L30 -6 L40 6 L46 0 H62" stroke="#121417" stroke-width="2.5" fill="none" />
      <text x="35" y="32" class="il-text mid sm">{label}</text>
    </g>
  );
}

export function FuseDropMethod() {
  return (
    <Frame viewBox="0 0 400 270" tag={TAG} label="Voltage drop across a fuse: one meter lead on each end of the fuse while current flows" caption={leadsNote}>
      <Battery x={16} y={30} />
      <path d="M33 34 V20 H150" class="il-hot" style="stroke:var(--il-ink);stroke-width:5" />
      <Fuse x={150} y={20} label="BIG FUSE" />
      <path d="M220 20 H306 V44" class="il-line" style="stroke-width:5" />
      <rect x="276" y="44" width="100" height="62" rx="8" class="il-fill2" />
      <text x="326" y="72" class="il-text mid">SAM / SRB</text><text x="326" y="92" class="il-text mid sm">(the load)</text>
      <Meter x={146} y={110} reading="0.04" />
      <path d="M208 232 C 240 250, 240 140, 214 34" class="il-hot" />
      <path d="M174 232 C 130 250, 130 140, 156 34" class="il-gnd" />
      <Probe x={156} y={20} color="black" angle={180} /><Probe x={214} y={20} color="red" angle={180} />
      <Label x={14} y={130}>key ON + loads ON</Label>
      <Label x={14} y={154}>so current is flowing</Label>
      <Label x={262} y={140}>one lead each end</Label>
      <Label x={262} y={164}>small = good</Label>
    </Frame>
  );
}

export function GroundDropMethod() {
  return (
    <Frame viewBox="0 0 400 270" tag={TAG} label="Ground voltage drop: red lead on the part's ground terminal, black lead on battery negative, with the part working" caption={leadsNote}>
      <rect x="20" y="30" width="96" height="60" rx="10" class="il-fill2" />
      <text x="68" y="58" class="il-text mid">PART</text><text x="68" y="78" class="il-text mid sm">(working)</text>
      <circle cx="104" cy="96" r="6" class="il-body" />
      <path d="M104 102 V150 H170" class="il-line" style="stroke-width:5" />
      <GroundSym x={170} y={162} />
      <text x="170" y="196" class="il-text mid sm">CHASSIS</text>
      <path d="M184 150 H286 V92" class="il-line" style="stroke-width:5;opacity:.5" />
      <Battery x={262} y={30} />
      <Meter x={150} y={112} reading="0.08" />
      <path d="M212 234 C 260 250, 120 170, 104 104" class="il-hot" />
      <path d="M178 234 C 120 260, 380 200, 315 40" class="il-gnd" />
      <Probe x={104} y={100} color="red" angle={200} /><Probe x={315} y={34} color="black" angle={180} />
      <Label x={14} y={226}>RED on the part’s ground</Label>
      <Label x={14} y={250}>BLACK on battery −</Label>
      <Label x={250} y={128}>over 0.2 V = weak</Label>
    </Frame>
  );
}

export function FeedMethod({ what = 'TERMINAL' }: { what?: string }) {
  return (
    <Frame viewBox="0 0 400 260" tag={TAG} label="Checking for 12 volts: red lead on the terminal, black lead on a clean ground" caption={leadsNote}>
      <rect x="40" y="30" width="120" height="70" rx="12" class="il-fill2" />
      <circle cx="78" cy="65" r="12" class="il-body" /><circle cx="122" cy="65" r="12" class="il-body" />
      <text x="100" y="122" class="il-text mid sm">{what}</text>
      <GroundSym x={330} y={70} />
      <text x="330" y="104" class="il-text mid sm">CLEAN BARE METAL</text>
      <Meter x={156} y={116} reading="12.4" />
      <path d="M218 238 C 260 250, 60 200, 78 72" class="il-hot" />
      <path d="M184 238 C 150 252, 360 190, 330 64" class="il-gnd" />
      <Probe x={78} y={66} color="red" angle={190} /><Probe x={330} y={58} color="black" angle={180} />
      <Label x={14} y={160}>11.5 – 14.5 V</Label>
      <Label x={14} y={184}>= feed arriving</Label>
    </Frame>
  );
}

export function HornMethod() {
  return (
    <Frame viewBox="0 0 400 260" tag={TAG} label="Horn test: helper presses the horn while you read volts at the unplugged horn connector" caption={leadsNote}>
      <circle cx="62" cy="70" r="44" class="il-line" style="stroke-width:7" />
      <circle cx="62" cy="70" r="16" class="il-fill2" />
      <path d="M40 30 q-6 -18 10 -20 q10 0 12 18 l2 30" class="il-body" />
      <text x="62" y="134" class="il-text mid">HELPER</text><text x="62" y="152" class="il-text mid sm">holds horn</text>
      <path d="M110 70 H170" class="il-dash" />
      <rect x="170" y="44" width="70" height="52" rx="8" class="il-fill2" />
      <text x="205" y="68" class="il-text mid sm">SAM</text><text x="205" y="84" class="il-text mid sm">relay</text>
      <path d="M240 70 H290" class="il-line" style="stroke-width:5" />
      <rect x="290" y="50" width="44" height="40" rx="6" class="il-fill3" />
      <path d="M346 54 l34 -18 v68 l-34 -18 z" class="il-fill2" />
      <text x="356" y="124" class="il-text mid sm">HORN</text>
      <text x="312" y="40" class="il-text mid sm">PLUG</text>
      <Meter x={160} y={112} reading="12.3" />
      <path d="M222 234 C 280 250, 320 160, 304 74" class="il-hot" />
      <path d="M188 234 C 120 250, 110 200, 120 200" class="il-gnd" />
      <GroundSym x={120} y={212} />
      <Probe x={304} y={70} color="red" angle={180} />
      <Label x={250} y={160}>12 V here?</Label>
      <Label x={250} y={184}>yes → SAM side OK</Label>
    </Frame>
  );
}

export function OhmsTrap() {
  return (
    <Frame viewBox="0 0 400 200" tag="Why ohms lie" label="Ohm test trap: the leads alone read 2.1 ohms, the fuse read 2.2 ohms, so the test shows nothing" caption="Measured on this van: the 150 A pre-fuse">
      <g transform="translate(20 20)">
        <rect width="170" height="130" rx="12" class="il-body" />
        <text x="85" y="26" class="il-text mid sm">LEADS TOUCHING</text>
        <rect x="35" y="40" width="100" height="40" rx="5" class="il-lcd" />
        <text x="85" y="68" class="il-lcd-text">2.1Ω</text>
        <path d="M50 116 L84 96 M120 116 L86 96" class="il-gnd" />
      </g>
      <g transform="translate(210 20)">
        <rect width="170" height="130" rx="12" class="il-body" />
        <text x="85" y="26" class="il-text mid sm">ACROSS 150 A FUSE</text>
        <rect x="35" y="40" width="100" height="40" rx="5" class="il-lcd" />
        <text x="85" y="68" class="il-lcd-text">2.2Ω</text>
        <rect x="55" y="98" width="60" height="18" rx="3" style="fill:#f2c94c;stroke:#121417;stroke-width:2" />
      </g>
      <text x="200" y="182" class="il-text mid lg">2.2 − 2.1 = learned nothing → use VOLTAGE DROP</text>
    </Frame>
  );
}

export function PhotoMethod() {
  return (
    <Frame viewBox="0 0 400 240" tag="How to shoot it" label="Photograph the fuse card flat and straight on, then the open box from above" caption="Flat, straight-on, no glare, fill the frame">
      <rect x="40" y="40" width="150" height="110" rx="6" class="il-body" transform="rotate(-4 115 95)" />
      <path class="il-thin" d="M58 64 h110 M58 80 h96 M58 96 h112 M58 112 h88 M58 128 h104" transform="rotate(-4 115 95)" />
      <text x="115" y="176" class="il-text mid sm">FUSE CARD</text>
      <rect x="220" y="20" width="120" height="200" rx="18" class="il-dark" />
      <rect x="228" y="40" width="104" height="156" rx="6" class="il-fill2" />
      <path d="M240 54 h20 M240 54 v20 M320 54 h-20 M320 54 v20 M240 182 h20 M240 182 v-20 M320 182 h-20 M320 182 v-20" stroke="var(--accent)" stroke-width="4" fill="none" />
      <rect x="250" y="84" width="60" height="44" rx="3" class="il-body" />
      <path class="il-thin" d="M256 96 h48 M256 106 h40 M256 116 h46" />
      <circle cx="280" cy="208" r="6" fill="#666" />
      <text x="280" y="160" class="il-text mid sm">✓ sharp</text>
    </Frame>
  );
}

export function ScanMethod() {
  return (
    <Frame viewBox="0 0 400 240" tag="Read only" label="Scanner: read codes and coding only. Do not clear, do not write" caption="Write every code down first">
      <rect x="20" y="20" width="200" height="200" rx="18" class="il-dark" />
      <rect x="34" y="36" width="172" height="120" rx="6" class="il-lcd" />
      <text x="44" y="60" style="font:700 13px ui-monospace,monospace;fill:#10210a">SAM  90B5  9042</text>
      <text x="44" y="80" style="font:700 13px ui-monospace,monospace;fill:#10210a">     901D  9001</text>
      <text x="44" y="100" style="font:700 13px ui-monospace,monospace;fill:#10210a">IC   9100</text>
      <text x="44" y="120" style="font:700 13px ui-monospace,monospace;fill:#10210a">ESP  44D8  44E8</text>
      <text x="44" y="144" style="font:700 12px ui-monospace,monospace;fill:#10210a">from 2026-10-09 report</text>
      <rect x="40" y="172" width="70" height="30" rx="8" fill="#1d7a44" /><text x="75" y="192" fill="#fff" text-anchor="middle" style="font:700 14px sans-serif">READ</text>
      <rect x="130" y="172" width="70" height="30" rx="8" fill="#555" /><text x="165" y="192" fill="#ccc" text-anchor="middle" style="font:700 14px sans-serif">CLEAR</text>
      <path d="M134 176 L196 198 M196 176 L134 198" stroke="#ff5a4e" stroke-width="4" />
      <g transform="translate(240 30)">
        <rect width="140" height="56" rx="10" fill="var(--pass-bg)" stroke="var(--pass)" stroke-width="2.5" />
        <text x="70" y="24" text-anchor="middle" style="font:700 17px var(--font-display);fill:var(--pass)">✓ READ codes</text>
        <text x="70" y="44" text-anchor="middle" style="font:700 15px var(--font-display);fill:var(--pass)">✓ READ coding</text>
      </g>
      <g transform="translate(240 100)">
        <rect width="140" height="56" rx="10" fill="var(--fail-bg)" stroke="var(--fail)" stroke-width="2.5" />
        <text x="70" y="24" text-anchor="middle" style="font:700 17px var(--font-display);fill:var(--fail)">✗ NO clearing</text>
        <text x="70" y="44" text-anchor="middle" style="font:700 15px var(--font-display);fill:var(--fail)">✗ NO writing coding</text>
      </g>
      <text x="310" y="190" class="il-text mid sm">photo every screen</text>
    </Frame>
  );
}

export const METHODS: Record<string, { title: string; C: () => any }[]> = {
  photo: [{ title: 'How to take the photos', C: PhotoMethod }],
  horn: [{ title: 'Volts at the horn plug', C: HornMethod }, { title: 'Then: the horn ground', C: GroundDropMethod }],
  'fuse-drop': [{ title: 'Voltage drop across each fuse', C: FuseDropMethod }, { title: 'Why not just use ohms?', C: OhmsTrap }],
  trailer: [{ title: '12 V at terminal 4', C: () => <FeedMethod what="TRAILER TERMINAL 4" /> }, { title: 'Then: seat-base ground W71/3', C: GroundDropMethod }],
  scan: [{ title: 'Scanner: read only', C: ScanMethod }],
};
