import { useState } from 'preact/hooks';
import { Icon } from './components/icons';
import { ConfirmHost, ToastHost } from './components/ui';
import { status, useStore } from './lib/store';
import { useRoute } from './lib/router';
import { DEMO, syncNow } from './lib/sync';
import { isDark, setTheme } from './lib/theme';
import { SheetHost, openSheet } from './screens/sheets';
import { Home } from './screens/Home';
import { Plan, StepDetail } from './screens/Plan';
import { Suspects, SuspectDetail } from './screens/Suspects';
import { Codes } from './screens/Codes';
import { Library, RefDetail } from './screens/Library';
import { More, MapScreen, ZoneDetail, Timeline, VanFacts, Share, Summary, Settings } from './screens/More';
import { Gate } from './screens/Gate';

const TABS = [
  { key: '', label: 'Next', icon: 'next' },
  { key: 'plan', label: 'Plan', icon: 'plan' },
  { key: 'suspects', label: 'Suspects', icon: 'suspects' },
  { key: 'codes', label: 'Codes', icon: 'codes' },
  { key: 'library', label: 'Library', icon: 'library' },
  { key: 'more', label: 'More', icon: 'more' },
];
const TAB_OF: Record<string, string> = { sheet: 'library', xray: 'more', grounds: 'more', step: 'plan', suspect: 'suspects', ref: 'library', map: 'more', zone: 'more', timeline: 'more', van: 'more', share: 'more', summary: 'more', settings: 'more' };

function SyncPill() {
  if (status.auth === 'demo') return <span class="sync-pill" title="Demo: saved on this phone only"><span class="dot" style="background:var(--accent)" />Demo</span>;
  let cls = '', text = 'Synced';
  if (!status.online) { cls = 'offline'; text = status.pending ? `${status.pending} saved on phone` : 'Offline'; }
  else if (status.pending || status.syncing) { cls = 'pending'; text = status.pending ? `${status.pending} saved on phone` : 'Syncing…'; }
  else if (status.error) { cls = 'error'; text = 'Sync problem'; }
  return (
    <button type="button" class={`sync-pill ${cls}`} onClick={() => syncNow()} aria-live="polite"
      title={status.error || (status.lastSync ? `Last synced ${new Date(status.lastSync).toLocaleTimeString()}` : '')}>
      <span class="dot" />{text}
    </button>
  );
}

function Fab() {
  const [open, setOpen] = useState(false);
  const pick = (k: 'reading' | 'photo' | 'note') => { setOpen(false); openSheet(k, {}); };
  return (
    <div class="fab-wrap">
      {open && (
        <>
          <button type="button" class="fab-item" onClick={() => pick('reading')}><Icon name="meter" />Add reading</button>
          <button type="button" class="fab-item" onClick={() => pick('photo')}><Icon name="camera" />Add photo</button>
          <button type="button" class="fab-item" onClick={() => pick('note')}><Icon name="note" />Add note</button>
        </>
      )}
      <button type="button" class="fab" aria-expanded={open} aria-label={open ? 'Close add menu' : 'Add reading, photo or note'} onClick={() => setOpen(!open)}><Icon name="plus" /></button>
    </div>
  );
}

// The wiring sheet is the heaviest screen, so it loads on first visit (kept out of the shell bundle).
let SheetMod: typeof import('./screens/Sheet') | null = null;
function LazySheet() {
  const [, set] = useState(0);
  if (!SheetMod) { import('./screens/Sheet').then((m) => { SheetMod = m; set(1); }); return <p class="muted">Loading wiring sheet…</p>; }
  return <SheetMod.WiringSheet />;
}
let GroundsMod: typeof import('./screens/Grounds') | null = null;
function LazyGrounds() {
  const [, set] = useState(0);
  if (!GroundsMod) { import('./screens/Grounds').then((m) => { GroundsMod = m; set(1); }); return <p class="muted">Loading ground map…</p>; }
  return <GroundsMod.Grounds />;
}
let XrayMod: typeof import('./screens/Xray') | null = null;
function LazyXray() {
  const [, set] = useState(0);
  if (!XrayMod) { import('./screens/Xray').then((m) => { XrayMod = m; set(1); }); return <p class="muted">Loading see-through view…</p>; }
  return <XrayMod.Xray />;
}

function Screen({ r }: { r: string[] }) {
  const [a, b] = r;
  switch (a) {
    case undefined: return <Home />;
    case 'plan': return <Plan />;
    case 'step': return <StepDetail id={b} />;
    case 'suspects': return <Suspects />;
    case 'suspect': return <SuspectDetail id={b} />;
    case 'codes': return <Codes />;
    case 'library': return <Library tag={b} />;
    case 'ref': return <RefDetail id={b} />;
    case 'more': return <More />;
    case 'map': return <MapScreen />;
    case 'zone': return <ZoneDetail id={b} />;
    case 'timeline': return <Timeline />;
    case 'van': return <VanFacts />;
    case 'share': return <Share />;
    case 'summary': return <Summary />;
    case 'settings': return <Settings />;
    case 'sheet': return <LazySheet />;
    case 'xray': return <LazyXray />;
    case 'grounds': return <LazyGrounds />;
    default: return <Home />;
  }
}

export function App() {
  useStore();
  const r = useRoute();
  const [, force] = useState(0);
  if (status.auth === 'loading' || status.auth === 'needsName') return <Gate />;
  if (r[0] === 'join' || r[0] === 'setup') { location.replace('#/'); return null; } // old invite links
  const tab = TAB_OF[r[0] ?? ''] ?? r[0] ?? '';
  return (
    <>
      <a class="visually-hidden" href="#main">Skip to content</a>
      <div class={`app${r[0] === 'sheet' || r[0] === 'xray' || r[0] === 'grounds' ? ' wide' : ''}`}>
        <header class="topbar">
          <a class="brand" href="#/"><span class="brand-mark"><Icon name="van" /></span>Van Fix</a>
          <span class="spacer" />
          <SyncPill />
          <button type="button" class="icon-btn" aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => { setTheme(isDark() ? 'light' : 'dark'); force((x) => x + 1); }}>
            <Icon name={isDark() ? 'sun' : 'moon'} />
          </button>
        </header>
        {DEMO && r[0] === undefined && <p class="small muted" style="margin:0 0 8px">Demo mode: everything stays on this device.</p>}
        <main id="main"><Screen r={r} /></main>
      </div>
      <Fab />
      <nav class="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <a class="tab" href={`#/${t.key}`} aria-current={tab === t.key ? 'page' : undefined}><Icon name={t.icon} />{t.label}</a>
        ))}
      </nav>
      <SheetHost />
      <ToastHost />
      <ConfirmHost />
    </>
  );
}
