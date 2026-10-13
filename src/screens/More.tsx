import { useEffect, useState } from 'preact/hooks';
import type { Fact, Provenance, Rec, Step, TimelineEvent, Vehicle, Zone } from '../../shared/types';
import { buildSummary } from '../../shared/summary';
import { Icon } from '../components/icons';
import { Chips, PageHead, Prov, Sheet, Status, ago, toast, when } from '../components/ui';
import { ZONE_SCENES } from '../illus/scenes';
import { PinKey, PinLegend, VanSide, VanTop } from '../illus/van';
import { photos, refs, zones } from '../lib/data';
import { go, href } from '../lib/router';
import { allRecords, get, list, logEvent, patch, save, status, useStore } from '../lib/store';
import { DEMO, api } from '../lib/sync';
import { getTheme, setTheme, type ThemePref } from '../lib/theme';
import { idbClear, idbPut } from '../lib/idb';
import { PhotoGrid, openSheet } from './sheets';
import { MarkedPhoto } from '../components/MarkedPhoto';
import { CircuitOverview } from '../illus/circuit';

export function More() {
  useStore();
  const items: [string, string, string, string][] = [
    ['/map', 'map', 'Where things are', 'Van map: tap engine bay, footwell, seat, rear'],
    ['/timeline', 'clock', 'Timeline', 'Everything that was done, by who and when'],
    ['/van', 'van', 'Van facts', 'VIN, mileage, what’s been done, SAM label'],
    ['/summary', 'copy', 'Copy summary / print', 'Plain text for Claude or a mechanic'],
    ['/share', 'share', 'Invite & people', 'Private link for helpers'],
    ['/settings', 'user', 'Settings', 'Your name, dark mode, install, export'],
  ];
  return (
    <div class="anim-in">
      <PageHead title="More" />
      <div class="stack" style="margin-top:14px">
        {items.map(([to, ic, t, sub]) => (
          <a class="item" href={href(to)}><span class="brand-mark" style="width:44px;height:44px;flex:none"><Icon name={ic} /></span><span class="grow"><h3>{t}</h3><span class="small muted">{sub}</span></span><Icon name="chev" class="chev" /></a>
        ))}
      </div>
    </div>
  );
}

export function MapScreen() {
  useStore();
  const [view, setView] = useState<'top' | 'side'>('top');
  return (
    <div class="anim-in">
      <PageHead title="Where things are" back="#/more" kicker="Van map" />
      <p class="lede">Tap a glowing area to see the parts, grounds and fuses there. Positions are <b>approximate</b> until confirmed with photos.</p>
      <Chips label="View" value={view} onChange={setView} options={[{ key: 'top', label: 'From above' }, { key: 'side', label: 'Driver side' }]} />
      <div style="margin-top:12px">{view === 'top' ? <VanTop onZone={(z) => go(`/zone/${z}`)} /> : <VanSide onZone={(z) => go(`/zone/${z}`)} />}</div>
      <PinKey />
      <section class="section">
        <div class="section-head"><h2>How it’s wired together</h2></div>
        <CircuitOverview />
      </section>
      <section class="section">
        <div class="section-head"><h2>What the numbers mean</h2></div>
        <PinLegend onPick={(z) => go(`/zone/${z}`)} />
      </section>
      <section class="section">
        <div class="section-head"><h2>Areas</h2></div>
        <div class="stack">{zones().map((z) => (
          <a class="item" href={href(`/zone/${z.id}`)}><span class="zone-dot" /><span class="grow"><b>{z.data.label}</b><br /><span class="small muted">{z.data.summary}</span></span>
            <span class={`prov ${z.data.approximate ? 'UNKNOWN' : 'CONFIRMED'}`}>{z.data.approximate ? 'Approx.' : 'Confirmed'}</span></a>
        ))}</div>
      </section>
    </div>
  );
}

function Bullets({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  if (!items.length) return null;
  return (
    <div class="card">
      <div class="row"><Icon name={icon} class="chev" /><h3>{title}</h3></div>
      <ul style="margin:8px 0 0;padding-left:22px">{items.map((i) => <li style="margin:4px 0">{i}</li>)}</ul>
      {/per source|per reference/.test(items.join()) && <div style="margin-top:8px"><Prov p="SOURCE" /></div>}
    </div>
  );
}

export function ZoneDetail({ id }: { id: string }) {
  useStore();
  const z = get<Zone>(id);
  if (!z) return <div class="empty">Not found. <a href="#/map">Back</a></div>;
  const d = z.data;
  const Scene = ZONE_SCENES[id];
  const zs = d.step_ids.map((s) => get<Step>(s)).filter(Boolean) as Rec<Step>[];
  const zr = refs().filter((r) => r.data.tags.some((t) => d.ref_tags.includes(t)));
  const zp = photos((p) => p.zone_id === id).map((p) => p.id);
  return (
    <div class="anim-in">
      <PageHead title={d.label} back="#/map" kicker="Area">
        <div class="row" style="margin-top:8px">
          <span class={`prov ${d.approximate ? 'UNKNOWN' : 'CONFIRMED'}`}>{d.approximate ? 'Positions approximate' : 'Confirmed by photos'}</span>
        </div>
      </PageHead>
      <p class="lede" style="margin-top:10px">{d.summary}</p>
      <section class="stack" style="margin-bottom:16px">
        <div class="section-head" style="margin:0"><h2>On this van (real photos)</h2></div>
        {zp.length ? zp.map((pid) => <MarkedPhoto id={pid} zone={d} />) : (
          <div class="empty">No real photos of this area yet. Take one, then tap on it to mark where each part is. That turns these approximate spots into confirmed ones.</div>
        )}
        <button type="button" class="btn primary block" onClick={() => openSheet('photo', { links: { zone_id: id }, caption: d.label })}><Icon name="camera" />Photograph this area</button>
      </section>
      <div class="section-head" style="margin:0 0 8px"><h2>Drawing (approximate)</h2></div>
      <div class="stack">
        <VanTop active={id} />
        {Scene && <Scene />}
      </div>
      <PinLegend zone={id} />
      <section class="section stack">
        <Bullets title="Parts here" items={d.parts} icon="pin" />
        <Bullets title="Ground points" items={d.ground_points} icon="ground" />
        <Bullets title="Fuses" items={d.fuses} icon="bolt" />
      </section>
      <section class="section">
        {zp.length > 0 && d.approximate && (
          <button type="button" class="btn block" style="margin-top:10px" onClick={async () => { await patch<Zone>(id, { approximate: false }); await logEvent('zone', 'zone', id, `${d.label} positions confirmed with photos`); }}>
            <Icon name="check" />Photos confirm these positions
          </button>
        )}
      </section>
      {zs.length > 0 && (
        <section class="section"><div class="section-head"><h2>Steps here</h2></div>
          <div class="stack">{zs.map((s) => <a class="item" href={href(`/step/${s.id}`)}><span class="step-num">{s.data.position}</span><span class="grow"><b>{s.data.title}</b></span><Status s={s.data.status} /></a>)}</div>
        </section>
      )}
      {zr.length > 0 && (
        <section class="section"><div class="section-head"><h2>Reference pages</h2></div>
          <div class="stack">{zr.map((r) => <a class="item" href={href(`/ref/${r.id}`)}><Icon name="book" class="chev" /><span class="grow"><b>{r.data.title}</b><br /><span class="small muted">{r.data.figure}</span></span><Prov p={r.data.provenance} /></a>)}</div>
        </section>
      )}
    </div>
  );
}

const EV_ICON: Record<string, string> = { reading: 'meter', photo: 'camera', note: 'note', step: 'plan', code: 'codes', suspect: 'suspects', evidence: 'suspects', seed: 'van', zone: 'map', delete: 'trash', fact: 'van' };
export function Timeline() {
  useStore();
  const [who, setWho] = useState('');
  const [type, setType] = useState('');
  const evs = list<TimelineEvent>('event').sort((a, b) => b.created_at - a.created_at);
  const people = [...new Set(evs.map((e) => e.data.actor))];
  const types = [...new Set(evs.map((e) => e.data.type))];
  const shown = evs.filter((e) => (!who || e.data.actor === who) && (!type || e.data.type === type));
  return (
    <div class="anim-in">
      <PageHead title="Timeline" back="#/more" kicker={`${evs.length} events`} />
      <div class="kicker" style="margin-top:12px">Who</div>
      <Chips small label="Filter by person" value={who} onChange={setWho} options={[{ key: '', label: 'Everyone' }, ...people.map((p) => ({ key: p, label: p }))]} />
      <div class="kicker" style="margin-top:10px">What</div>
      <Chips small label="Filter by type" value={type} onChange={setType} options={[{ key: '', label: 'All' }, ...types.map((t) => ({ key: t, label: t }))]} />
      <ul class="tl" style="margin-top:18px">
        {shown.map((e) => {
          const ph = e.data.ref_kind === 'photo' ? e.data.ref_id : undefined;
          return (
            <li>
              <span class="tl-ico"><Icon name={EV_ICON[e.data.type] ?? 'info'} /></span>
              <div><b>{e.data.actor}</b> <time dateTime={new Date(e.created_at).toISOString()}>{when(e.created_at)}</time></div>
              <div>{e.data.summary}</div>
              {ph && get(ph) && <div style="max-width:120px;margin-top:6px"><PhotoGrid ids={[ph]} /></div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function VanFacts() {
  useStore();
  const v = get<Vehicle>('v1')?.data;
  const facts = list<Fact>('fact');
  const [adding, setAdding] = useState(false);
  return (
    <div class="anim-in">
      <PageHead title={v?.name ?? 'The van'} back="#/more" kicker="Van facts" />
      <VanSide caption="2012 Sprinter 2500 · driver’s side" tag="" />
      {v && (
        <div class="card" style="margin-top:12px">
          <dl class="kv">
            <dt>Vehicle</dt><dd>{v.year} {v.make_model}</dd>
            <dt>Engine</dt><dd>{v.engine}</dd>
            <dt>Mileage</dt><dd>{v.mileage}</dd>
            <dt>VIN</dt><dd><code>{v.vin}</code></dd>
          </dl>
          <p class="small" style="margin-bottom:0">{v.notes}</p>
          <div style="margin-top:8px"><Prov p="CONFIRMED" /></div>
        </div>
      )}
      <section class="section">
        <div class="section-head"><h2>What we know</h2></div>
        <div class="stack">
          {facts.map((f) => (
            <div class="card">
              <p style="margin-top:0">{f.data.text}</p>
              <div class="row"><Prov p={f.data.provenance} onChange={(p) => patch<Fact>(f.id, { provenance: p })} />{f.data.source && <span class="small muted">{f.data.source}</span>}</div>
            </div>
          ))}
        </div>
        <button type="button" class="btn ghost block" style="margin-top:12px" onClick={() => setAdding(true)}><Icon name="plus" />Add a fact</button>
      </section>
      {adding && <FactSheet onClose={() => setAdding(false)} />}
    </div>
  );
}

function FactSheet({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [p, setP] = useState<Provenance>('REPORTED');
  return (
    <Sheet title="Add a fact" onClose={onClose}>
      <form onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; const r = await save<Fact>('fact', { text: text.trim(), source: source.trim(), provenance: p, tags: [] }); await logEvent('fact', 'fact', r.id, `Added fact: ${text.trim()}`); onClose(); }}>
        <label class="field"><span>Fact</span><textarea class="input" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} /></label>
        <label class="field"><span>Where it came from</span><input class="input" value={source} onInput={(e) => setSource((e.target as HTMLInputElement).value)} /></label>
        <div class="row" style="margin-top:12px"><span class="kicker">How sure</span><Prov p={p} onChange={setP} /></div>
        <button class="btn primary block" style="margin-top:14px" type="submit"><Icon name="check" />Save</button>
      </form>
    </Sheet>
  );
}

interface Invite { id: string; label: string; created_at: number; revoked_at: number | null }
interface MemberRow { id: string; display_name: string; role: string; last_seen: number; invite_label: string }

export function Share() {
  useStore();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [label, setLabel] = useState('Dad');
  const [fresh, setFresh] = useState<string>('');
  const [err, setErr] = useState('');
  const owner = status.me?.role === 'owner';
  const load = async () => {
    try {
      setMembers((await api<{ members: MemberRow[] }>('/api/members')).members);
      if (owner) setInvites((await api<{ invites: Invite[] }>('/api/invites')).invites);
    } catch (e) { setErr((e as Error).message); }
  };
  useEffect(() => { if (!DEMO) load(); }, []);
  if (DEMO) return (<div class="anim-in"><PageHead title="Invite & people" back="#/more" /><div class="empty">Demo mode keeps everything on this device. Deploy the app to Cloudflare to share a private link.</div></div>);
  const create = async () => {
    try {
      const r = await api<{ token: string }>('/api/invites', { method: 'POST', body: JSON.stringify({ label }) });
      setFresh(`${location.origin}/#/join/${r.token}`);
      load();
    } catch (e) { setErr((e as Error).message); }
  };
  const revoke = async (id: string) => {
    if (!confirm('Revoke this link? Anyone who joined with it is signed out on their next request.')) return;
    await api(`/api/invites/${id}/revoke`, { method: 'POST' });
    load();
  };
  return (
    <div class="anim-in">
      <PageHead title="Invite & people" back="#/more" />
      {err && <div class="caveat" style="margin-top:10px">{err}</div>}
      {owner && (
        <section class="section">
          <div class="card">
            <h3>Make a private invite link</h3>
            <p class="small muted">Anyone with the link can join. No passwords. You can revoke it any time.</p>
            <label class="field"><span>Who is it for?</span><input class="input" value={label} onInput={(e) => setLabel((e.target as HTMLInputElement).value)} /></label>
            <button type="button" class="btn primary block" style="margin-top:12px" onClick={create}><Icon name="link" />Create link</button>
            {fresh && (
              <div style="margin-top:12px">
                <div class="kicker">Send this link (shown once)</div>
                <input class="input" readOnly value={fresh} onFocus={(e) => (e.target as HTMLInputElement).select()} />
                <div class="btn-row" style="margin-top:8px">
                  <button type="button" class="btn" onClick={() => navigator.clipboard.writeText(fresh).then(() => toast('Link copied'))}><Icon name="copy" />Copy</button>
                  {'share' in navigator && <button type="button" class="btn" onClick={() => navigator.share({ title: 'Van Fix', text: 'Join the van repair tracker', url: fresh }).catch(() => {})}><Icon name="share" />Share</button>}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <section class="section">
        <div class="section-head"><h2>People</h2></div>
        <div class="stack">{members.map((m) => <div class="item"><Icon name="user" class="chev" /><span class="grow"><b>{m.display_name}</b> <span class="small muted">({m.role})</span><br /><span class="small muted">seen {ago(m.last_seen)} · via {m.invite_label}</span></span></div>)}</div>
      </section>
      {owner && invites.length > 0 && (
        <section class="section">
          <div class="section-head"><h2>Links</h2></div>
          <div class="stack">{invites.map((i) => (
            <div class="item"><Icon name="link" class="chev" /><span class="grow"><b>{i.label}</b><br /><span class="small muted">{i.revoked_at ? `revoked ${ago(i.revoked_at)}` : `created ${ago(i.created_at)}`}</span></span>
              {!i.revoked_at && <button type="button" class="btn danger sm" onClick={() => revoke(i.id)}>Revoke</button>}</div>
          ))}</div>
        </section>
      )}
    </div>
  );
}

export function Summary() {
  useStore();
  const text = buildSummary(allRecords());
  return (
    <div class="anim-in">
      <div class="no-print"><PageHead title="Summary" back="#/more" kicker="For Claude or a mechanic" /></div>
      <div class="btn-row no-print" style="margin:12px 0">
        <button type="button" class="btn primary" onClick={() => navigator.clipboard.writeText(text).then(() => toast('Summary copied'), () => toast('Copy failed: select the text below'))}><Icon name="copy" />Copy summary</button>
        <button type="button" class="btn" onClick={() => print()}><Icon name="print" />Print / PDF</button>
      </div>
      <pre class="summary-pre">{text}</pre>
    </div>
  );
}

let deferredPrompt: any = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

export function Settings() {
  useStore();
  const [name, setName] = useState(status.me?.display_name ?? '');
  const [theme, setT] = useState<ThemePref>(getTheme());
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches;
  const saveName = async () => {
    const n = name.trim();
    if (!n) return;
    if (DEMO) { await idbPut('meta', 'demoName', n); status.me = { ...status.me!, display_name: n }; toast('Name saved'); return; }
    try { const r = await api<{ member: any }>('/api/me', { method: 'POST', body: JSON.stringify({ name: n }) }); status.me = r.member; await idbPut('meta', 'me', r.member); toast('Name saved'); }
    catch (e) { toast((e as Error).message); }
  };
  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), records: allRecords() }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `van-fix-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  return (
    <div class="anim-in">
      <PageHead title="Settings" back="#/more" />
      <section class="section card">
        <label class="field" style="margin-top:0"><span>Your name (shown on readings)</span><input class="input" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} /></label>
        <button type="button" class="btn block" style="margin-top:10px" onClick={saveName}>Save name</button>
      </section>
      <section class="section card">
        <h3>Look</h3>
        <div style="margin-top:8px"><Chips label="Theme" value={theme} onChange={(t) => { setT(t); setTheme(t); }} options={[{ key: 'light', label: 'Light (sun)' }, { key: 'dark', label: 'Dark' }, { key: 'system', label: 'Match phone' }]} /></div>
      </section>
      {!standalone && (
        <section class="section card">
          <h3>Put it on your home screen</h3>
          {iOS ? <p>In Safari, tap <b>Share</b> (square with arrow) then <b>Add to Home Screen</b>.</p>
            : deferredPrompt ? <button type="button" class="btn primary block" style="margin-top:8px" onClick={() => { deferredPrompt.prompt(); deferredPrompt = null; }}><Icon name="download" />Install Van Fix</button>
              : <p>In Chrome, tap the <b>⋮</b> menu then <b>Add to Home screen</b> (or <b>Install app</b>).</p>}
        </section>
      )}
      <section class="section card">
        <h3>Your data</h3>
        <p class="small muted">Download everything (readings, notes, codes, suspects) as a JSON file.</p>
        <button type="button" class="btn block" onClick={exportAll}><Icon name="download" />Export all data</button>
      </section>
      {!DEMO && (
        <section class="section">
          <button type="button" class="btn danger block" onClick={async () => {
            if (!confirm('Sign out on this phone? Unsynced changes on this phone will be lost. You will need the invite link again.')) return;
            await api('/api/logout', { method: 'POST' }).catch(() => {});
            await idbClear();
            location.hash = '#/';
            location.reload();
          }}>Sign out on this phone</button>
        </section>
      )}
    </div>
  );
}

