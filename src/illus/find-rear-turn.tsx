// Rear turn signals: where the parts are and how to test them.
// Wiring from System Wiring Diagram Figs. 22-23 (van, not chassis cab). Locations are the manual's words
// (G303 "upper left of left rear door", splices "left rear headliner"); exact spots and wire routes are not
// in the manual, so the drawing is APPROXIMATE. Left = vehicle left = driver side.
const INK = '#cfe0ff', DIM = '#5f7fa8', BG = '#0a1220', AMB = '#ffd23f', HOT = '#ff5a4e';
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; fill?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} stroke="none" style={`font:${o.w ?? 700} ${o.size ?? 12}px var(--font-body)`} fill={o.fill ?? INK}>{s}</text>
);

function Lamp({ x, side }: { x: number; side: 'L' | 'R' }) {
  return (
    <g>
      <rect x={x} y="300" width="34" height="170" rx="8" fill="#2a1416" stroke={HOT} stroke-width="2.4" />
      <rect x={x + 6} y="312" width="22" height="146" rx="5" fill="#d33a2c" opacity=".45" />
      {T(x + 17, 380, 'turn', { size: 8.5, anchor: 'middle', fill: '#fff', w: 800 })}
      {T(x + 17, 393, 'stop', { size: 8.5, anchor: 'middle', fill: '#fff', w: 800 })}
      {T(x + 17, 406, 'tail', { size: 8.5, anchor: 'middle', fill: '#fff', w: 800 })}
      {T(x + 17, 492, side === 'L' ? 'LEFT tail lamp' : 'RIGHT tail lamp', { size: 11, anchor: 'middle', w: 800 })}
      {T(x + 17, 506, side === 'L' ? '(driver side)' : '(passenger side)', { size: 10, anchor: 'middle', w: 600, fill: '#9fb3c8' })}
    </g>
  );
}

export function FindRearTurn() {
  return (
    <svg class="xr-svg gm-svg" viewBox="0 0 1000 660" role="img" aria-label="Back of the van, see-through: both tail lamps in the rear corners, ground G303 at the upper left of the left rear door, the turn signal wires from the SAM in the left kick panel, and the tail lamp plug pins with the test steps.">
      <defs><pattern id="rt-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern></defs>
      <rect width="1000" height="660" fill={BG} /><rect width="1000" height="660" fill="url(#rt-grid)" />

      {/* ---------- A: back of the van ---------- */}
      {T(20, 30, 'A · BACK OF THE VAN, SEE-THROUGH (standing behind it)', { size: 13, fill: '#9fb3c8' })}
      {T(20, 48, 'your left = van’s LEFT (driver side)', { size: 11, w: 600, fill: '#7f97b4' })}
      <g fill="none" stroke={DIM} stroke-width="2.4" stroke-linejoin="round">
        <path d="M80 520 V120 Q80 74 130 70 H490 Q540 74 540 120 V520 Z" fill="rgba(95,127,168,.06)" />
        <path d="M124 104 H496 V520 M124 104 V520" stroke-width="1.6" opacity=".55" />
        <path d="M310 104 V520" stroke-width="2" />
        <rect x="140" y="120" width="150" height="150" rx="8" opacity=".5" /><rect x="330" y="120" width="150" height="150" rx="8" opacity=".5" />
        <rect x="70" y="520" width="480" height="34" rx="8" fill="#1a2a42" />
        <rect x="96" y="554" width="60" height="30" rx="6" fill="#1a2a42" /><rect x="464" y="554" width="60" height="30" rx="6" fill="#1a2a42" />
      </g>
      {T(215, 300, 'LEFT REAR DOOR', { size: 10, anchor: 'middle', fill: '#7f97b4' })}{T(405, 300, 'RIGHT REAR DOOR', { size: 10, anchor: 'middle', fill: '#7f97b4' })}
      <Lamp x={86} side="L" /><Lamp x={500} side="R" />
      {/* G303 */}
      <rect x="92" y="84" width="74" height="54" rx="10" fill="rgba(255,210,63,.12)" stroke={AMB} stroke-width="2" stroke-dasharray="6 4" />
      <circle cx="129" cy="111" r="12" fill="#13243d" stroke={HOT} stroke-width="2.6" />
      <path d="M129 105 V111 M122 111 H136 M124.5 115 H133.5 M127 119 H131" stroke="#e6f0ff" stroke-width="1.8" fill="none" />
      {T(146, 158, 'G303 · ground for', { size: 11.5, w: 800, fill: '#ffd0cb' })}{T(146, 173, 'BOTH tail lamps', { size: 11.5, w: 800, fill: '#ffd0cb' })}
      {T(146, 189, '“upper left of', { size: 10.5, w: 600, fill: '#9fb3c8' })}{T(146, 203, 'left rear door”', { size: 10.5, w: 600, fill: '#9fb3c8' })}
      {/* headliner splices */}
      <rect x="182" y="66" width="120" height="22" rx="6" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.4" />
      {T(242, 81, 'splices · L rear headliner', { size: 9.5, anchor: 'middle', w: 700, fill: '#9fb3c8' })}
      {/* wires: SAM -> lamps (connections, not routes) */}
      <g fill="none" stroke-linecap="round">
        <path d="M30 150 C 60 150, 70 200, 103 300" stroke="#e6e6e6" stroke-width="3" stroke-dasharray="8 5" />
        <path d="M30 160 C 160 30, 480 30, 517 300" stroke="#2fd27a" stroke-width="3" stroke-dasharray="8 5" />
        <path d="M103 300 C 103 200, 118 150, 129 123" stroke="#c9884a" stroke-width="2.6" />
        <path d="M517 470 C 545 330, 540 150, 496 128 H 141" stroke="#c9884a" stroke-width="2" opacity=".6" />
      </g>
      <g transform="translate(8 128)"><path d="M0 0 h22 l-6 -6 M22 0 l-6 6" stroke={INK} stroke-width="1.6" fill="none" /></g>
      {T(10, 196, 'from SAM', { size: 10.5, w: 800 })}{T(10, 210, '(left kick', { size: 10, w: 600, fill: '#9fb3c8' })}{T(10, 222, 'panel, C3)', { size: 10, w: 600, fill: '#9fb3c8' })}
      <g transform="translate(330 330)">
        <rect width="150" height="70" rx="8" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.2" />
        <path d="M10 18 h24" stroke="#e6e6e6" stroke-width="3" stroke-dasharray="6 4" />{T(40, 22, 'L turn BLK/WHT', { size: 10, w: 700 })}
        <path d="M10 38 h24" stroke="#2fd27a" stroke-width="3" stroke-dasharray="6 4" />{T(40, 42, 'R turn BLK/DK GRN', { size: 10, w: 700 })}
        <path d="M10 58 h24" stroke="#c9884a" stroke-width="3" />{T(40, 62, 'ground BRN → G303', { size: 10, w: 700 })}
      </g>
      <g transform="translate(20 600)">
        <rect width="580" height="44" rx="8" fill="rgba(255,210,63,.08)" stroke={AMB} stroke-width="1.2" />
        {T(10, 18, 'APPROXIMATE: places are the manual’s words; wire routes are not in the manual.', { size: 11, fill: AMB })}
        {T(10, 34, 'Lines show what connects to what. Source: System Wiring Diagram Figs. 22-23.', { size: 10.5, w: 600, fill: '#9fb3c8' })}
      </g>

      {/* ---------- B: plug + fix steps ---------- */}
      <rect x="620" y="16" width="366" height="628" rx="12" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.5" />
      {T(636, 40, 'B · TAIL LAMP PLUG (each side)', { size: 13, fill: '#9fb3c8' })}
      {[['5', 'TURN', 'L: BLK/WHT · R: BLK/DK GRN', AMB], ['4', 'STOP', 'L: BLK/RED · R: RED/BLK', HOT], ['6', 'TAIL (park)', 'L: GRY/BLK · R: GRY/RED', '#9fb3c8'], ['3', 'GROUND', 'BRN → G303', '#c9884a']].map(([p, n, c, col], i) => (
        <g transform={`translate(636 ${62 + i * 40})`}>
          <rect width="30" height="30" rx="6" fill="#13243d" stroke={col} stroke-width="2.4" />{T(15, 20, p, { size: 14, anchor: 'middle', w: 800 })}
          {T(42, 13, `pin ${p} · ${n}`, { size: 12, w: 800 })}{T(42, 28, c, { size: 10.5, w: 600, fill: '#9fb3c8' })}
        </g>
      ))}
      <rect x="632" y="226" width="342" height="406" rx="8" fill="#13243d" stroke={AMB} stroke-width="1.4" />
      {T(644, 248, 'HOW TO FIX IT, IN ORDER', { size: 12, fill: AMB })}
      {[
        ['1', 'Hazards + lights on, foot on brake.', 'Brake & tail also dead? → G303.'],
        ['2', 'G303: upper left of left rear door.', 'Unbolt, clean to bare metal, retighten.'],
        ['3', 'Open the rear door and remove the', 'tail lamp (look for its screws).'],
        ['4', 'Hazards on: pin 5 to battery − .', 'Pulses 0↔12 V? → bulb/socket/pin 3.'],
        ['5', 'Pin 3 to battery − with lamp on:', '0.2 V or less meets the rule.'],
        ['6', 'Pin 5 stays 0 V? Check SAM C3', 'pin 15 (L) / 16 (R) with hazards on.'],
        ['7', 'Pulse at SAM, none at lamp: broken', 'wire/splice (L rear headliner, hinge).'],
        ['8', 'No pulse at SAM: SAM output fault;', 'get SAM + coding checked.'],
      ].map(([n, a, b], i) => (
        <g transform={`translate(644 ${262 + i * 45})`}>
          <circle cx="10" cy="10" r="10" fill={AMB} />{T(10, 14.5, n, { size: 11, anchor: 'middle', fill: '#121417', w: 800 })}
          {T(28, 10, a, { size: 11, w: 700 })}{T(28, 25, b, { size: 10.5, w: 600, fill: '#9fb3c8' })}
        </g>
      ))}
    </svg>
  );
}
