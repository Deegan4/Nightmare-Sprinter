// "Where is G302" finder. APPROXIMATE: the manuals name the area, not the bolt.
// Area: System Wiring Diagram Fig. 26 "left rear of engine compt"; Mercedes W43/1 "left firewall ground point"
// (left footwell page). Wires listed are the ones Fig. 26 draws to G302, colour BRN as printed.
const INK = '#cfe0ff', DIM = '#5f7fa8', BG = '#0a1220', HOT = '#ff5a4e', AMB = '#ffd23f';
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; fill?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} style={`font:${o.w ?? 700} ${o.size ?? 12}px var(--font-body)`} fill={o.fill ?? INK}>{s}</text>
);

export function FindG302() {
  return (
    <svg class="xr-svg gm-svg" viewBox="0 0 1000 640" role="img" aria-label="Where to look for ground G302: the driver-side firewall, footwell side first next to the kick-panel fuse/relay box with the SAM, then the engine-bay side of the same firewall. Close-up of a ground stud with the brown wires the manual lists on G302.">
      <defs>
        <pattern id="fg-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern>
        <pattern id="fg-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="rgba(255,210,63,.28)" /></pattern>
        <pattern id="fg-hatch2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="4" height="10" fill="rgba(255,210,63,.14)" /></pattern>
        <marker id="fg-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill={AMB} /></marker>
      </defs>
      <rect width="1000" height="640" fill={BG} /><rect width="1000" height="640" fill="url(#fg-grid)" />

      {/* ---------- A: driver-side cutaway of the front of the van ---------- */}
      {T(20, 30, 'A · DRIVER’S SIDE, BODY SEE-THROUGH', { size: 13, fill: '#9fb3c8' })}
      {T(20, 48, 'front on the left', { size: 11, w: 600, fill: '#7f97b4' })}
      <g fill="none" stroke={DIM} stroke-width="2.2" stroke-linejoin="round">
        {/* body */}
        <path d="M30 430 L28 330 Q30 300 60 292 L230 268 Q250 264 262 246 L360 96 Q368 84 390 84 L600 82" fill="rgba(95,127,168,.06)" />
        <path d="M30 430 H600" />
        {/* windshield + door opening */}
        <path d="M272 244 L366 104 L420 104 L420 244 Z" fill="rgba(120,160,210,.08)" opacity=".8" />
        <path d="M430 100 V430" opacity=".6" />
        {/* wheel */}
        <circle cx="160" cy="440" r="52" fill="#1a2a42" /><circle cx="160" cy="440" r="20" />
        {/* engine (dashed) */}
        <rect x="70" y="300" width="150" height="100" rx="12" stroke-dasharray="7 5" opacity=".7" />
        {/* dash + steering + pedals + seat */}
        <path d="M270 252 H420" opacity=".7" />
        <path d="M352 262 L328 330" stroke-width="5" opacity=".45" />
        <path d="M300 392 l18 -34 M318 392 h22" opacity=".6" />
        <path d="M470 340 h90 v40 h-90 Z M548 340 l20 -120" opacity=".45" />
      </g>
      {/* firewall: the wall between engine bay and footwell */}
      <path d="M262 250 L246 402" stroke={INK} stroke-width="5" stroke-linecap="round" />
      {T(178, 236, 'LEFT FIREWALL', { size: 12, fill: INK })}
      <path d="M232 240 L252 262" stroke={INK} stroke-width="1.4" />
      {T(80, 292, 'ENGINE BAY', { size: 11, fill: '#7f97b4' })}
      {T(300, 424, 'LEFT FOOTWELL', { size: 11, fill: '#7f97b4' })}
      {/* kick panel fuse/relay box with SAM */}
      <rect x="262" y="330" width="40" height="64" rx="5" fill="#ffc21a" stroke="#121417" stroke-width="2" />
      {T(282, 352, 'SAM', { size: 10.5, anchor: 'middle', fill: '#121417', w: 800 })}
      {T(282, 366, 'K40/9', { size: 9.5, anchor: 'middle', fill: '#121417' })}
      {/* search zone 1: footwell side of firewall */}
      <path d="M258 268 L330 268 L330 410 L244 410 Z" fill="url(#fg-hatch)" stroke={AMB} stroke-width="2.5" stroke-dasharray="8 5" />
      <circle cx="320" cy="262" r="15" fill={AMB} stroke="#121417" stroke-width="2" />{T(320, 267, '1', { size: 15, anchor: 'middle', fill: '#121417', w: 800 })}
      {/* search zone 2: engine-bay side of firewall */}
      <path d="M262 262 L196 262 L196 410 L246 410 Z" fill="url(#fg-hatch2)" stroke={AMB} stroke-width="2" stroke-dasharray="4 5" opacity=".9" />
      <circle cx="206" cy="262" r="13" fill="#0a1220" stroke={AMB} stroke-width="2.5" />{T(206, 267, '2', { size: 14, anchor: 'middle', fill: AMB, w: 800 })}
      {/* callouts */}
      <path d="M332 300 C 420 290, 440 210, 470 180" stroke={AMB} stroke-width="1.8" fill="none" marker-end="url(#fg-ah)" />
      <g transform="translate(450 118)">
        <rect width="160" height="62" rx="8" fill="#0f1b2d" stroke={AMB} stroke-width="2" />
        {T(10, 20, '1 · LOOK HERE FIRST', { size: 11.5, fill: AMB })}
        {T(10, 37, 'Footwell side of the left', { size: 11, w: 600 })}
        {T(10, 52, 'firewall, by the SAM box', { size: 11, w: 600 })}
      </g>
      <path d="M200 410 C 190 470, 120 500, 96 520" stroke={AMB} stroke-width="1.8" fill="none" marker-end="url(#fg-ah)" stroke-dasharray="5 4" />
      <g transform="translate(20 520)">
        <rect width="230" height="62" rx="8" fill="#0f1b2d" stroke={AMB} stroke-width="1.6" stroke-dasharray="5 4" />
        {T(10, 20, '2 · THEN HERE', { size: 11.5, fill: AMB })}
        {T(10, 37, 'Engine-bay side of the same', { size: 11, w: 600 })}
        {T(10, 52, 'left firewall, low and rear', { size: 11, w: 600 })}
      </g>
      <g transform="translate(270 520)">
        <rect width="330" height="62" rx="8" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.5" />
        {T(10, 20, 'WHAT THE MANUALS SAY', { size: 11, fill: '#9fb3c8' })}
        {T(10, 37, 'Fig. 26: G302 “left rear of engine compt”', { size: 11, w: 600 })}
        {T(10, 52, 'Mercedes: W43/1 “left firewall” (left footwell page)', { size: 11, w: 600 })}
      </g>
      <rect x="20" y="596" width="580" height="30" rx="6" fill="rgba(255,210,63,.08)" stroke={AMB} stroke-width="1.2" />
      {T(30, 616, 'APPROXIMATE: hatched = search area. The manuals give no measured spot.', { size: 11.5, fill: AMB })}

      {/* ---------- B: what the ground point looks like ---------- */}
      <rect x="626" y="16" width="360" height="610" rx="12" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.5" />
      {T(642, 40, 'B · WHAT YOU’RE LOOKING FOR', { size: 13, fill: '#9fb3c8' })}
      {T(642, 58, 'a stud or bolt with brown ground wires', { size: 11, w: 600, fill: '#7f97b4' })}
      {/* body panel + stud + ring terminals */}
      <rect x="642" y="90" width="80" height="220" rx="6" fill="#1a2a42" stroke={DIM} stroke-width="2" />
      {T(682, 82, 'body panel', { size: 10.5, anchor: 'middle', fill: '#7f97b4' })}
      <rect x="722" y="186" width="16" height="28" fill="#8a9bb0" stroke="#121417" stroke-width="1.5" />
      {[0, 1, 2].map((i) => <rect x={738 + i * 9} y="178" width="8" height="44" rx="2" fill="#c9884a" stroke="#121417" stroke-width="1.3" />)}
      <path d="M765 172 h22 l8 14 v28 l-8 14 h-22 Z" fill="#b8c4d2" stroke="#121417" stroke-width="2" />
      {T(800, 186, 'nut', { size: 10, fill: '#9fb3c8' })}
      {T(750, 240, 'ring terminals', { size: 10, anchor: 'middle', fill: '#9fb3c8' })}
      {/* brown wires fanning out */}
      {[
        ['SAM · connector C7 pin 8', HOT],
        ['Parking brake switch (1 C2)', '#c9884a'],
        ['Clutch pedal switch*', '#c9884a'],
        ['Passenger entry lamp (2)', '#c9884a'],
        ['Right outside mirror (5 C1)', '#c9884a'],
        ['Left curtain air bag (1 C2)', '#c9884a'],
        ['Park assist module (10 C1)*', '#c9884a'],
      ].map(([label, c], i) => {
        const y = 360 + i * 30;
        return (
          <g>
            <path d={`M${742 + (i % 3) * 9} 222 C ${742 + (i % 3) * 9} 270, ${692 - i * 3} 262, ${692 - i * 3} 320 V ${y - 10} Q ${692 - i * 3} ${y} 708 ${y}`} stroke={c} stroke-width={i === 0 ? 4 : 3} fill="none" opacity=".9" />
            <circle cx="714" cy={y} r="4" fill={c} />
            {T(726, y + 4, label, { size: 11.5, w: i === 0 ? 800 : 600, fill: i === 0 ? '#ffd0cb' : INK })}
          </g>
        );
      })}
      {T(642, 582, 'All wires BRN (brown) per Fig. 26.', { size: 11, w: 600, fill: '#9fb3c8' })}
      {T(642, 598, '* only if the van has that option', { size: 10.5, w: 600, fill: '#7f97b4' })}
      {T(642, 614, 'SAM wire is red here only to stand out; it is brown.', { size: 11, w: 700, fill: AMB })}
    </svg>
  );
}
