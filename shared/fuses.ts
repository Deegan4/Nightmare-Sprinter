// Every fuse and relay the owner's Mercedes manual ("Wiring Diagrams (Fuse Block, Grounds).pdf") lists for the US/Canada 906,
// text copied from its legends. Box locations: Mercedes 2015 Sprinter Fuse Allocation Supplement (web, same W906), which the
// 2012 manuals lack. Listed in number order: this is NOT the physical slot layout. The fuse card in the van decides.
export type Hit = 'horn' | 'ac' | 'turn' | 'trailer' | 'power' | 'scan';
export interface Fuse { n: string; amp: string; what: string; hit?: Hit[]; note?: string }
export interface FuseBox { id: string; name: string; where: string; whereSrc: string; src: string; fuses: Fuse[]; relays?: Fuse[] }

export const HIT_LABEL: Record<Hit, string> = { horn: 'Horn', ac: 'A/C', turn: 'Rear turn', trailer: 'Trailer', power: 'Ignition / power', scan: 'Scan codes' };
export const HIT_COLOR: Record<Hit, string> = { horn: '#ff5a4e', ac: '#4da3ff', turn: '#ffd23f', trailer: '#c48bff', power: '#ff9f1c', scan: '#2fd27a' };

const MAIN = 'Main fuse box · footwell, left side (kick panel)';
const SEAT = 'Fuse box on the outside of the driver seat base';
const SUP = 'MB 2015 Sprinter fuse supplement (web, confirm)';

export const FUSE_BOXES: FuseBox[] = [
  {
    id: 'k40', name: 'K40/9 · Fuse/relay box (SRB)', where: MAIN, whereSrc: SUP, src: 'FG K40/9 legend, PE54.15-D-2001-97AB (USA/Canada)',
    fuses: [
      { n: 'f1', amp: '15 A', what: 'Signaling horn', hit: ['horn'] },
      { n: 'f2', amp: '25 A', what: 'ELV / EZS (steering lock, ignition switch)', hit: ['power'] },
      { n: 'f3', amp: '10 A', what: 'Circuit 30z (gasoline), EZS, instrument cluster', hit: ['power'] },
      { n: 'f4', amp: '5 A', what: 'Tml. 30 LDS / OBF (light switch, switch unit)' },
      { n: 'f5', amp: '30 A', what: 'Front windshield wiper' },
      { n: 'f6', amp: '15 A', what: 'Fuel pump' },
      { n: 'f7', amp: '5 A', what: 'MRM (steering column module)' },
      { n: 'f8', amp: '20 A', what: 'Tml. 87 engine control (2)' },
      { n: 'f9', amp: '20/25 A', what: 'Tml. 87 engine control (3)' },
      { n: 'f10', amp: '10 A', what: 'Tml. 87 engine control (4)' },
      { n: 'f11', amp: '15 A', what: 'Tml. 15R (accessory feed)', hit: ['power'] },
      { n: 'f12', amp: '10 A', what: 'Tml. 15R airbag' },
      { n: 'f13', amp: '15 A', what: 'Cigar lighter / radio' },
      { n: 'f14', amp: '5 A', what: 'Tml. 15 LDS / instrument cluster / diagnostic socket', hit: ['scan'] },
      { n: 'f15', amp: '5 A', what: 'LWR (headlamp range)' },
      { n: 'f16', amp: '10 A', what: 'Tml. 87 engine control (1)' },
      { n: 'f17', amp: '10 A', what: 'Airbag' },
      { n: 'f18', amp: '7.5 A', what: 'Tml. 15 (ignition feed)', hit: ['power'] },
      { n: 'f19', amp: '7.5 A', what: 'Tml. 30 interior lights' },
      { n: 'f20', amp: '25 A', what: 'Tml. 30', hit: ['power'], note: '2015 sheet: passenger window switch / tml. 30/2 SAM' },
      { n: 'f21', amp: '5 A', what: 'Tml. 15 engine control unit' },
      { n: 'f22', amp: '5 A', what: 'Tml. 15 ESP', hit: ['scan'], note: 'ESP code 43C0 (low voltage)' },
      { n: 'f23', amp: '20/25 A', what: 'Circuit 50 starter' },
      { n: 'f24', amp: '10 A', what: 'Tml. 15 diesel engine components' },
      { n: 'f25', amp: '25 A', what: 'Instrument panel socket' },
    ],
    relays: [
      { n: 'k1', amp: 'relay', what: 'Horn relay', hit: ['horn'] },
      { n: 'k2', amp: 'relay', what: 'Wiper stage 2' },
      { n: 'k3', amp: 'relay', what: 'Fuel pump' },
      { n: 'k4', amp: 'relay', what: 'Wiper stage 1' },
      { n: 'k5', amp: 'relay', what: 'Tml. 50 starter' },
      { n: 'k6', amp: 'relay', what: 'Tml. 15R', hit: ['power'] },
      { n: 'k7', amp: 'relay', what: 'Tml. 87 engine control' },
      { n: 'k8', amp: 'relay', what: 'Tml. 15 (feeds horn relay)', hit: ['power', 'horn'] },
    ],
  },
  {
    id: 'f55-1', name: 'F55/1 · Fuse block 1', where: MAIN, whereSrc: SUP, src: 'FG F55/1 legend, PE54.15-D-2400-97AAA (USA/Canada)',
    fuses: [
      { n: '1', amp: '25 A', what: 'Driver door control unit' },
      { n: '2', amp: '10 A', what: 'Diagnostic socket (scanner port)', hit: ['scan'] },
      { n: '3', amp: '25 A', what: 'Brake system (valves)' },
      { n: '4', amp: '40 A', what: 'Brake system (delivery pump)' },
      { n: '5', amp: '7.5/10 A', what: 'Motors circuit 87 (5)' },
      { n: '6', amp: '7.5/10 A', what: 'Motors circuit 87 (6)' },
      { n: '7', amp: '30 A', what: 'Headlamp cleaning system' },
      { n: '8', amp: '15 A', what: 'EDW alarm, rotating beacon / tone sequence' },
      { n: '9', amp: '10 A', what: 'Additional turn signal module (if fitted)', hit: ['turn'], note: '2015 sheet agrees' },
    ],
  },
  {
    id: 'f55-2', name: 'F55/2 · Fuse block 2', where: MAIN, whereSrc: SUP, src: 'FG F55/2 legend, PE54.15-D-2400-97ABA (USA/Canada)',
    fuses: [
      { n: '10', amp: '15/20 A', what: 'Radio' },
      { n: '11', amp: '7.5 A', what: 'Mobile phone, tachograph' },
      { n: '12', amp: '30 A', what: 'Front blower', hit: ['ac'] },
      { n: '13', amp: '7.5 A', what: 'Heater timer / FleetBoard' },
      { n: '14', amp: '30 A', what: 'Heated seats' },
      { n: '15', amp: '10 A', what: 'Non-MB body electrical (or 5 A brake system)' },
      { n: '16', amp: '10 A', what: 'Front climate control (S98), CD changer', hit: ['ac'], note: 'Owner: power OK' },
      { n: '17', amp: '7.5/10 A', what: 'Motion detector / comfort illumination' },
      { n: '18', amp: '7.5 A', what: 'Rear climate control', hit: ['ac'] },
    ],
  },
  {
    id: 'f55-3', name: 'F55/3 · Fuse block 3', where: SEAT, whereSrc: SUP, src: 'FG F55/3 legend (USA/Canada)',
    fuses: [
      { n: '1', amp: '5 A', what: 'Mirror adjustment, heated rear window relay' },
      { n: '2', amp: '30 A', what: 'Rear wiper' },
      { n: '3', amp: '5 A', what: 'Start-off assist, heater timer, backup camera, telephone' },
      { n: '4', amp: '7.5 A', what: 'AAG trailer module, tachograph, ADR', hit: ['trailer'] },
      { n: '5', amp: '10 A', what: 'EGS transmission tml. 87' },
      { n: '6', amp: '—', what: 'Not in the 2012 legend', note: '2015 sheet: AWD / aux oil pump' },
      { n: '7', amp: '10 A', what: 'ESM (selector module)' },
      { n: '8', amp: '10 A', what: 'Dump truck / cargo lift gate tml. 15' },
      { n: '9', amp: '15 A', what: 'Multitone horn / roof fan', hit: ['horn', 'ac'], note: '2015 sheet: 7.5 A rear A/C, compressor clutch, reverse warning (beeper). Check your card' },
    ],
  },
  {
    id: 'f55-4', name: 'F55/4 · Fuse block 4', where: SEAT, whereSrc: SUP, src: 'FG F55/4 legend as of 4/1/07, PE54.15-D-2400-97ADA',
    fuses: [
      { n: '10', amp: '25 A', what: 'Body manufacturer tml. 30' },
      { n: '11', amp: '15 A', what: 'Body manufacturer tml. 15' },
      { n: '12', amp: '10 A', what: 'Body manufacturer tml. D+' },
      { n: '13', amp: '30 / 20 A', what: 'Rear A/C (30 A) or fuel pump (20 A)', note: 'Only vans built up to 3/31/07 had the turn module here' },
      { n: '14', amp: '20 A', what: 'Trailer socket (pin 4, hot at all times)', hit: ['trailer'] },
      { n: '15', amp: '25 A', what: 'AAG trailer tow lighting module', hit: ['trailer'] },
      { n: '16', amp: '7.5 A', what: 'TPM tire pressure, Parktronic' },
      { n: '17', amp: '25 A', what: 'PSM special module' },
      { n: '18', amp: '25 A', what: 'PSM special module' },
    ],
  },
  {
    id: 'f59', name: 'F59 · Pre-fuse box', where: 'Battery compartment, footwell left side', whereSrc: SUP, src: 'FG fuse legends (F59.3, F59.5, F59.6)',
    fuses: [
      { n: 'F59.3', amp: '80 A', what: 'SAM / SRB terminal 30z', hit: ['power'] },
      { n: 'F59.5', amp: '150 A', what: 'Tml. 30 SAM / SRB (feeds the whole kick-panel box)', hit: ['power'] },
      { n: 'F59.6', amp: 'bridge', what: 'Tml. 30 current bridge' },
    ],
  },
];
