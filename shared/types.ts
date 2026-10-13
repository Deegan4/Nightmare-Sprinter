// Shared record shapes used by the worker and the web app.
// Every synced thing is a "record": { id, kind, data, timestamps }. See CLAUDE.md for why.

export type Provenance = 'CONFIRMED' | 'REPORTED' | 'HYPOTHESIS' | 'SOURCE' | 'UNKNOWN';
export const PROVENANCES: Provenance[] = ['CONFIRMED', 'REPORTED', 'HYPOTHESIS', 'SOURCE', 'UNKNOWN'];

export type Kind =
  | 'vehicle' | 'fact' | 'step' | 'reading' | 'rule' | 'suspect' | 'evidence'
  | 'fault_code' | 'reference_page' | 'zone' | 'photo' | 'note' | 'event' | 'fuse';

export interface Rec<T = any> {
  id: string;
  kind: Kind;
  vehicle_id: string;
  data: T;
  created_at: number;
  updated_at: number;
  created_by: string;
  deleted?: boolean;
  seq?: number;
}

export type Unit = 'V' | 'mV' | 'Ω' | 'A' | 'psi' | '°F';
export const UNITS: Unit[] = ['V', 'mV', 'Ω', 'A', 'psi', '°F'];

export type Condition = 'key_off' | 'key_on' | 'running' | 'load';
export const CONDITIONS: { key: Condition; label: string }[] = [
  { key: 'key_off', label: 'Key off' },
  { key: 'key_on', label: 'Key on' },
  { key: 'running', label: 'Engine running' },
  { key: 'load', label: 'Load applied' },
];

export interface Vehicle { name: string; vin: string; year: string; make_model: string; engine: string; mileage: string; notes: string }
export interface Fact { text: string; provenance: Provenance; source: string; tags: string[] }

export type StepStatus = 'todo' | 'doing' | 'done' | 'skipped';
export interface ReadingPreset { label: string; unit: Unit; condition: Condition; rule_id?: string; hint?: string }
export interface Step {
  position: number; title: string; why: string; how_to: string[]; status: StepStatus;
  requires_photo: boolean; safety: SafetyKey[]; presets: ReadingPreset[];
  suspect_ids: string[]; zone_id?: string; ref_ids: string[]; illustration?: string; notes: string;
  short?: string;
}

export interface Reading {
  step_id?: string; label: string; value: number; unit: Unit; condition: Condition;
  rule_id?: string; result: 'pass' | 'fail' | 'check' | 'none'; photo_id?: string; note: string;
  entered_by: string; provenance: Provenance;
}

export type Comparator = 'max' | 'min' | 'between';
export interface Rule {
  label: string; comparator: Comparator; a: number; b?: number; unit: 'V'; conditions: Condition[];
  explanation: string; provenance: Provenance; source: string; meets_text: string;
}

export type SuspectState = 'untested' | 'leaning' | 'ruled_out' | 'confirmed';
export interface Suspect { title: string; short: string; state: SuspectState; provenance: Provenance; summary: string; change_my_mind: string; position: number; symptom_links: string[] }
export interface Evidence { suspect_id: string; text: string; reading_id?: string; direction: 'for' | 'against' }

export interface Fuse { box: string; number: string; amps: string; function: string; provenance: Provenance; source: string; position: number }

export interface FaultCode { module: string; code: string; description: string; status: 'active' | 'stored' | 'unknown' | 'cleared'; date_read: string; source: string; photo_id?: string; note: string; provenance: Provenance }

export interface ReferencePage { title: string; figure: string; tags: string[]; source_name: string; provenance: Provenance; image_key?: string; image_keys?: string[]; how_to_read: string; caveat: string; position: number }

export interface Zone { key: string; label: string; approximate: boolean; summary: string; parts: string[]; ground_points: string[]; fuses: string[]; step_ids: string[]; ref_tags: string[]; position: number }

export interface PhotoMarker { x: number; y: number; label: string }
export interface Photo { markers?: PhotoMarker[]; caption: string; step_id?: string; zone_id?: string; reading_id?: string; code_id?: string; note_id?: string; width: number; height: number; uploaded?: boolean }
export interface Note { text: string; step_id?: string; photo_id?: string }
export interface TimelineEvent { type: string; ref_kind: Kind; ref_id: string; summary: string; actor: string }

export type SafetyKey = 'no_battery_to_compressor' | 'log_before_clear' | 'verify_before_replace' | 'use_voltage_drop';
export const SAFETY: Record<SafetyKey, { title: string; text: string }> = {
  no_battery_to_compressor: {
    title: 'Do not jump the compressor plug',
    text: 'Do not apply battery voltage directly to the A/C compressor plug until the compressor type and pin functions are confirmed.',
  },
  log_before_clear: { title: 'Write codes down first', text: 'Do not clear codes before they are written down.' },
  verify_before_replace: {
    title: 'Verify before replacing',
    text: 'Do not replace the SAM or other modules before power, grounds, fuses and relay control have been verified.',
  },
  use_voltage_drop: {
    title: 'Use voltage drop, not ohms',
    text: 'Use voltage-drop tests for high-current fuses and grounds. Ohm readings are misleading: the meter leads alone read about 2.1 Ω here.',
  },
};
