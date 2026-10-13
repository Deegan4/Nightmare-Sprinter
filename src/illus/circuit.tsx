// "How the three dead systems connect": an infographic built ONLY from facts in
// the PRD / source pages. It shows connections, not physical positions, and
// invents no fuse numbers, pins or wire colours. Colours = circuit type.
import { Frame, GroundSym } from './parts';

const C = { power: '#d33a2c', horn: '#1f6fd1', ac: '#16894a', trailer: '#8a3fc7', can: '#c27c00' };

function Tag({ x, y, t }: { x: number; y: number; t: 'SOURCE' | 'HYPOTHESIS' | 'CONFIRMED' | 'REPORTED' | 'UNKNOWN' }) {
  const col = { SOURCE: 'var(--p-source)', HYPOTHESIS: 'var(--p-hypothesis)', CONFIRMED: 'var(--p-confirmed)', REPORTED: 'var(--p-reported)', UNKNOWN: 'var(--p-unknown)' }[t];
  const w = t.length * 6.4 + 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="15" rx="3" fill="var(--il-fill)" stroke={col} stroke-width="1.5" stroke-dasharray={t === 'HYPOTHESIS' ? '3 2' : undefined} />
      <text x={w / 2} y="11" text-anchor="middle" style={`font:700 10px var(--font-body);fill:${col};letter-spacing:.04em`}>{t}</text>
    </g>
  );
}

function Box({ x, y, w, h, title, sub, color }: { x: number; y: number; w: number; h: number; title: string; sub?: string; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="7" class="il-body" style={color ? `stroke:${color}` : ''} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 5)} class="il-text mid">{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 14} class="il-text mid sm" style="font-weight:600">{sub}</text>}
    </g>
  );
}

function Panel({ x, y, w, h, color, title }: { x: number; y: number; w: number; h: number; color: string; title: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={color} fill-opacity=".08" stroke={color} stroke-width="2" />
      <rect x={x} y={y} width={w} height="24" rx="10" fill={color} />
      <rect x={x} y={y + 14} width={w} height="10" fill={color} />
      <text x={x + 10} y={y + 17} style="font:700 14px var(--font-display);fill:#fff;letter-spacing:.06em">{title}</text>
    </g>
  );
}

const wire = (color: string, w = 4) => `stroke:${color};stroke-width:${w};fill:none;stroke-linecap:round;stroke-linejoin:round`;

export function CircuitOverview() {
  return (
    <Frame viewBox="0 0 400 712" tag="From PRD + source pages" label="How the horn, A/C and trailer circuits connect to the SAM, its power fuses, the CAN B network and shared grounds"
      caption="Colours = circuit type, not wire colours">
      <rect x="0" y="0" width="400" height="44" fill="#121417" />
      <text x="200" y="20" text-anchor="middle" style="font:700 17px var(--font-display);fill:#ffc21a;letter-spacing:.04em">HOW THE 3 DEAD SYSTEMS CONNECT</text>
      <text x="200" y="36" text-anchor="middle" style="font:600 11.5px var(--font-body);fill:#f1ede4">2012 Sprinter 906 · connections, not physical layout</text>

      {/* power */}
      <Panel x={8} y={54} w={384} h={110} color={C.power} title="POWER FEED TO THE SAM" />
      <Box x={18} y={92} w={86} h={58} title="BATTERY" sub="14.05 V run" />
      <path d="M104 112 H124 V104 H140 M124 112 V140 H140" style={wire(C.power)} />
      <Box x={140} y={84} w={150} h={34} title="150 A · F59.5 · term. 30" color={C.power} />
      <Box x={140} y={124} w={150} h={34} title="80 A · F59.3 · term. 30z" color={C.power} />
      <Tag x={300} y={93} t="SOURCE" />
      <text x="300" y="128" class="il-text sm">test with</text>
      <text x="300" y="142" class="il-text sm">volt drop</text>
      <path d="M290 101 H296 M290 141 H296" style={wire(C.power, 3)} />
      <path d="M215 158 V186" style={wire(C.power)} />

      {/* SAM */}
      <rect x="60" y="186" width="280" height="74" rx="10" class="il-accent" />
      <text x="200" y="210" text-anchor="middle" style="font:700 19px var(--font-display);fill:#121417">SAM / SRB (body control)</text>
      <text x="200" y="228" text-anchor="middle" style="font:600 12px var(--font-body);fill:#121417">horn relay lives here · CAN B gateway</text>
      <text x="92" y="248" style="font:600 12px var(--font-body);fill:#121417">refurbished unit · coding:</text>
      <Tag x={252} y={237} t="UNKNOWN" />

      {/* horn */}
      <path d="M100 260 V300" style={wire(C.horn)} />
      <Panel x={8} y={280} w={330} h={92} color={C.horn} title="HORN" />
      <Box x={20} y={312} w={92} h={44} title="Horn relay" sub="(in SAM)" color={C.horn} />
      <path d="M112 334 H150" style={wire(C.horn)} />
      <path d="M150 316 l26 -10 v56 l-26 -10 z" fill="var(--il-fill2)" stroke={C.horn} stroke-width="2.5" />
      <text x="163" y="368" class="il-text mid sm">horn</text>
      <path d="M176 334 H214 V342" style="stroke:var(--il-gnd);stroke-width:4;fill:none" />
      <GroundSym x={214} y={354} />
      <text x="232" y="320" class="il-text sm">ground W9/6</text>
      <text x="232" y="335" class="il-text sm" style="font-weight:600">L front lamp ground,</text>
      <text x="232" y="349" class="il-text sm" style="font-weight:600">shared: SRB, engine, ESP</text>
      <Tag x={232} y={353} t="SOURCE" />

      {/* CAN B */}
      <path d="M320 260 V398" style={wire(C.can, 4)} stroke-dasharray="8 5" />
      <path d="M40 398 H360" style={wire(C.can, 6)} stroke-dasharray="10 6" />
      <rect x="128" y="384" width="144" height="26" rx="13" fill="var(--il-fill)" stroke={C.can} stroke-width="2.5" />
      <text x="200" y="402" text-anchor="middle" style={`font:700 14px var(--font-display);fill:${C.can}`}>CAN B NETWORK</text>
      <text x="348" y="276" class="il-text sm end" style={`fill:${C.can}`}>bus</text>
      <path d="M100 398 V428 M300 398 V428" style={wire(C.can, 4)} stroke-dasharray="8 5" />

      {/* A/C */}
      <Panel x={8} y={420} w={186} h={196} color={C.ac} title="A/C (FRONT ONLY)" />
      <Box x={18} y={452} w={166} h={42} title="A/C control module" sub="scan: listed OK" color={C.ac} />
      <Tag x={120} y={496} t="REPORTED" />
      <path d="M100 494 V530" style={wire(C.ac)} />
      <Box x={18} y={530} w={166} h={42} title="Compressor" sub="solenoid control valve?" color={C.ac} />
      <Tag x={104} y={574} t="HYPOTHESIS" />
      <circle cx="30" cy="596" r="7" fill="#1d1a12" stroke="var(--accent)" stroke-width="2" />
      <text x="42" y="600" class="il-text sm">oil in compressor plug</text>
      <Tag x={20} y={604} t="CONFIRMED" />

      {/* trailer */}
      <Panel x={206} y={420} w={186} h={196} color={C.trailer} title="TRAILER LIGHTS" />
      <Box x={216} y={452} w={166} h={42} title="Trailer unit" sub="on CAN B" color={C.trailer} />
      <path d="M240 494 V512" style="stroke:var(--il-gnd);stroke-width:4" />
      <GroundSym x={240} y={524} />
      <text x="256" y="514" class="il-text sm">W71/3 seat base</text>
      <text x="256" y="530" class="il-text sm">+ left footwell</text>
      <path d="M216 552 H382" class="il-thin" opacity=".4" />
      <circle cx="234" cy="580" r="15" fill="var(--il-fill2)" stroke={C.trailer} stroke-width="2.5" />
      <circle cx="234" cy="580" r="4" fill={C.trailer} />
      <text x="256" y="572" class="il-text sm">socket terminal 4 =</text>
      <text x="256" y="587" class="il-text sm">constant 12 V (20 A)</text>
      <Tag x={256} y={594} t="SOURCE" />

      {/* legend + takeaway */}
      <g transform="translate(8 628)">
        <rect width="384" height="74" rx="10" class="il-body" />
        {[['Power', C.power], ['Horn', C.horn], ['A/C', C.ac], ['Trailer', C.trailer], ['CAN B', C.can]].map(([t, c], i) => (
          <g transform={`translate(${12 + i * 74} 18)`}><rect width="20" height="6" y="-4" rx="3" fill={c} /><text x="25" y="3" class="il-text sm">{t}</text></g>
        ))}
        <text x="12" y="44" class="il-text sm">All three share: the SAM, its power fuses, CAN B</text>
        <text x="12" y="62" class="il-text sm">and grounds. Test those first: Plan steps 2–5.</text>
      </g>
    </Frame>
  );
}
