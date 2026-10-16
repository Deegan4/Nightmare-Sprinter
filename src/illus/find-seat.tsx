// Driver seat base: what is there for the rear turn signals / trailer problem.
// Sources: System Wiring Diagram Fig. 23 (additional turn signal control module "under driver's seat", pins, fuse block 4
// fuse 13 10 A, ground G301); Mercedes 2015 Sprinter fuse supplement (fuse box on the outside of the driver seat base,
// F55/3 and F55/4, how to open it); Fig. 24 / FG legend (trailer fuses). Positions inside the seat base are APPROXIMATE.
const INK = '#cfe0ff', DIM = '#5f7fa8', BG = '#0a1220', AMB = '#ffd23f', HOT = '#ff5a4e', PUR = '#c48bff';
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; fill?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} stroke="none" style={`font:${o.w ?? 700} ${o.size ?? 12}px var(--font-body)`} fill={o.fill ?? INK}>{s}</text>
);

export function FindSeat() {
  return (
    <svg class="xr-svg gm-svg" viewBox="0 0 1000 660" role="img" aria-label="Driver seat base seen from the door side, see-through: the fuse box on the outside of the seat base with fuse blocks 3 and 4, the optional additional turn signal module inside the base, and its ground. There is no relay for the rear turn signals.">
      <defs><pattern id="st-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern>
        <pattern id="st-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="rgba(255,210,63,.22)" /></pattern></defs>
      <rect width="1000" height="660" fill={BG} /><rect width="1000" height="660" fill="url(#st-grid)" />

      {/* ---------- A: seat base from the driver's door ---------- */}
      {T(20, 30, 'A · DRIVER SEAT, SEEN FROM THE OPEN DRIVER DOOR (see-through)', { size: 13, fill: '#9fb3c8' })}
      {T(20, 48, 'front of the van on the left', { size: 11, w: 600, fill: '#7f97b4' })}
      <g fill="none" stroke={DIM} stroke-width="2.4" stroke-linejoin="round">
        {/* seat cushion + backrest */}
        <path d="M150 250 H470 Q490 250 490 270 V300 H150 Z" fill="#1a2a42" />
        <path d="M420 250 L470 70 Q474 56 490 58 L520 62 Q534 66 530 82 L490 250" fill="#1a2a42" />
        {/* seat base box */}
        <rect x="130" y="300" width="380" height="200" rx="10" fill="rgba(95,127,168,.08)" />
        <path d="M60 500 H580" stroke-width="2" />
      </g>
      {T(320, 286, 'SEAT CUSHION', { size: 10, anchor: 'middle', fill: '#7f97b4' })}
      {T(498, 520, 'floor', { size: 10, fill: '#7f97b4' })}
      {T(320, 492, 'SEAT BASE (box under the seat)', { size: 10, anchor: 'middle', fill: '#7f97b4' })}
      {/* outside fuse box on the seat base */}
      <rect x="170" y="320" width="170" height="110" rx="8" fill="#13243d" stroke={HOT} stroke-width="2.6" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <rect x={182 + i * 17} y="338" width="11" height="24" rx="2" fill="#2a3a52" stroke="#9fb3c8" stroke-width="1" />)}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <rect x={182 + i * 17} y="378" width="11" height="24" rx="2" fill="#2a3a52" stroke="#9fb3c8" stroke-width="1" />)}
      {T(176, 334, 'fuse block 3', { size: 9.5, w: 700, fill: '#9fb3c8' })}{T(176, 374, 'fuse block 4', { size: 9.5, w: 700, fill: '#9fb3c8' })}
      {T(255, 422, 'FUSE BOX · outside of seat base', { size: 10.5, anchor: 'middle', w: 800, fill: '#ffd0cb' })}
      {/* additional turn signal module (if equipped) */}
      <rect x="370" y="350" width="110" height="70" rx="8" fill="url(#st-hatch)" stroke={AMB} stroke-width="2.2" stroke-dasharray="7 5" />
      {T(425, 374, 'Additional turn', { size: 10.5, anchor: 'middle', w: 800, fill: AMB })}{T(425, 388, 'signal module', { size: 10.5, anchor: 'middle', w: 800, fill: AMB })}
      {T(425, 404, '(if equipped)', { size: 9.5, anchor: 'middle', w: 600, fill: '#d1a565' })}
      {/* ground */}
      <circle cx="455" cy="470" r="11" fill="#13243d" stroke="#9fb3c8" stroke-width="2" /><path d="M455 464 V470 M448 470 H462 M450.5 474 H459.5 M453 478 H457" stroke="#e6f0ff" stroke-width="1.6" fill="none" />
      {T(472, 474, 'G301 · its ground', { size: 10, w: 700, fill: '#9fb3c8' })}
      <path d="M455 420 V459" stroke="#c9884a" stroke-width="2.4" />
      {/* wires to rear + from SAM */}
      <path d="M480 385 C 530 385, 545 370, 590 370" stroke={PUR} stroke-width="2.6" fill="none" stroke-dasharray="7 5" />
      {T(500, 360, 'to rear lamps →', { size: 10, w: 700, fill: PUR })}
      <path d="M40 385 C 120 470, 340 470, 400 420" stroke="#2fd27a" stroke-width="2.2" fill="none" stroke-dasharray="6 5" />
      {T(26, 376, '← from SAM', { size: 10, w: 700, fill: '#2fd27a' })}
      <path d="M340 395 C 352 395, 356 395, 370 395" stroke="#ff9f1c" stroke-width="2.2" fill="none" />
      {T(255, 446, 'fuse block 4 · fuse 13 (10 A) → module', { size: 10, anchor: 'middle', w: 700, fill: '#ff9f1c' })}
      {/* no relay banner */}
      <g transform="translate(130 100)">
        <rect width="270" height="84" rx="10" fill="#0f1b2d" stroke={HOT} stroke-width="2" />
        {T(14, 26, 'NO RELAY for the rear turn signals', { size: 13, w: 800, fill: '#ffd0cb' })}
        {T(14, 46, 'The SAM drives them (C3 pins 15 / 16).', { size: 11, w: 600 })}
        {T(14, 64, 'Under the seat: fuses + optional module.', { size: 11, w: 600 })}
      </g>
      <g transform="translate(20 548)">
        <rect width="580" height="96" rx="8" fill="#0f1b2d" stroke={AMB} stroke-width="1.4" />
        {T(10, 20, 'OPEN THE FUSE BOX (Mercedes 2015 fuse supplement)', { size: 11.5, fill: AMB })}
        {T(10, 38, 'Raise the seat to its highest position, press both latches down, lift the cover.', { size: 11, w: 600 })}
        {T(10, 58, 'APPROXIMATE: places inside the seat base are a drawing choice. The module is', { size: 10.5, w: 600, fill: '#d1a565' })}
        {T(10, 72, 'only there on vans with “additional turn signal lamps”. Check your fuse card:', { size: 10.5, w: 600, fill: '#d1a565' })}
        {T(10, 86, 'the 2015 sheet lists fuse 13 of block 4 differently (fuel pump).', { size: 10.5, w: 600, fill: '#d1a565' })}
      </g>

      {/* ---------- B: fuses + module pins ---------- */}
      <rect x="620" y="16" width="366" height="628" rx="12" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.5" />
      {T(636, 40, 'B · WHAT TO CHECK UNDER THE SEAT', { size: 13, fill: '#9fb3c8' })}
      {T(636, 66, 'FUSES (key on, both sides ~12 V)', { size: 11.5, fill: AMB })}
      {[['Block 4 · fuse 13', '10 A', 'turn signal module (Fig. 23)'], ['Block 4 · fuse 14', '20 A', 'trailer socket pin 4'], ['Block 4 · fuse 15', '25 A', 'trailer module'], ['Block 3 · fuse 4', '7.5 A', 'trailer module']].map(([a, b, c], i) => (
        <g transform={`translate(636 ${78 + i * 36})`}>
          <rect width="334" height="30" rx="6" fill="#13243d" stroke="#2b4467" />
          {T(10, 13, a, { size: 11, w: 800 })}{T(130, 13, b, { size: 11, w: 800, fill: '#ff9f1c' })}{T(10, 25, c, { size: 10, w: 600, fill: '#9fb3c8' })}
        </g>
      ))}
      {T(636, 238, 'ADDITIONAL TURN SIGNAL MODULE (if fitted)', { size: 11.5, fill: AMB })}
      {[['20', 'RED/DK BLU', 'power in (fuse blk 4 f13)'], ['17', 'BRN', 'ground → G301'], ['5', 'DK GRN/GRY', 'turn command from SAM'], ['2', 'BLK/WHT', 'left rear turn'], ['11', 'BLK/DK GRN', 'right rear turn'], ['8', 'DK GRN/WHT', 'left turn (upfitter X52/9)'], ['14', 'DK GRN/RED', 'right turn (upfitter X52/10)']].map(([p, c, d], i) => (
        <g transform={`translate(636 ${250 + i * 32})`}>
          <rect width="30" height="24" rx="5" fill="#13243d" stroke={AMB} stroke-width="1.6" />{T(15, 17, p, { size: 11.5, anchor: 'middle', w: 800 })}
          {T(40, 11, c, { size: 10.5, w: 800 })}{T(40, 23, d, { size: 10, w: 600, fill: '#9fb3c8' })}
        </g>
      ))}
      <rect x="632" y="482" width="342" height="150" rx="8" fill="#13243d" stroke={AMB} stroke-width="1.4" />
      {T(644, 502, 'TEST ORDER', { size: 11.5, fill: AMB })}
      {T(644, 522, '1 · Open the seat-base fuse box. Is there a', { size: 10.5, w: 600 })}{T(656, 536, 'module under the seat at all? (photo it)', { size: 10.5, w: 600 })}
      {T(644, 556, '2 · Key on: block 4 fuse 13 → 12 V both sides?', { size: 10.5, w: 600 })}
      {T(644, 576, '3 · Hazards on: pins 2 and 11 pulse 0↔12 V?', { size: 10.5, w: 600 })}
      {T(644, 596, '4 · Pin 17 to battery −: 0.2 V or less', { size: 10.5, w: 600 })}
      {T(644, 616, 'No module? Then the rear turns come straight', { size: 10.5, w: 600, fill: '#9fb3c8' })}
      {T(644, 629, 'from the SAM: test at the lamp and SAM C3.', { size: 10.5, w: 600, fill: '#9fb3c8' })}
    </svg>
  );
}
