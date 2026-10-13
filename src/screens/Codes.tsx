import { useState } from 'preact/hooks';
import type { FaultCode } from '../../shared/types';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov, Safety, Sheet, ask, toast } from '../components/ui';
import { codes, photos } from '../lib/data';
import { get, logEvent, patch, remove, save, useStore } from '../lib/store';
import { PhotoGrid } from './sheets';

const STATUS: { key: FaultCode['status']; label: string }[] = [
  { key: 'active', label: 'Active' }, { key: 'stored', label: 'Stored' }, { key: 'unknown', label: 'Unknown' }, { key: 'cleared', label: 'Cleared' },
];

export function Codes() {
  useStore();
  const [edit, setEdit] = useState<string | null>(null);
  const list = codes();
  const groups = new Map<string, typeof list>();
  list.forEach((c) => groups.set(c.data.module, [...(groups.get(c.data.module) ?? []), c]));
  return (
    <div class="anim-in">
      <PageHead title="Fault codes" kicker={`${list.length} logged`} />
      <Safety k="log_before_clear" />
      <p class="lede" style="margin-top:12px">From the TOPDON report (2026-10-09) unless noted. The A/C control module was listed as OK.</p>
      {[...groups.entries()].map(([mod, cs]) => (
        <section class="section" style="margin-top:16px">
          <div class="kicker" style="margin-bottom:6px">{mod}</div>
          <div class="stack">
            {cs.map((c) => (
              <button type="button" class="item" onClick={() => setEdit(c.id)} style={c.data.status === 'cleared' ? 'opacity:.6' : ''}>
                <span class="code-chip">{c.data.code}</span>
                <span class="grow">
                  <b>{c.data.description || 'No description yet'}</b>
                  <span class="row small muted" style="margin-top:4px"><span class={`status ${c.data.status === 'active' ? 'doing' : ''}`}>{c.data.status}</span><Prov p={c.data.provenance} /></span>
                </span>
                <Icon name="edit" class="chev" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <button type="button" class="btn primary block" style="margin-top:20px" onClick={() => setEdit('new')}><Icon name="plus" />Add a code</button>
      {edit && <CodeSheet id={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function CodeSheet({ id, onClose }: { id?: string; onClose: () => void }) {
  const cur = get<FaultCode>(id)?.data;
  const [d, setD] = useState<FaultCode>(cur ?? { module: '', code: '', description: '', status: 'active', date_read: new Date().toISOString().slice(0, 10), source: 'Manual entry', note: '', provenance: 'REPORTED' });
  const set = (p: Partial<FaultCode>) => setD({ ...d, ...p });
  const setStatus = async (s: FaultCode['status']) => {
    if (s === 'cleared' && !await ask('Never clear before logging.\n\nIs this code (and every other code) written down or photographed? Tap Yes only if it is.')) return;
    set({ status: s });
  };
  const submit = async (e: Event) => {
    e.preventDefault();
    if (!d.module.trim() || !d.code.trim()) return;
    if (id) {
      await patch<FaultCode>(id, d);
      if (cur?.status !== d.status) await logEvent('code', 'fault_code', id, `${d.module} ${d.code} marked ${d.status}`);
    } else {
      const r = await save<FaultCode>('fault_code', d);
      await logEvent('code', 'fault_code', r.id, `Logged code ${d.module} ${d.code}`);
    }
    toast('Code saved');
    onClose();
  };
  const field = (k: keyof FaultCode, label: string, ph = '') => (
    <label class="field"><span>{label}</span><input class="input" value={d[k] as string} placeholder={ph} onInput={(e) => set({ [k]: (e.target as HTMLInputElement).value } as any)} /></label>
  );
  return (
    <Sheet title={id ? `${d.module} ${d.code}` : 'New code'} onClose={onClose}>
      <form onSubmit={submit}>
        {field('module', 'Module', 'e.g. SAM')}
        {field('code', 'Code', 'e.g. 90B5')}
        {field('description', 'Description')}
        <div class="kicker" style="margin-top:12px">Status</div>
        <Chips label="Status" value={d.status} onChange={setStatus} options={STATUS} />
        {d.status === 'cleared' && <div style="margin-top:10px"><Safety k="log_before_clear" /></div>}
        {field('date_read', 'Date read', 'YYYY-MM-DD')}
        {field('source', 'Source')}
        <label class="field"><span>Notes</span><textarea class="input" value={d.note} onInput={(e) => set({ note: (e.target as HTMLTextAreaElement).value })} /></label>
        <div class="row" style="margin-top:12px"><span class="kicker">Provenance</span><Prov p={d.provenance} onChange={(p) => set({ provenance: p })} /></div>
        {id && <div style="margin-top:14px"><div class="kicker" style="margin-bottom:6px">Scanner screen photo</div><PhotoGrid ids={photos((p) => p.code_id === id).map((p) => p.id)} addLinks={{ code_id: id }} addLabel="Photo of scanner screen" /></div>}
        <button class="btn primary block" style="margin-top:16px" type="submit"><Icon name="check" />Save code</button>
        {id && <button type="button" class="btn danger block" style="margin-top:10px" onClick={async () => { if (await ask('Delete this code from the log?')) { await remove(id); onClose(); } }}><Icon name="trash" />Delete from log</button>}
      </form>
    </Sheet>
  );
}
