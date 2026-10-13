// First-run content, taken from the PRD. Provenance labels here are part of the spec:
// do not upgrade a HYPOTHESIS or SOURCE item to CONFIRMED in code.
import type { Rec, Kind, Vehicle, Fact, Step, Rule, Suspect, FaultCode, ReferencePage, Zone, Fuse } from './types';

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
  ['fact-scan', { text: 'TOPDON scan 2026-10-09 (scanner SN 988311103781, software V10.50): 24 fault codes in 7 of 16 modules. No fault: SRS, TPMS, MRM steering column, AdBlue, radio, A/C, upper control panel, PTC heater, driver door.', provenance: 'REPORTED', source: 'TOPDON online report 2026-10-09: https://online-report.topdoninfo.com/Home/Topdon/topdonReportDetail/diagnose_record_id/868fee14ge54OM54KwoGOMoGlp/report_type/TC/l/en-us', tags: [] }],
  ['fact-scan-pattern', { text: 'Scan pattern: the ignition switch (EIS N73) stores 9007 "Terminal 15 short/open" and 9009 "Terminal 15R short/open"; engine, ESP, TCM and selector lever all log missing CAN messages from the EIS; the SAM logs "CAN signal terminal 15 / 15R implausible" (9091, 9090). Engine and TCM also miss CAN messages from the A/C control unit S98 (KLA), though the A/C module itself reports no fault.', provenance: 'REPORTED', source: 'TOPDON report 2026-10-09', tags: ['SAM', 'A/C'] }],
  ['fact-timeline', { text: 'Horn, A/C and trailer lights all stopped BEFORE the SAM was replaced.', provenance: 'CONFIRMED', source: 'Owner', tags: ['SAM', 'Horn', 'A/C', 'Trailer'] }],
  ['fact-oil', { text: 'Oil found inside the lower electrical connector that plugs into the A/C compressor.', provenance: 'CONFIRMED', source: 'Owner inspection', tags: ['A/C'] }],
  ['fact-src-kickpanel', { text: 'Manual: the fuse/relay block with the body control module (SAM), horn relay and horn fuse 1 (15 A) is in the LEFT KICK PANEL (driver footwell). Fuse blocks 1 and 2 sit on top of it.', provenance: 'SOURCE', source: 'System Wiring Diagram.pdf Figs. 30, 39', tags: ['SAM', 'Horn', 'Fuse/relay box'] }],
  ['fact-src-ac', { text: 'Manual: the A/C heater control (S98) drives the compressor through one "compressor control valve" wire; the A/C pressure sensor reports back to S98. S98 is fed by fuse block 2 fuse 16 (10 A) and grounds at G200 (right rear of engine compartment).', provenance: 'SOURCE', source: 'System Wiring Diagram.pdf Fig. 1', tags: ['A/C'] }],
  ['fact-src-trailer', { text: 'Manual: the trailer tow lighting module is at the REAR of the vehicle, fed by fuse block 4 fuse 15 (25 A) and fuse block 3 fuse 4 (7.5 A), grounded at G305 (lower left side). Socket pin 4 = fuse block 4 fuse 14 (20 A); socket ground pin 8 → G304 (lower left center body).', provenance: 'SOURCE', source: 'System Wiring Diagram.pdf Fig. 24', tags: ['Trailer'] }],
  ['fact-src-horn', { text: 'Manual: horn relay output → fuse 1 (15 A) → Horn 1 (engine compartment) pin B; pin A → ground G104 (left side of engine compartment). The steering control module switches the horn relay when the horn button is pressed.', provenance: 'SOURCE', source: 'System Wiring Diagram.pdf Fig. 30', tags: ['Horn'] }],
  ['fact-src-battery', { text: 'Manual: battery G1 is under the floor of the DRIVER FOOTWELL. Remove the door sill molding, the floor covering and the cover plate to reach it.', provenance: 'SOURCE', source: 'Equipment & Instructions.pdf Fig. 2 (AR54.10-D-0003SD)', tags: ['Power distribution'] }],
  ['fact-src-battery-test', { text: 'Manual battery check: switch everything off and wait about 2 minutes for the modules to sleep; a good, charged battery reads above 12.4 V.', provenance: 'SOURCE', source: 'Equipment & Instructions.pdf (AR54.10-D-1129A)', tags: ['Power distribution'] }],
  ['fact-src-scn', { text: 'Manual: a replacement control unit needs SCN coding with Mercedes STAR Diagnosis / Xentry, with a battery charger keeping voltage up the whole time (low voltage can damage the unit). Then read and, if needed, clear fault memory.', provenance: 'SOURCE', source: 'Equipment & Instructions.pdf (AR54.21-D-0015X)', tags: ['SAM'] }],
  ['fact-src-psm', { text: 'Manual: the box inside the driver seat frame is the PSM special module (N26/15), not the SAM. The SAM (N10) is in the left kick panel fuse/relay box.', provenance: 'SOURCE', source: 'Equipment & Instructions.pdf Fig. 27; System Wiring Diagram Fig. 30', tags: ['SAM'] }],
  ['fact-src-horn-switches', { text: 'Manual horn check: the horn can be sounded from the steering-wheel contact plate AND from the horn switch on the combination stalk. If both fail, the switches are unlikely to be the cause.', provenance: 'SOURCE', source: 'Maintenance.pdf (AP54.00-D-5451-02A)', tags: ['Horn'] }],
  ['fact-src-trailer-can', { text: 'Manual: turn-signal and brake-lamp commands reach the trailer module (N28/1) over CAN B from the SAM (N10). If CAN B or the SAM is down, trailer lamps fail even with good fuses.', provenance: 'SOURCE', source: 'Wiring Diagrams - Body.pdf Fig. 6, 7', tags: ['Trailer', 'SAM'] }],
  ['fact-src-compressor-wire', { text: 'Manual: compressor A9 pin 1 is a 0.75 mm² blue/green (BU/GN) wire through engine harness connector X26/38 pin 7 and cockpit connector X18/56 pin 23 to A/C control S98 pin 5. Pin 2 goes to a local ground.', provenance: 'SOURCE', source: 'Wiring Diagrams.pdf Fig. 29', tags: ['A/C'] }],
  ['fact-src-fuse-locations', { text: 'Web source (official Mercedes fuse supplement for the 2015 Sprinter, same W906 body): the main fuse box is in the footwell on the left side; the F59 pre-fuse box is in the battery compartment in that footwell; fuse blocks F55/3 and F55/4 are in the fuse box on the outside of the driver seat base (raise the seat fully, press both latches, lift the cover). Its F55/3 fuse 4 (7.5 A trailer unit) and F55/4 fuses 14 (20 A trailer socket) and 15 (25 A trailer unit) match the 2012 manuals. Different model year: confirm on this van.', provenance: 'SOURCE', source: 'MB Sprinter Fuse Allocation Supplement 2015 (web, mercedes-benz-vans.ca)', tags: ['Fuse/relay box', 'Power distribution', 'Trailer'] }],
  ['fact-label-ecu', { text: 'Engine computer (CDI) label: Mercedes A 642 900 33 01, HW A 164 446 00 54, Bosch 0 281 018 313, DCU17PC01, dated 11-09-09.', provenance: 'CONFIRMED', source: 'Owner photo of the label (2026-10-13)', tags: ['Network'] }],
  ['fact-label-tcm', { text: 'Transmission computer label: Siemens VDO EGS53, Mercedes A 001 545 59 16 (also A 003 446 41 10, A 007 448 09 10), HW 48/06, SW 32/09, 5WP20124DG, ZGS001, 11W35.', provenance: 'CONFIRMED', source: 'Owner photo of the label (2026-10-13)', tags: ['Network'] }],
  ['fact-label-3445', { text: 'Module on two studs (white painted panel): LU A 906 540 34 45, Siemens VDO 5WK48388D, HW A 906 540 33 45, SW A 906 448 05 37, 83.3 kbaud, Diagnose-Kennung 0002, ZGS001. Where on the van: not recorded yet.', provenance: 'CONFIRMED', source: 'Owner photo of the label (2026-10-13)', tags: ['Network'] }],
  ['fact-id-3445', { text: 'What the A 906 540 34 45 module is: one parts-retailer listing calls it a tire-pressure (TPMS) control unit. Not checked against a Mercedes parts catalogue for this VIN. Its label says 83.3 kbaud, the speed of the low-speed interior CAN, so it likely shares the network with the SAM and trailer module. Do not assume it is the trailer module.', provenance: 'HYPOTHESIS', source: 'mbpartsdepot.com listing 906-540-34-45 (web); label', tags: ['Network', 'Trailer'] }],
  ['fact-label-yaw', { text: 'Bosch sensor label: 0 265 005 774, Mercedes A 006 542 42 18, ZGS001 Q02, 11244, 7043367, 4320, made in Hungary. Bolted flat on two ears to a painted panel. Where on the van: not recorded yet.', provenance: 'CONFIRMED', source: 'Owner photo of the label (2026-10-13)', tags: ['Network'] }],
  ['fact-id-yaw', { text: 'What the Bosch 0 265 005 774 sensor is: a parts catalogue lists it as an ESP transverse/longitudinal acceleration sensor for the W906 Sprinter, which matches the manual\'s B24/15 (yaw rate, lateral and longitudinal acceleration sensor). It feeds the ESP unit, which stored 3 codes (475C, 5401: no message from the ignition switch; 4804: ESP version coding invalid). Not yet checked against a Mercedes catalogue for this VIN.', provenance: 'HYPOTHESIS', source: 'buycarparts.co.uk Bosch 0 265 005 774 listing (web); Wiring Diagrams (Fuse Block, Grounds) legend B24/15', tags: ['Network'] }],
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
  ['step-7', {
    position: 2, title: 'Ignition feed: Terminal 15 / 15R fuses and relays', short: 'Ignition',
    why: 'The scan points at the ignition switch: it stores "Terminal 15 / 15R short or open" and four modules lost its CAN messages. The horn relay is fed through the Terminal 15 relay (manual Fig. 30), so this one check could explain more than one dead system.',
    how_to: [
      'In the fuse/relay box in the LEFT KICK PANEL (K40/9), find: f18 Terminal 15 fuse (7.5 A), f11 Terminal 15R fuse (15 A), relay k8 (Terminal 15) and relay k6 (Terminal 15R). Labels per the fuse/relay box legend; check them against the fuse card.',
      'Key OFF: black lead on a clean ground, red lead on each side of f18 and f11. Note the volts.',
      'Key ON: measure the same points again. Battery voltage should now be present.',
      'Have a helper turn the key on and off while you feel or listen for k8 and k6 switching.',
      'Afterwards, run a read-only scan: note whether EIS 9007 / 9009 come back as current. Do not clear codes.',
    ],
    status: 'todo', requires_photo: false, safety: ['log_before_clear'],
    presets: [
      { label: 'Tml 15 fuse f18 (7.5 A), key ON', unit: 'V', condition: 'key_on', rule_id: 'rule-feed-12v', hint: 'Red on the fuse, black on ground' },
      { label: 'Tml 15R fuse f11 (15 A), key ON', unit: 'V', condition: 'key_on', rule_id: 'rule-feed-12v', hint: 'Red on the fuse, black on ground' },
      { label: 'Tml 15 fuse f18, key OFF', unit: 'V', condition: 'key_off', hint: 'Expect near 0 V' },
      { label: 'Tml 15R fuse f11, key OFF', unit: 'V', condition: 'key_off', hint: 'Expect near 0 V' },
    ],
    suspect_ids: ['sus-t15', 'sus-sam'], zone_id: 'zone-footwell', ref_ids: ['ref-power', 'ref-fuse-box', 'ref-horn'], illustration: 'fuse-drop', notes: '',
  }],
  ['step-2', {
    position: 3, title: 'Horn: power and ground at the horn plug', short: 'Horn',
    why: 'If 12 V reaches the horn plug when the button is pressed, the SAM and its relay are doing their job and the problem is the horn or its ground. If not, look upstream.',
    how_to: [
      'Try BOTH horn buttons: the steering-wheel pad and the horn switch on the stalk (manual horn check). Note if either works.',
      'Key ON.',
      'First, in the fuse/relay box in the LEFT KICK PANEL: check horn fuse f1 (15 A) and that horn relay k1 clicks when the horn is pressed (manual Fig. 30).',
      'Unplug Horn 1 in the engine compartment.',
      'Black meter lead on a clean bare-metal ground, red lead on the horn plug power terminal.',
      'Helper presses and holds the horn. Record the volts.',
      'Then do a voltage-drop test on the horn ground wire: red lead on the horn ground terminal (pin A), black lead on battery negative, horn pressed. Per Fig. 30 that wire goes to ground G104, left side of the engine compartment.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop'],
    presets: [
      { label: 'Horn fuse f1 (15 A) drop across', unit: 'V', condition: 'load', rule_id: 'rule-fuse-drop', hint: 'Left kick panel box · one lead each side · horn pressed' },
      { label: 'Horn plug power (horn pressed)', unit: 'V', condition: 'load', rule_id: 'rule-feed-12v', hint: 'Red on plug pin B, black on ground' },
      { label: 'Horn ground voltage drop', unit: 'V', condition: 'load', rule_id: 'rule-ground-drop', hint: 'Red on horn ground, black on battery −' },
    ],
    suspect_ids: ['sus-t15', 'sus-sam', 'sus-grounds', 'sus-power'], zone_id: 'zone-engine', ref_ids: ['ref-horn', 'ref-grounds-a'], illustration: 'horn', notes: '',
  }],
  ['step-3', {
    position: 4, title: 'Big SAM fuses: voltage drop across 150 A and 80 A', short: 'Big fuses',
    why: 'These two fuses feed the SAM/SRB, where the horn relay lives. Ohms on a fuse this big tells you nothing; a voltage drop with current flowing does.',
    how_to: [
      'Battery check first: everything off for 2 minutes, then battery should read above 12.4 V (manual). The battery is under the driver-footwell floor.',
      'Key ON (more load is better: lights on, blower on).',
      'Put one meter lead on each end of the 150 A fuse (F59.5). Record the volts across it.',
      'Do the same across the 80 A fuse (F59.3).',
      'Also record volts on each end of each fuse to ground, so both sides are on file.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop', 'verify_before_replace'],
    presets: [
      { label: 'Battery at rest (2 min, all off)', unit: 'V', condition: 'key_off', hint: 'Manual: above 12.4 V' },
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
    position: 5, title: 'Trailer plug: constant 12 V, then seat-base ground', short: 'Trailer',
    why: 'The trailer unit needs a constant feed and a good ground. Its ground point at the seat base (W71/3) is shared, so a bad one could hit more than the trailer.',
    how_to: [
      'At the trailer socket on the rear bumper, find terminal 4 (numbers are molded on the socket face). Per Fig. 24 it is fed by fuse block 4, fuse 14 (20 A), hot at all times.',
      'Black lead on a clean ground, red lead on terminal 4. Record the volts (should be constant, any key position).',
      'Check the trailer tow lighting module feeds too (module is at the REAR of the van per Fig. 24): fuse block 4 fuse 15 (25 A) and fuse block 3 fuse 4 (7.5 A).',
      'At the driver’s seat base, voltage-drop the ground W71/3: red on the ground eyelet, black on battery negative, with trailer lights or hazards on.',
    ],
    status: 'todo', requires_photo: false, safety: ['use_voltage_drop'],
    presets: [
      { label: 'Trailer terminal 4 constant 12 V', unit: 'V', condition: 'key_off', rule_id: 'rule-feed-12v', hint: 'Red on terminal 4, black on ground' },
      { label: 'Seat-base ground W71/3 drop', unit: 'V', condition: 'load', rule_id: 'rule-ground-drop', hint: 'Red on W71/3, black on battery −' },
      { label: 'Trailer module feed (fuse 15, 25 A)', unit: 'V', condition: 'key_off', rule_id: 'rule-feed-12v', hint: 'Red on the fuse’s output side, black on ground' },
    ],
    suspect_ids: ['sus-grounds', 'sus-can'], zone_id: 'zone-rear', ref_ids: ['ref-trailer', 'ref-grounds-a', 'ref-grounds-b'], illustration: 'trailer', notes: '',
  }],
  ['step-5', {
    position: 6, title: 'Scan, read only: network faults & SAM coding', short: 'Scan',
    why: 'CAN B links the SAM, A/C module and trailer unit. Network faults plus an uncoded used SAM would explain three systems failing together. Reading is safe; writing is not.',
    how_to: [
      'Plug in the scanner, key ON.',
      'Read all modules. Write down EVERY code (or photograph each screen) before anything else.',
      'Look for CAN B / network faults and read the SAM coding / variant info.',
      'Do NOT clear codes. Do NOT write coding.',
      'Note: per the manual, coding a replacement SAM is SCN coding with Mercedes STAR Diagnosis / Xentry and a charger connected. A generic scanner may only read it.',
    ],
    status: 'todo', requires_photo: false, safety: ['log_before_clear', 'verify_before_replace'], presets: [],
    suspect_ids: ['sus-can', 'sus-sam'], zone_id: 'zone-footwell', ref_ids: ['ref-body-control'], illustration: 'scan', notes: '',
  }],
  ['step-6', {
    position: 7, title: 'A/C: oil and the compressor control wire', short: 'A/C wire',
    why: 'Oil was in the compressor plug. The compressor has one control wire from the A/C control (S98). Oil wicking along it, or a break, would stop the compressor even if everything else is fine.',
    how_to: [
      'Key OFF. Unplug the compressor (A9) plug and photograph both halves.',
      'Follow the blue/green (BU/GN) wire from pin 1 to engine harness connector X26/38. Open it and look for oil at pin 7 (manual Fig. 29).',
      'Continuity, key off, plugs apart: A9 plug pin 1 to X26/38 pin 7, then onward to X18/56 pin 23 if reachable.',
      'Check fuse block 2, fuse 16 (10 A) that powers the A/C control.',
      'Do NOT put battery voltage on the compressor plug.',
    ],
    status: 'todo', requires_photo: true, safety: ['no_battery_to_compressor'],
    presets: [
      { label: 'A9 pin 1 → X26/38 pin 7 continuity', unit: 'Ω', condition: 'key_off', hint: 'Plugs apart, key off' },
      { label: 'Fuse blk 2 f16 (10 A) drop across', unit: 'V', condition: 'key_on', rule_id: 'rule-fuse-drop', hint: 'A/C on, one lead each side' },
    ],
    suspect_ids: ['sus-ac'], zone_id: 'zone-engine', ref_ids: ['ref-ac', 'ref-connectors'], illustration: 'photo', notes: '',
  }],
];

const suspects: [string, Suspect][] = [
  ['sus-sam', {
    position: 1, title: 'The SAM (body-control brain)', short: 'SAM', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'The SAM (N10) sits in the fuse/relay box in the left kick panel with the horn relay (k1) and horn fuse (f1). The A/C control (S98) and trailer module (N28/1) talk to it over CAN B. The used SAM’s coding is unknown. Note: all three faults started before the SAM was swapped.',
    change_my_mind: 'Horn plug gets 12 V when pressed, and SAM coding reads correct for this VIN.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
  ['sus-grounds', {
    position: 2, title: 'Shared grounds', short: 'Grounds', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Horn, SRB, engine and ESP controllers share ground W9/6 (left front lamp unit ground). The trailer unit grounds at the seat base (W71/3) and the left footwell. The US-format pages name them differently: horn → G104 (left engine compartment), trailer module → G305 (lower left side), trailer socket → G304 (lower left center body), A/C control → G200 (right rear engine compartment).',
    change_my_mind: 'Voltage drop on W9/6 and W71/3 under load stays at 0.2 V or less.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
  ['sus-power', {
    position: 3, title: 'SAM power feed (150 A / 80 A fuses)', short: 'Power feed', state: 'untested', provenance: 'HYPOTHESIS',
    summary: '150 A (F59.5, terminal 30) and 80 A (F59.3, terminal 30z) fuses feed the SAM/SRB, where the horn relay lives.',
    change_my_mind: 'Voltage drop across both fuses is 0.2 V or less with key on and load present.', symptom_links: ['horn', 'trailer'],
  }],
  ['sus-ac', {
    position: 4, title: 'A/C compressor circuit', short: 'A/C circuit', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Oil was found in the compressor plug. Manual Fig. 1 shows the compressor is driven by a single "compressor control valve" wire from the A/C heater control (S98), not a clutch relay, and S98 reads the A/C pressure sensor. S98 is fed by fuse block 2 fuse 16 (10 A).',
    change_my_mind: 'Compressor type confirmed and its control signal is present at a clean, dry plug.', symptom_links: ['ac'],
  }],
  ['sus-t15', {
    position: 0, title: 'Ignition feed (EIS N73 / Terminal 15 & 15R)', short: 'Ignition', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'The scan shows the ignition switch storing Terminal 15 and 15R short/open faults (9007, 9009), four other modules missing its CAN messages, and the SAM calling its terminal 15/15R signals implausible. The horn relay k1 is fed through the Terminal 15 relay k8 (manual Fig. 30), so a bad ignition feed could take out several systems at once.',
    change_my_mind: 'Terminal 15 and 15R fuses read battery voltage with key on, relays k8/k6 switch, and EIS 9007/9009 do not come back after a key cycle.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
  ['sus-can', {
    position: 5, title: 'Network (CAN B / engine CAN)', short: 'Network', state: 'untested', provenance: 'HYPOTHESIS',
    summary: 'Cluster fault 9100 (engine CAN) and ESP/TCM CAN faults suggest bus trouble.',
    change_my_mind: 'A read-only scan shows no current CAN / network faults.', symptom_links: ['horn', 'ac', 'trailer'],
  }],
];

// Every code from the TOPDON report of 2026-10-09 (online report link in fact-scan), word for word.
// "Current And Stored" -> active, "Stored" -> stored.
const TOPDON = 'TOPDON report 2026-10-09';
const dtc: [string, string, string, 'active' | 'stored'][] = [
  ['Engine (CDI4 6-cyl)', '100B00', 'The upper limit value of component B2/14 (hot film mass air flow sensor) has been reached.', 'stored'],
  ['Engine (CDI4 6-cyl)', '104000', 'No CAN message was received from control unit EZS.', 'stored'],
  ['Engine (CDI4 6-cyl)', '105B00', 'No CAN message was received from control unit EZS.', 'stored'],
  ['Engine (CDI4 6-cyl)', '155C00', 'Signal engine off time from control unit KI is implausible.', 'stored'],
  ['Engine (CDI4 6-cyl)', '10BC00', 'No CAN message was received from control unit KLA.', 'stored'],
  ['Engine (CDI4 6-cyl)', '161700', 'Component B2/14b1 (intake air temperature sensor) not within permissible range of values: on/off ratio of reference signal is outside of permissible range.', 'active'],
  ['Engine (CDI4 6-cyl)', '161800', 'Component B2/14b1 (intake air temperature sensor) not within permissible range of values: there is a frequency or pulse width modulation fault.', 'active'],
  ['EIS (ignition switch N73)', '9007', 'Terminal 15 - short circuit or open circuit.', 'stored'],
  ['EIS (ignition switch N73)', '9009', 'Terminal 15R - short circuit or open circuit.', 'stored'],
  ['ESP', '475C', 'No CAN message from control unit N73 (EIS [EZS] control unit).', 'stored'],
  ['ESP', '4804', 'N30/4 (ESP control unit) - version coding string: INVALID.', 'stored'],
  ['ESP', '5401', 'No or incorrect CAN message from control unit N73 (EIS [EZS] control unit).', 'stored'],
  ['TCM (transmission)', 'C164', 'CAN bus - no or incorrect CAN message from control unit S98 (AAC [KLA] control and operating unit).', 'stored'],
  ['TCM (transmission)', 'C141', 'CAN bus - no or incorrect CAN message from control unit N73 (EIS [EZS] control unit).', 'stored'],
  ['Instrument cluster', '9100', 'Engine CAN bus - CAN bus fault.', 'stored'],
  ['EWM (selector lever)', '0005', 'CAN bus - no CAN message from control unit N73 (EIS [EZS] control unit).', 'stored'],
  ['SAM', '9091', 'Monitoring: signal input terminal 15 - CAN signal terminal 15 is implausible.', 'stored'],
  ['SAM', '9042', 'E15/1 (front dome lamp with switch) - short circuit to positive.', 'active'],
  ['SAM', '9001', 'Left side light - open circuit in wiring.', 'active'],
  ['SAM', '909F', 'Brake wear sensor - open circuit in wiring.', 'active'],
  ['SAM', '9004', 'Right side light - open circuit in wiring.', 'active'],
  ['SAM', '901C', '[License plate lights - open circuit in wiring] or [side marker lamps - open circuit in wiring].', 'active'],
  ['SAM', '9090', 'Monitoring: signal input circuit 15R - CAN signal circuit 15R is implausible.', 'stored'],
  ['SAM', '90B5', 'The control unit is faulty.', 'active'],
];
const codes: [string, FaultCode][] = dtc.map(([module, code, description, status]) => [`dtc-${code.toLowerCase()}`, {
  module, code, description, status, date_read: '2026-10-09', source: TOPDON, note: '', provenance: 'REPORTED',
} as FaultCode]);
/** Seed ids replaced by later seed content; ensureSeeded marks them deleted if nobody edited them. */
export const RETIRED_SEED_IDS = [
  ...Array.from({ length: 13 }, (_, i) => `code-${i + 1}`),
  // Replaced by *-loc versions once the fuse box locations were found (2015 Mercedes fuse supplement).
  'fuse-f59-5', 'fuse-f59-3', 'fuse-f55-3-4', 'fuse-f55-3-9', 'fuse-f55-4-14', 'fuse-f55-4-15',
];

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
  ['ref-battery', { position: 9, title: 'Battery location & check', figure: 'Fig. 2-3', tags: ['Power distribution'], source_name: 'Equipment & Instructions.pdf', provenance: 'SOURCE', how_to_read: 'Photos show the driver footwell: remove the door sill (2), floor covering (3) and cover (4) to reach battery G1 and its ground cable (6).', caveat: CAVEAT }],
  ['ref-connectors', { position: 10, title: 'Engine-bay connectors (compressor wire)', figure: 'Fig. 29', tags: ['A/C'], source_name: 'Wiring Diagrams.pdf', provenance: 'SOURCE', how_to_read: 'Find A9 (compressor) bottom left. Its pin 1 BU/GN wire goes up through X26/38 pin 7 and X18/56 pin 23 to S98 pin 5.', caveat: CAVEAT }],
  ['ref-turn-signal', { position: 11, title: 'Turn signal function (CAN B to trailer module)', figure: 'Fig. 6', tags: ['Trailer', 'SAM'], source_name: 'Wiring Diagrams - Body.pdf', provenance: 'SOURCE', how_to_read: 'Boxes joined by lines marked B are on interior CAN B: the stalk (N80) and SAM (N10) send turn commands to the trailer module (N28/1).', caveat: CAVEAT }],
  ['ref-fuse-box', { position: 8, title: 'Fuse / relay box', figure: 'Figs. 37-41', tags: ['Fuse/relay box', 'Power distribution'], source_name: SRC_B, provenance: 'SOURCE', how_to_read: 'Fuse box layout drawings. Compare against the photo of your own fuse card; if they differ, the fuse card wins.', caveat: CAVEAT }],
];

const zones: [string, Zone][] = [
  ['zone-engine', {
    position: 1, key: 'engine', label: 'Engine bay', approximate: true,
    summary: 'Horn 1 and its plug, the A/C compressor (A9) plug where oil was found, the A/C pressure sensor (B12), and grounds G104 / W9/6 and G200.',
    parts: ['Horn 1 (H1) and its 2-pin plug: B = feed, A = ground (Fig. 30)', 'A/C compressor (A9) plug: pin 1 BU/GN control wire, pin 2 local ground (Fig. 29)', 'Engine harness connector X26/38: compressor wire on pin 7 (Fig. 29)', 'A/C pressure sensor (B12)', 'Engine-to-chassis ground strap (replaced)'],
    ground_points: ['G104: left side of engine compartment, horn ground (Fig. 30)', 'W9/6: left front lamp unit ground (Mercedes legend)', 'G200: right rear of engine compartment, A/C control ground (Fig. 1)'],
    fuses: [], step_ids: ['step-2', 'step-6'], ref_tags: ['Horn', 'A/C', 'Grounds'],
  }],
  ['zone-footwell', {
    position: 2, key: 'footwell', label: 'Left (driver) footwell', approximate: true,
    summary: 'The left kick panel fuse/relay box (K40/9 SRB): SAM (N10), horn relay k1, horn fuse f1 (15 A), Terminal 15 relay; fuse blocks 1 and 2 on top. Also the scanner port.',
    parts: ['Battery G1: under the footwell floor (door sill molding, floor covering, cover) · Equipment manual Fig. 2', 'Fuse/relay box K40/9 (SRB) in the left kick panel', 'SAM N10 (refurbished unit, coding unknown)', 'Horn relay k1', 'Diagnostic socket (fuse block 1, fuse 2, 10 A)'],
    ground_points: ['Left footwell ground (trailer unit, Mercedes legend)'],
    fuses: ['f1: 15 A signaling horn (K40/9)', 'Fuse block 2, fuse 16: 10 A front climate control (S98)', 'Fuse block 2, fuse 12: 30 A front blower'], step_ids: ['step-2', 'step-5'], ref_tags: ['SAM', 'Grounds', 'Fuse/relay box'],
  }],
  ['zone-seat', {
    position: 3, key: 'seat', label: 'Under / at the driver’s seat', approximate: true,
    summary: 'The under-seat box with the fuse-card legend and the seat-base ground W71/3. Fuse blocks 3 / 4 (trailer fuses) sit in the box on the outside of the seat base, per the 2015 Mercedes fuse supplement (web). Confirm with photos.',
    parts: ['Under-seat box', 'Fuse-card legend', 'PSM special module N26/15 inside the seat frame (not the SAM) · Equipment manual Fig. 27'],
    ground_points: ['W71/3: seat-base ground (trailer unit, per source)'],
    fuses: ['Fuse block 3, fuse 4: 7.5 A trailer module (seat-base box, web source)', 'Fuse block 4, fuses 14 / 15: 20 A trailer socket / 25 A trailer module (seat-base box, web source)', 'F59 big fuses: battery compartment in the left footwell (web source), not here'],
    step_ids: ['step-1', 'step-3', 'step-4'], ref_tags: ['Fuse/relay box', 'Power distribution', 'Grounds'],
  }],
  ['zone-rear', {
    position: 4, key: 'rear', label: 'Rear / trailer plug', approximate: true,
    summary: 'The trailer socket on the rear bumper and the trailer tow lighting module (rear of vehicle, Fig. 24).',
    parts: ['Trailer socket: pin 4 constant 12 V, pin 8 ground, 2 RH turn, 3 reverse, 5 LH tail, 7 brake, 10 LH turn (Fig. 24)', 'Trailer tow lighting module N28/1 (rear of vehicle)'],
    ground_points: ['G305: lower left side of vehicle, module ground (Fig. 24)', 'G304: lower left center body, socket pin 8 (Fig. 24)'],
    fuses: ['Fuse block 4, fuse 14: 20 A trailer socket', 'Fuse block 4, fuse 15: 25 A trailer module', 'Fuse block 3, fuse 4: 7.5 A trailer module'],
    step_ids: ['step-4'], ref_tags: ['Trailer'],
  }],
];

// Fuses from the owner's manuals (Google Drive). SYS = "System Wiring Diagram.pdf" (cardiagn.com set);
// FG = "Wiring Diagrams (Fuse Block, Grounds).pdf" (Mercedes format, US version ZU7/ZU8 legend PE54.15-D-2001-97AB).
// General 906 data: still SOURCE until checked against this van's fuse card.
const KP = 'Fuse/relay box K40/9 (SRB) · left kick panel';
const fuseList: [string, string, string, string, string][] = [
  // id, box, number, amps, function + source
  ['fuse-f59-5-loc', 'F59 pre-fuse box · battery compartment, left footwell (web source, confirm)', 'F59.5', '150 A', 'Terminal 30 SAM/SRB fuse|FG fuse/relay box legend; location: MB 2015 fuse supplement'],
  ['fuse-f59-3-loc', 'F59 pre-fuse box · battery compartment, left footwell (web source, confirm)', 'F59.3', '80 A', 'SAM/SRB terminal 30z|FG fuse/relay box legend; location: MB 2015 fuse supplement'],
  ['fuse-k40-f1', KP, 'f1 (Fuse 1)', '15 A', 'Signaling horn fuse|FG K40/9 legend; SYS Fig. 30'],
  ['fuse-k40-k1', KP, 'k1 (relay)', 'relay', 'Horn relay|FG K40/9 legend; SYS Fig. 30'],
  ['fuse-k40-k8', KP, 'k8 (relay)', 'relay', 'Terminal 15 relay (feeds the horn relay)|FG K40/9 legend; SYS Fig. 30'],
  ['fuse-k40-f18', KP, 'f18', '7.5 A', 'Terminal 15 fuse (ignition feed)|FG K40/9 legend'],
  ['fuse-k40-f11', KP, 'f11', '15 A', 'Terminal 15R fuse|FG K40/9 legend'],
  ['fuse-k40-k6', KP, 'k6 (relay)', 'relay', 'Terminal 15R relay|FG K40/9 legend'],
  ['fuse-f55-1-2', 'Fuse block 1 (F55/1) · top of fuse/relay box', 'Fuse 2', '10 A', 'Diagnostic socket (scanner port)|FG F55/1 legend; SYS Fig. 39'],
  ['fuse-f55-2-12', 'Fuse block 2 (F55/2) · top of fuse/relay box', 'Fuse 12', '30 A', 'Front blower|FG F55/2 legend; SYS Fig. 39'],
  ['fuse-f55-2-16', 'Fuse block 2 (F55/2) · top of fuse/relay box', 'Fuse 16', '10 A', 'Front climate control (A/C heater control S98)|FG F55/2 legend; SYS Fig. 1'],
  ['fuse-f55-3-4-loc', 'Fuse block 3 (F55/3) · outside of driver seat base (web source, confirm)', 'Fuse 4', '7.5 A', 'AAG trailer module, tachograph, ADR (hot at all times)|FG F55/3 legend; SYS Fig. 24; location: MB 2015 fuse supplement'],
  ['fuse-f55-3-9-loc', 'Fuse block 3 (F55/3) · outside of driver seat base (web source, confirm)', 'Fuse 9', '15 A', 'Multitone horn / roof fan|FG F55/3 legend; location: MB 2015 fuse supplement'],
  ['fuse-f55-4-14-loc', 'Fuse block 4 (F55/4) · outside of driver seat base (web source, confirm)', 'Fuse 14', '20 A', 'Trailer socket (pin 4, hot at all times)|FG F55/4 legend (as of 4/1/07); SYS Figs. 24, 38; location: MB 2015 fuse supplement'],
  ['fuse-f55-4-15-loc', 'Fuse block 4 (F55/4) · outside of driver seat base (web source, confirm)', 'Fuse 15', '25 A', 'AAG trailer tow lighting module|FG F55/4 legend (as of 4/1/07); SYS Figs. 24, 38; location: MB 2015 fuse supplement'],
];
const fuses: [string, Fuse][] = fuseList.map(([id, box, number, amps, fs], i) => {
  const [fn, src] = fs.split('|');
  return [id, { position: i + 1, box, number, amps, function: fn, provenance: 'SOURCE', source: src }];
});

export function seedRecords(): Rec[] {
  let i = 0;
  const out: Rec[] = [rec('vehicle', VEHICLE_ID, vehicle, i++)];
  const add = (kind: Kind, list: [string, any][]) => list.forEach(([id, d]) => out.push(rec(kind, id, d, i++)));
  add('fact', facts); add('rule', rules); add('step', steps); add('suspect', suspects);
  add('fault_code', codes); add('reference_page', refs); add('zone', zones); add('fuse', fuses);
  out.push(rec('event', 'ev-seed', { type: 'seed', ref_kind: 'vehicle', ref_id: VEHICLE_ID, summary: 'Project created with vehicle facts, 5 test steps, 5 suspects and the scan codes', actor: 'Van Fix' }, i++));
  return out;
}
