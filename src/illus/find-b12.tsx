// "Where is the A/C pressure sensor (B12)" finder. APPROXIMATE: the manual (System Wiring Diagram Fig. 1)
// says only "in engine compt". Search zones follow where such sensors usually sit (on a refrigerant pipe,
// high-pressure side), labelled as typical, not as manual data. Wiring and colours are Fig. 1 / Fig. 29.
const INK = '#cfe0ff', DIM = '#5f7fa8', BG = '#0a1220', AMB = '#ffd23f', AC = '#2fd27a';
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; fill?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} stroke="none" style={`font:${o.w ?? 700} ${o.size ?? 12}px var(--font-body)`} fill={o.fill ?? INK}>{s}</text>
);

export function FindB12() {
  return (
    <svg class="xr-svg gm-svg" viewBox="0 0 1000 640" role="img" aria-label="See-through view of the front of the van from above showing where to look for the A/C pressure sensor B12: on a refrigerant pipe in the engine compartment, most often the thin high-pressure line near the condenser. Its three wires run to the A/C control S98 in the dash. Plug close-up with pin colours.">
      <defs>
        <pattern id="fb-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern>
        <pattern id="fb-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="rgba(255,210,63,.26)" /></pattern>
        <filter id="fb-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="1000" height="640" fill={BG} /><rect width="1000" height="640" fill="url(#fb-grid)" />

      {/* ---------- A: see-through top view of the front of the van ---------- */}
      {T(20, 30, 'A · FRONT OF THE VAN FROM ABOVE, SEE-THROUGH', { size: 13, fill: '#9fb3c8' })}
      {T(20, 48, 'front on the left · driver’s side at the bottom', { size: 11, w: 600, fill: '#7f97b4' })}
      <g fill="none" stroke={DIM} stroke-width="2.2" stroke-linejoin="round">
        <path d="M600 80 H190 L110 92 Q50 104 46 170 V430 Q50 496 110 508 L190 520 H600" fill="rgba(95,127,168,.06)" />
        <rect x="120" y="62" width="70" height="16" rx="5" fill="#1a2a42" /><rect x="120" y="522" width="70" height="16" rx="5" fill="#1a2a42" />
        <path d="M262 86 Q246 300 262 514" stroke-width="2" />
        {T(268, 72, 'FIREWALL', { size: 10, fill: '#7f97b4' })}
        <rect x="300" y="110" width="110" height="380" rx="10" opacity=".25" />
        <rect x="440" y="120" width="80" height="80" rx="12" opacity=".5" /><rect x="440" y="400" width="80" height="80" rx="12" opacity=".5" />
        <ellipse cx="380" cy="440" rx="10" ry="34" opacity=".6" />
      </g>
      {T(355, 140, 'DASH', { size: 10, anchor: 'middle', fill: '#7f97b4' })}
      {/* condenser + radiator at the front */}
      <rect x="58" y="150" width="14" height="300" rx="3" fill="rgba(47,210,122,.18)" stroke={AC} stroke-width="2" />
      {T(64, 140, 'condenser', { size: 10.5, anchor: 'middle', fill: AC })}
      <rect x="78" y="160" width="12" height="280" rx="3" fill="#1a2a42" stroke={DIM} stroke-width="1.8" />
      {T(100, 470, 'radiator', { size: 10, fill: '#7f97b4' })}
      {/* engine (dashed) */}
      <rect x="120" y="200" width="120" height="200" rx="18" fill="none" stroke={DIM} stroke-width="2" stroke-dasharray="7 5" />
      {T(180, 304, 'ENGINE', { size: 11, anchor: 'middle', fill: '#7f97b4' })}
      {/* refrigerant pipes (schematic) */}
      <path d="M72 200 C 110 200, 140 160, 250 150" stroke={AC} stroke-width="3" fill="none" opacity=".75" />
      <path d="M72 420 C 100 440, 150 470, 250 460" stroke={AC} stroke-width="6" fill="none" opacity=".45" />
      {T(96, 122, 'thin pipe: high pressure', { size: 10, fill: AC, w: 600 })}
      {T(108, 492, 'thick pipe: suction', { size: 10, fill: AC, w: 600 })}
      {/* compressor A9 */}
      <circle cx="150" cy="360" r="18" fill="#13243d" stroke={AC} stroke-width="2.6" />{T(150, 364, 'A9', { size: 11, anchor: 'middle', w: 800 })}
      {T(150, 394, 'compressor (on engine)', { size: 10, anchor: 'middle', fill: '#9fb3c8' })}
      {/* search zones for B12 */}
      <path d="M66 180 L130 160 L180 150 L180 210 L90 230 L66 230 Z" fill="url(#fb-hatch)" stroke={AMB} stroke-width="2.2" stroke-dasharray="7 5" />
      <circle cx="104" cy="196" r="12" fill="#13243d" stroke={AMB} stroke-width="2.6" filter="url(#fb-glow)" />{T(104, 200, 'B12', { size: 9.5, anchor: 'middle', w: 800, fill: AMB })}
      <circle cx="160" cy="174" r="12" fill={AMB} stroke="#121417" stroke-width="2" />{T(160, 179, '1', { size: 13, anchor: 'middle', fill: '#121417', w: 800 })}
      <path d="M208 154 L254 148 L254 176 L208 182 Z" fill="url(#fb-hatch)" stroke={AMB} stroke-width="1.8" stroke-dasharray="4 4" />
      <circle cx="244" cy="196" r="11" fill={BG} stroke={AMB} stroke-width="2.4" />{T(244, 200, '2', { size: 12, anchor: 'middle', fill: AMB, w: 800 })}
      {/* S98 in dash, G200, fuse */}
      <rect x="330" y="270" width="60" height="44" rx="7" fill="#13243d" stroke={AC} stroke-width="2.4" />
      {T(360, 290, 'S98', { size: 12, anchor: 'middle', w: 800 })}{T(360, 305, 'A/C control', { size: 9, anchor: 'middle', fill: '#9fb3c8' })}
      {/* wires (connections, not routes) */}
      <g fill="none" stroke-linecap="round">
        <path d="M110 205 C 190 230, 250 250, 330 284" stroke="#4da3ff" stroke-width="2.4" stroke-dasharray="7 5" />
        <path d="M110 209 C 190 236, 250 258, 330 292" stroke="#2fd27a" stroke-width="2.4" stroke-dasharray="7 5" />
        <path d="M110 213 C 190 242, 250 266, 330 300" stroke="#c9884a" stroke-width="2.4" stroke-dasharray="7 5" />
        <path d="M168 360 C 240 360, 280 330, 330 306" stroke="#4da3ff" stroke-width="2.4" opacity=".75" />
      </g>
      {T(240, 342, 'control wire BU/GN', { size: 9.5, fill: '#9fb3c8', w: 600 })}
      {T(240, 354, 'via X26/38 · X18/56', { size: 9.5, fill: '#9fb3c8', w: 600 })}
      {T(262, 246, '3 sensor wires → S98', { size: 9.5, fill: '#9fb3c8', w: 600 })}
      <circle cx="232" cy="100" r="9" fill="#13243d" stroke="#9fb3c8" stroke-width="2" /><path d="M232 96 V101 M227 101 H237 M229 104 H235" stroke="#e6f0ff" stroke-width="1.4" />
      {T(246, 100, 'G200 · S98 ground', { size: 9.5, fill: '#9fb3c8', w: 600 })}{T(246, 112, 'R rear engine compt', { size: 9, fill: '#7f97b4', w: 600 })}
      <path d="M232 109 C 280 160, 320 240, 345 270" stroke="#9fb3c8" stroke-width="1.6" fill="none" stroke-dasharray="3 4" />
      <rect x="360" y="472" width="34" height="18" rx="3" fill="#13243d" stroke="#ff5a4e" stroke-width="2" />{T(377, 485, 'f16', { size: 10, anchor: 'middle', w: 800 })}
      {T(404, 486, 'fuse blk 2 · 10 A ✓', { size: 10, fill: '#9fb3c8', w: 600 })}
      <path d="M377 472 C 377 400, 372 340, 366 314" stroke="#ff5a4e" stroke-width="2" fill="none" stroke-dasharray="4 4" />
      {/* callouts */}
      <g transform="translate(300 128)"><rect width="0" height="0" /></g>
      <g transform="translate(20 548)">
        <rect width="580" height="76" rx="8" fill="#0f1b2d" stroke={AMB} stroke-width="1.6" />
        {T(10, 20, 'WHERE TO LOOK (manual: “in engine compt” only)', { size: 11.5, fill: AMB })}
        {T(10, 38, '1 · On the thin A/C pipe (high-pressure side), front of the engine bay near the condenser', { size: 11, w: 600 })}
        {T(10, 54, '2 · Further along that thin pipe toward the firewall', { size: 11, w: 600 })}
        {T(10, 70, 'APPROXIMATE: typical spots, not printed in your manual. Pipes drawn schematically.', { size: 10.5, w: 600, fill: '#d1a565' })}
      </g>

      {/* ---------- B: the plug ---------- */}
      <rect x="626" y="16" width="360" height="608" rx="12" fill="#0f1b2d" stroke="#2b4467" stroke-width="1.5" />
      {T(642, 40, 'B · WHAT IT LOOKS LIKE', { size: 13, fill: '#9fb3c8' })}
      {T(642, 58, 'small sensor screwed onto an A/C pipe, 3-wire plug', { size: 11, w: 600, fill: '#7f97b4' })}
      {/* wires */}
      {[['#4a7fd8', '3 · DK BLU / RED', '+ supply → S98 C4 pin 2'], ['#2fa84a', '2 · DK GRN', 'pressure signal → S98 C4 pin 1'], ['#7a5a3a', '1 · BRN / DK BLU', '− return → S98 C4 pin 10']].map(([c, a, b], i) => {
        const y = 250 + i * 70;
        return (
          <g>
            <path d={`M784 ${76 + i * 10} C 720 ${76 + i * 10}, ${654 + i * 5} ${80 + i * 10}, ${654 + i * 5} 130 V ${y - 12} Q ${654 + i * 5} ${y} 670 ${y}`} stroke={c} stroke-width="4" fill="none" />
            <circle cx="676" cy={y} r="6" fill={c} stroke="#e6f0ff" stroke-width="1.2" />
            {T(692, y - 2, `pin ${a}`, { size: 12.5, w: 800 })}
            {T(692, y + 16, b, { size: 11, w: 600, fill: '#9fb3c8' })}
          </g>
        );
      })}
      {/* pipe + sensor */}
      <rect x="650" y="150" width="310" height="26" rx="13" fill="#3a4a5e" stroke={DIM} stroke-width="2" />
      {T(805, 194, 'A/C pipe (thin, high-pressure)', { size: 10.5, anchor: 'middle', fill: '#9fb3c8' })}
      <path d="M790 150 h40 v-14 h-6 v-30 h-28 v30 h-6 Z" fill="#b8c4d2" stroke="#121417" stroke-width="2" />
      <rect x="784" y="66" width="52" height="40" rx="6" fill="#1a1d22" stroke="#121417" stroke-width="2" />
      {T(810, 90, 'plug', { size: 10, anchor: 'middle', fill: '#9fb3c8' })}
      <rect x="642" y="470" width="328" height="138" rx="8" fill="#13243d" stroke="#2b4467" stroke-width="1.2" />
      {T(654, 492, 'QUICK CHECK (key on, A/C on, back-probe)', { size: 11.5, fill: AMB })}
      {T(654, 512, 'Pin 3 to pin 1: supply from S98', { size: 11, w: 600 })}
      {T(654, 528, '(usually about 5 V; value not in your manual)', { size: 10.5, w: 600, fill: '#9fb3c8' })}
      {T(654, 548, 'Pin 2 to pin 1: pressure signal, should sit', { size: 11, w: 600 })}
      {T(654, 564, 'between 0 V and the supply, not stuck', { size: 11, w: 600 })}
      {T(654, 584, 'Supply 0 V: wiring or S98, not the sensor', { size: 11, w: 700, fill: '#ffd0cb' })}
      {T(654, 600, 'Source: System Wiring Diagram Fig. 1', { size: 10, w: 600, fill: '#7f97b4' })}
    </svg>
  );
}
