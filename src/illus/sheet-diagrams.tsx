// Circuit drawings for the Wiring Sheet, redrawn from the owner's manuals:
// SYS = "System Wiring Diagram.pdf" Figs. 1 (A/C), 24 (trailer), 30 (horn), 38-40 (power);
// FG = "Wiring Diagrams (Fuse Block, Grounds).pdf" fuse/relay box legend (US version).
// Pin numbers and wire colours appear only where those pages print them.
const K = { power: '#d33a2c', horn: '#1f6fd1', ac: '#16894a', trailer: '#8a3fc7', can: '#c27c00', gnd: 'var(--il-gnd)' };
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; anchor?: string; color?: string } = {}) => (
  <text x={x} y={y} text-anchor={o.anchor ?? 'start'} style={`font:${o.w ?? 700} ${o.size ?? 13}px var(--font-body);fill:${o.color ?? 'var(--il-ink)'}`}>{s}</text>
);
const line = (d: string, c: string, w = 3.5, dash?: string) => <path d={d} fill="none" stroke={c} stroke-width={w} stroke-linecap="round" stroke-linejoin="round" stroke-dasharray={dash} />;
const box = (x: number, y: number, w: number, h: number, c = 'var(--il-ink)', fill = 'var(--il-fill)') => <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke={c} stroke-width="2" />;
const gnd = (x: number, y: number) => <path d={`M${x} ${y - 10} V${y} M${x - 11} ${y} H${x + 11} M${x - 7} ${y + 5} H${x + 7} M${x - 3} ${y + 10} H${x + 3}`} stroke="var(--il-ink)" stroke-width="2.2" fill="none" />;
function Tag({ x, y, t }: { x: number; y: number; t: string }) {
  const col: Record<string, string> = { SOURCE: 'var(--p-source)', HYPOTHESIS: 'var(--p-hypothesis)', CONFIRMED: 'var(--p-confirmed)', REPORTED: 'var(--p-reported)', UNKNOWN: 'var(--p-unknown)' };
  const w = t.length * 6.3 + 10;
  return (<g transform={`translate(${x} ${y})`}><rect width={w} height="15" rx="3" fill="var(--il-fill)" stroke={col[t]} stroke-width="1.5" stroke-dasharray={t === 'HYPOTHESIS' ? '3 2' : undefined} />
    <text x={w / 2} y="11" text-anchor="middle" style={`font:700 10px var(--font-body);fill:${col[t]}`}>{t}</text></g>);
}
const meterPoint = (x: number, y: number, n: string) => (
  <g transform={`translate(${x} ${y})`}><circle r="10" fill="#ffc21a" stroke="#121417" stroke-width="2" /><text text-anchor="middle" dominant-baseline="central" style="font:700 11px var(--font-display);fill:#121417">{n}</text></g>
);

export function PowerFlow() {
  return (
    <svg viewBox="0 0 660 300" role="img" aria-label="Power and control flow from the manual: battery to F59 fuses to the left kick panel fuse/relay box with the SAM, horn relay and fuse blocks 1 and 2; fuse blocks 3 and 4 feed the trailer">
      {box(12, 110, 80, 62)}
      <rect x="26" y="102" width="14" height="9" fill={K.power} stroke="var(--il-ink)" stroke-width="1.5" /><rect x="66" y="102" width="14" height="9" fill="var(--il-ink)" />
      {T(52, 138, 'Battery', { anchor: 'middle', size: 15 })}{T(52, 156, '14.05 V run', { anchor: 'middle', size: 11, w: 600 })}
      {line('M92 141 H116', K.power, 4)}
      <rect x="116" y="88" width="138" height="106" rx="8" fill="var(--il-fill)" stroke="#1f3b63" stroke-width="2.5" />
      {T(185, 108, 'F59 fuse box', { anchor: 'middle', size: 14 })}
      {T(126, 130, 'F59.5 · 150 A · tml 30', { size: 12, w: 600 })}
      {T(126, 150, 'F59.3 · 80 A · tml 30z', { size: 12, w: 600 })}
      {T(126, 170, 'location: confirm', { size: 11, w: 600, color: 'var(--p-unknown)' })}
      <Tag x={126} y={175} t="SOURCE" />
      {line('M254 128 H282', K.power, 4)}
      <rect x="282" y="40" width="226" height="152" rx="10" fill="var(--il-fill)" stroke="#1f3b63" stroke-width="2.5" stroke-dasharray="7 4" />
      {T(395, 58, 'Fuse/relay box K40/9 · LEFT KICK PANEL', { anchor: 'middle', size: 12.5, color: 'var(--ws-head, var(--il-ink))' })}
      <rect x="294" y="68" width="200" height="42" rx="7" fill="#ffc21a" stroke="#121417" stroke-width="2" />
      {T(394, 86, 'SAM N10 (body control)', { anchor: 'middle', size: 13.5, color: '#121417' })}
      {T(394, 102, 'refurbished · coding UNKNOWN', { anchor: 'middle', size: 11, w: 700, color: '#121417' })}
      {box(294, 118, 96, 32, K.horn)}{T(342, 139, 'horn relay k1', { anchor: 'middle', size: 11.5 })}
      {box(398, 118, 96, 32, K.horn)}{T(446, 139, 'f1 · 15 A horn', { anchor: 'middle', size: 11.5 })}
      {box(294, 156, 200, 28, '#1f3b63', 'var(--il-fill2)')}{T(394, 175, 'on top: fuse blocks 1 & 2', { anchor: 'middle', size: 11.5 })}
      {line('M508 116 H534', K.can, 4, '8 5')}{T(521, 132, 'CAN B', { anchor: 'middle', size: 10, color: K.can })}
      {box(534, 40, 116, 56, K.ac)}{T(592, 60, 'A/C control S98', { anchor: 'middle', size: 12, color: K.ac })}{T(592, 76, 'fuse blk 2 · f16 10 A', { anchor: 'middle', size: 10.5, w: 600 })}{T(592, 90, 'gnd G200', { anchor: 'middle', size: 10.5, w: 600 })}
      {box(534, 104, 116, 70, K.trailer)}{T(592, 122, 'Trailer module', { anchor: 'middle', size: 12, color: K.trailer })}{T(592, 137, 'REAR of vehicle', { anchor: 'middle', size: 10.5, w: 700 })}{T(592, 151, 'blk 4 f15 25 A', { anchor: 'middle', size: 10.5, w: 600 })}{T(592, 165, 'blk 3 f4 7.5 A', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M342 192 V232', K.horn, 4)}
      {box(282, 232, 120, 54, K.horn)}{T(342, 252, 'Horn 1 (H1)', { anchor: 'middle', size: 12.5, color: K.horn })}{T(342, 267, 'engine compt', { anchor: 'middle', size: 10.5, w: 600 })}{T(342, 280, 'gnd G104', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M592 174 V232', K.trailer, 4)}
      {box(520, 232, 130, 54, K.trailer)}{T(585, 252, 'Trailer socket', { anchor: 'middle', size: 12.5, color: K.trailer })}{T(585, 267, 'pin 4: blk 4 f14 20 A', { anchor: 'middle', size: 10.5, w: 600 })}{T(585, 280, 'pin 8 gnd → G304', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M592 96 V118', K.can, 3, '6 4')}
      {box(410, 232, 102, 54, K.power, 'var(--il-fill2)')}{T(461, 252, 'Fuse blocks', { anchor: 'middle', size: 12 })}{T(461, 267, '3 & 4', { anchor: 'middle', size: 12 })}{T(461, 281, 'location: confirm', { anchor: 'middle', size: 10, w: 600, color: 'var(--p-unknown)' })}
      {line('M512 259 H520', K.power, 3)}{line('M461 232 V206 H556 V174', K.power, 3)}
      <Tag x={12} y={222} t="SOURCE" />{T(12, 252, 'SYS Figs. 1, 24, 30, 38-40', { size: 10.5, w: 600 })}{T(12, 266, 'FG K40/9 legend', { size: 10.5, w: 600 })}
    </svg>
  );
}

export function HornCircuit() {
  return (
    <svg viewBox="0 0 300 360" role="img" aria-label="Horn circuit from Fig. 30: terminal 15 relay feeds horn relay k1; steering control module switches the relay; relay output through fuse 1 15 A to Horn 1 pin B; pin A to ground G104">
      <rect x="10" y="10" width="280" height="168" rx="8" fill="none" stroke="#1f3b63" stroke-width="2" stroke-dasharray="6 4" />
      {T(18, 28, 'Fuse/relay block · LEFT KICK PANEL', { size: 11.5 })}
      {box(20, 38, 92, 34, 'var(--il-ink)', 'var(--il-fill2)')}{T(66, 54, 'Tml. 15 relay', { anchor: 'middle', size: 11.5 })}{T(66, 67, '(k8)', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M112 55 H150 V84', K.power, 3.5)}
      <rect x="128" y="84" width="104" height="58" rx="5" fill="var(--il-fill)" stroke={K.horn} stroke-width="2.5" />
      <path d="M146 96 v8 l5 3 -10 4 10 4 -10 4 5 3 v8" stroke="var(--il-ink)" stroke-width="1.6" fill="none" />
      {T(140, 96, '86', { size: 9.5 })}{T(140, 140, '85', { size: 9.5 })}
      <path d="M190 100 L214 92 M214 100 v28" stroke="var(--il-ink)" stroke-width="2" />
      {T(196, 96, '87', { size: 9.5 })}{T(218, 140, '30', { size: 9.5 })}
      {T(180, 120, 'k1', { anchor: 'middle', size: 13, color: K.horn })}
      {T(180, 136, 'horn relay', { anchor: 'middle', size: 9.5, w: 600 })}
      {box(20, 96, 92, 40, '#121417', '#ffc21a')}{T(66, 114, 'SAM N10', { anchor: 'middle', size: 12, color: '#121417' })}{T(66, 128, 'horn rly ctrl', { anchor: 'middle', size: 10, w: 600, color: '#121417' })}
      {line('M146 142 V160 H66 V136', K.horn, 2.5)}
      {line('M66 160 V206', K.horn, 3.5)}
      {T(72, 196, 'C1-12 DK GRN', { size: 10, w: 600 })}
      {box(14, 206, 112, 40, 'var(--il-ink)', 'var(--il-fill2)')}{T(70, 223, 'Steering control', { anchor: 'middle', size: 11 })}{T(70, 238, 'module ← horn btn', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M214 142 V150 H248', K.horn, 3.5)}
      <rect x="248" y="142" width="34" height="16" rx="3" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="1.8" />
      {T(265, 154, 'f1', { anchor: 'middle', size: 10 })}{T(265, 172, '15 A', { anchor: 'middle', size: 10.5 })}
      {line('M265 158 V178 V214', K.horn, 3.5)}
      {T(200, 196, 'C5-16 DK GRN', { size: 10, w: 600 })}
      {meterPoint(244, 222, '2')}
      <rect x="250" y="214" width="32" height="20" rx="3" fill="var(--il-fill3)" stroke="var(--il-ink)" stroke-width="2" />
      {T(258, 228, 'B', { size: 10 })}
      <rect x="254" y="248" width="24" height="24" rx="3" fill="var(--il-fill3)" stroke="var(--il-ink)" stroke-width="2.2" />
      <path d="M278 252 l16 -12 v40 l-16 -12 z" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="2.2" stroke-linejoin="round" />
      {line('M266 234 V246', K.horn, 3.5)}
      {T(246, 284, 'Horn 1 · engine compt', { anchor: 'end', size: 11 })}
      {line('M266 280 V306', K.gnd, 3.5)}{T(272, 300, 'A', { size: 10 })}{gnd(266, 316)}
      {T(290, 334, 'G104 · L side engine compt', { anchor: 'end', size: 11 })}
      {T(240, 300, 'BRN', { size: 9.5, w: 600, anchor: 'end' })}
      <Tag x={10} y={320} t="SOURCE" />{T(10, 354, 'SYS Fig. 30 · FG K40/9 legend', { size: 10, w: 600 })}
    </svg>
  );
}

export function AcCircuit() {
  return (
    <svg viewBox="0 0 300 360" role="img" aria-label="A/C circuit from Fig. 1: fuse block 2 fuse 16 10 A feeds the A/C heater control S98; S98 drives the compressor control valve on one wire and reads the A/C pressure sensor; S98 grounds at G200 and is on CAN B">
      {box(14, 12, 150, 38, K.power, 'var(--il-fill2)')}{T(89, 29, 'Fuse block 2 · fuse 16', { anchor: 'middle', size: 11.5 })}{T(89, 43, '10 A · top of K40/9 box', { anchor: 'middle', size: 10.5, w: 600 })}
      {line('M89 50 V78', K.power, 3.5)}
      {box(14, 78, 170, 56, K.ac)}
      {T(99, 98, 'A/C heater control S98', { anchor: 'middle', size: 12.5 })}{T(99, 113, 'scan: listed OK', { anchor: 'middle', size: 10.5, w: 600 })}{T(99, 127, 'CAN B to SAM', { anchor: 'middle', size: 10.5, w: 600, color: K.can })}
      <Tag x={190} y={82} t="REPORTED" />
      {line('M184 120 H210 V150', K.gnd, 3)}{gnd(210, 160)}{T(222, 160, 'G200', { size: 11 })}{T(222, 174, 'R rear engine', { size: 10, w: 600 })}
      {line('M60 134 V222', K.ac, 4)}{T(66, 170, 'pin 5 "compressor', { size: 10.5, w: 600 })}{T(66, 184, 'ctrl vlv" (1 wire)', { size: 10.5, w: 600 })}
      <circle cx="60" cy="252" r="28" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="2.5" />
      <circle cx="60" cy="252" r="12" fill="var(--il-fill)" stroke="var(--il-ink)" stroke-width="2" />
      <rect x="82" y="258" width="22" height="16" rx="3" fill="var(--il-fill3)" stroke="var(--il-ink)" stroke-width="2" />
      <path d="M108 276 q-4 8 0 12 q4 -4 0 -12z" fill="#1d1a12" stroke="#ffc21a" stroke-width="2" />
      {meterPoint(112, 250, '!')}
      {T(14, 300, 'Compressor A9', { size: 12.5 })}{T(14, 315, 'control valve · engine compt', { size: 10.5, w: 600 })}
      <Tag x={130} y={290} t="CONFIRMED" />{T(130, 318, 'oil in its plug', { size: 10.5 })}
      {box(196, 210, 92, 50, K.ac)}{T(242, 228, 'A/C pressure', { anchor: 'middle', size: 11.5 })}{T(242, 243, 'sensor B12', { anchor: 'middle', size: 11.5 })}{T(242, 256, '3 wires', { anchor: 'middle', size: 10, w: 600 })}
      {line('M242 210 V196 H184 V134', K.ac, 2.5, '5 4')}{T(196, 206, 'signal', { size: 10, w: 600 })}
      <Tag x={196} y={268} t="SOURCE" />
      {T(10, 340, 'SYS Fig. 1 · Do not jump the plug', { size: 10.5, color: 'var(--fail)' })}
    </svg>
  );
}

export function TrailerCircuit() {
  return (
    <svg viewBox="0 0 300 360" role="img" aria-label="Trailer circuit from Fig. 24: fuse block 4 fuse 14 20 A to socket pin 4; fuse block 4 fuse 15 25 A and fuse block 3 fuse 4 7.5 A feed the trailer tow lighting module at the rear; module ground G305, socket pin 8 ground G304; module on CAN B">
      {box(10, 10, 88, 40, K.power, 'var(--il-fill2)')}{T(54, 27, 'blk 3 · f4', { anchor: 'middle', size: 11 })}{T(54, 42, '7.5 A', { anchor: 'middle', size: 11 })}
      {box(106, 10, 88, 40, K.power, 'var(--il-fill2)')}{T(150, 27, 'blk 4 · f15', { anchor: 'middle', size: 11 })}{T(150, 42, '25 A', { anchor: 'middle', size: 11 })}
      {box(202, 10, 88, 40, K.power, 'var(--il-fill2)')}{T(246, 27, 'blk 4 · f14', { anchor: 'middle', size: 11 })}{T(246, 42, '20 A', { anchor: 'middle', size: 11 })}
      {line('M54 50 V92', K.power, 3)}{line('M150 50 V92', K.power, 3)}
      {box(14, 92, 170, 58, K.trailer)}
      {T(99, 112, 'Trailer tow lighting', { anchor: 'middle', size: 12.5 })}{T(99, 127, 'module · REAR of van', { anchor: 'middle', size: 11, w: 700 })}{T(99, 142, 'CAN B to SAM', { anchor: 'middle', size: 10.5, w: 600, color: K.can })}
      {line('M30 150 V182', K.gnd, 3)}{gnd(30, 192)}{T(44, 186, 'G305', { size: 11 })}{T(44, 200, 'lower L side', { size: 10, w: 600 })}
      {line('M246 50 V214', K.power, 3.5)}{T(252, 132, 'pin 4', { size: 10.5 })}{T(252, 146, 'RED/YEL', { size: 10, w: 600 })}{T(252, 160, 'hot at all', { size: 10, w: 600 })}{T(252, 173, 'times', { size: 10, w: 600 })}
      {line('M120 150 V236 H198', K.trailer, 3.5)}{T(126, 226, 'lamp outputs', { size: 10, w: 600 })}
      <circle cx="232" cy="244" r="30" fill="var(--il-fill2)" stroke={K.trailer} stroke-width="3" />
      <circle cx="232" cy="244" r="18" fill="var(--il-fill)" stroke="var(--il-ink)" stroke-width="1.5" />
      {meterPoint(262, 218, '4')}
      {T(232, 292, 'Trailer socket', { anchor: 'middle', size: 12.5 })}
      {line('M202 252 H186 V294', K.gnd, 3)}{gnd(186, 304)}{T(150, 328, 'pin 8 → G304', { size: 10.5 })}{T(150, 341, 'lower L center body', { size: 10, w: 600 })}
      {T(14, 262, 'Socket pins (Fig. 24):', { size: 10.5 })}
      {['2 RH turn · 3 reverse', '5 LH tail · 7 brake', '10 LH turn · 8 ground'].map((s, i) => T(14, 277 + i * 13, s, { size: 10, w: 600 }))}
      <Tag x={14} y={322} t="SOURCE" />{T(14, 352, 'SYS Fig. 24 · FG F55/3, F55/4', { size: 10, w: 600 })}
    </svg>
  );
}
