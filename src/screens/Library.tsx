import { useState } from 'preact/hooks';
import type { ReferencePage } from '../../shared/types';
import { Icon } from '../components/icons';
import { PageHead, Prov } from '../components/ui';
import { ZoomViewer } from '../components/ZoomViewer';
import { refs } from '../lib/data';
import { go, href } from '../lib/router';
import { get, patch, useStore } from '../lib/store';

const TAGS = ['Horn', 'Trailer', 'A/C', 'Power distribution', 'Grounds', 'Fuse/relay box', 'SAM'];
const imgUrl = (key: string) => `/api/ref-image/${key.split('/').map(encodeURIComponent).join('/')}`;

function Caveat({ text }: { text: string }) {
  return <div class="caveat" role="note"><Icon name="warn" /><span>{text}</span></div>;
}

// Manual page images are only served when the deployment enables them (they are third-party manuals).
let manualsBlocked = false;
function Placeholder({ blocked }: { blocked?: boolean }) {
  return (
    <div class="illus" style="aspect-ratio:4/3;display:grid;place-items:center;text-align:center;padding:16px">
      <div style="color:var(--il-ink);max-width:280px"><span class="ph-ico"><Icon name="book" /></span>
        <div class="small" style="font-weight:700">{blocked ? 'Manual page not shown on the open app' : 'Page image not uploaded yet'}</div>
        <div class="small" style="opacity:.8">{blocked ? 'Use the figure number and source below to find it in your own copy of the manual.' : 'Run scripts/pdf-to-images with the PDFs'}</div></div>
    </div>
  );
}

export function Library({ tag }: { tag?: string }) {
  useStore();
  const list = refs().filter((r) => !tag || r.data.tags.includes(tag));
  return (
    <div class="anim-in">
      <PageHead title="Library" kicker="Wiring & location pages" />
      <a class="item" href="#/sheet" style="margin:12px 0;border-color:#1f3b63;border-width:3px"><span class="brand-mark" style="width:44px;height:44px;flex:none;background:#1f3b63;color:#fff"><Icon name="plan" /></span><span class="grow"><h3>Wiring sheet</h3><span class="small muted">Everything on one page: components, power flow, fuses, horn / A/C / trailer circuits</span></span><Icon name="chev" class="chev" /></a>
      <Caveat text="General 906 reference, not matched to this VIN. Verify against the fuse-card and the van." />
      <div class="chips" style="margin:14px 0;overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px" role="group" aria-label="Filter by system">
        <a class="chip sm" href="#/library" aria-pressed={!tag} style="text-decoration:none;flex:none">All</a>
        {TAGS.map((t) => <a class="chip sm" style="text-decoration:none;flex:none" href={href(`/library/${t}`)} aria-pressed={tag === t}>{t}</a>)}
      </div>
      <div class="stack">
        {list.map((r) => (
          <a class="item" href={href(`/ref/${r.id}`)} style="align-items:flex-start">
            <span class="thumb">{r.data.image_key && !manualsBlocked ? <img src={imgUrl(r.data.image_key)} alt="" loading="lazy" style="aspect-ratio:3/4;object-fit:cover" onError={(e) => { manualsBlocked = true; (e.target as HTMLImageElement).style.visibility = 'hidden'; }} /> : <span style="display:grid;place-items:center;aspect-ratio:3/4;background:var(--il-bg);color:var(--il-ink)"><Icon name="book" class="chev" /></span>}</span>
            <span class="grow">
              <h3>{r.data.title}</h3>
              <span class="small muted">{r.data.figure} · {r.data.source_name}</span>
              <span class="row" style="margin-top:6px"><Prov p={r.data.provenance} />{r.data.tags.slice(0, 2).map((t) => <span class="small muted">#{t}</span>)}</span>
            </span>
          </a>
        ))}
        {!list.length && <div class="empty">Nothing tagged “{tag}” yet.</div>}
      </div>
    </div>
  );
}

export function RefDetail({ id }: { id: string }) {
  useStore();
  const [full, setFull] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(manualsBlocked);
  const r = get<ReferencePage>(id);
  if (!r) return <div class="empty">Not found. <a href="#/library">Back</a></div>;
  const d = r.data;
  const keys = d.image_keys?.length ? d.image_keys : d.image_key ? [d.image_key] : [];
  return (
    <div class="anim-in">
      <PageHead title={d.title} back="#/library" kicker={d.figure}>
        <div class="row" style="margin-top:8px"><Prov p={d.provenance} onChange={(p) => patch<ReferencePage>(id, { provenance: p })} /><span class="small muted">Source: {d.source_name}</span></div>
      </PageHead>
      <div style="margin:12px 0"><Caveat text={d.caveat} /></div>
      {keys.length && !blocked ? keys.map((k, i) => (
        <div style="margin-top:12px">
          {keys.length > 1 && <div class="kicker">Page {i + 1} of {keys.length}</div>}
          <button type="button" style="all:unset;display:block;cursor:zoom-in;width:100%" onClick={() => setFull(k)} aria-label={`Open page ${i + 1} full size`}>
            <img src={imgUrl(k)} alt={`${d.title}, ${d.figure}, page ${i + 1}`} loading="lazy" onError={() => { manualsBlocked = true; setBlocked(true); }} style="border-radius:12px;border:2px solid var(--line);background:#fff;width:100%" />
          </button>
          <button type="button" class="btn primary block" style="margin-top:10px" onClick={() => setFull(k)}><Icon name="expand" />Open full size (pinch to zoom)</button>
        </div>
      )) : <Placeholder blocked={blocked} />}
      <section class="section">
        <div class="card">
          <div class="kicker">How to read this page</div>
          <p style="margin-bottom:0">{d.how_to_read}</p>
        </div>
      </section>
      <section class="section">
        <div class="kicker" style="margin-bottom:6px">Systems</div>
        <div class="chips">{d.tags.map((t) => <button type="button" class="chip sm" onClick={() => go(`/library/${t}`)}>{t}</button>)}</div>
      </section>
      {full && <ZoomViewer src={imgUrl(full)} title={`${d.title} · ${d.figure}`} foot={`${d.source_name} · general reference, not matched to this VIN`} onClose={() => setFull(null)} />}
    </div>
  );
}
