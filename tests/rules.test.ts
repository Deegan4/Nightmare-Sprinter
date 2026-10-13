import { describe, expect, it } from 'vitest';
import { evaluate } from '../shared/rules';
import { seedRecords } from '../shared/seed';
import { buildSummary } from '../shared/summary';
import type { Rule } from '../shared/types';

const seed = seedRecords();
const rule = (id: string) => seed.find((r) => r.id === id)!.data as Rule;
const BAD_WORDS = /\b(is bad|faulty|broken|replace (it|the))\b/i;

describe('rule engine (PRD acceptance test 3)', () => {
  it('0.35 V ground drop fails the 0.2 V rule without blaming a part', () => {
    const e = evaluate(0.35, 'V', 'load', rule('rule-ground-drop'));
    expect(e.result).toBe('fail');
    expect(e.headline).toContain('does not meet the rule');
    expect(e.headline + e.detail).not.toMatch(BAD_WORDS);
  });
  it('0.1 V ground drop passes', () => {
    const e = evaluate(0.1, 'V', 'load', rule('rule-ground-drop'));
    expect(e.result).toBe('pass');
    expect(e.headline).toContain('meets the rule');
    expect(e.headline + e.detail).not.toMatch(BAD_WORDS);
  });
  it('0.2 V exactly is on the passing side', () => {
    expect(evaluate(0.2, 'V', 'load', rule('rule-ground-drop')).result).toBe('pass');
  });
  it('converts mV to V', () => {
    expect(evaluate(350, 'mV', 'load', rule('rule-ground-drop')).result).toBe('fail');
    expect(evaluate(80, 'mV', 'key_on', rule('rule-fuse-drop')).result).toBe('pass');
  });
  it('asks to re-check when the unit cannot be compared', () => {
    expect(evaluate(2.2, 'Ω', 'key_off', rule('rule-fuse-drop')).result).toBe('check');
  });
  it('asks to re-check when the test condition is wrong (ground drop with no load)', () => {
    expect(evaluate(0.05, 'V', 'key_off', rule('rule-ground-drop')).result).toBe('check');
  });
  it('12 V feed rule uses an 11.5 to 14.5 V window', () => {
    const r = rule('rule-feed-12v');
    expect(evaluate(12.4, 'V', 'key_off', r).result).toBe('pass');
    expect(evaluate(11.2, 'V', 'key_off', r).result).toBe('fail');
    expect(evaluate(0, 'V', 'key_off', r).result).toBe('fail');
  });
  it('no rule means no verdict', () => {
    expect(evaluate(1, 'V', 'key_on', undefined).result).toBe('none');
  });
});

describe('seed content', () => {
  it('every reference page has a provenance label and source name', () => {
    const refs = seed.filter((r) => r.kind === 'reference_page');
    expect(refs.length).toBeGreaterThan(0);
    for (const r of refs) { expect(r.data.provenance).toBe('SOURCE'); expect(r.data.source_name).toBeTruthy(); }
  });
  it('suspects start untested as HYPOTHESIS', () => {
    for (const s of seed.filter((r) => r.kind === 'suspect')) { expect(s.data.state).toBe('untested'); expect(s.data.provenance).toBe('HYPOTHESIS'); }
  });
  it('rules are labelled SOURCE (general practice), not factory specs', () => {
    for (const r of seed.filter((x) => x.kind === 'rule')) { expect(r.data.provenance).toBe('SOURCE'); expect(r.data.source).toMatch(/general practice/i); }
  });
});

describe('fault codes from the 2026-10-09 TOPDON report', () => {
  const codes = seed.filter((r) => r.kind === 'fault_code');
  it('has all 24 codes, each REPORTED with a description', () => {
    expect(codes).toHaveLength(24);
    for (const c of codes) { expect(c.data.provenance).toBe('REPORTED'); expect(c.data.description.length).toBeGreaterThan(5); }
  });
  it('uses the report\'s code 901C, not the earlier typo 901D', () => {
    expect(codes.some((c) => c.data.code === '901C')).toBe(true);
    expect(codes.some((c) => c.data.code === '901D')).toBe(false);
  });
  it('records the ignition switch terminal 15 / 15R faults', () => {
    expect(codes.filter((c) => c.data.code === '9007' || c.data.code === '9009')).toHaveLength(2);
  });
});

describe('copy summary (PRD acceptance test 7)', () => {
  it('includes vehicle facts, readings with unit and condition, suspects, codes and provenance', () => {
    const reading = { id: 'r1', kind: 'reading', vehicle_id: 'v1', created_at: 1, updated_at: 1, created_by: 'Dad',
      data: { label: 'Horn plug power', value: 12.3, unit: 'V', condition: 'load', rule_id: 'rule-feed-12v', result: 'pass', note: '', entered_by: 'Dad', provenance: 'CONFIRMED' } } as any;
    const text = buildSummary([...seed, reading]);
    for (const s of ['WD3PE7CCXC5614568', 'Horn plug power: 12.3 V, Load applied', '[HYPOTHESIS] The SAM', 'SAM 90B5', '[REPORTED]', '[CONFIRMED]', '[SOURCE, unverified for this VIN]', 'Current step:']) {
      expect(text).toContain(s);
    }
    // "Control unit faulty" is the scanner's own REPORTED wording for SAM 90B5, so only check app-generated phrases.
    expect(text).not.toMatch(/\b(is bad|part is|replace (it|the))\b/i);
  });
});
