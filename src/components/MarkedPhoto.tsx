// Real photos of THIS van with numbered markers placed by a person.
// This is how locations become CONFIRMED instead of approximate.
import { useState } from 'preact/hooks';
import type { Photo, PhotoMarker, Zone } from '../../shared/types';
import { usePhotoUrl } from '../lib/photo';
import { get, logEvent, patch, useStore } from '../lib/store';
import { Icon } from './icons';
import { Prov, Sheet, ago } from './ui';

function Markers({ list, onTap }: { list: PhotoMarker[]; onTap?: (i: number) => void }) {
  return (
    <>
      {list.map((m, i) => (
        <button type="button" class="photo-marker" style={`left:${m.x * 100}%;top:${m.y * 100}%`} aria-label={`${i + 1}: ${m.label}`}
          onClick={(e) => { e.stopPropagation(); onTap?.(i); }}>{i + 1}</button>
      ))}
    </>
  );
}

export function MarkedPhoto({ id, zone }: { id: string; zone?: Zone }) {
  useStore();
  const url = usePhotoUrl(id);
  const [edit, setEdit] = useState(false);
  const p = get<Photo>(id);
  if (!p || !url) return null;
  const marks = p.data.markers ?? [];
  return (
    <figure class="card" style="margin:0;padding:10px">
      <div class="marked-wrap"><img src={url} alt={p.data.caption || 'Photo of the van'} loading="lazy" /><Markers list={marks} /></div>
      <figcaption style="margin-top:8px">
        <div class="row"><Prov p="CONFIRMED" /><span class="small muted">{p.data.caption || 'Photo'} · {p.created_by} · {ago(p.created_at)}</span></div>
        {marks.length > 0 && <ol class="small" style="margin:8px 0 0;padding-left:22px">{marks.map((m) => <li><b>{m.label}</b></li>)}</ol>}
        <button type="button" class="btn sm block" style="margin-top:8px" onClick={() => setEdit(true)}><Icon name="pin" />{marks.length ? 'Edit markers' : 'Mark where things are on this photo'}</button>
      </figcaption>
      {edit && <MarkerEditor id={id} url={url} zone={zone} onClose={() => setEdit(false)} />}
    </figure>
  );
}

const short = (s: string) => s.split(/[:(]/)[0].trim();

function MarkerEditor({ id, url, zone, onClose }: { id: string; url: string; zone?: Zone; onClose: () => void }) {
  const p = get<Photo>(id)!;
  const [marks, setMarks] = useState<PhotoMarker[]>(p.data.markers ?? []);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [custom, setCustom] = useState('');
  const suggestions = zone ? [...zone.parts, ...zone.ground_points, ...zone.fuses].map(short) : [];
  const tap = (e: MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPending({ x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) });
  };
  const add = (label: string) => { if (!pending || !label.trim()) return; setMarks([...marks, { ...pending, label: label.trim() }]); setPending(null); setCustom(''); };
  const save = async () => {
    await patch<Photo>(id, { markers: marks });
    await logEvent('zone', 'photo', id, `Marked ${marks.length} location${marks.length === 1 ? '' : 's'} on a photo: ${marks.map((m) => m.label).join(', ')}`);
    onClose();
  };
  return (
    <Sheet title="Mark the photo" onClose={onClose}>
      <p class="small" style="margin-top:0"><b>Tap the photo</b> exactly where the part is, then pick what it is. Only mark what you can actually see.</p>
      <div class="marked-wrap" onClick={tap} style="cursor:crosshair">
        <img src={url} alt="Tap to place a marker" />
        <Markers list={marks} />
        {pending && <span class="photo-marker pending" style={`left:${pending.x * 100}%;top:${pending.y * 100}%`}>{marks.length + 1}</span>}
      </div>
      {pending && (
        <div class="card" style="margin-top:10px">
          <div class="kicker">What is marker {marks.length + 1}?</div>
          <div class="chips" style="margin-top:6px">{suggestions.map((s) => <button type="button" class="chip sm" onClick={() => add(s)}>{s}</button>)}</div>
          <div class="row" style="margin-top:8px;flex-wrap:nowrap">
            <input class="input" value={custom} placeholder="Or type a name" onInput={(e) => setCustom((e.target as HTMLInputElement).value)} />
            <button type="button" class="btn primary sm" onClick={() => add(custom)}>Add</button>
          </div>
        </div>
      )}
      {marks.length > 0 && (
        <ul class="list" style="margin-top:10px">
          {marks.map((m, i) => (
            <li class="row" style="padding:6px 0;border-top:1px solid var(--line);flex-wrap:nowrap">
              <span class="photo-marker static">{i + 1}</span><span class="grow">{m.label}</span>
              <button type="button" class="icon-btn" aria-label={`Remove marker ${i + 1}`} onClick={() => setMarks(marks.filter((_, j) => j !== i))}><Icon name="trash" /></button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" class="btn primary block" style="margin-top:12px" onClick={save}><Icon name="check" />Save markers</button>
    </Sheet>
  );
}
