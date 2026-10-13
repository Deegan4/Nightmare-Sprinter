// Small SVG building blocks shared by all illustrations.
import type { ComponentChildren } from 'preact';

export type PinKind = 'part' | 'gnd' | 'hot';
export function Pin({ x, y, n, kind = 'part', pulse, label, s = 1 }: { x: number; y: number; n: string; kind?: PinKind; pulse?: boolean; label?: string; s?: number }) {
  return (
    <g class={`il-pin ${kind}`} transform={`translate(${x} ${y}) scale(${s})`} role={label ? 'img' : undefined} aria-label={label}>
      {pulse && <circle class="pulse" r="13" />}
      <circle class="head" r="13" />
      <text y="0.5">{n}</text>
    </g>
  );
}

/** Text with a solid backing so it stays readable over line art. */
export function Label({ x, y, children, anchor = 'start', size = 'sm' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'; size?: 'sm' | 'md' }) {
  const w = children.length * (size === 'sm' ? 6.6 : 7.8) + 10;
  const h = size === 'sm' ? 19 : 22;
  const x0 = anchor === 'start' ? x : anchor === 'middle' ? x - w / 2 : x - w;
  return (
    <g>
      <rect class="il-label-bg" x={x0} y={y - h / 2} width={w} height={h} rx="4" />
      <text class={`il-text ${size === 'sm' ? 'sm' : ''}`} x={x0 + 5} y={y + (size === 'sm' ? 4.5 : 5.5)}>{children}</text>
    </g>
  );
}

export function Leader({ d }: { d: string }) {
  return <path d={d} class="il-thin" />;
}

/** A yellow handheld multimeter. Jacks: COM (black) at (x+28, y+122), V (red) at (x+62, y+122). */
export function Meter({ x, y, reading, unit = 'V' }: { x: number; y: number; reading: string; unit?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="90" height="136" rx="12" class="il-accent" />
      <rect x="8" y="8" width="74" height="122" rx="8" fill="#2a2d33" />
      <rect x="14" y="14" width="62" height="36" rx="4" class="il-lcd" />
      <text x="45" y="40" class="il-lcd-text" style="font-size:17px">{reading}{unit}</text>
      <circle cx="45" cy="80" r="20" fill="#3b3f47" stroke="#121417" stroke-width="2" />
      <path d="M45 80 L45 63" stroke="#ffc21a" stroke-width="4" stroke-linecap="round" />
      <text x="45" y="72" fill="#fff" font-size="8" text-anchor="middle" font-weight="700" opacity=".0">V</text>
      <text x="66" y="66" fill="#ffc21a" font-size="10" font-weight="700" font-family="sans-serif">V⎓</text>
      <circle cx="28" cy="122" r="6" fill="#111" stroke="#666" stroke-width="2" />
      <circle cx="62" cy="122" r="6" fill="#c62f24" stroke="#666" stroke-width="2" />
      <text x="28" y="110" fill="#ddd" font-size="8" text-anchor="middle" font-family="sans-serif">COM</text>
      <text x="62" y="110" fill="#ddd" font-size="8" text-anchor="middle" font-family="sans-serif">V</text>
    </g>
  );
}

/** Probe tip at the end of a lead. */
export function Probe({ x, y, color, angle = 0 }: { x: number; y: number; color: 'red' | 'black'; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 0 L-3 -8 L-5 -26 L5 -26 L3 -8 Z" fill={color === 'red' ? '#c62f24' : '#1c1d20'} stroke="#121417" stroke-width="1.5" />
      <path d="M0 0 L0 -8" stroke="#bbb" stroke-width="2" />
    </g>
  );
}

export function GroundSym({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} class="il-line">
      <path d="M0 -12 V0 M-14 0 H14 M-9 6 H9 M-4 12 H4" class="il-line" />
    </g>
  );
}

export function Frame({ children, caption, tag = 'Approximate', label, viewBox }: { children: ComponentChildren; caption?: string; tag?: string; label: string; viewBox: string }) {
  return (
    <figure class="illus" style="margin:0">
      <svg viewBox={viewBox} role="img" aria-label={label}>{children}</svg>
      {(caption || tag) && (
        <figcaption class="illus-cap"><span>{caption}</span>{tag && <span class="tag">{tag}</span>}</figcaption>
      )}
    </figure>
  );
}
