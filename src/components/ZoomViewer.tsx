// Full-screen pinch-zoom / pan viewer. Pointer Events only, so it behaves the
// same in Chrome for Android and Safari on iOS.
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon } from './icons';

export function ZoomViewer({ src, title, foot, onClose }: { src: string; title: string; foot?: string; onClose: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const t = useRef({ x: 0, y: 0, s: 1, min: 1 });
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ d: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);
  const [, tick] = useState(0);

  const apply = () => { if (img.current) img.current.style.transform = `translate(${t.current.x}px, ${t.current.y}px) scale(${t.current.s})`; };
  const fit = () => {
    const st = stage.current, im = img.current;
    if (!st || !im || !im.naturalWidth) return;
    const s = Math.min(st.clientWidth / im.naturalWidth, st.clientHeight / im.naturalHeight);
    t.current = { s, min: s, x: (st.clientWidth - im.naturalWidth * s) / 2, y: (st.clientHeight - im.naturalHeight * s) / 2 };
    apply();
  };
  const zoomAt = (factor: number, cx: number, cy: number) => {
    const c = t.current;
    const ns = Math.min(Math.max(c.s * factor, c.min * 0.8), c.min * 12);
    const k = ns / c.s;
    c.x = cx - (cx - c.x) * k; c.y = cy - (cy - c.y) * k; c.s = ns;
    apply();
  };
  const center = () => { const st = stage.current!; return [st.clientWidth / 2, st.clientHeight / 2] as const; };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k); addEventListener('resize', fit);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); removeEventListener('resize', fit); document.body.style.overflow = ''; };
  }, []);

  const rel = (e: PointerEvent) => { const r = stage.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const down = (e: PointerEvent) => {
    stage.current!.setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, rel(e));
    last.current = null;
    if (pts.current.size === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) { const p = rel(e); t.current.s > t.current.min * 1.5 ? fit() : zoomAt(2.5, p.x, p.y); }
      lastTap.current = now;
    }
  };
  const move = (e: PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    const prev = pts.current.get(e.pointerId)!;
    const p = rel(e);
    pts.current.set(e.pointerId, p);
    if (pts.current.size === 1) { t.current.x += p.x - prev.x; t.current.y += p.y - prev.y; apply(); return; }
    const [a, b] = [...pts.current.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    if (last.current) {
      t.current.x += cx - last.current.cx; t.current.y += cy - last.current.cy;
      zoomAt(d / last.current.d, cx, cy);
    }
    last.current = { d, cx, cy };
  };
  const up = (e: PointerEvent) => { pts.current.delete(e.pointerId); last.current = null; };
  const wheel = (e: WheelEvent) => { e.preventDefault(); const p = rel(e as any); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y); };

  return (
    <div class="viewer" role="dialog" aria-modal="true" aria-label={title}>
      <div class="viewer-bar">
        <button type="button" class="icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        <b class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{title}</b>
        <button type="button" class="icon-btn" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.5, ...center())}><Icon name="zoomout" /></button>
        <button type="button" class="icon-btn" aria-label="Zoom in" onClick={() => zoomAt(1.5, ...center())}><Icon name="zoomin" /></button>
        <button type="button" class="icon-btn" aria-label="Fit to screen" onClick={fit}><Icon name="expand" /></button>
      </div>
      <div class="viewer-stage" ref={stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}>
        <img ref={img} src={src} alt={title} draggable={false} onLoad={() => { fit(); tick(1); }} />
      </div>
      <div class="viewer-foot">Pinch or double-tap to zoom · drag to move{foot ? ` · ${foot}` : ''}</div>
    </div>
  );
}
