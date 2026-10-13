// Ground map: every ground point from the owner's manuals, grouped by the AREA the manual names.
// Each area is a dot on the see-through van with a callout box listing its ground points in the manual's own words.
// The dot marks the area, not a measured bolt position. Seen from above: front on the left, driver's side (US left) at the bottom.
import { G_POINTS, W_POINTS, type GroundArea, type GroundPoint } from '../../shared/grounds';

export const OUR_PROBLEM = (g: GroundPoint) => !!g.hits?.length;

// Van drawing box: front x=250 → rear x=950, passenger side y=210 → driver side y=500.
const VAN = 'M330 210 L930 210 Q950 210 950 230 L950 480 Q950 500 930 500 L330 500 L278 492 Q252 486 250 452 L250 258 Q252 224 278 218 Z';

interface Area { label: string; dot: [number, number]; box: [number, number, number]; roof?: boolean }
// box = [x, y, width]; height follows the content.
const AREAS: Partial<Record<GroundArea, Area>> = {
  'lamp-r': { label: 'Right front lamp unit', dot: [262, 228], box: [12, 196, 200] },
  'eng-rf': { label: 'Right front of engine compt', dot: [292, 244], box: [12, 270, 200] },
  'eng-lf': { label: 'Left front of engine compt', dot: [290, 462], box: [12, 350, 200] },
  'lamp-l': { label: 'Left front lamp unit / left front', dot: [262, 484], box: [12, 424, 200] },
  'eng-ls': { label: 'Left side of engine compt', dot: [318, 486], box: [12, 498, 200] },
  'eng-rr': { label: 'Right rear of engine compt', dot: [356, 240], box: [232, 40, 196] },
  'cockpit': { label: 'Cockpit (right footwell)', dot: [420, 262], box: [440, 40, 180] },
  'roof-fc': { label: 'Front center headliner', dot: [440, 355], box: [632, 40, 170], roof: true },
  'roof-lf': { label: 'Left front headliner', dot: [458, 430], box: [814, 40, 160], roof: true },
  'roof': { label: 'Roof (spot not given)', dot: [700, 355], box: [986, 40, 202], roof: true },
  'xmember-r': { label: 'Right rear crossmember', dot: [918, 230], box: [986, 196, 202] },
  'rear-door-l': { label: 'Upper left of left rear door', dot: [944, 462], box: [986, 300, 202] },
  'xmember-l': { label: 'Left rear crossmember', dot: [912, 478], box: [986, 380, 202] },
  'pillar-d-l': { label: 'Left D-pillar', dot: [938, 492], box: [986, 456, 202] },
  'eng-lr': { label: 'Left rear of engine compt', dot: [354, 470], box: [12, 580, 300] },
  'firewall-l': { label: 'Left firewall', dot: [372, 448], box: [324, 580, 150] },
  'seat': { label: 'Driver seat frame', dot: [470, 468], box: [486, 580, 196] },
  'low-left-ctr': { label: 'Lower left center body', dot: [640, 500], box: [694, 580, 180] },
  'low-left': { label: 'Lower left side of vehicle', dot: [790, 500], box: [886, 580, 302] },
};

const CHIP_W = 58, CHIP_H = 24, PAD = 10;

export function GroundMap({ only, sel, onPick, confirmed }: { only?: boolean; sel?: string; onPick?: (id: string) => void; confirmed?: (id: string) => boolean }) {
  const all = [...G_POINTS.map((g) => ({ g, sys: 'G' as const })), ...W_POINTS.map((g) => ({ g, sys: 'W' as const }))]
    .filter(({ g }) => !only || OUR_PROBLEM(g));
  const groups = (Object.keys(AREAS) as GroundArea[]).map((k) => ({ k, a: AREAS[k]!, pts: all.filter(({ g }) => g.area === k) })).filter((x) => x.pts.length);
  return (
    <svg class="xr-svg gm-svg" viewBox="0 0 1200 700" role="img" aria-label="Every ground point from the manuals, grouped by the area each manual names, around a see-through top view of the van">
      <defs><pattern id="gm-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#16263d" stroke-width="1" /></pattern></defs>
      <rect width="1200" height="700" fill="#0a1220" /><rect width="1200" height="700" fill="url(#gm-grid)" />
      {/* van, see-through */}
      <g fill="none" stroke="#5f7fa8" stroke-width="2.2" stroke-linejoin="round">
        <rect x="292" y="198" width="60" height="12" rx="4" fill="#1a2a42" /><rect x="292" y="500" width="60" height="12" rx="4" fill="#1a2a42" />
        <rect x="780" y="198" width="66" height="12" rx="4" fill="#1a2a42" /><rect x="780" y="500" width="66" height="12" rx="4" fill="#1a2a42" />
        <path d={VAN} fill="rgba(95,127,168,.07)" />
        <path d="M376 214 Q366 355 376 496" stroke-width="2" opacity=".8" />
        <path d="M520 214 V496" stroke-width="1.4" opacity=".45" stroke-dasharray="8 6" />
        <rect x="452" y="232" width="56" height="56" rx="10" opacity=".45" /><rect x="452" y="422" width="56" height="56" rx="10" opacity=".45" />
        <rect x="950" y="290" width="8" height="130" rx="3" fill="#1a2a42" />
      </g>
      <path d="M520 500 H930" stroke="#ff9f1c" stroke-width="9" opacity=".16" stroke-linecap="round" />
      <g style="font:700 12px var(--font-body);letter-spacing:.08em" fill="#7f97b4">
        <text x="250" y="184">◄ FRONT</text><text x="950" y="184" text-anchor="end">REAR ►</text>
        <text x="735" y="232" text-anchor="middle">PASSENGER SIDE</text><text x="735" y="530" text-anchor="middle">DRIVER SIDE</text>
        <text x="312" y="360" text-anchor="middle" opacity=".7" style="font-size:10px">ENGINE</text>
        <text x="735" y="390" text-anchor="middle" opacity=".45">CARGO AREA</text>
      </g>
      {groups.map(({ k, a, pts }) => {
        const [bx, by, bw] = a.box;
        const perRow = Math.max(1, Math.floor((bw - PAD * 2 + 6) / (CHIP_W + 6)));
        const rows = Math.ceil(pts.length / perRow);
        const bh = 30 + rows * (CHIP_H + 6) + 4;
        const hot = pts.some(({ g }) => OUR_PROBLEM(g));
        // leader from the nearest box edge to the area dot
        const [dx, dy] = a.dot;
        const ex = Math.max(bx, Math.min(dx, bx + bw)), ey = Math.max(by, Math.min(dy, by + bh));
        return (
          <g>
            <path d={`M${ex} ${ey} L${dx} ${dy}`} stroke={hot ? '#ff8a7f' : '#5f7fa8'} stroke-width="1.6" opacity=".8" stroke-dasharray={a.roof ? '4 3' : undefined} />
            <circle cx={dx} cy={dy} r="9" fill={hot ? 'rgba(255,90,78,.25)' : 'rgba(159,179,200,.18)'} stroke={hot ? '#ff5a4e' : '#9fb3c8'} stroke-width="2" stroke-dasharray={a.roof ? '3 2' : undefined} />
            <circle cx={dx} cy={dy} r="3" fill={hot ? '#ff5a4e' : '#9fb3c8'} />
            <rect x={bx} y={by} width={bw} height={bh} rx="10" fill="#0f1b2d" stroke={hot ? '#ff5a4e' : '#2b4467'} stroke-width={hot ? 2 : 1.5} />
            <text x={bx + PAD} y={by + 19} style="font:800 12px var(--font-body);letter-spacing:.02em" fill={hot ? '#ffd0cb' : '#cfe0ff'}>{a.label}{a.roof ? ' · roof' : ''}</text>
            {pts.map(({ g, sys }, i) => {
              const cx = bx + PAD + (i % perRow) * (CHIP_W + 6), cy = by + 28 + Math.floor(i / perRow) * (CHIP_H + 6);
              const h = OUR_PROBLEM(g), ok = confirmed?.(g.id), picked = sel === g.id;
              return (
                <g class="gm-chip" transform={`translate(${cx} ${cy})`} tabIndex={onPick ? 0 : undefined} role={onPick ? 'button' : undefined}
                  aria-label={`${g.id}: ${g.where}`} onClick={() => onPick?.(g.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick?.(g.id)}>
                  <rect width={CHIP_W} height={CHIP_H} rx={sys === 'G' ? 12 : 4} fill={picked ? '#ffd23f' : h ? '#3a1416' : '#13243d'}
                    stroke={ok ? '#2fd27a' : h ? '#ff5a4e' : '#5f7fa8'} stroke-width={ok ? 3 : 1.8} stroke-dasharray={a.roof ? '3 2' : undefined} />
                  <text x={CHIP_W / 2} y="16.5" text-anchor="middle" style="font:800 12px var(--font-body)" fill={picked ? '#0a1220' : '#e6f0ff'}>{g.id}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      <g style="font:600 11px var(--font-body)" fill="#7f97b4">
        <text x="12" y="690">Round = G-number (System Wiring Diagram Figs. 25-27) · square = W-number (Mercedes ground legend) · red = used by SAM, horn, A/C, trailer, ignition or network</text>
        <text x="1188" y="690" text-anchor="end">Dot = the area the manual names, not the exact bolt</text>
      </g>
    </svg>
  );
}
