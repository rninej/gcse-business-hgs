'use client';

// Hand-crafted SVG diagrams (accuracy over stock imagery) + score/integrity meters.
// All data shown matches the question banks that reference these diagrams.

import type { DiagramKey, RiskBand, RiskSignal } from '@/lib/types';
import { cn } from '@/lib/utils';

const AX = 'var(--border)';
const TXT = 'var(--muted-foreground)';
const C1 = 'var(--chart-1)';
const C2 = 'var(--chart-2)';
const C3 = 'var(--chart-3)';
const C4 = 'var(--chart-4)';

function Frame({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="w-full rounded-xl border bg-card p-3 sm:p-4">
      <svg viewBox="0 0 640 360" className="w-full h-auto" role="img">
        {children}
      </svg>
      {caption ? (
        <figcaption className="text-center text-xs text-muted-foreground mt-2">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

const tick = (x: number, y = 316, len = 6) => (
  <line x1={x} y1={y} x2={x} y2={y + len} stroke={AX} strokeWidth={1} />
);

function AxisLabels({ xLabel, yLabel }: { xLabel: string; yLabel: string }) {
  return (
    <>
      <text x={332} y={345} textAnchor="middle" fontSize={11} fill={TXT}>{xLabel}</text>
      <text x={16} y={180} textAnchor="middle" fontSize={11} fill={TXT} transform="rotate(-90 16 180)">{yLabel}</text>
    </>
  );
}

/* Break-even chart for The Dough House (price £2.50, VC £1.00, fixed £4,500/mo) */
function BreakEven() {
  // x: 0..6000 loaves -> 60..600px ; y: £0..£15,000 -> 320..40px
  const X = (loaves: number) => 60 + (loaves / 6000) * 540;
  const Y = (gbp: number) => 320 - (gbp / 15000) * 280;
  const g = (n: number) => n.toLocaleString('en-GB');
  const ticks = [0, 1000, 2000, 3000, 4000, 5000, 6000].map((l) => (
    <g key={l}>
      {tick(X(l))}
      <text x={X(l)} y={332} textAnchor="middle" fontSize={10} fill={TXT}>{g(l)}</text>
    </g>
  ));
  const yTicks = [0, 3000, 6000, 9000, 12000, 15000].map((v) => (
    <g key={v}>
      <line x1={56} y1={Y(v)} x2={60} y2={Y(v)} stroke={AX} strokeWidth={1} />
      <text x={52} y={Y(v) + 3} textAnchor="end" fontSize={10} fill={TXT}>£{g(v)}</text>
    </g>
  ));
  return (
    <Frame caption="The Dough House · price £2.50, variable cost £1.00/loaf, fixed costs £4,500/month">
      <AxisLabels xLabel="Output (loaves per month)" yLabel="Costs and revenue (£)" />
      {ticks}
      {yTicks}
      {/* grid */}
      {[1000, 2000, 3000, 4000, 5000].map((l) => (
        <line key={l} x1={X(l)} y1={40} x2={X(l)} y2={320} stroke={AX} strokeWidth={0.5} strokeDasharray="2 4" opacity={0.5} />
      ))}
      {/* fixed costs */}
      <line x1={60} y1={Y(4500)} x2={600} y2={Y(4500)} stroke={C4} strokeWidth={2} strokeDasharray="7 5" />
      <text x={604} y={Y(4500) + 3} fontSize={10} fill={C4} textAnchor="end" transform={`translate(-6,-8)`}>Fixed costs £4,500</text>
      {/* total costs */}
      <line x1={60} y1={Y(4500)} x2={600} y2={Y(10500)} stroke={C3} strokeWidth={2.5} />
      <text x={596} y={Y(10500) - 8} fontSize={11} fill={C3} textAnchor="end" fontWeight="600">Total costs</text>
      {/* revenue */}
      <line x1={60} y1={320} x2={600} y2={Y(15000)} stroke={C1} strokeWidth={2.5} />
      <text x={596} y={Y(15000) + 12} fontSize={11} fill={C1} textAnchor="end" fontWeight="600">Revenue</text>
      {/* break-even point */}
      <circle cx={X(3000)} cy={Y(7500)} r={6} fill={C2} stroke="var(--card)" strokeWidth={2} />
      <line x1={X(3000)} y1={Y(7500)} x2={X(3000)} y2={320} stroke={C2} strokeWidth={1.25} strokeDasharray="4 4" />
      <line x1={60} y1={Y(7500)} x2={X(3000)} y2={Y(7500)} stroke={C2} strokeWidth={1.25} strokeDasharray="4 4" />
      <text x={X(3000)} y={Y(7500) - 14} textAnchor="middle" fontSize={11} fill={C2} fontWeight="700">Break-even</text>
      <text x={X(3000) + 4} y={Y(7500) - 1} textAnchor="start" fontSize={10} fill={TXT}>3,000 loaves · £7,500</text>
      {/* margin of safety */}
      <line x1={X(3000)} y1={300} x2={X(4200)} y2={300} stroke={C1} strokeWidth={2} />
      <line x1={X(3000)} y1={295} x2={X(3000)} y2={305} stroke={C1} strokeWidth={2} />
      <line x1={X(4200)} y1={295} x2={X(4200)} y2={305} stroke={C1} strokeWidth={2} />
      <text x={(X(3000) + X(4200)) / 2} y={292} textAnchor="middle" fontSize={10} fill={C1} fontWeight="600">Margin of safety (1,200)</text>
      {/* current output marker */}
      <line x1={X(4200)} y1={Y(10500)} x2={X(4200)} y2={320} stroke={TXT} strokeWidth={1} strokeDasharray="3 5" opacity={0.8} />
      <text x={X(4200) - 6} y={340} textAnchor="end" fontSize={10} fill={TXT}>current 4,200</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Break-even chart</text>
    </Frame>
  );
}

/* Product life cycle */
function PLC() {
  const path = 'M60,300 C110,298 130,288 160,276 C200,260 210,210 260,168 C310,128 330,118 380,108 C440,98 480,96 520,112 C560,130 580,170 600,196';
  const ext = 'M520,112 C560,96 580,84 604,74';
  return (
    <Frame caption="Sales against time · the dotted line shows an extension strategy after an update">
      <AxisLabels xLabel="Time" yLabel="Sales (£)" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={40} stroke={AX} strokeWidth={1.25} />
      {[40, 80, 120, 160, 200, 240, 280].map((yv) => tick(60, yv, 6))}
      {/* stage separators */}
      {[160, 280, 460, 540].map((x) => (
        <line key={x} x1={x} y1={60} x2={x} y2={320} stroke={AX} strokeDasharray="3 5" strokeWidth={0.75} opacity={0.7} />
      ))}
      <path d={path} fill="none" stroke={C1} strokeWidth={3} strokeLinecap="round" />
      <path d={ext} fill="none" stroke={C2} strokeWidth={2.5} strokeDasharray="6 5" strokeLinecap="round" />
      {/* stage labels */}
      <text x={106} y={52} textAnchor="middle" fontSize={10.5} fill={TXT}>Development</text>
      <text x={218} y={52} textAnchor="middle" fontSize={10.5} fill={TXT}>Introduction</text>
      <text x={368} y={52} textAnchor="middle" fontSize={10.5} fill={TXT} fontWeight="600">Growth</text>
      <text x={500} y={52} textAnchor="middle" fontSize={10.5} fill={TXT}>Maturity</text>
      <text x={590} y={52} textAnchor="middle" fontSize={10.5} fill={TXT}>Decline</text>
      {/* annotations */}
      <text x={128} y={300} fontSize={10} fill={TXT}>no sales yet, high set-up costs</text>
      <text x={300} y={132} fontSize={10} fill={C1}>sales rising fast, profit improving</text>
      <text x={470} y={86} fontSize={10} fill={TXT}>sales peak, strong competition</text>
      <text x={576} y={176} fontSize={10} fill={C3}>sales falling</text>
      <text x={560} y={64} fontSize={10} fill={C2} fontWeight="600">extension strategy</text>
    </Frame>
  );
}

/* Cash flow forecast (grouped bars + closing balance line) */
function CashFlow() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const inflow = [9.0, 8.5, 10.5, 9.5, 11.0, 10.0];
  const outflow = [10.5, 8.0, 9.0, 9.5, 10.5, 9.5];
  const closing = [0.5, 1.0, 2.5, 2.5, 3.0, 3.5];
  const X = (i: number) => 96 + i * 88;
  const Y = (v: number) => 320 - (v / 12) * 260;
  return (
    <Frame caption="Rise & Shine Ltd · illustrative six-month cash flow forecast (£000s)">
      <AxisLabels xLabel="Month" yLabel="£000s" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={44} stroke={AX} strokeWidth={1.25} />
      {[3, 6, 9, 12].map((v) => (
        <g key={v}>
          <line x1={56} y1={Y(v)} x2={60} y2={Y(v)} stroke={AX} />
          <text x={52} y={Y(v) + 3} textAnchor="end" fontSize={10} fill={TXT}>{v}</text>
        </g>
      ))}
      {months.map((m, i) => {
        const x = X(i);
        return (
          <g key={m}>
            <rect x={x - 16} y={Y(inflow[i])} width={15} height={320 - Y(inflow[i])} rx={3} fill={C1} />
            <rect x={x + 2} y={Y(outflow[i])} width={15} height={320 - Y(outflow[i])} rx={3} fill={C3} opacity={0.85} />
            <text x={x} y={334} textAnchor="middle" fontSize={10} fill={TXT}>{m}</text>
            <text x={x - 8} y={Y(inflow[i]) - 5} textAnchor="middle" fontSize={9} fill={C1}>{inflow[i]}</text>
            <text x={x + 10} y={Y(outflow[i]) - 5} textAnchor="middle" fontSize={9} fill={C3}>{outflow[i]}</text>
          </g>
        );
      })}
      {/* closing balance line */}
      <polyline
        points={closing.map((v, i) => `${X(i) - 0},${Y(v)}`).join(' ')}
        fill="none"
        stroke={C2}
        strokeWidth={2.5}
        strokeDasharray="7 5"
      />
      {closing.map((v, i) => (
        <circle key={i} cx={X(i)} cy={Y(v)} r={4} fill={C2} stroke="var(--card)" strokeWidth={1.5} />
      ))}
      <text x={X(0) - 6} y={Y(0.5) - 12} fontSize={10} fill={C2} fontWeight="600">closing balance</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Cash flow forecast</text>
      <rect x={470} y={40} width={12} height={12} rx={3} fill={C1} />
      <text x={488} y={50} fontSize={10} fill={TXT}>inflows</text>
      <rect x={534} y={40} width={12} height={12} rx={3} fill={C3} opacity={0.85} />
      <text x={552} y={50} fontSize={10} fill={TXT}>outflows</text>
    </Frame>
  );
}

/* Organisational structure */
function OrgChart() {
  const box = (x: number, y: number, w: number, label: string, hot = false) => (
    <g>
      <rect x={x} y={y} width={w} height={34} rx={8} fill={hot ? C1 : 'var(--secondary)'} stroke={hot ? C1 : AX} />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" fontSize={10.5} fill={hot ? 'white' : 'var(--foreground)'} fontWeight={hot ? 700 : 500}>{label}</text>
    </g>
  );
  const link = (x1: number, y1: number, x2: number, y2: number) => (
    <path d={`M${x1},${y1} L${x1},${(y1 + y2) / 2} L${x2},${(y1 + y2) / 2} L${x2},${y2}`} fill="none" stroke={AX} strokeWidth={1.25} />
  );
  return (
    <Frame caption="Fernfield Foods Ltd · a tall, functional structure with four layers">
      <AxisLabels xLabel="" yLabel="" />
      {box(268, 44, 104, 'Managing Director', true)}
      {link(320, 78, 108, 116)}{link(320, 78, 320, 116)}{link(320, 78, 532, 116)}
      {box(44, 116, 128, 'Operations Director')}
      {box(256, 116, 128, 'Marketing Director')}
      {box(468, 116, 128, 'Finance Director')}
      {link(108, 150, 64, 188)}{link(108, 150, 152, 188)}
      {link(320, 150, 276, 188)}{link(320, 150, 364, 188)}
      {box(8, 188, 112, 'Production Mgr')}
      {box(96, 188, 112, 'Quality Mgr')}
      {box(220, 188, 112, 'Sales Manager')}
      {box(308, 188, 132, 'Digital Marketing Mgr')}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Organisational structure</text>
      <text x={470} y={250} fontSize={10} fill={TXT}>Span of control: 3</text>
      <text x={470} y={266} fontSize={10} fill={TXT}>Layers: 4 → tall structure</text>
      <text x={470} y={282} fontSize={10} fill={TXT}>Slow communication, close supervision</text>
    </Frame>
  );
}

/* Market share donut (illustrative UK grocery) */
function MarketShare() {
  const segs: [string, number, string][] = [
    ['Tesco', 25, C1],
    ['Sainsbury’s', 15, C2],
    ['Asda', 14, C3],
    ['Aldi', 10, C4],
    ['Lidl', 8, 'oklch(0.45 0.08 90)'],
    ['Others', 28, 'var(--secondary)'],
  ];
  const total = segs.reduce((s, [, v]) => s + v, 0);
  const R = 92;
  const cx = 190;
  const cy = 190;
  let acc = -90;
  const arcs: React.ReactNode[] = [];
  for (const [name, v, color] of segs) {
    const a0 = acc;
    const a1 = acc + (v / total) * 360;
    acc = a1;
    const rad = (d: number) => (d * Math.PI) / 180;
    const x0 = cx + R * Math.cos(rad(a0));
    const y0 = cy + R * Math.sin(rad(a0));
    const x1 = cx + R * Math.cos(rad(a1));
    const y1 = cy + R * Math.sin(rad(a1));
    const large = a1 - a0 > 180 ? 1 : 0;
    arcs.push(
      <path
        key={name}
        d={`M${cx},${cy} L${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} Z`}
        fill={color}
        stroke="var(--card)"
        strokeWidth={2}
      />
    );
  }
  return (
    <Frame caption="Illustrative UK grocery market share · a concentrated, competitive market">
      <svg width="0" height="0" />
      {arcs}
      <circle cx={cx} cy={cy} r={44} fill="var(--card)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={13} fill="var(--foreground)" fontWeight="700">Oligopoly</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9.5} fill={TXT}>few big firms dominate</text>
      {segs.map(([name, v, color], i) => {
        const ly = 92 + i * 40;
        return (
          <g key={name}>
            <rect x={352} y={ly - 11} width={14} height={14} rx={4} fill={color} stroke={AX} />
            <text x={374} y={ly} fontSize={11} fill="var(--foreground)">{name}</text>
            <text x={374} y={ly + 14} fontSize={10} fill={TXT}>{v}% share</text>
          </g>
        );
      })}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Market share</text>
    </Frame>
  );
}

/* Revenue growth bars */
function GrowthChart() {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const rev = [0.8, 1.4, 2.6, 4.1, 5.2, 6.0];
  const X = (i: number) => 100 + i * 86;
  const Y = (v: number) => 316 - (v / 7) * 260;
  return (
    <Frame caption="Rise & Shine Ltd · revenue £m — organic growth by opening new branches">
      <AxisLabels xLabel="Year" yLabel="Revenue (£m)" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={44} stroke={AX} strokeWidth={1.25} />
      {[2, 4, 6].map((v) => (
        <g key={v}>
          <line x1={56} y1={Y(v)} x2={60} y2={Y(v)} stroke={AX} />
          <text x={52} y={Y(v) + 3} textAnchor="end" fontSize={10} fill={TXT}>£{v}m</text>
          <line x1={60} y1={Y(v)} x2={620} y2={Y(v)} stroke={AX} strokeDasharray="2 5" strokeWidth={0.6} opacity={0.6} />
        </g>
      ))}
      {years.map((y, i) => (
        <g key={y}>
          <rect x={X(i) - 20} y={Y(rev[i])} width={40} height={320 - Y(rev[i])} rx={6} fill={i === years.length - 1 ? C1 : C4} opacity={i === years.length - 1 ? 1 : 0.75} />
          <text x={X(i)} y={Y(rev[i]) - 7} textAnchor="middle" fontSize={10.5} fill="var(--foreground)" fontWeight="600">£{rev[i].toFixed(1)}m</text>
          <text x={X(i)} y={334} textAnchor="middle" fontSize={10} fill={TXT}>{y}</text>
        </g>
      ))}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Revenue growth</text>
      <text x={430} y={70} fontSize={10} fill={C1} fontWeight="600">+650% in five years</text>
    </Frame>
  );
}

/* Economies of scale LRAC */
function Economies() {
  const path = 'M70,90 C150,95 190,180 260,228 C310,260 330,262 380,262 C430,262 470,240 520,196 C560,160 580,120 600,84';
  return (
    <Frame caption="Long-run average costs fall, flatten, then rise as the business grows too big to manage">
      <AxisLabels xLabel="Output" yLabel="Average cost per unit (£)" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={40} stroke={AX} strokeWidth={1.25} />
      {[8, 16, 24, 32, 40].map((v) => (
        <g key={v}>
          <line x1={56} y1={320 - v * 6.4} x2={60} y2={320 - v * 6.4} stroke={AX} />
          <text x={52} y={320 - v * 6.4 + 3} textAnchor="end" fontSize={10} fill={TXT}>£{v}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke={C1} strokeWidth={3} strokeLinecap="round" />
      <text x={128} y={128} fontSize={10.5} fill={C1} fontWeight="700" transform="rotate(38 128 128)">Economies of scale</text>
      <text x={560} y={140} fontSize={10.5} fill={C3} fontWeight="700" transform="rotate(-33 560 140)">Diseconomies</text>
      <circle cx={380} cy={262} r={6} fill={C2} stroke="var(--card)" strokeWidth={2} />
      <line x1={380} y1={262} x2={380} y2={320} stroke={C2} strokeDasharray="4 4" strokeWidth={1.25} />
      <text x={380} y={296} textAnchor="middle" fontSize={10.5} fill={C2} fontWeight="700">minimum efficient scale</text>
      <text x={380} y={310} textAnchor="middle" fontSize={9.5} fill={TXT}>lowest cost per unit — £8</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Average cost curve</text>
    </Frame>
  );
}

const MAP: Record<DiagramKey, () => React.JSX.Element> = {
  breakeven: BreakEven,
  plc: PLC,
  cashflow: CashFlow,
  orgchart: OrgChart,
  marketshare: MarketShare,
  growthchart: GrowthChart,
  economies: Economies,
};

export function Diagram({ k, className }: { k: DiagramKey; className?: string }) {
  const C = MAP[k];
  if (!C) return null;
  return (
    <div className={cn('my-3', className)}>
      <C />
    </div>
  );
}

/* Score ring */
export function ScoreRing({ pct, label = 'score', size = 132 }: { pct: number; label?: string; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const stroke = pct >= 80 ? 'var(--success)' : pct >= 55 ? 'var(--chart-1)' : pct >= 40 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${pct}% ${label}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx={60} cy={60} r={r} fill="none" stroke="var(--secondary)" strokeWidth={10} />
        <circle
          cx={60}
          cy={60}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{Math.round(pct)}<span className="text-lg">%</span></span>
        <span className="text-[11px] text-muted-foreground -mt-1">{label}</span>
      </div>
    </div>
  );
}

/* Integrity risk meter — teacher only */
export function RiskMeter({
  score,
  band,
  signals,
  compact,
}: {
  score: number;
  band: RiskBand;
  signals?: RiskSignal[];
  compact?: boolean;
}) {
  const color =
    band === 'low' ? 'var(--success)' : band === 'moderate' ? 'var(--warn)' : band === 'elevated' ? 'oklch(0.72 0.16 55)' : 'var(--danger)';
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="relative h-2.5 flex-1 rounded-full overflow-hidden bg-secondary">
          <div className="absolute inset-0 flex">
            <div className="h-full" style={{ width: '20%', background: 'var(--success)', opacity: 0.45 }} />
            <div className="h-full" style={{ width: '25%', background: 'var(--warn)', opacity: 0.45 }} />
            <div className="h-full" style={{ width: '25%', background: 'oklch(0.72 0.16 55)', opacity: 0.5 }} />
            <div className="h-full" style={{ width: '30%', background: 'var(--danger)', opacity: 0.45 }} />
          </div>
          <div
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] shadow"
            style={{ left: `${Math.max(2, Math.min(98, score))}%`, borderColor: color, background: 'var(--card)' }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>
          {score}%
        </span>
      </div>
      {!compact && signals && signals.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {signals.map((s) => (
            <li key={s.label} className="text-xs text-muted-foreground flex justify-between gap-2">
              <span>· {s.label}</span>
              <span className="tabular-nums">+{s.points}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {!compact && (!signals || signals.length === 0) ? (
        <p className="mt-1.5 text-xs text-[var(--success)]">No unusual activity detected</p>
      ) : null}
    </div>
  );
}

/* Topic bar list */
export function BarList({
  items,
  emptyText = 'No data yet',
}: {
  items: { label: string; pct: number; sub?: string }[];
  emptyText?: string;
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const tone = it.pct >= 80 ? 'var(--success)' : it.pct >= 55 ? 'var(--chart-1)' : it.pct >= 40 ? 'var(--warn)' : 'var(--danger)';
        return (
          <li key={it.label}>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-sm truncate">{it.label}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: tone }}>{it.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${it.pct}%`, background: tone }} />
            </div>
            {it.sub ? <p className="text-xs text-muted-foreground mt-1">{it.sub}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
