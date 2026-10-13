import type { Condition, Rule, Unit } from './types';
import { CONDITIONS } from './types';

export type Verdict = 'pass' | 'fail' | 'check' | 'none';
export interface Evaluation { result: Verdict; headline: string; detail: string }

const condLabel = (c: Condition) => CONDITIONS.find((x) => x.key === c)?.label ?? c;

function toVolts(value: number, unit: Unit): number | null {
  if (unit === 'V') return value;
  if (unit === 'mV') return value / 1000;
  return null;
}

export function describeRule(rule: Rule): string {
  if (rule.comparator === 'max') return `meets the rule at ${rule.a} ${rule.unit} or less`;
  if (rule.comparator === 'min') return `meets the rule at ${rule.a} ${rule.unit} or more`;
  return `meets the rule between ${rule.a} and ${rule.b} ${rule.unit}`;
}

/**
 * Compare one reading against one rule. Wording is deliberately limited to
 * "meets / does not meet the rule": a reading never proves a part is bad.
 */
export function evaluate(value: number, unit: Unit, condition: Condition, rule?: Rule | null): Evaluation {
  if (!rule) return { result: 'none', headline: 'No rule', detail: 'Recorded as-is. No pass/fail rule is attached to this reading.' };
  if (!Number.isFinite(value)) return { result: 'none', headline: 'No value', detail: 'Enter a number to compare against the rule.' };
  const v = toVolts(value, unit);
  if (v === null) {
    return { result: 'check', headline: 'CHECK: wrong unit', detail: `This rule uses volts. A reading in ${unit} cannot be compared. ${rule.explanation}` };
  }
  let ok: boolean;
  if (rule.comparator === 'max') ok = v <= rule.a;
  else if (rule.comparator === 'min') ok = v >= rule.a;
  else ok = v >= rule.a && v <= (rule.b ?? Infinity);

  const shown = unit === 'mV' ? `${value} mV (${v.toFixed(3)} V)` : `${value} V`;
  const ruleText = `Rule: ${describeRule(rule)}.`;
  if (rule.conditions.length && !rule.conditions.includes(condition)) {
    const want = rule.conditions.map(condLabel).join(' or ');
    return {
      result: 'check',
      headline: `CHECK: ${ok ? 'meets' : 'does not meet'} the rule, wrong test condition`,
      detail: `${shown} was taken "${condLabel(condition)}". This rule is meant for ${want}. Re-test under that condition before deciding. ${ruleText}`,
    };
  }
  return ok
    ? { result: 'pass', headline: 'PASS: meets the rule', detail: `${shown}. ${ruleText} ${rule.meets_text}` }
    : { result: 'fail', headline: 'FAIL: does not meet the rule', detail: `${shown}. ${ruleText} ${rule.explanation}` };
}
