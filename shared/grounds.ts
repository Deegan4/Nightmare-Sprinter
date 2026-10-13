// Every ground point printed in the owner's manuals, word for word.
// G-numbers: "System Wiring Diagram.pdf" Figs. 25-27 "Ground Distribution Circuit" (pp. 35-37), plus Figs. 1, 24, 30.
// W-numbers: "Wiring Diagrams (Fuse Block, Grounds).pdf", PE54.00-D-2000 "Wiring diagram for ground points of complete vehicle".
// Locations are the manuals' own words (area only, never a measured spot). Parts list = what the figure wires to that ground.

export type GroundArea = 'eng-lr' | 'eng-rr' | 'eng-rf' | 'eng-lf' | 'eng-ls' | 'roof-fc' | 'roof-lf' | 'low-left' | 'low-left-ctr' | 'rear-door-l'
  | 'lamp-l' | 'lamp-r' | 'firewall-l' | 'cockpit' | 'seat' | 'pillar-d-l' | 'xmember-l' | 'xmember-r' | 'filler' | 'roof';

export interface GroundPoint {
  id: string;
  /** As printed. */
  where: string;
  area: GroundArea;
  fig: string;
  /** Parts wired to it, with pin/connector as printed. */
  parts: string[];
  /** Which of this van's problems it touches. */
  hits?: ('horn' | 'ac' | 'trailer' | 'sam' | 'ign' | 'can')[];
}

const SYS = 'System Wiring Diagram';
export const G_POINTS: GroundPoint[] = [
  { id: 'G100', where: 'Left rear of engine compt', area: 'eng-lr', fig: `${SYS} Fig. 25`, parts: ['Heater PTC (1 C3)'] },
  { id: 'G101', where: 'Left rear of engine compt', area: 'eng-lr', fig: `${SYS} Fig. 25`, parts: ['Auxiliary battery (−)'] },
  { id: 'G102', where: 'Right front of engine compt', area: 'eng-rf', fig: `${SYS} Fig. 25`, parts: ['Anti-lock brakes module (4)', 'Right headlamp (4, 8)', 'Right front fog lamp (2)', 'Auxiliary fan relay (2) via S212 (on front HVAC unit)', 'Auxiliary cooling fan 2 motor (2) via S212'] },
  { id: 'G103', where: 'Left rear of engine compt', area: 'eng-lr', fig: `${SYS} Fig. 25`, hits: ['sam', 'horn', 'trailer', 'can'],
    parts: ['Body control module / SAM, in the fuse/relay block behind the left kick panel (8 C5)', 'Engine control module (2, 4, 6 C2)', 'Front wiper motor (4)', 'Left headlamp (4, 8, 3)', 'Right headlamp (3) and adaptive lighting module (24) via S318 (upper left rear engine compt)'] },
  { id: 'G104', where: 'Left side of engine compt', area: 'eng-ls', fig: `${SYS} Figs. 25, 30`, hits: ['horn'],
    parts: ['Horn 1 (A)', 'Left front fog lamp (2)', 'Windshield washer pump (1)', 'Headlamp washer motor (2)', 'Siren (2)', 'Heater control valve (2)', 'Rear door washer pump (1)', 'Hood ajar switch (2)'] },
  { id: 'G108', where: 'Right front of engine compt', area: 'eng-rf', fig: `${SYS} Fig. 25`, parts: ['Anti-lock brakes module (1)'] },
  { id: 'G109', where: 'Left front of engine compt', area: 'eng-lf', fig: `${SYS} Fig. 26`, parts: ['Glow plug module (6 C2)'] },
  { id: 'G200', where: 'Right rear of engine compt', area: 'eng-rr', fig: `${SYS} Figs. 1, 25, 40`, hits: ['ac', 'ign', 'horn', 'can'],
    parts: ['Ignition switch (8 C2, 7 C4)', 'Steering control module (8 C1, 10 C2)', 'Steering column lock module (3)', 'A/C heater control (2 C3, 8 C4)', 'Cluster (1)', 'Radio (A8 C1, 12 C2)', 'Shifter lever assembly (2)', 'Switch bank module (1 C2)', 'Headlamp leveling switch, CD changer, cigar lighter, cellphone interface, speed control switch, roof ventilator switch, front power outlet', 'Parking heater switches, upfitter / liftgate / aux drive / rear roof lamp switches', 'Blower motor (manual A/C), blower motor regulator (automatic A/C), center blend door actuator, glove box lamp, radio signal receiver heater', 'Rear camera, rear camera monitor (via S348 left rear headliner / S224 in instrument panel), passenger air bag (1 C2)'] },
  { id: 'G201', where: 'Front center headliner', area: 'roof-fc', fig: `${SYS} Fig. 25`, parts: ['Antenna booster assembly (2 C2)'] },
  { id: 'G300', where: 'Left front headliner', area: 'roof-lf', fig: `${SYS} Fig. 26`, parts: ['Intrusion sensors 1, 2, 3 and intrusion sensor', 'Rear recirculation door actuator 2', 'Roof control module (2 C3)', 'Left, center and right front identification lamps', 'Front ceiling lamp & switch', 'Upfitters connector X178 (4)', 'Electric heated windshield 2', 'Roof auxiliary cooling fan motor 2 and roof auxiliary fan relay via S351 (left center headliner)'] },
  { id: 'G301', where: 'Lower left side of vehicle', area: 'low-left', fig: `${SYS} Fig. 26`, hits: ['can', 'ign'],
    parts: ['Relay block (14, 24, 44)', 'Additional terminal 15 relay (1)', 'Programmable special module PSM (3 C1)', 'Dynamics sensor (1)', 'Tire pressure monitor module (8)', 'Data link connector (4, 5)', 'Driver door module (2 C2)', 'Battery isolator relay (1 C2)', 'Additional turn signal control module (17)', 'Left box seat power outlet, sliding door pillar B switches, driver seat belt switch, stop auxiliary drive switch, auxiliary drive solenoid, upfitters connector X145/6', 'Power sliding door modules, fuel pump module, driver and passenger thorax air bags, heated windshield relay'] },
  { id: 'G302', where: 'Left rear of engine compt', area: 'eng-lr', fig: `${SYS} Fig. 26`, hits: ['sam'],
    parts: ['Body control module / SAM (8 C7)', 'Park assist module (10 C1)', 'Right outside rearview mirror (5 C1)', 'Left side curtain air bag (1 C2)', 'Clutch pedal switch, parking brake switch (1 C2), passenger entry lamp (2)'] },
  { id: 'G303', where: 'Upper left of left rear door', area: 'rear-door-l', fig: `${SYS} Fig. 27`, parts: ['Left and right tail lamps, except chassis cab (3)', 'Tail stop lamp 3 (1)', 'Left and right license lamps (2)', 'Rear door swing switches, in hinge (2)', 'Left and right electric heated backlites', 'Rear door wiper motors (3)', 'Left and right rear power outlets (1)', 'From S348 (left rear headliner)'] },
  { id: 'G304', where: 'Lower left center body', area: 'low-left-ctr', fig: `${SYS} Figs. 24, 27`, hits: ['trailer'],
    parts: ['Trailer socket pin 8 (Fig. 24)', 'Chassis cab left and right tail lamps (1)', 'Reverse horn (2)', 'Upfitters connectors X52/9, X52/10 (2)'] },
  { id: 'G305', where: 'Lower left side of vehicle', area: 'low-left', fig: `${SYS} Figs. 24, 26`, hits: ['trailer', 'can'],
    parts: ['Trailer tow lighting module (3 C1)', 'Transmission control module (30 C1)', 'Relay block (34, 35, 74)', 'Terminal 15 relief relay (1)', 'Rear window defogger relay 1 (6)', 'Blower vent relay (6)', 'Rear recirculation door actuator 1 (1 C1)', 'Auxiliary heat dosing pump (1 C1, 1 C2)', 'Auxiliary heater modules 1 and 2'] },
  { id: 'G306', where: 'Left rear of engine compt', area: 'eng-lr', fig: `${SYS} Fig. 27`, parts: ['Occupant restraint controller module (15 C1, 16 C1)', 'Left and right side impact sensors 1 and 2'] },
  { id: 'G307', where: 'Right rear of engine compt', area: 'eng-rr', fig: `${SYS} Fig. 26`, hits: ['can'], parts: ['Diagnostic junction block 27 (3 C1)', 'Right side curtain air bag (1 C2)'] },
];

const FG = 'Fuse Block, Grounds manual PE54.00-D-2000';
export const W_POINTS: GroundPoint[] = [
  { id: 'W9/6', where: 'Left front lamp unit ground point', area: 'lamp-l', fig: `${FG} (complete vehicle, US)`, hits: ['horn', 'sam'], parts: ['Same page as: H1 signaling horn, K40/9 fuse/relay box, CDI control unit, ESP control unit, left lamp unit, wiper motor, washer pumps'] },
  { id: 'W9/7', where: 'Left front ground point 2', area: 'lamp-l', fig: `${FG} (complete vehicle, US)`, hits: ['horn'], parts: ['Same page as W9/6'] },
  { id: 'W2', where: 'Right front lamp unit ground point', area: 'lamp-r', fig: `${FG} (right engine compartment)`, parts: ['Right lamp unit, right fog lamp, additional fan relays, A/C additional fan'] },
  { id: 'W43/1', where: 'Left firewall ground point', area: 'firewall-l', fig: `${FG} (left footwell)`, hits: ['sam'], parts: ['N10 SAM control unit', 'Clutch pedal switch, parking brake indicator switch, passenger-side mirror, left windowbag'] },
  { id: 'W1/3', where: 'CLS cockpit ground point 1', area: 'cockpit', fig: `${FG} (right footwell, US)`, hits: ['ign', 'ac', 'horn', 'can'], parts: ['Same page as: N73 ignition switch (EZS), S98 A/C control (KLA), A1 cluster, N80 steering column module, K40/9, radio, blower motor'] },
  { id: 'W1/4', where: 'HLS cockpit ground point', area: 'cockpit', fig: `${FG} (right footwell, US)`, hits: ['ign', 'ac'], parts: ['Same page as W1/3'] },
  { id: 'W71/1', where: 'Driver seat frame ground point 1', area: 'seat', fig: `${FG} (seat base W71/1, W71/2, US)`, hits: ['trailer', 'can'], parts: ['Same page as: N28/1 trailer unit (AAG), N15/3 transmission (EGS), B24/15 yaw/acceleration sensor, N88/1 tire pressure, N26/15 PSM, K40/9, terminal 15 / 15R relief relays'] },
  { id: 'W71/2', where: 'Driver seat frame ground point 2', area: 'seat', fig: `${FG} (seat base W71/1, W71/2, US)`, hits: ['trailer'], parts: ['Same page as W71/1'] },
  { id: 'W71/3', where: 'Driver seat frame ground point 3', area: 'seat', fig: `${FG} (seat base W71/3)`, hits: ['trailer'], parts: ['N28/1 trailer unit (AAG), N88/1 tire pressure, additional turn signal module, level control'] },
  { id: 'W33', where: 'Tank filler neck grounding', area: 'filler', fig: `${FG} (seat base, US)`, parts: ['Fuel tank filler neck'] },
  { id: 'W29/8', where: 'Left D-pillar ground point', area: 'pillar-d-l', fig: `${FG} (rear end)`, parts: ['Tail lamps, license plate lamps, center high-mounted stop lamp, rear door wiper motors, heated rear windows'] },
  { id: 'W52/7', where: 'Left rear crossmember ground point', area: 'xmember-l', fig: `${FG} (frame)`, parts: ['Tail lamps, rear fog lamps, side-marker lamps, fuel pump, backup warning horn'] },
  { id: 'W52/8', where: 'Right rear crossmember ground point', area: 'xmember-r', fig: `${FG} (frame)`, parts: ['Same page as W52/7'] },
  { id: 'W38', where: 'Roof ground point', area: 'roof', fig: `${FG} (roof)`, parts: ['Front dome lamp, identification and clearance lamps, interior protection sensors, roof fans, heated windshield'] },
];

/** Where the two manuals list the same parts, so they are PROBABLY the same bolt. Not confirmed. */
export const LIKELY_SAME: [string, string, string][] = [
  ['G302', 'W43/1', 'Strong match: both list the SAM, clutch pedal switch, parking brake switch, passenger-side mirror, side window/curtain bag and passenger entry lamp. "Left rear of engine compt" vs "left firewall" (on the Mercedes "left footwell" page)'],
  ['G103 / G104', 'W9/6, W9/7', 'Same parts (horn, wiper motor, left lamp unit, engine computer, washer pumps, fuse/relay box), but the wording differs: "left rear / left side of engine compt" vs "left front lamp unit / left front". Confirm on the van'],
  ['G200', 'W1/3, W1/4', 'Both carry the ignition switch, A/C control, cluster and steering module: "right rear of engine compt" vs "cockpit"'],
  ['G301 / G305', 'W71/1, W71/2, W71/3', 'Both carry the trailer module, transmission computer, dynamics sensor, tire-pressure and PSM: "lower left side of vehicle" vs "driver seat frame"'],
];
