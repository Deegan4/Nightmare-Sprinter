// Which symptoms each suspect could explain. Drawn from suspect.symptom_links (HYPOTHESIS data).
import type { Rec, Suspect } from '../../shared/types';
import { Frame } from './parts';

const SYM = [
  { key: 'horn', label: 'HORN', x: 70 },
  { key: 'ac', label: 'A/C', x: 200 },
  { key: 'trailer', label: 'TRAILER', x: 330 },
];
const ICON: Record<string, string> = {
  horn: 'M-12 -4v8h6l13 9V-13L-6 -4zM12 -6a8 8 0 0 1 0 12',
  ac: 'M0 -16v32M-14 -8l28 16M-14 8l28 -16',
  trailer: 'M-16 -10h22v14h-22zM6 0h8l4 4M-10 8a3 3 0 1 0 0.1 0M0 8a3 3 0 1 0 0.1 0',
};

export function SymptomMap({ suspects, onPick }: { suspects: Rec<Suspect>[]; onPick: (id: string) => void }) {
  const n = suspects.length;
  const xs = suspects.map((_, i) => 40 + (i * 320) / Math.max(1, n - 1));
  return (
    <Frame viewBox="0 0 400 270" tag="Hypothesis" label="Diagram: which suspects could explain the horn, A/C and trailer failures" caption="Lines = what each suspect could explain">
      {suspects.map((s, i) => s.data.symptom_links.map((k) => {
        const sym = SYM.find((y) => y.key === k);
        if (!sym) return null;
        const off = s.data.state === 'ruled_out';
        return <path d={`M${sym.x} 84 C ${sym.x} 140, ${xs[i]} 140, ${xs[i]} 186`} class={off ? 'il-dash' : 'il-line'} style={off ? 'opacity:.35' : s.data.state === 'leaning' || s.data.state === 'confirmed' ? 'stroke:var(--accent);stroke-width:5' : 'stroke-width:2'} />;
      }))}
      {SYM.map((s) => (
        <g transform={`translate(${s.x} 50)`}>
          <circle r="34" class="il-body" style="stroke-width:3" />
          <path d={ICON[s.key]} transform="translate(0 -6) scale(.9)" fill="none" stroke="var(--il-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <text y="20" class="il-text mid sm">{s.label}</text>
          <g transform="translate(24 -24)"><circle r="11" fill="var(--il-hot)" stroke="#121417" stroke-width="2" /><path d="M-4 -4l8 8M4 -4l-8 8" stroke="#fff" stroke-width="2.5" /></g>
        </g>
      ))}
      {suspects.map((s, i) => {
        const st = s.data.state;
        return (
          <g transform={`translate(${xs[i]} 212)`} tabIndex={0} role="button" aria-label={`${s.data.title}: ${st.replace('_', ' ')}`} style="cursor:pointer"
            onClick={() => onPick(s.id)} onKeyDown={(e) => e.key === 'Enter' && onPick(s.id)}>
            <rect x="-38" y="-26" width="76" height="52" rx="10"
              class={st === 'leaning' || st === 'confirmed' ? 'il-accent' : 'il-body'} style={st === 'ruled_out' ? 'opacity:.4;stroke-dasharray:4 4' : st === 'untested' ? 'stroke-dasharray:6 4' : ''} />
            <text y="-2" class="il-text mid sm" style={st === 'leaning' || st === 'confirmed' ? 'fill:#121417' : ''}>{s.data.short}</text>
            <text y="15" class="il-text mid sm" style={`font-size:11px;opacity:.8;${st === 'leaning' || st === 'confirmed' ? 'fill:#121417' : ''}`}>{st.replace('_', ' ').toUpperCase()}</text>
          </g>
        );
      })}
      <text x="200" y="266" class="il-text mid sm" opacity=".7">tap a suspect</text>
    </Frame>
  );
}
