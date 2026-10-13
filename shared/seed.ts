// First-run content, taken from the PRD. Provenance labels here are part of the spec:
// do not upgrade a HYPOTHESIS or SOURCE item to CONFIRMED in code.
import type { Rec, Kind, Vehicle, Fact, Step, Rule, Suspect, FaultCode, ReferencePage, Zone } from './types';

export const VEHICLE_ID = 'v1';
const T0 = Date.UTC(2026, 9, 12, 12, 0, 0);

const rec = <T>(kind: Kind, id: string, data: T, i = 0): Rec<T> => ({
  id, kind, vehicle_id: VEHICLE_ID, data, created_at: T0 + i, updated_at: T0 + i, created_by: 'seed',
});

const vehicle: Vehicle = {
  name: 'Nightmare Sprinter',
  vin: 'WD3PE7CCXC5614568',
  year: '2012',
  make_model: 'Freightliner Sprinter W906 / 2500',
  engine: '3.0L V6 diesel (OM642)',
  mileage: '≈175,413',
  notes: 'Front A/C only (no rear A/C). Horn, A/C compressor and trailer lights all stopped working at the same time.',
};

const facts: [string, Fact][] = [
  ['fact-charge', { text: 'Charging voltage with engine running: 14.05 V', provenance: 'CONFIRMED', source: 'Owner measurement', tags: ['Power distribution'] }],
  ['fact-ground-strap', { text: 'Engine-to-chassis ground strap replaced; contact area cleaned to bare metal.', provenance: 'CONFIRMED', source: 'Owner', tags: ['Grounds'] }],
  ['fact-connections', { text: 'Electrical connections cleaned.', provenance: 'CONFIRMED', source: 'Owner', tags: [] }],
  ['fact-sam', { text: 'Refurbished SAM installed (eBay, seller unreachable). Coding status unknown.', provenance: 'CONFIRMED', source: 'Owner', tags: ['SAM'] }],
  ['fact-sam-coding', { text: 'Whether the used SAM is coded to this VIN.', provenance: 'UNKNOWN', source: '', tags: ['SAM'] }],
  ['fact-sam-label', { text: 'SAM label: part A 906 900 47 00, hardware A 906 901 15 00, firmware A 906 902 75 00, ZGS 001, manufacturer Temic.', provenance: 'CONFIRMED', source: 'SAM label', tags: ['SAM'] }],
  ['fact-sam-volts', { text: 'Scanner shows SAM module voltage 13.10 V.', provenance: 'REPORTED', source: 'TOPDON scan', tags: ['SAM'] }],
  ['fact-scan', { text: 'TOPDON scanner (exact model unknown), report dated 2026-10-09 with 23 faults.', provenance: 'REPORTED', source: 'TOPDON report 2026-10-09', tags: [] }],
  ['fact-timeline', { text: 'Horn, A/C and trailer lights all stopped BEFORE the SAM was replaced.', provenance: 'CONFIRMED', source: 'Owner', tags: ['SAM', 'Horn', 'A/C', 'Trailer'] }],
  ['fact-oil', { text: 'Oil found inside the lower electrical connector that plugs into the A/C compressor.', provenance: 'CONFIRMED', source: 'Owner inspection', tags: ['A/C'] }],
  ['fact-prefuse-ohm', { text: '150 A pre-fuse read ≈2.2 Ω, but the meter leads alone read ≈2.1 Ω. This test proves nothing; use voltage drop instead.', provenance: 'CONFIRMED', source: 'Owner measurement', tags: ['Power distribution'] }],
];

const rules: [string, Rule][] = [
  ['rule-ground-drop', {
    label: 'Ground voltage drop', comparator: 'max', a: 0.2, unit: 'V', conditions: ['load', 'running'],
    explanation: 'More than about 0.2 V lost in a ground path suggests a weak or corroded return.',
    meets_text: 'The ground path is not losing much voltage under this test.',
    provenance: 'SOURCE', source: 'General practice (rule of thumb, not a factory spec)',
  }],
  ['rule-fuse-drop', {
    label: 'Voltage drop across a fuse', comparator: 'max', a: 0.2, unit: 'V', conditions: ['key_on', 'load', 'running'],
    explanation: 'A large drop across a fuse suggests a bad fuse or terminal.',
    meets_text: 'Little voltage is being lost across this fuse and its terminals.',
    provenance: 'SOURCE', source: 'General practice (rule of thumb, not a factory spec)',
  }],
  ['rule-feed-12v', {
    label: 'Constant 12 V at a feed', comparator: 'between', a: 11.5, b: 14.5, unit: 'V', conditions: [],
    explanation: 'Low or zero volts means the feed is missing or restricted upstream.',
    meets_text: 'Battery voltage is arriving at this point.',
    provenance: 'SOURCE', source: 'General practice (rule of thumb, not a factory spec)',
  }],
];

const steps: [string, Step][] = [
  ['step-1', {
    position: 1, title: 'Photograph the fuse card & under-seat box', short: 'Photos',
    why: 'The fuse-card legend is the only fuse map matched to THIS van. Every later step depends on knowing what is really in the box.',
    how_to: [
      'Find the fuse-card legend (the printed chart) and photograph it flat, with no glare.',
      'Open the box under the driver’s seat and photograph it from straight above.',
      'Take one wide shot and one close-up of each row of fuses.',
    ],
    status: 'todo', requires_photo: true, safety: [], presets: [], suspect_ids: ['sus-power'], zone_id: 'zone-seat',
    ref_ids: ['ref-fuse-box'], illustration: 'photo', notes: '',
  }],
  ['step-2', {
    position: 2, title: 'Horn: power and ground at the horn plug', short: 'Horn',
    why: 'If 12 V reaches the horn plug when the button is pressed, the SAM and its relay are doing their job and the problem is the horn or its ground. If not, look upstream.',
    how_to: [
      'Key ON.',
      'Unplug the horn in the engine bay.',
      'Black meter lead on a clean bare-metal ground, red lead on the horn plug power terminal.',
      'Helper presses and holds the horn. Record the volts.',
      'Then do a voltage-drop test on the horn ground wire: red lead on the horn ground terminal, black lead on battery negative, horn pressed.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop'],
    presets: [
      { label: 'Horn plug power (horn pressed)', unit: 'V', condition: 'load', rule_id: 'rule-feed-12v', hint: 'Red on plug power, black on ground' },
      { label: 'Horn ground voltage drop', unit: 'V', condition: 'load', rule_id: 'rule-ground-drop', hint: 'Red on horn ground, black on battery −' },
    ],
    suspect_ids: ['sus-sam', 'sus-grounds', 'sus-power'], zone_id: 'zone-engine', ref_ids: ['ref-horn', 'ref-grounds-a'], illustration: 'horn', notes: '',
  }],
  ['step-3', {
    position: 3, title: 'Big SAM fuses: voltage drop across 150 A and 80 A', short: 'Big fuses',
    why: 'These two fuses feed the SAM/SRB, where the horn relay lives. Ohms on a fuse this big tells you nothing; a voltage drop with current flowing does.',
    how_to: [
      'Key ON (more load is better: lights on, blower on).',
      'Put one meter lead on each end of the 150 A fuse (F59.5). Record the volts across it.',
      'Do the same across the 80 A fuse (F59.3).',
      'Also record volts on each end of each fuse to ground, so both sides are on file.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop', 'verify_before_replace'],
    presets: [
      { label: '150 A fuse (F59.5) drop across', unit: 'V', condition: 'key_on', rule_id: 'rule-fuse-drop', hint: 'One lead each side of the fuse' },
      { label: '80 A fuse (F59.3) drop across', unit: 'V', condition: 'key_on', rule_id: 'rule-fuse-drop', hint: 'One lead each side of the fuse' },
      { label: '150 A fuse: battery side to ground', unit: 'V', condition: 'key_on' },
      { label: '150 A fuse: SAM side to ground', unit: 'V', condition: 'key_on' },
      { label: '80 A fuse: battery side to ground', unit: 'V', condition: 'key_on' },
      { label: '80 A fuse: SAM side to ground', unit: 'V', condition: 'key_on' },
    ],
    suspect_ids: ['sus-power', 'sus-sam'], zone_id: 'zone-seat', ref_ids: ['ref-power', 'ref-fuse-box'], illustration: 'fuse-drop', notes: '',
  }],
  ['step-4', {
    position: 4, title: 'Trailer plug: constant 12 V, then seat-base ground', short: 'Trailer',
    why: 'The trailer unit needs a constant feed and a good ground. Its ground point at the seat base (W71/3) is shared, so a bad one could hit more than the trailer.',
    how_to: [
      'At the trailer socket on the rear bumper, find terminal 4 (numbers are molded on the socket face).',
      'Black lead on a clean ground, red lead on terminal 4. Record the volts (should be constant, any key position).',
      'At the driver’s seat base, voltage-drop the ground W71/3: red on the ground eyelet, black on battery negative, with trailer lights or hazards on.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop'],
    presets: [
      { label: 'Trailer terminal 4 constant 12 V', unit: 'V', condition: 'key_off', rule_id: 'rule-feed-12v', hint: 'Red on terminal 4, black on ground' },
      { label: 'Seat-base ground W71/3 drop', unit: 'V', condition: 'load', rule_id: 'rule-ground-drop', hint: 'Red on W71/3, black on battery −' },
    ],
    suspect_ids: ['sus-grounds', 'sus-can'], zone_id: 'zone-rear', ref_ids: ['ref-trailer', 'ref-grounds-a', 'ref-grounds-b'], illustration: 'trailer', notes: '',
  }],
  ['step-5', {
    position: 5, title: 'Scan, read only: network faults & SAM coding', short: 'Scan',
    why: 'CAN B links the SAM, A/C module and trailer unit. Network faults plus an uncoded used SAM would explain three systems failing together. Reading is safe; writing is not.',
    how_to: [
      'Plug in the scanner, key ON.',
      'Read all modules. Write down EVERY code (or photograph each screen) before anything else.',
      'Look for CAN B / network faults and read the SAM coding / variant info.',
      'Do NOT clear codes. Do NOT write coding.',
    ],
    status: 'todo', requires_photo: false, safety: ['log_before_clear', 'verify_before_replace'], presets: [],
    suspect_ids: ['sus-can', 'sus-sam'], zone_id: 'zone-footwell', ref_ids: ['ref-body-control'], illustration: 'scan', notes: '',
  }],
];

const suspects: [string, Suspect][] = [
  ['sus-sam', {
    position: 1, title: 'The SAM (body-control brain)', short: 'SAM', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'The SAM drives the horn relay; the A/C module and trailer unit talk to it over the CAN B network. The used SAM’s coding is unknown. Note: all three faults started before the SAM was swapped.',
    change_my_mind: 'Horn plug gets 12 V when pressed, and SAM coding reads correct for this VIN.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
  ['sus-grounds', {
    position: 2, title: 'Shared grounds', short: 'Grounds', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Horn, SRB, engine and ESP controllers share ground W9/6 (left front lamp unit ground). The trailer unit grounds at the seat base (W71/3) and the left footwell.',
    change_my_mind: 'Voltage drop on W9/6 and W71/3 under load stays at 0.2 V or less.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
  ['sus-power', {
    position: 3, title: 'SAM power feed (150 A / 80 A fuses)', short: 'Power feed', state: 'untested', provenance: 'HYPOTHESIS',
    summary: '150 A (F59.5, terminal 30) and 80 A (F59.3, terminal 30z) fuses feed the SAM/SRB, where the horn relay lives.',
    change_my_mind: 'Voltage drop across both fuses is 0.2 V or less with key on and load present.', symptom_links: ['horn', 'trailer'],
  }],
  ['sus-ac', {
    position: 4, title: 'A/C compressor circuit', short: 'A/C circuit', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Oil was found in the compressor plug. The compressor may be driven by a solenoid control valve from the A/C control module, not a plain clutch coil, and needs a pressure-sensor signal.',
    change_my_mind: 'Compressor type confirmed and its control signal is present at a clean, dry plug.', symptom_links: ['ac'],
  }],
  ['sus-can', {
    position: 5, title: 'Network (CAN B / engine CAN)', short: 'Network', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Cluster fault 9100 (engine CAN) and ESP/TCM CAN faults suggest bus trouble.',
    change_my_mind: 'A read-only scan shows no current CAN / network faults.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
];

const codes: [string, FaultCode][] = [
  ['SAM', '90B5', 'Control unit faulty'], ['SAM', '9042', ''], ['SAM', '901D', ''], ['SAM', '9001', ''], ['SAM', '909F', ''], ['SAM', '9004', ''],
  ['Instrument cluster', '9100', 'Engine CAN'], ['ESP', '44D8', ''], ['ESP', '44E8', ''],
  ['TCM / selector', '—', 'CAN faults (codes not itemised in the summary)'],
  ['Engine', '—', 'Mass airflow fault'], ['Engine', '—', 'Intake pressure / temperature fault'], ['Engine', '—', 'Water in fuel filter'],
].map(([module, code, description], i) => [`code-${i + 1}`, {
  module, code, description, status: 'unknown', date_read: '2026-10-09', source: 'TOPDON scan report', note: '', provenance: 'REPORTED',
} as FaultCode]);

const CAVEAT = 'General 906 reference, not matched to this VIN. Verify against the fuse-card and the van.';
const READ_WIRING = 'Wiring pages show circuits, not physical layout. Follow a line from the power source (top) through fuses and switches to the part, then to its ground (bottom). Labels like W9/6 are ground points; F-numbers are fuses. Check every number against the fuse card before trusting it.';
const SRC_A = '2011-2019 Sprinter wiring set (cardiagn.com watermark)';
const SRC_B = 'Mercedes-format wiring / fuse / ground set (truckfixdiagn.com)';
const refs: [string, ReferencePage][] = [
  ['ref-horn', { position: 1, title: 'Horn circuit', figure: 'Fig. 30', tags: ['Horn', 'SAM'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' On this page, trace from the SAM horn relay to the horn plug and on to its ground.', caveat: CAVEAT }],
  ['ref-trailer', { position: 2, title: 'Trailer circuit', figure: 'Fig. 24', tags: ['Trailer', 'Grounds'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' Find the trailer socket terminals and where the trailer unit gets power and ground.', caveat: CAVEAT }],
  ['ref-power', { position: 3, title: 'Power distribution', figure: 'Figs. 38-42', tags: ['Power distribution', 'Fuse/relay box', 'SAM'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' Look for the large pre-fuses feeding terminal 30 / 30z circuits.', caveat: CAVEAT }],
  ['ref-ac', { position: 4, title: 'A/C system', figure: 'Figs. 1-3', tags: ['A/C'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' Identify how the compressor is controlled and which sensor signal it needs.', caveat: CAVEAT }],
  ['ref-grounds-a', { position: 5, title: 'Ground points (wiring set)', figure: 'Figs. 25-27', tags: ['Grounds'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' Note which parts share each ground point.', caveat: CAVEAT }],
  ['ref-body-control', { position: 6, title: 'Body control (SAM)', figure: 'Figs. 10-11', tags: ['SAM'], source_name: SRC_A, provenance: 'SOURCE', how_to_read: READ_WIRING + ' Shows SAM connections, including CAN B.', caveat: CAVEAT }],
  ['ref-grounds-b', { position: 7, title: 'Ground locations (Mercedes format)', figure: 'Figs. 1-3, 11-13, 15-20', tags: ['Grounds'], source_name: SRC_B, provenance: 'SOURCE', how_to_read: 'These are location drawings: they show WHERE each ground point sits on the body. Match the W-number to the wiring page, then find it here.', caveat: CAVEAT }],
  ['ref-fuse-box', { position: 8, title: 'Fuse / relay box', figure: 'Figs. 37-41', tags: ['Fuse/relay box', 'Power distribution'], source_name: SRC_B, provenance: 'SOURCE', how_to_read: 'Fuse box layout drawings. Compare against the photo of your own fuse card; if they differ, the fuse card wins.', caveat: CAVEAT }],
];

const zones: [string, Zone][] = [
  ['zone-engine', {
    position: 1, key: 'engine', label: 'Engine bay', approximate: true,
    summary: 'Horn plug, A/C compressor plug (oil found here), and the left front lamp unit ground W9/6.',
    parts: ['Horn and its plug (behind the front bumper area)', 'A/C compressor and its lower electrical plug', 'Engine-to-chassis ground strap (replaced)'],
    ground_points: ['W9/6: left front lamp unit ground (shared by horn, SRB, engine and ESP controllers per source)'],
    fuses: [], step_ids: ['step-2'], ref_tags: ['Horn', 'A/C', 'Grounds'],
  }],
  ['zone-footwell', {
    position: 2, key: 'footwell', label: 'Left (driver) footwell', approximate: true,
    summary: 'Behind the footwell trim: the SAM / body-control module, and a trailer-unit ground point. Also where the scanner plugs in.',
    parts: ['SAM (refurbished unit, coding unknown)', 'Diagnostic port for the scanner'],
    ground_points: ['Left footwell ground (trailer unit, per source)'], fuses: [], step_ids: ['step-5'], ref_tags: ['SAM', 'Grounds'],
  }],
  ['zone-seat', {
    position: 3, key: 'seat', label: 'Under / at the driver’s seat', approximate: true,
    summary: 'The under-seat box with the fuse-card legend, the seat-base ground W71/3, and (to confirm with photos) the big SAM/SRB fuses.',
    parts: ['Under-seat box', 'Fuse-card legend'],
    ground_points: ['W71/3: seat-base ground (trailer unit, per source)'],
    fuses: ['F59.5: 150 A, terminal 30 (per source)', 'F59.3: 80 A, terminal 30z (per source)'],
    step_ids: ['step-1', 'step-3', 'step-4'], ref_tags: ['Fuse/relay box', 'Power distribution', 'Grounds'],
  }],
  ['zone-rear', {
    position: 4, key: 'rear', label: 'Rear / trailer plug', approximate: true,
    summary: 'The trailer socket on the rear bumper. Terminal numbers are molded on the socket face.',
    parts: ['Trailer socket', 'Trailer unit (location to confirm)'], ground_points: [], fuses: ['20 A trailer circuit (per reference manual)'],
    step_ids: ['step-4'], ref_tags: ['Trailer'],
  }],
];

export function seedRecords(): Rec[] {
  let i = 0;
  const out: Rec[] = [rec('vehicle', VEHICLE_ID, vehicle, i++)];
  const add = (kind: Kind, list: [string, any][]) => list.forEach(([id, d]) => out.push(rec(kind, id, d, i++)));
  add('fact', facts); add('rule', rules); add('step', steps); add('suspect', suspects);
  add('fault_code', codes); add('reference_page', refs); add('zone', zones);
  out.push(rec('event', 'ev-seed', { type: 'seed', ref_kind: 'vehicle', ref_id: VEHICLE_ID, summary: 'Project created with vehicle facts, 5 test steps, 5 suspects and the scan codes', actor: 'Van Fix' }, i++));
  return out;
}
