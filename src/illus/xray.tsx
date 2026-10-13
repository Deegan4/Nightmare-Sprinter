// See-through (x-ray) view of the van from above, with the wiring connections drawn on top.
// Every part sits inside the AREA its source names (the manuals give areas, not millimetres).
// Lines are electrical CONNECTIONS taken from the wiring figures, not the real harness routes:
// the manuals do not show routing. Front of the van is on the left, driver's side at the bottom.

export type Layer = 'power' | 'ign' | 'horn' | 'ac' | 'trailer' | 'can' | 'gnd';
export const LAYERS: { key: Layer; label: string; color: string }[] = [
  { key: 'power', label: 'Battery power', color: '#ff5a4e' },
  { key: 'ign', label: 'Ignition (T15)', color: '#ff9f1c' },
  { key: 'horn', label: 'Horn', color: '#4da3ff' },
  { key: 'ac', label: 'A/C', color: '#2fd27a' },
  { key: 'trailer', label: 'Trailer', color: '#c48bff' },
  { key: 'can', label: 'CAN network', color: '#ffd23f' },
  { key: 'gnd', label: 'Grounds', color: '#9fb3c8' },
];
export const LAYER_COLOR = Object.fromEntries(LAYERS.map((l) => [l.key, l.color])) as Record<Layer, string>;

export type NodeKind = 'module' | 'fuse' | 'part' | 'gnd' | 'plug' | 'battery';
export interface XNode {
  id: string; code: string; name: string; kind: NodeKind; x: number; y: number;
  /** Where the code label goes (default: below, or above near the bottom edge). */
  lab?: 'above' | 'below' | 'left' | 'right';
  /** Where the source puts it, in its own words. */
  where: string;
  /** SOURCE = a manual or official document names the area; UNKNOWN = nobody has said where yet. */
  loc: 'SOURCE' | 'UNKNOWN';
  source: string; does: string; layers: Layer[];
  /** Words that, if found in a marker on a photo of this van, confirm the location. */
  keys: string[]; zone?: string;
  /** Codes this module stored in the TOPDON scan (REPORTED). */
  codes?: string;
}

const SYS = 'System Wiring Diagram.pdf';
const WEB = 'MB 2015 Sprinter fuse supplement (web)';
export const XNODES: XNode[] = [
  // --- Left footwell / kick panel ---
  { id: 'g1', code: 'G1', name: 'Battery', kind: 'battery', x: 290, y: 350, lab: 'left', where: 'Under the driver-footwell floor (sill molding, floor covering, cover plate)', loc: 'SOURCE', source: 'Equipment & Instructions.pdf Fig. 2', does: 'Main battery. Manual check: above 12.4 V after 2 min with everything off.', layers: ['power'], keys: ['battery', 'g1'], zone: 'zone-footwell' },
  { id: 'f59', code: 'F59', name: 'Pre-fuse box (F59.5 150 A, F59.3 80 A)', kind: 'fuse', x: 322, y: 384, lab: 'right', where: 'Battery compartment in the left footwell', loc: 'SOURCE', source: `${WEB}; values: Fuse Block manual K40/9 legend`, does: 'Big fuses that feed the SAM / fuse-relay box (terminals 30 and 30z). Test with voltage drop, not ohms.', layers: ['power'], keys: ['f59', '150 a', '80 a', 'pre-fuse', 'prefuse'], zone: 'zone-footwell' },
  { id: 'k40', code: 'K40/9 · N10', name: 'Fuse/relay box with SAM', kind: 'module', x: 224, y: 386, lab: 'right', where: 'Left kick panel (driver footwell); fuse blocks 1 and 2 on top', loc: 'SOURCE', source: `${SYS} Figs. 30, 39; ${WEB}`, does: 'Holds the SAM body computer (N10), horn relay k1, horn fuse f1 15 A, terminal 15 relay k8 + fuse f18 7.5 A, 15R relay k6 + fuse f11 15 A, and fuse block 2 fuse 16 (10 A, A/C control).', layers: ['power', 'ign', 'horn', 'ac', 'trailer', 'can'], keys: ['sam', 'kick', 'k40', 'horn relay', 'fuse/relay'], zone: 'zone-footwell', codes: 'SAM: 8 codes incl. 9091 / 9090 (T15 / 15R CAN signal implausible), 90B5' },
  { id: 'diag', code: 'Diag', name: 'Diagnostic socket (scanner port)', kind: 'plug', x: 300, y: 386, lab: 'below', where: 'Driver side under the dash (where the scanner plugged in)', loc: 'UNKNOWN', source: 'Fuse block 1 fuse 2 (10 A): Fuse Block manual F55/1 legend; SYS Fig. 40 (CAN to diagnostic junction)', does: 'Where the TOPDON plugs in. Reads every module over CAN.', layers: ['can'], keys: ['diagnostic', 'obd', 'scanner port'] },
  // --- Dash / cockpit ---
  { id: 'n73', code: 'N73', name: 'Ignition switch (EIS / EZS)', kind: 'module', x: 240, y: 256, lab: 'right', where: 'At the key slot in the dash', loc: 'SOURCE', source: `${SYS} Fig. 40`, does: 'Sends terminal 15 / 15R (key on) to the SAM, and talks on CAN B and engine CAN. Grounds at G200.', layers: ['ign', 'can'], keys: ['ignition switch', 'eis', 'ezs', 'n73'], codes: 'EIS: 9007 (T15) and 9009 (T15R) short/open. ESP, TCM, EWM and engine: no CAN message from N73' },
  { id: 'a1', code: 'A1', name: 'Instrument cluster', kind: 'module', x: 240, y: 312, lab: 'left', where: 'Dash, behind the steering wheel', loc: 'SOURCE', source: 'Overall network list (cluster bridges engine CAN and interior CAN)', does: 'Gateway between the engine CAN and the interior CAN.', layers: ['can'], keys: ['cluster', 'a1'], codes: 'Cluster: 9100 engine CAN bus fault' },
  { id: 'n80', code: 'N80', name: 'Steering column module (horn button)', kind: 'module', x: 300, y: 306, lab: 'right', where: 'Steering column, left side of the instrument panel', loc: 'SOURCE', source: `${SYS} Fig. 30`, does: 'Reads the horn button and switches the horn relay k1 in the kick-panel box.', layers: ['horn', 'can'], keys: ['steering', 'n80', 'horn button'] },
  { id: 's98', code: 'S98', name: 'A/C heater control', kind: 'module', x: 240, y: 190, lab: 'right', where: 'Dash (climate control panel)', loc: 'SOURCE', source: `${SYS} Fig. 1`, does: 'Decides when the compressor runs; drives it through one control-valve wire. Fed by fuse block 2 fuse 16 (10 A).', layers: ['ac', 'can'], keys: ['s98', 'a/c control', 'climate'], codes: 'TCM: C164 no CAN message from S98; engine: 10BC00 no message from KLA (S98)' },
  { id: 'x1856', code: 'X18/56', name: 'Cockpit connector (pin 23)', kind: 'plug', x: 312, y: 156, lab: 'right', where: 'Cockpit: exact spot not given', loc: 'UNKNOWN', source: 'Wiring Diagrams.pdf Fig. 29', does: 'Compressor wire passes through pin 23.', layers: ['ac'], keys: ['x18/56', 'x18'] },
  // --- Driver seat ---
  { id: 'f55', code: 'F55/3 · F55/4', name: 'Seat-base fuse box (trailer fuses)', kind: 'fuse', x: 372, y: 404, lab: 'right', where: 'Box on the outside of the driver seat base (raise seat, press both latches)', loc: 'SOURCE', source: `${WEB}; values: Fuse Block manual F55/3, F55/4 legends; SYS Fig. 24`, does: 'F55/3 fuse 4 (7.5 A) and F55/4 fuse 15 (25 A) feed the trailer module; F55/4 fuse 14 (20 A) feeds trailer socket pin 4.', layers: ['trailer'], keys: ['fuse block 3', 'fuse block 4', 'f55/3', 'f55/4', 'seat-base fuse', 'seat base fuse'], zone: 'zone-seat' },
  { id: 'psm', code: 'N26/15', name: 'PSM special module (not the SAM)', kind: 'module', x: 392, y: 350, lab: 'below', where: 'Inside the driver seat frame', loc: 'SOURCE', source: 'Equipment & Instructions.pdf Fig. 27', does: 'Body-builder module on the interior CAN.', layers: ['can'], keys: ['psm', 'n26'], zone: 'zone-seat' },
  { id: 'w713', code: 'W71/3', name: 'Seat-base ground', kind: 'gnd', x: 432, y: 372, lab: 'right', where: 'Driver seat base', loc: 'SOURCE', source: 'Fuse Block manual: ground points, seat base W71/3', does: 'Ground point at the seat base.', layers: ['gnd'], keys: ['w71/3', 'w71'], zone: 'zone-seat' },
  // --- Engine compartment ---
  { id: 'h1', code: 'H1', name: 'Horn 1', kind: 'part', x: 78, y: 300, where: 'Engine compartment', loc: 'SOURCE', source: `${SYS} Fig. 30`, does: 'Pin B gets 12 V through f1 when the relay closes; pin A goes to ground G104.', layers: ['horn'], keys: ['horn 1', 'horn'], zone: 'zone-engine' },
  { id: 'g104', code: 'G104', name: 'Horn ground', kind: 'gnd', x: 118, y: 392, where: 'Left side of the engine compartment', loc: 'SOURCE', source: `${SYS} Fig. 30`, does: 'Horn return path.', layers: ['gnd', 'horn'], keys: ['g104'], zone: 'zone-engine' },
  { id: 'w96', code: 'W9/6', name: 'Ground, left front lamp', kind: 'gnd', x: 66, y: 372, where: 'Left front lamp unit', loc: 'SOURCE', source: 'Fuse Block manual ground legend', does: 'Front left ground point.', layers: ['gnd'], keys: ['w9/6'], zone: 'zone-engine' },
  { id: 'a9', code: 'A9', name: 'A/C compressor (oil found in plug)', kind: 'part', x: 112, y: 180, where: 'Engine compartment, on the engine', loc: 'SOURCE', source: `${SYS} Fig. 1; Wiring Diagrams.pdf Fig. 29`, does: 'Pin 1: BU/GN control-valve wire from S98 pin 5. Pin 2: local ground. Do not apply 12 V until the type is confirmed.', layers: ['ac', 'gnd'], keys: ['compressor', 'a9'], zone: 'zone-engine' },
  { id: 'b12', code: 'B12', name: 'A/C pressure sensor', kind: 'part', x: 74, y: 130, where: 'Engine compartment (refrigerant line)', loc: 'SOURCE', source: `${SYS} Fig. 1`, does: 'Reports refrigerant pressure back to S98.', layers: ['ac'], keys: ['b12', 'pressure sensor'], zone: 'zone-engine' },
  { id: 'x2638', code: 'X26/38', name: 'Engine harness connector (pin 7)', kind: 'plug', x: 168, y: 214, where: 'Engine harness', loc: 'SOURCE', source: 'Wiring Diagrams.pdf Fig. 29', does: 'Compressor wire passes through pin 7.', layers: ['ac'], keys: ['x26/38', 'x26'], zone: 'zone-engine' },
  { id: 'g200', code: 'G200', name: 'Ground (A/C control, ignition switch)', kind: 'gnd', x: 178, y: 100, where: 'Right rear of the engine compartment', loc: 'SOURCE', source: `${SYS} Figs. 1, 40`, does: 'Return for S98 and the ignition switch.', layers: ['gnd', 'ac', 'ign'], keys: ['g200'], zone: 'zone-engine' },
  { id: 'cdi', code: 'CDI', name: 'Engine computer (CDI, N3/20 or N3/21 by variant)', kind: 'module', x: 130, y: 262, where: 'Engine compartment: exact spot not given in these manuals', loc: 'UNKNOWN', source: 'Overall network list (engine CAN)', does: 'Engine control on the engine CAN.', layers: ['can'], keys: ['cdi', 'ecu', 'engine computer', 'n3/2'], zone: 'zone-engine', codes: 'Engine: 7 codes incl. 104000 / 105B00 no CAN message from EZS (N73)' },
  // --- Rear ---
  { id: 'n28', code: 'N28/1', name: 'Trailer tow lighting module', kind: 'module', x: 900, y: 318, where: 'Rear of the vehicle', loc: 'SOURCE', source: `${SYS} Fig. 24; Wiring Diagrams - Body.pdf Fig. 6`, does: 'Gets turn / brake commands from the SAM over CAN B and switches the trailer lamps. Grounds at G305.', layers: ['trailer', 'can'], keys: ['trailer module', 'n28'], zone: 'zone-rear' },
  { id: 'sock', code: 'Socket', name: 'Trailer socket', kind: 'plug', x: 972, y: 236, where: 'Rear bumper', loc: 'SOURCE', source: `${SYS} Fig. 24`, does: 'Pin 4 constant 12 V (F55/4 f14 20 A), 2 RH turn, 3 reverse, 5 LH tail, 7 brake, 10 LH turn, pin 8 ground → G304.', layers: ['trailer'], keys: ['trailer socket', 'socket', 'trailer plug'], zone: 'zone-rear' },
  { id: 'g305', code: 'G305', name: 'Trailer module ground', kind: 'gnd', x: 836, y: 404, where: 'Lower left side of the vehicle', loc: 'SOURCE', source: `${SYS} Fig. 24`, does: 'Return for the trailer module.', layers: ['gnd', 'trailer'], keys: ['g305'], zone: 'zone-rear' },
  { id: 'g304', code: 'G304', name: 'Trailer socket ground (pin 8)', kind: 'gnd', x: 600, y: 404, where: 'Lower left center of the body', loc: 'SOURCE', source: `${SYS} Fig. 24`, does: 'Return for the trailer socket, pin 8.', layers: ['gnd', 'trailer'], keys: ['g304'], zone: 'zone-rear' },
];

export interface XLink { from: string; to: string; layer: Layer; label: string; src: string; d?: string; via?: number; dashed?: boolean }
// Drawn as simple right-angle connections (auto-routed unless `d` is given; `via` = run along that y first).
// They show WHAT connects to WHAT, not where the wires run.
export const XLINKS: XLink[] = [
  { from: 'g1', to: 'f59', layer: 'power', label: 'Battery + to pre-fuses', src: 'SYS Fig. 38' },
  { from: 'f59', to: 'k40', layer: 'power', label: 'F59.5 150 A (tml 30) + F59.3 80 A (tml 30z) → SAM / fuse-relay box', src: 'Fuse Block manual K40/9 legend', via: 420 },
  { from: 'n73', to: 'k40', layer: 'ign', label: 'Terminal 15R + ignition signal → SAM; SAM switches k8 (→ f18 7.5 A, horn relay) and k6 (→ f11 15 A, f13 15 A)', src: 'SYS Figs. 39, 40; K40/9 legend', d: 'M240 256 H214 V386' },
  { from: 'n73', to: 'g200', layer: 'gnd', label: 'Ignition switch ground → G200', src: 'SYS Fig. 40', d: 'M240 256 H222 V100 H178' },
  { from: 'n80', to: 'k40', layer: 'horn', label: 'Horn button request (C1-12 DK GRN) → SAM → relay k1', src: 'SYS Fig. 30', d: 'M300 306 V334 H232 V386' },
  { from: 'k40', to: 'h1', layer: 'horn', label: 'Relay k1 output → f1 15 A → Horn 1 pin B', src: 'SYS Fig. 30', d: 'M224 386 V410 H40 V300 H78' },
  { from: 'h1', to: 'g104', layer: 'gnd', label: 'Horn 1 pin A → G104', src: 'SYS Fig. 30', d: 'M78 300 V334 H118 V392' },
  { from: 'k40', to: 's98', layer: 'ac', label: 'Fuse block 2 fuse 16 (10 A) → S98', src: 'SYS Fig. 1; F55/2 legend', d: 'M224 386 V376 H208 V190 H240' },
  { from: 's98', to: 'x1856', layer: 'ac', label: 'S98 pin 5 → X18/56 pin 23 (BU/GN 0.75)', src: 'Wiring Diagrams.pdf Fig. 29', d: 'M240 190 V156 H312' },
  { from: 'x1856', to: 'x2638', layer: 'ac', label: 'X18/56 pin 23 → X26/38 pin 7 (BU/GN)', src: 'Wiring Diagrams.pdf Fig. 29', d: 'M312 156 V136 H168 V214' },
  { from: 'x2638', to: 'a9', layer: 'ac', label: 'X26/38 pin 7 → compressor A9 pin 1 (BU/GN)', src: 'Wiring Diagrams.pdf Fig. 29', d: 'M168 214 V180 H112' },
  { from: 'b12', to: 's98', layer: 'ac', label: 'Pressure sensor signal → S98', src: 'SYS Fig. 1', d: 'M74 130 V118 H252 V190', dashed: true },
  { from: 's98', to: 'g200', layer: 'gnd', label: 'S98 ground → G200', src: 'SYS Fig. 1', d: 'M240 190 V100 H178' },
  { from: 'a9', to: 'a9', layer: 'gnd', label: 'Compressor pin 2 → local ground', src: 'Wiring Diagrams.pdf Fig. 29', d: 'M112 180 H92 V198' },
  { from: 'f55', to: 'n28', layer: 'trailer', label: 'F55/4 f15 25 A + F55/3 f4 7.5 A → trailer module', src: 'SYS Fig. 24', via: 426 },
  { from: 'f55', to: 'sock', layer: 'trailer', label: 'F55/4 f14 20 A → socket pin 4', src: 'SYS Figs. 24, 38', d: 'M372 404 V434 H984 V236 H972' },
  { from: 'k40', to: 'n28', layer: 'trailer', label: 'Turn / brake commands over CAN B (SAM → trailer module)', src: 'Wiring Diagrams - Body.pdf Fig. 6, 7', d: 'M224 386 V368 H880 V318 H900', dashed: true },
  { from: 'n28', to: 'sock', layer: 'trailer', label: 'Lamp outputs → socket pins 2, 3, 5, 7, 10', src: 'SYS Fig. 24', d: 'M900 318 H940 V236 H972' },
  { from: 'n28', to: 'g305', layer: 'gnd', label: 'Trailer module → G305', src: 'SYS Fig. 24' },
  { from: 'sock', to: 'g304', layer: 'gnd', label: 'Socket pin 8 → G304', src: 'SYS Fig. 24', d: 'M972 236 V392 H600 V404' },
  // CAN: one connection per pair of neighbours on each network.
  { from: 'k40', to: 'psm', layer: 'can', label: 'Interior CAN (CAN B): SAM N10 ↔ PSM N26/15', src: 'Overall network list', d: 'M224 386 V330 H392 V350', dashed: true },
  { from: 'psm', to: 'n28', layer: 'can', label: 'Interior CAN (CAN B): PSM ↔ trailer module N28/1', src: 'Overall network list', d: 'M392 330 H910 V318', dashed: true },
  { from: 'a1', to: 'k40', layer: 'can', label: 'Interior CAN (CAN B): cluster A1 ↔ SAM', src: 'Overall network list', d: 'M240 312 V330', dashed: true },
  { from: 'n73', to: 'a1', layer: 'can', label: 'CAN B + engine CAN: ignition switch N73 ↔ cluster A1', src: 'Overall network list; SYS Fig. 40', d: 'M246 256 V312', dashed: true },
  { from: 'n73', to: 's98', layer: 'can', label: 'Second interior CAN: N73 ↔ A/C control S98 (+ cluster, radio, OBF)', src: 'Overall network list', d: 'M234 256 V190', dashed: true },
  { from: 'a1', to: 'cdi', layer: 'can', label: 'Engine CAN: cluster A1 ↔ engine CDI (+ ESP, TCM, EWM)', src: 'Overall network list', d: 'M240 312 H150 V262 H130', dashed: true },
  { from: 'n73', to: 'diag', layer: 'can', label: 'Diagnostic CAN → scanner port', src: 'SYS Fig. 40', d: 'M240 256 H272 V386 H300', dashed: true },
];
export function linkPath(l: XLink): string {
  if (l.d) return l.d;
  const a = XNODES.find((n) => n.id === l.from)!, b = XNODES.find((n) => n.id === l.to)!;
  return l.via != null ? `M${a.x} ${a.y} V${l.via} H${b.x} V${b.y}` : `M${a.x} ${a.y} H${b.x} V${b.y}`;
}


// The cab holds most of the parts, so it is drawn wider than life and the empty cargo area narrower.
// X() maps a "true proportion" x to the drawing; P() does the same for a path (absolute M/L/H/V/Q only).
const XS: [number, number][] = [[0, 0], [48, 48], [206, 230], [444, 640], [956, 956], [1000, 1000]];
export function X(x: number): number {
  for (let i = 1; i < XS.length; i++) {
    const [a0, b0] = XS[i - 1], [a1, b1] = XS[i];
    if (x <= a1) return Math.round(b0 + ((x - a0) * (b1 - b0)) / (a1 - a0));
  }
  return x;
}
export function P(d: string): string {
  const out: string[] = [];
  const re = /([MLHVQZ])([^MLHVQZ]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const c = m[1], nums = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'H') out.push('H' + nums.map(X).join(' '));
    else if (c === 'V' || c === 'Z' || c === 'z') out.push(c + nums.join(' '));
    else out.push(c + nums.map((n, i) => (i % 2 === 0 ? X(n) : n)).join(' '));
  }
  return out.join(' ');
}
const R = (x: number, w: number) => ({ x: X(x), width: X(x + w) - X(x) });

const KIND_R: Record<NodeKind, number> = { module: 15, fuse: 14, part: 13, gnd: 10, plug: 11, battery: 15 };

function Node({ n, on, dim, picked, confirmed, onPick }: { n: XNode; on: boolean; dim: boolean; picked: boolean; confirmed: boolean; onPick: (id: string) => void }) {
  const r = KIND_R[n.kind];
  const col = LAYER_COLOR[n.layers[0]];
  const pick = () => onPick(n.id);
  return (
    <g class={`xr-node${dim ? ' dim' : ''}${picked ? ' picked' : ''}`} transform={`translate(${X(n.x)} ${n.y})`} tabIndex={0} role="button"
      aria-label={`${n.code} ${n.name}. ${n.where}`} onClick={pick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}>
      <circle r="24" fill="transparent" />
      {n.loc === 'UNKNOWN' && !confirmed && <circle r={r + 8} fill="none" stroke="#9fb3c8" stroke-width="1.5" stroke-dasharray="3 3" />}
      {confirmed && <circle r={r + 6} fill="none" stroke="#2fd27a" stroke-width="3" />}
      {n.kind === 'gnd' ? (
        <g stroke={on ? '#e6f0ff' : '#9fb3c8'} stroke-width="2.2" fill="none">
          <circle r={r} fill="#0d1726" />
          <path d="M0 -5 V1 M-6 1 H6 M-4 4.5 H4 M-1.8 8 H1.8" />
        </g>
      ) : n.kind === 'battery' ? (
        <g><rect x="-18" y="-12" width="36" height="24" rx="3" fill="#0d1726" stroke={col} stroke-width="2.5" /><path d="M-11 0 h6 M8 -3 v6 M5 0 h6" stroke="#e6f0ff" stroke-width="2" /></g>
      ) : n.kind === 'fuse' ? (
        <g><rect x="-16" y="-11" width="32" height="22" rx="4" fill="#0d1726" stroke={col} stroke-width="2.5" /><path d="M-9 0 h4 l3 -4 4 8 3 -4 h4" stroke="#e6f0ff" stroke-width="1.8" fill="none" /></g>
      ) : n.kind === 'plug' ? (
        <g><rect x="-11" y="-9" width="22" height="18" rx="3" fill="#0d1726" stroke={col} stroke-width="2.2" /><path d="M-5 -3 v6 M0 -3 v6 M5 -3 v6" stroke="#e6f0ff" stroke-width="1.8" /></g>
      ) : (
        <g><circle r={r} fill={n.kind === 'module' ? '#13243d' : '#0d1726'} stroke={col} stroke-width="2.6" /><circle r="4" fill={col} /></g>
      )}
      {n.codes && <g transform={`translate(${r - 1} ${-r + 1})`}><circle r="7" fill="#ff5a4e" stroke="#0a1220" stroke-width="2" /><text y="0.5" text-anchor="middle" dominant-baseline="central" style="font:800 9px var(--font-body);fill:#fff">!</text></g>}
      {(() => {
        const lab = n.lab ?? (n.y > 380 ? 'above' : 'below');
        const [tx, ty, a] = lab === 'above' ? [0, -r - 7, 'middle'] : lab === 'below' ? [0, r + 15, 'middle'] : lab === 'left' ? [-r - 6, 4.5, 'end'] : [r + 6, 4.5, 'start'];
        return <text class="xr-code" x={tx} y={ty} text-anchor={a}>{n.code}</text>;
      })()}
    </g>
  );
}

/** The see-through van. `layers` = layers to show; `sel` = picked node id. */
export function XrayVan({ layers, sel, onPick, confirmed }: { layers: Set<Layer>; sel?: string; onPick: (id: string) => void; confirmed: (n: XNode) => boolean }) {
  const linked = new Set<string>();
  if (sel) for (const l of XLINKS) if ((l.from === sel || l.to === sel) && layers.has(l.layer)) { linked.add(l.from); linked.add(l.to); }
  const nodeOn = (n: XNode) => n.layers.some((l) => layers.has(l));
  return (
    <svg class="xr-svg" viewBox="0 0 1000 470" role="img" aria-label="See-through view of the Sprinter from above with its wiring connections. Front on the left, driver's side at the bottom.">
      <defs>
        <pattern id="xr-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern>
        <filter id="xr-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="1000" height="470" fill="#0a1220" />
      <rect width="1000" height="470" fill="url(#xr-grid)" />
      {/* areas named by the sources */}
      <g style="font:700 11px var(--font-body);letter-spacing:.06em" fill="#7f97b4">
        <rect {...R(46, 160)} y="76" height="336" rx="18" fill="rgba(77,163,255,.07)" stroke="#2b4467" stroke-dasharray="6 5" />
        <text x={X(58)} y="96">ENGINE COMPARTMENT</text>
        <rect {...R(200, 134)} y="340" height="72" rx="12" fill="rgba(255,90,78,.07)" stroke="#5a2f3a" stroke-dasharray="6 5" />
        <text x={X(208)} y="452" fill="#c98b93">▲ LEFT FOOTWELL</text>
        <rect {...R(336, 96)} y="318" height="94" rx="12" fill="rgba(196,139,255,.07)" stroke="#4a3866" stroke-dasharray="6 5" />
        <text x={X(350)} y="452" fill="#b49ad8">▲ DRIVER SEAT</text>
        <rect {...R(830, 124)} y="270" height="142" rx="12" fill="rgba(196,139,255,.07)" stroke="#4a3866" stroke-dasharray="6 5" />
        <text x={X(842)} y="288" fill="#b49ad8">REAR</text>
      </g>
      {/* van outline, see-through */}
      <g fill="none" stroke="#5f7fa8" stroke-width="2.4" stroke-linejoin="round">
        <rect {...R(118, 72)} y="58" height="16" rx="5" fill="#1a2a42" /><rect {...R(118, 72)} y="410" height="16" rx="5" fill="#1a2a42" />
        <rect x={X(716)} width="72" y="58" height="16" rx="5" fill="#1a2a42" /><rect x={X(716)} width="72" y="410" height="16" rx="5" fill="#1a2a42" />
        <path d={P("M206 72 L934 72 Q956 72 956 94 L956 392 Q956 412 934 412 L206 412 L110 400 Q52 392 48 340 L48 144 Q52 92 110 84 Z")} fill="rgba(95,127,168,.06)" />
        <path d={P("M206 78 Q194 242 206 406")} stroke-width="2" opacity=".8" />
        <path d={P("M206 78 L262 76 M206 406 L262 408")} stroke-width="1.6" opacity=".6" />
        <path d={P("M444 76 V408")} stroke-width="1.5" opacity=".5" stroke-dasharray="8 6" />
        <rect {...R(336, 80)} y="96" height="78" rx="12" opacity=".55" />
        <rect {...R(336, 80)} y="318" height="78" rx="12" opacity=".55" />
        <ellipse cx={X(292)} cy="322" rx="9" ry="30" opacity=".7" />
        <path d={P("M218 84 V400")} stroke-width="5" opacity=".18" />
        <path d={P("M60 172 Q54 242 60 312")} opacity=".5" />
        <rect {...R(956, 10)} y="140" height="200" rx="3" fill="#1a2a42" />
      </g>
      <g style="font:700 12px var(--font-body);letter-spacing:.08em" fill="#7f97b4">
        <text x={X(48)} y="36">◄ FRONT</text>
        <text x={X(700)} y="98" text-anchor="middle">PASSENGER SIDE</text>
        <text x={X(700)} y="452" text-anchor="middle">DRIVER SIDE</text>
        <text x={X(690)} y="240" text-anchor="middle" opacity=".55">CARGO AREA</text>
        <text x={X(952)} y="36" text-anchor="end">REAR ►</text>
      </g>
      {/* connections */}
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        {XLINKS.filter((l) => layers.has(l.layer)).map((l) => {
          const hot = !sel || l.from === sel || l.to === sel;
          return <path d={P(linkPath(l))} stroke={LAYER_COLOR[l.layer]} stroke-width={hot && sel ? 4.5 : 3} stroke-dasharray={l.dashed ? '9 6' : undefined}
            opacity={hot ? 0.95 : 0.14} filter={hot ? 'url(#xr-glow)' : undefined} />;
        })}
      </g>
      {XNODES.map((n) => {
        const on = nodeOn(n);
        const dim = !on || (!!sel && sel !== n.id && !linked.has(n.id));
        return <Node n={n} on={on} dim={dim} picked={sel === n.id} confirmed={confirmed(n)} onPick={onPick} />;
      })}
      <text x="992" y="466" text-anchor="end" style="font:600 10.5px var(--font-body)" fill="#7f97b4">Not to scale (cab drawn wider) · lines = connections from the wiring figures, not harness routes</text>
    </svg>
  );
}
