import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Provenance, SafetyKey, StepStatus, SuspectState } from '../../shared/types';
import { PROVENANCES, SAFETY } from '../../shared/types';
import type { Verdict } from '../../shared/rules';
import { Icon } from './icons';

const PROV_ICON: Record<Provenance, string> = { CONFIRMED: 'check', REPORTED: 'note', HYPOTHESIS: 'question', SOURCE: 'book', UNKNOWN: 'info' };
const PROV_HELP: Record<Provenance, string> = {
  CONFIRMED: 'Measured or verified on this van',
  REPORTED: 'Told by someone or read from a scan report, not independently checked',
  HYPOTHESIS: 'A possible explanation to test',
  SOURCE: 'From a general manual or website, unverified for this VIN',
  UNKNOWN: 'Needed but not yet known',
};
export const provText = (p: Provenance) => (p === 'SOURCE' ? 'Source · unverified' : p.charAt(0) + p.slice(1).toLowerCase());

export function Prov({ p, onChange }: { p: Provenance; onChange?: (p: Provenance) => void }) {
  const [open, setOpen] = useState(false);
  const body = (<><Icon name={PROV_ICON[p]} />{provText(p)}</>);
  if (!onChange) return <span class={`prov ${p}`} title={PROV_HELP[p]}>{body}</span>;
  return (
    <>
      <button type="button" class={`prov ${p}`} title={PROV_HELP[p]} aria-label={`Provenance: ${provText(p)}. Tap to change`} onClick={() => setOpen(true)}>{body}</button>
      {open && (
        <Sheet title="How sure is this?" onClose={() => setOpen(false)}>
          <div class="stack">
            {PROVENANCES.map((x) => (
              <button type="button" class="item" aria-pressed={x === p} onClick={() => { onChange(x); setOpen(false); }}>
                <span class={`prov ${x}`}><Icon name={PROV_ICON[x]} />{provText(x)}</span>
                <span class="grow small">{PROV_HELP[x]}</span>
                {x === p && <Icon name="check" class="chev" />}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

const V_ICON: Record<Verdict, string> = { pass: 'check', fail: 'x', check: 'warn', none: 'info' };
export function VerdictBadge({ v, text }: { v: Verdict; text?: string }) {
  const t = text ?? { pass: 'Meets rule', fail: 'Does not meet rule', check: 'Check', none: 'No rule' }[v];
  return <span class={`verdict ${v}`}><Icon name={V_ICON[v]} />{t}</span>;
}

const ST: Record<StepStatus | SuspectState, string> = {
  todo: 'To do', doing: 'Doing', done: 'Done', skipped: 'Skipped',
  untested: 'Untested', leaning: 'Leaning', ruled_out: 'Ruled out', confirmed: 'Confirmed',
};
export const statusText = (s: StepStatus | SuspectState) => ST[s];
export function Status({ s }: { s: StepStatus | SuspectState }) {
  return <span class={`status ${s}`}>{s === 'done' && <Icon name="check" class="chev" />}{ST[s]}</span>;
}

export function Safety({ k }: { k: SafetyKey }) {
  const s = SAFETY[k];
  return (
    <div class="safety" role="note">
      <div class="safety-inner"><Icon name="warn" /><div><b>{s.title}</b>{s.text}</div></div>
    </div>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus?.(); };
  }, []);
  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div class="sheet-grab" />
        <div class="sheet-head"><h2>{title}</h2><button type="button" class="icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Chips<T extends string>({ options, value, onChange, label, small }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; small?: boolean }) {
  return (
    <div class="chips" role="group" aria-label={label}>
      {options.map((o) => <button type="button" class={`chip${small ? ' sm' : ''}`} aria-pressed={o.key === value} onClick={() => onChange(o.key)}>{o.label}</button>)}
    </div>
  );
}

export function PageHead({ title, back, kicker, children }: { title: string; back?: string; kicker?: string; children?: ComponentChildren }) {
  return (
    <div class="page-title">
      {back && <a class="btn ghost sm" href={back} style="margin-bottom:10px"><Icon name="back" />Back</a>}
      {kicker && <div class="kicker">{kicker}</div>}
      <h1>{title}</h1>
      {children}
    </div>
  );
}

let toastSet: ((s: string) => void) | null = null;
export function toast(s: string) { toastSet?.(s); }
export function ToastHost() {
  const [msg, set] = useState('');
  useEffect(() => { toastSet = (s) => { set(s); setTimeout(() => set(''), 2600); }; }, []);
  return msg ? <div class="toast" role="status">{msg}</div> : null;
}

export const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
export const when = (t: number) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
