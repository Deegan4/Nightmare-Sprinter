// Three-quarter front view of a high-roof Sprinter van (stylised; no positions claimed).
export function Van34({ pins = [] as { n: string; x: number; y: number }[] }) {
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="2012 Sprinter 2500 high-roof van, three-quarter front view">
      <ellipse cx="160" cy="182" rx="140" ry="10" fill="var(--il-ink)" opacity=".12" />
      {/* roof */}
      <path d="M30 52 L62 30 L262 14 L282 20 L108 36 Z" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="2" stroke-linejoin="round" />
      {/* side */}
      <path d="M108 36 L282 20 L284 148 L128 162 Z" fill="var(--il-fill)" stroke="var(--il-ink)" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M170 31 L172 154 M176 30 L178 153" stroke="var(--il-ink)" stroke-width="1.2" opacity=".5" />
      <path d="M118 46 L162 42 L163 92 L122 96 Z" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="2" />
      <path d="M185 98 L280 90" stroke="var(--il-ink)" stroke-width="1.2" opacity=".4" />
      <rect x="146" y="100" width="12" height="3.5" rx="1.5" fill="var(--il-ink)" />
      {/* front face */}
      <path d="M30 52 L108 36 L128 162 L24 172 Z" fill="var(--il-fill)" stroke="var(--il-ink)" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M36 60 L104 46 L112 100 L40 110 Z" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="2" />
      <path d="M44 66 L66 62" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round" />
      <path d="M40 110 L112 100 L118 124 L32 136 Z" fill="var(--il-fill)" stroke="var(--il-ink)" stroke-width="1.5" />
      <path d="M42 132 L108 123 L111 140 L44 149 Z" fill="var(--il-fill3)" stroke="var(--il-ink)" stroke-width="2" />
      <path d="M48 137 L106 129 M49 143 L107 135" stroke="var(--il-ink)" stroke-width="1.2" opacity=".6" />
      <path d="M26 128 L42 126 L43 141 L25 143 Z" fill="#fff6c8" stroke="var(--il-ink)" stroke-width="1.8" />
      <path d="M109 119 L121 117 L123 131 L111 133 Z" fill="#fff6c8" stroke="var(--il-ink)" stroke-width="1.8" />
      <path d="M22 152 L126 141 L128 162 L24 174 Z" fill="var(--il-fill3)" stroke="var(--il-ink)" stroke-width="2" />
      <path d="M112 70 L104 66 L102 84 L112 86 Z" fill="var(--il-fill2)" stroke="var(--il-ink)" stroke-width="1.8" />
      {/* wheels */}
      <ellipse cx="148" cy="162" rx="13" ry="19" fill="var(--il-ink)" /><ellipse cx="148" cy="162" rx="5" ry="8" fill="var(--il-fill2)" />
      <ellipse cx="254" cy="152" rx="12" ry="18" fill="var(--il-ink)" /><ellipse cx="254" cy="152" rx="5" ry="7.5" fill="var(--il-fill2)" />
      <ellipse cx="40" cy="174" rx="12" ry="8" fill="var(--il-ink)" />
      {pins.map((p) => (
        <g transform={`translate(${p.x} ${p.y})`}>
          <circle r="9" fill="#fff" stroke="#1f3b63" stroke-width="2" />
          <text text-anchor="middle" dominant-baseline="central" style="font:700 11px var(--font-display);fill:#1f3b63">{p.n}</text>
        </g>
      ))}
    </svg>
  );
}
