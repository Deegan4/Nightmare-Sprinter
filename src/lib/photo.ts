import type { Photo } from '../../shared/types';
import { idbGet, idbPut } from './idb';
import { logEvent, save, status, uid } from './store';
import { useEffect, useState } from 'preact/hooks';

const MAX = 1600;

/** Resize to max 1600 px and JPEG ~0.8 on the phone before anything is stored or sent. */
export async function resize(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as any).catch(() => null);
  let w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  if (bmp) {
    w = bmp.width; h = bmp.height; draw = (c, cw, ch) => c.drawImage(bmp, 0, 0, cw, ch);
  } else {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    w = img.naturalWidth; h = img.naturalHeight; draw = (c, cw, ch) => c.drawImage(img, 0, 0, cw, ch);
    URL.revokeObjectURL(url);
  }
  const scale = Math.min(1, MAX / Math.max(w, h));
  const cw = Math.round(w * scale), ch = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  draw(canvas.getContext('2d')!, cw, ch);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.8));
  return { blob, width: cw, height: ch };
}

export async function addPhoto(file: Blob, links: Partial<Photo>, caption = ''): Promise<string> {
  const { blob, width, height } = await resize(file);
  const id = uid('pho-');
  await idbPut('blobs', id, { blob, uploaded: status.auth === 'demo' });
  await save<Photo>('photo', { caption, width, height, uploaded: false, ...links }, id);
  await logEvent('photo', 'photo', id, caption ? `Added a photo: ${caption}` : 'Added a photo');
  return id;
}

const urlCache = new Map<string, string>();
export function usePhotoUrl(id?: string): string | undefined {
  const [url, set] = useState<string | undefined>(id ? urlCache.get(id) : undefined);
  useEffect(() => {
    if (!id) return;
    if (urlCache.has(id)) { set(urlCache.get(id)); return; }
    let live = true;
    idbGet<{ blob: Blob }>('blobs', id).then((e) => {
      const u = e?.blob ? URL.createObjectURL(e.blob) : `/api/photos/${encodeURIComponent(id)}`;
      urlCache.set(id, u);
      if (live) set(u);
    });
    return () => { live = false; };
  }, [id]);
  return url;
}
