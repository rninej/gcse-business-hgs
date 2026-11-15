'use client';

// Free GCSE Business calculators. These exist for search: a student revising
// cash flow or break-even types exactly this into Google, and the pages that
// answer it are the ones that get found. No login, no email wall — the trade is
// that they see who makes it and can try the quizzes.

import { useState } from 'react';

function money(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  return `${sign}£${Math.abs(n).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
}

function units(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-GB', { maximumFractionDigits: 1 });
}

function pct(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-white/30 py-2 last:border-0">
      <span className="text-sm">
        {label}
        {hint ? <span className="block text-[11px] text-muted-foreground">{hint}</span> : null}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 rounded-md border border-white/60 bg-background/70 px-2 py-1 text-right text-sm tabular-nums"
        aria-label={label}
      />
    </label>
  );
}

function Out({ lines }: { lines: Array<[string, string, boolean?]> }) {
  return (
    <dl className="mt-3 space-y-1 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/8 px-3.5 py-2.5 text-sm">
      {lines.map(([k, v, strong]) => (
        <div key={k} className="flex items-baseline justify-between gap-3">
          <dt className={strong ? 'font-semibold' : 'text-muted-foreground'}>{k}</dt>
          <dd className={strong ? 'font-semibold tabular-nums' : 'tabular-nums'}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4 sm:p-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BreakEven() {
  const [fc, setFc] = useState('8000');
  const [price, setPrice] = useState('20');
  const [vc, setVc] = useState('12');
  const [actual, setActual] = useState('');

  const contribution = num(price) - num(vc);
  const be = contribution > 0 ? num(fc) / contribution : NaN;
  const mo = num(actual) - be;

  return (
    <Card title="Break-even calculator">
      <Field label="Fixed costs" value={fc} onChange={setFc} hint="rent, salaries — costs that don’t change with output" />
      <Field label="Selling price per unit" value={price} onChange={setPrice} />
      <Field label="Variable cost per unit" value={vc} onChange={setVc} hint="materials, packaging per item" />
      <Field label="Output you expect to sell" value={actual} onChange={setActual} hint="optional — adds margin of safety" />
      <Out
        lines={[
          ['Contribution per unit', money(contribution)],
          ['Break-even output', `${units(be)} units`, !Number.isFinite(be)],
          ...(Number.isFinite(mo) && Number.isFinite(be)
            ? ([
                ['Margin of safety', `${units(mo)} units`],
                ['Profit at that output', money(contribution * num(actual) - num(fc))],
              ] as Array<[string, string, boolean?]>)
            : []),
        ]}
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        Fixed costs ÷ (price − variable cost per unit). If price is at or below variable cost, the business makes a
        contribution of nothing and can never break even.
      </p>
    </Card>
  );
}

function Margins() {
  const [revenue, setRevenue] = useState('120000');
  const [gp, setGp] = useState('48000');
  const [np, setNp] = useState('21000');

  const rev = num(revenue);
  const gpMargin = (num(gp) / rev) * 100;
  const npMargin = (num(np) / rev) * 100;

  return (
    <Card title="Gross and net profit margin">
      <Field label="Revenue (sales)" value={revenue} onChange={setRevenue} />
      <Field label="Gross profit" value={gp} onChange={setGp} hint="revenue − cost of sales" />
      <Field label="Net profit" value={np} onChange={setNp} hint="gross profit − other expenses" />
      <Out
        lines={[
          ['Gross profit margin', pct(gpMargin)],
          ['Net profit margin', pct(npMargin)],
          ['Mark-up on cost of sales', pct(((num(gp) / Math.max(rev - num(gp), 0.01)) * 100))],
        ]}
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        Margin = profit ÷ revenue × 100. Mark-up is different: it compares profit with cost, which is why a 50% margin
        is a 100% mark-up.
      </p>
    </Card>
  );
}

function Arr() {
  const [total, setTotal] = useState('60000');
  const [years, setYears] = useState('5');
  const [invest, setInvest] = useState('200000');

  const avgAnnual = num(years) > 0 ? num(total) / num(years) : NaN;
  const arr = (avgAnnual / num(invest)) * 100;

  return (
    <Card title="Average rate of return (ARR)">
      <Field label="Total profit over the project" value={total} onChange={setTotal} />
      <Field label="Number of years" value={years} onChange={setYears} />
      <Field label="Initial investment" value={invest} onChange={setInvest} />
      <Out
        lines={[
          ['Average annual profit', money(avgAnnual)],
          ['ARR', pct(arr), true],
        ]}
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        ARR = (average annual profit ÷ initial investment) × 100. Higher is better; compare it with the interest rate on
        a loan or a rival project.
      </p>
    </Card>
  );
}

function CashFlow() {
  const [opening, setOpening] = useState('2500');
  const [inflow, setInflow] = useState('14000');
  const [outflow, setOutflow] = useState('16500');

  const net = num(inflow) - num(outflow);
  const closing = num(opening) + net;

  return (
    <Card title="Cash flow — one month">
      <Field label="Opening balance" value={opening} onChange={setOpening} />
      <Field label="Total cash inflows" value={inflow} onChange={setInflow} hint="cash sales, loans, capital" />
      <Field label="Total cash outflows" value={outflow} onChange={setOutflow} hint="wages, rent, materials" />
      <Out
        lines={[
          ['Net cash flow', money(net)],
          ['Closing balance', money(closing), true],
        ]}
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        Net cash flow = inflows − outflows. Closing balance = opening balance + net cash flow. A negative closing
        balance means the business needs an overdraft that month — even if it is profitable.
      </p>
    </Card>
  );
}

export function Calculators() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <BreakEven />
      <CashFlow />
      <Margins />
      <Arr />
    </div>
  );
}
