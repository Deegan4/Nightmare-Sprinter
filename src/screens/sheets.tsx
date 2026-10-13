import { useEffect, useRef, useState } from 'preact/hooks';
import type { Condition, Note, Photo, Reading, ReadingPreset, Step, Unit } from '../../shared/types';
import { CONDITIONS, UNITS } from '../../shared/types';
import { evaluate } from '../../shared/rules';
import { Icon } from '../components/icons';
import { Chips, Sheet, VerdictBadge, toast } from '../components/ui';
import { ZoomViewer } from '../components/ZoomViewer';
import { nextStep, rule, rules, steps } from '../lib/data';
import { addPhoto, usePhotoUrl } from '../lib/photo';
import { get, logEvent, myName, patch, save, status, useStore } from '../lib/store';

type SheetKind = 'reading' | 'photo' | 'note' | 'viewer';
interface SheetOpts { stepId?: string; preset?: ReadingPreset; links?: Partial<Photo>; photoId?: string; caption?: string }
let setter: ((s: { kind: SheetKind; opts: SheetOpts } | null) => void) | null = null;
export const openSheet = (kind: SheetKind, opts: SheetOpts) => setter?.({ kind, opts });

export function SheetHost() {
  const [s, set] = useState<{ kind: SheetKind; opts: SheetOpts } | null>(null);
  useEffect(() => { setter = set; }, []);
  if (!s) return null;
  const close = () => set(null);
  if (s.kind === 'reading') return <AddReading opts={s.opts} onClose={close} />;
  if (s.kind === 'photo') return <AddPhoto opts={s.opts} onClose={close} />;
  if (s.kind === 'note') return <AddNote opts={s.opts} onClose={close} />;
  return <PhotoViewer id={s.opts.photoId!} onClose={close} />;
}

const markDoing = async (stepId?: string) => {
  const st = get<Step>(stepId);
  if (st && st.data.status === 'todo') await patch<Step>(st.id, { status: 'doing' });
};
const savedMsg = () => (status.auth === 'demo' ? 'Saved' : status.online ? 'Saved · syncing' : 'Saved on this phone · will sync');

function PhotoPicker({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const url = file ? URL.createObjectURL(file) : '';
  return (
    <div class="row" style="margin-top:12px">
      <label class="btn ghost sm" style="cursor:pointer">
        <Icon name="camera" />{file ? 'Change photo' : 'Add photo'}
        <input type="file" accept="image/*" capture="environment" class="visually-hidden" onChange={(e) => onFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
      </label>
      {file && <img src={url} alt="Selected photo" style="width:56px;height:56px;object-fit:cover;border-radius:8px;border:2px solid var(--line)" />}
      {file && <button type="button" class="btn ghost sm" onClick={() => onFile(null)}>Remove</button>}
    </div>
  );
}

function AddReading({ opts, onClose }: { opts: SheetOpts; onClose: () => void }) {
  useStore();
  const all = steps();
  const [stepId, setStepId] = useState<string>(opts.stepId ?? nextStep()?.id ?? '');
  const step = get<Step>(stepId);
  const first = opts.preset ?? step?.data.presets[0];
  const [label, setLabel] = useState(first?.label ?? '');
  const [unit, setUnit] = useState<Unit>(first?.unit ?? 'V');
  const [cond, setCond] = useState<Condition>(first?.condition ?? 'key_on');
  const [ruleId, setRuleId] = useState<string>(first?.rule_id ?? '');
  const [raw, setRaw] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const num = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => num.current?.focus(), 250); }, []);

  const applyPreset = (p: ReadingPreset) => { setLabel(p.label); setUnit(p.unit); setCond(p.condition); setRuleId(p.rule_id ?? ''); num.current?.focus(); };
  const value = parseFloat(raw.replace(',', '.'));
  const ev = evaluate(value, unit, cond, rule(ruleId)?.data);
  const valid = Number.isFinite(value) && label.trim();

  async function submit(e: Event) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    const r = await save<Reading>('reading', {
      step_id: stepId || undefined, label: label.trim(), value, unit, condition: cond, rule_id: ruleId || undefined,
      result: ev.result, note: note.trim(), entered_by: myName(), provenance: 'CONFIRMED',
    });
    if (file) {
      const pid = await addPhoto(file, { reading_id: r.id, step_id: stepId || undefined }, label.trim());
      await patch<Reading>(r.id, { photo_id: pid });
    }
    await logEvent('reading', 'reading', r.id, `${label.trim()}: ${value} ${unit}${ev.result !== 'none' ? ` (${ev.result.toUpperCase()})` : ''}`);
    await markDoing(stepId);
    toast(savedMsg());
    onClose();
  }

  return (
    <Sheet title="Add reading" onClose={onClose}>
      <form onSubmit={submit}>
        <div class="kicker" style="margin-top:4px">Step</div>
        <Chips small label="Step" value={stepId} onChange={(id) => { setStepId(id); const p = get<Step>(id)?.data.presets[0]; if (p) applyPreset(p); }}
          options={[...all.map((s) => ({ key: s.id, label: `${s.data.position}. ${s.data.short ?? s.data.title}` })), { key: '', label: 'No step' }]} />
        {step && step.data.presets.length > 0 && (
          <>
            <div class="kicker" style="margin-top:14px">What are you measuring?</div>
            <div class="stack" style="margin-top:6px">
              {step.data.presets.map((p) => (
                <button type="button" class="item" aria-pressed={label === p.label} style={label === p.label ? 'border-color:var(--ink);background:var(--accent-soft)' : ''} onClick={() => applyPreset(p)}>
                  <Icon name={p.rule_id === 'rule-ground-drop' ? 'ground' : p.rule_id ? 'bolt' : 'meter'} class="chev" />
                  <span class="grow"><b>{p.label}</b>{p.hint && <><br /><span class="small muted">{p.hint}</span></>}</span>
                  {label === p.label && <Icon name="check" class="chev" />}
                </button>
              ))}
            </div>
          </>
        )}
        <label class="field"><span>Label</span><input class="input" value={label} onInput={(e) => setLabel((e.target as HTMLInputElement).value)} placeholder="e.g. Horn plug power" required /></label>
        <label class="field"><span>Value</span>
          <input ref={num} class="input bignum" inputMode="decimal" enterKeyHint="done" autoComplete="off" value={raw} placeholder="0.00"
            aria-describedby="verdict" onInput={(e) => setRaw((e.target as HTMLInputElement).value.replace(/[^0-9.,-]/g, ''))} />
        </label>
        <div class="kicker" style="margin-top:12px">Unit</div>
        <Chips label="Unit" value={unit} onChange={setUnit} options={UNITS.map((u) => ({ key: u, label: u }))} />
        <div class="kicker" style="margin-top:12px">Test condition</div>
        <Chips label="Test condition" value={cond} onChange={setCond} options={CONDITIONS} />
        <div class="kicker" style="margin-top:12px">Compare to rule</div>
        <Chips small label="Rule" value={ruleId} onChange={setRuleId} options={[{ key: '', label: 'No rule' }, ...rules().map((r) => ({ key: r.id, label: r.data.label }))]} />
        <div id="verdict" class="card" style="margin-top:12px" aria-live="polite">
          <VerdictBadge v={ev.result} text={ev.headline} />
          <p class="small" style="margin-bottom:0">{ev.detail}</p>
        </div>
        <PhotoPicker file={file} onFile={setFile} />
        <label class="field"><span>Note (optional)</span><textarea class="input" value={note} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} placeholder="Tap the mic on your keyboard to talk" /></label>
        <button type="submit" class="btn primary block" style="margin-top:16px" disabled={!valid || busy}><Icon name="check" />Save reading</button>
      </form>
    </Sheet>
  );
}

function AddPhoto({ opts, onClose }: { opts: SheetOpts; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(opts.caption ?? '');
  const [stepId, setStepId] = useState(opts.links?.step_id ?? opts.stepId ?? (opts.links ? '' : nextStep()?.id ?? ''));
  const [busy, setBusy] = useState(false);
  async function submit(e: Event) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    try {
      await addPhoto(file, { ...opts.links, step_id: stepId || undefined }, caption.trim());
      toast(savedMsg());
      onClose();
    } catch {
      toast('Could not read that photo. Try again.');
      setBusy(false);
    }
  }
  return (
    <Sheet title="Add photo" onClose={onClose}>
      <form onSubmit={submit}>
        <label class="btn primary block" style="cursor:pointer;min-height:72px;margin-top:6px">
          <Icon name="camera" />{file ? 'Retake / choose another' : 'Take or choose a photo'}
          <input type="file" accept="image/*" capture="environment" class="visually-hidden" onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
        </label>
        {file && <img src={URL.createObjectURL(file)} alt="Preview" style="margin-top:12px;border-radius:12px;border:2px solid var(--line);max-height:280px;width:100%;object-fit:contain;background:var(--card-2)" />}
        <label class="field"><span>What is it?</span><input class="input" value={caption} onInput={(e) => setCaption((e.target as HTMLInputElement).value)} placeholder="e.g. Fuse card legend" /></label>
        {!opts.links?.zone_id && !opts.links?.code_id && (
          <>
            <div class="kicker" style="margin-top:12px">Attach to step</div>
            <Chips small label="Step" value={stepId} onChange={setStepId} options={[...steps().map((s) => ({ key: s.id, label: `${s.data.position}. ${s.data.short ?? s.data.title}` })), { key: '', label: 'None' }]} />
          </>
        )}
        <p class="small muted">Photos are shrunk on the phone (max 1600 px) before upload.</p>
        <button type="submit" class="btn primary block" style="margin-top:12px" disabled={!file || busy}><Icon name="check" />{busy ? 'Saving…' : 'Save photo'}</button>
      </form>
    </Sheet>
  );
}

function AddNote({ opts, onClose }: { opts: SheetOpts; onClose: () => void }) {
  const [text, setText] = useState('');
  const [stepId, setStepId] = useState(opts.stepId ?? nextStep()?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  async function submit(e: Event) {
    e.preventDefault();
    if (!text.trim()) return;
    const n = await save<Note>('note', { text: text.trim(), step_id: stepId || undefined });
    if (file) await patch<Note>(n.id, { photo_id: await addPhoto(file, { note_id: n.id, step_id: stepId || undefined }, 'Note photo') });
    await logEvent('note', 'note', n.id, text.trim().slice(0, 140));
    toast(savedMsg());
    onClose();
  }
  return (
    <Sheet title="Add note" onClose={onClose}>
      <form onSubmit={submit}>
        <label class="field" style="margin-top:4px"><span>Note</span>
          <textarea class="input" style="min-height:140px" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder="What did you see or do? Tap the mic on your keyboard to talk." autoFocus />
        </label>
        <div class="kicker" style="margin-top:12px">About step</div>
        <Chips small label="Step" value={stepId} onChange={setStepId} options={[...steps().map((s) => ({ key: s.id, label: `${s.data.position}. ${s.data.short ?? s.data.title}` })), { key: '', label: 'General' }]} />
        <PhotoPicker file={file} onFile={setFile} />
        <button type="submit" class="btn primary block" style="margin-top:16px" disabled={!text.trim()}><Icon name="check" />Save note</button>
      </form>
    </Sheet>
  );
}

export function PhotoThumb({ id, onOpen }: { id: string; onOpen?: () => void }) {
  useStore();
  const url = usePhotoUrl(id);
  const p = get<Photo>(id);
  const up = status.uploads[id];
  return (
    <button type="button" onClick={onOpen ?? (() => openSheet('viewer', { photoId: id }))} aria-label={`Open photo${p?.data.caption ? `: ${p.data.caption}` : ''}`}>
      {url && <img src={url} alt={p?.data.caption ?? ''} loading="lazy" />}
      {status.auth !== 'demo' && p && !p.data.uploaded && <span class="badge-up">{up != null ? `${Math.round(up * 100)}%` : 'on phone'}</span>}
    </button>
  );
}

export function PhotoGrid({ ids, addLinks, addLabel = 'Add photo', required }: { ids: string[]; addLinks?: Partial<Photo>; addLabel?: string; required?: boolean }) {
  return (
    <div>
      {ids.length > 0 && <div class="photo-grid">{ids.map((id) => <PhotoThumb id={id} />)}</div>}
      {!ids.length && required && <div class="empty" style="margin-bottom:8px"><Icon name="camera" class="chev" /> This step needs photos.</div>}
      {addLinks && <button type="button" class="btn ghost block" style="margin-top:10px" onClick={() => openSheet('photo', { links: addLinks })}><Icon name="camera" />{addLabel}</button>}
    </div>
  );
}

function PhotoViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = usePhotoUrl(id);
  const p = get<Photo>(id);
  if (!url) return null;
  return <ZoomViewer src={url} title={p?.data.caption || 'Photo'} foot={p ? `${p.created_by} · ${new Date(p.created_at).toLocaleString()}` : ''} onClose={onClose} />;
}
