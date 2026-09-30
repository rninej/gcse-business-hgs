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

/* Purplebricks share price — real anchors: £1.89 peak (May 2022), £0.76 the day
   after the £1 sale to Strike was announced (May 2023). Path between is illustrative. */
function SharePrice() {
  const points: [number, number][] = [
    [60, 96], [130, 82], [200, 118], [270, 160], [340, 196], [420, 232], [600, 250],
  ]; // x, y — falling line
  const path = points.map(([x, y]) => `${x},${y}`).join(' L');
  return (
    <Frame caption="Purplebricks PLC · share price — £1.89 at the May 2022 peak, £0.76 after the £1 sale to Strike in May 2023 (path illustrative)">
      <AxisLabels xLabel="Time (May 2022 → May 2023)" yLabel="Share price (£)" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={40} stroke={AX} strokeWidth={1.25} />
      {[0.5, 1.0, 1.5].map((v) => (
        <g key={v}>
          <line x1={56} y1={320 - v * 120} x2={60} y2={320 - v * 120} stroke={AX} />
          <text x={52} y={320 - v * 120 + 3} textAnchor="end" fontSize={10} fill={TXT}>£{v.toFixed(2)}</text>
          <line x1={60} y1={320 - v * 120} x2={620} y2={320 - v * 120} stroke={AX} strokeDasharray="2 5" strokeWidth={0.6} opacity={0.6} />
        </g>
      ))}
      <path d={`M${path}`} fill="none" stroke={C3} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {/* peak marker */}
      <circle cx={60} cy={96} r={6} fill={C1} stroke="var(--card)" strokeWidth={2} />
      <text x={72} y={92} fontSize={10.5} fill={C1} fontWeight="700">£1.89 peak · May 2022</text>
      {/* sale marker */}
      <circle cx={600} cy={250} r={6} fill={C2} stroke="var(--card)" strokeWidth={2} />
      <text x={596} y={236} fontSize={10.5} fill={C2} fontWeight="700" textAnchor="end">£0.76 after £1 sale · May 2023</text>
      {/* value wiped annotation */}
      <text x={330} y={300} fontSize={10} fill={TXT} textAnchor="middle">years of losses and falling sales destroyed most of the company’s value</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Share price</text>
    </Frame>
  );
}

/* Biscuiteers revenue growth bars — £11m 2023/24 projection is the verifiable
   endpoint; earlier bars show the climb (illustrative). */
function LuxGrowth() {
  const years = ['2017', '2019', '2021', '2023/24'];
  const rev = [1.1, 2.2, 5.5, 11.0];
  const X = (i: number) => 118 + i * 136;
  const Y = (v: number) => 316 - (v / 12) * 260;
  return (
    <Frame caption="Biscuiteers Baking Company Ltd · revenue £m — 2023/24 projection £11m, growth of around 400% a year (earlier years illustrative)">
      <AxisLabels xLabel="Year" yLabel="Revenue (£m)" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      <line x1={60} y1={320} x2={60} y2={44} stroke={AX} strokeWidth={1.25} />
      {[3, 6, 9, 12].map((v) => (
        <g key={v}>
          <line x1={56} y1={Y(v)} x2={60} y2={Y(v)} stroke={AX} />
          <text x={52} y={Y(v) + 3} textAnchor="end" fontSize={10} fill={TXT}>£{v}m</text>
          <line x1={60} y1={Y(v)} x2={620} y2={Y(v)} stroke={AX} strokeDasharray="2 5" strokeWidth={0.6} opacity={0.6} />
        </g>
      ))}
      {years.map((y, i) => (
        <g key={y}>
          <rect x={X(i) - 28} y={Y(rev[i])} width={56} height={320 - Y(rev[i])} rx={7} fill={i === years.length - 1 ? C2 : C4} opacity={i === years.length - 1 ? 1 : 0.75} />
          <text x={X(i)} y={Y(rev[i]) - 8} textAnchor="middle" fontSize={11} fill="var(--foreground)" fontWeight="700">£{rev[i].toFixed(1)}m</text>
          <text x={X(i)} y={334} textAnchor="middle" fontSize={10} fill={TXT}>{y}</text>
        </g>
      ))}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Revenue growth</text>
      <text x={X(3) - 120} y={Y(11) - 26} fontSize={10} fill={C2} fontWeight="700">≈ 400% growth a year</text>
      <text x={X(0)} y={120} fontSize={9.5} fill={TXT} textAnchor="middle">founded 2007 ·</text>
      <text x={X(0)} y={133} fontSize={9.5} fill={TXT} textAnchor="middle">hand-iced luxury biscuits</text>
    </Frame>
  );
}

/* Primark store split (2022) — real figures: 408 stores worldwide, 197 in the UK */
function PrimarkStores() {
  const R = 96;
  const cx = 178;
  const cy = 186;
  // UK 197/408 = 48% of the circle, starting at -90°
  const ukSweep = (197 / 408) * 360;
  const rad = (d: number) => (d * Math.PI) / 180;
  const a0 = -90;
  const a1 = a0 + ukSweep;
  const a2 = a0 + 360;
  const p = (a: number) => `${cx + R * Math.cos(rad(a))},${cy + R * Math.sin(rad(a))}`;
  return (
    <Frame caption="Primark stores, 2022 · 408 worldwide, of which 197 (about 48%) are in the UK">
      <path d={`M${cx},${cy} L${p(a0)} A${R},${R} 0 ${ukSweep > 180 ? 1 : 0} 1 ${p(a1)} Z`} fill={C1} stroke="var(--card)" strokeWidth={2} />
      <path d={`M${cx},${cy} L${p(a1)} A${R},${R} 0 ${360 - ukSweep > 180 ? 1 : 0} 1 ${p(a2)} Z`} fill={C4} opacity={0.85} stroke="var(--card)" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={46} fill="var(--card)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={16} fill="var(--foreground)" fontWeight="800">408</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9.5} fill={TXT}>stores worldwide</text>
      <rect x={352} y={96} width={14} height={14} rx={4} fill={C1} stroke={AX} />
      <text x={374} y={107} fontSize={11.5} fill="var(--foreground)" fontWeight="600">UK · 197 stores</text>
      <text x={374} y={122} fontSize={10} fill={TXT}>about 48% of all stores</text>
      <rect x={352} y={156} width={14} height={14} rx={4} fill={C4} opacity={0.85} stroke={AX} />
      <text x={374} y={167} fontSize={11.5} fill="var(--foreground)" fontWeight="600">Rest of world · 211</text>
      <text x={374} y={182} fontSize={10} fill={TXT}>incl. Ireland, Spain, USA</text>
      <text x={374} y={216} fontSize={10} fill={TXT}>All owned by ABF —</text>
      <text x={374} y={230} fontSize={10} fill={TXT}>no franchise stores,</text>
      <text x={374} y={244} fontSize={10} fill={TXT}>no online store</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Where Primark sells</text>
    </Frame>
  );
}

/* Quality control vs quality assurance — inspection happens at the END */
function QualityFlow() {
  const stages: [string, string][] = [
    ['Mix', 'flour, water, yeast'],
    ['Bake', 'wood-fired oven'],
    ['Inspect', 'head baker checks every loaf'],
    ['Sell', 'perfect loaves full price'],
  ];
  const box = (x: number, y: number, w: number, title: string, sub: string, hot = false) => (
    <g>
      <rect x={x} y={y} width={w} height={52} rx={10} fill={hot ? C2 : 'var(--secondary)'} stroke={hot ? C2 : AX} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize={12} fill={hot ? 'white' : 'var(--foreground)'} fontWeight={hot ? 800 : 600}>{title}</text>
      <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize={8.5} fill={hot ? 'white' : TXT}>{sub}</text>
    </g>
  );
  const arrow = (x1: number, x2: number, y: number) => (
    <g>
      <line x1={x1} y1={y} x2={x2 - 9} y2={y} stroke={AX} strokeWidth={1.5} />
      <path d={`M${x2 - 9},${y - 5} L${x2},${y} L${x2 - 9},${y + 5} Z`} fill={AX} />
    </g>
  );
  return (
    <Frame caption="The Dough House · checking happens at the very end of the process — that is quality control">
      {box(60, 132, 108, stages[0][0], stages[0][1])}
      {arrow(168, 206, 158)}
      {box(206, 132, 108, stages[1][0], stages[1][1])}
      {arrow(314, 352, 158)}
      {box(352, 132, 118, stages[2][0], stages[2][1], true)}
      {arrow(470, 508, 158)}
      {box(508, 132, 92, stages[3][0], stages[3][1])}
      {/* end-of-process bracket */}
      <path d="M352,206 L352,222 L470,222 L470,206" fill="none" stroke={C2} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={411} y={240} textAnchor="middle" fontSize={10.5} fill={C2} fontWeight="700">inspection at the END</text>
      <text x={411} y={256} textAnchor="middle" fontSize={9.5} fill={TXT}>faults found only after the money is spent</text>
      {/* rejects note */}
      <path d="M411,258 C411,282 320,270 262,286" fill="none" stroke={C3} strokeWidth={1.25} strokeDasharray="4 3" />
      <text x={262} y={300} textAnchor="middle" fontSize={9.5} fill={C3}>failed loaves → sold cheap at close</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Production process</text>
      <text x={64} y={88} fontSize={10} fill={TXT}>Quality assurance would instead check the work at EVERY stage:</text>
      <text x={64} y={103} fontSize={9.5} fill={TXT}>right ingredients → right temperature → right bake time → right finish</text>
    </Frame>
  );
}

/* Internal vs external sources of finance (The Dough House expansion) */
function FinanceSources() {
  const item = (x: number, y: number, w: number, label: string, sub: string, hot = false) => (
    <g>
      <rect x={x} y={y} width={w} height={44} rx={9} fill="var(--card)" stroke={hot ? C1 : AX} strokeWidth={hot ? 1.75 : 1} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={11} fill={hot ? C1 : 'var(--foreground)'} fontWeight={hot ? 700 : 500}>{label}</text>
      <text x={x + w / 2} y={y + 33} textAnchor="middle" fontSize={8.5} fill={TXT}>{sub}</text>
    </g>
  );
  return (
    <Frame caption="The Dough House needs £175,000 for a second shop in Portsmouth · the bank loan is external — already inside the business would be internal">
      <rect x={60} y={64} width={252} height={236} rx={12} fill={C1} opacity={0.07} stroke={C1} strokeDasharray="5 4" />
      <text x={186} y={92} textAnchor="middle" fontSize={12} fill={C1} fontWeight="800">INTERNAL</text>
      <text x={186} y={107} textAnchor="middle" fontSize={9} fill={TXT}>money already in the business</text>
      {item(80, 122, 212, 'Retained profit', 'years of profitable trading — kept in the business', true)}
      {item(80, 176, 212, 'Owners’ savings', 'personal capital put in by the owners', false)}
      {item(80, 230, 212, 'Sell assets', 'e.g. an unused van or old oven', false)}
      <rect x={336} y={64} width={244} height={236} rx={12} fill={C3} opacity={0.06} stroke={C3} strokeDasharray="5 4" />
      <text x={458} y={92} textAnchor="middle" fontSize={12} fill={C3} fontWeight="800">EXTERNAL</text>
      <text x={458} y={107} textAnchor="middle" fontSize={9} fill={TXT}>money from outside the business</text>
      {item(356, 122, 204, 'Bank loan · £175,000', 'repaid with interest over years', true)}
      {item(356, 176, 204, 'Overdraft', 'small, short-term, high interest', false)}
      {item(356, 230, 204, 'New investors', 'sell a share of the business', false)}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Sources of finance</text>
      <text x={320} y={326} textAnchor="middle" fontSize={10} fill={TXT}>if the bank says no → the internal route is retained profit</text>
    </Frame>
  );
}

/* Automation productivity — illustrative comparison for Amazon-style picking */
function Automation() {
  const rows: [string, number, string][] = [
    ['Manual picking', 58, C4],
    ['Robots + pickers', 118, C1],
  ];
  const Y = (i: number) => 130 + i * 78;
  return (
    <Frame caption="Fulfilment centres · items picked per worker-hour (illustrative) — robots carry the shelves to people, who stay at their stations">
      <AxisLabels xLabel="Items picked per worker-hour" yLabel="" />
      <line x1={60} y1={320} x2={620} y2={320} stroke={AX} strokeWidth={1.25} />
      {[50, 100, 150].map((v) => (
        <g key={v}>
          <line x1={60 + v * 3.6} y1={320} x2={60 + v * 3.6} y2={330} stroke={AX} />
          <text x={60 + v * 3.6} y={344} textAnchor="middle" fontSize={10} fill={TXT}>{v}</text>
          <line x1={60 + v * 3.6} y1={100} x2={60 + v * 3.6} y2={320} stroke={AX} strokeDasharray="2 5" strokeWidth={0.6} opacity={0.5} />
        </g>
      ))}
      {rows.map(([label, v, color], i) => (
        <g key={label}>
          <text x={60} y={Y(i) - 14} fontSize={11} fill="var(--foreground)" fontWeight="600">{label}</text>
          <rect x={60} y={Y(i) - 6} width={v * 3.6} height={40} rx={7} fill={color} opacity={i === 0 ? 0.55 : 0.95} />
          <text x={60 + v * 3.6 + 10} y={Y(i) + 20} fontSize={12} fill={i === 0 ? TXT : C1} fontWeight="700">{v} items</text>
        </g>
      ))}
      <path d="M 342 156 C 372 150 380 186 384 200" fill="none" stroke={C2} strokeWidth={2} strokeDasharray="5 4" />
      <path d="M 380 190 L 384 202 L 392 194" fill="none" stroke={C2} strokeWidth={2} strokeLinecap="round" />
      <text x={398} y={186} fontSize={10.5} fill={C2} fontWeight="700">roughly double the output</text>
      <text x={398} y={200} fontSize={9.5} fill={TXT}>per worker, fewer handling errors</text>
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Productivity with automation</text>
      <text x={60} y={290} fontSize={9.5} fill={TXT}>people still pick and pack the orders — robots need maintenance too</text>
    </Frame>
  );
}

/* Two routes into Shrewsbury — open from scratch vs buy The Bread Basket */
function GrowthPaths() {
  const bar = (y: number, label: string, months: number, w: number, color: string, sub: string, hot = false) => (
    <g>
      <text x={60} y={y - 10} fontSize={11.5} fill={hot ? color : 'var(--foreground)'} fontWeight={hot ? 800 : 600}>{label}</text>
      <rect x={60} y={y} width={w} height={30} rx={7} fill={color} opacity={hot ? 1 : 0.55} />
      <text x={60 + w + 10} y={y + 20} fontSize={11} fill={color} fontWeight="700">{months} month{months === 1 ? '' : 's'}*</text>
      <text x={60} y={y + 48} fontSize={9} fill={TXT}>{sub}</text>
    </g>
  );
  return (
    <Frame caption="The Old Mill Bakery wants a presence in Shrewsbury · *timings illustrative — the takeover brings shops, staff and customers on day one">
      <AxisLabels xLabel="Time to be up and running in Shrewsbury" yLabel="" />
      <line x1={60} y1={296} x2={620} y2={296} stroke={AX} strokeWidth={1.25} />
      {[3, 6, 9, 12].map((m) => (
        <g key={m}>
          <line x1={60 + m * 42} y1={296} x2={60 + m * 42} y2={306} stroke={AX} />
          <text x={60 + m * 42} y={320} textAnchor="middle" fontSize={10} fill={TXT}>{m} mo</text>
        </g>
      ))}
      {bar(96, 'Option A · Open a new shop from scratch', 12, 12 * 42, C4, 'find a site → negotiate a lease → fit it out → hire and train staff → build up customers')}
      {bar(196, 'Option B · Buy The Bread Basket (two shops)', 1, 42, C1, 'premises, equipment, trained staff and an existing customer base all come on day one', true)}
      <text x={64} y={36} fontSize={11} fill={TXT} fontWeight="600">Speed of growth: organic vs takeover</text>
      <text x={470} y={70} fontSize={10} fill={C1} fontWeight="700">instant presence in a new town</text>
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
  shareprice: SharePrice,
  luxgrowth: LuxGrowth,
  primarkstores: PrimarkStores,
  qcflow: QualityFlow,
  financesources: FinanceSources,
  automation: Automation,
  growpaths: GrowthPaths,
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

/* Progress over time — one dot per submitted quiz, oldest → newest */
export function ProgressLine({
  points,
  height = 190,
}: {
  points: { at: number; pct: number; title: string; mode?: string }[];
  height?: number;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No completed quizzes yet — the graph appears after the first submission.</p>;
  }

  const W = 640;
  const H = 190;
  const PAD_L = 30;
  const PAD_R = 14;
  const PAD_T = 14;
  const PAD_B = 26;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;

  const n = points.length;
  const x = (i: number) => (n === 1 ? PAD_L + iw / 2 : PAD_L + (i / (n - 1)) * iw);
  const y = (pct: number) => PAD_T + ih * (1 - Math.max(0, Math.min(100, pct)) / 100);

  const line = points.map((p, i) => `${x(i)},${y(p.pct)}`).join(' ');
  const area = `${PAD_L},${PAD_T + ih} ${line} ${x(n - 1)},${PAD_T + ih}`;

  const fmt = (t: number) =>
    new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // x labels: first, middle, last (never crowd, never duplicate — n=1 gives [0])
  const labelIdx = [...new Set(n <= 2 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1])];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Score per quiz over time">
        <defs>
          <linearGradient id="pgline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke={AX} strokeWidth={1} opacity={v === 0 ? 0.9 : 0.45} strokeDasharray={v === 0 ? undefined : '3 4'} />
            <text x={PAD_L - 6} y={y(v) + 3.5} textAnchor="end" fontSize={9.5} fill={TXT}>
              {v}
            </text>
          </g>
        ))}
        {/* area + line */}
        <polygon points={area} fill="url(#pgline)" />
        <polyline points={line} fill="none" stroke="var(--chart-1)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.pct)} r={n > 24 ? 2.6 : 3.4} fill="var(--card)" stroke="var(--chart-1)" strokeWidth={2}>
              <title>{`${p.title} — ${p.pct}% (${fmt(p.at)})`}</title>
            </circle>
          </g>
        ))}
        {/* x labels */}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={9.5} fill={TXT}>
            {fmt(points[i].at)}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
        <span>{n} completed quiz{n === 1 ? '' : 'zes'}</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--chart-1)]" /> score %
        </span>
      </div>
    </div>
  );
}
