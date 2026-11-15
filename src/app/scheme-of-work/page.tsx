import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { TOPICS } from '@/lib/topics';

// Teachers plan a whole year before they buy anything, and "Edexcel GCSE
// Business scheme of work" is the query they type when they are handed a new
// class. Nothing on the site answered it, so this page does — every one of the
// 39 sub-topics in specification order, with a homework suggestion per week.
// It is also the page most likely to be linked from a department website,
// which is the only free way to earn domain authority.

const BASE = 'https://www.gcse.business';

export const metadata: Metadata = {
  title: 'Free Edexcel GCSE Business (1BS0) scheme of work — two years, every sub-topic',
  description:
    'A free two-year scheme of work for Edexcel GCSE Business 1BS0: all 39 specification sub-topics in order, week by week, with a homework suggestion for each and assessment points built in. Printable.',
  alternates: { canonical: '/scheme-of-work' },
  openGraph: {
    title: 'Free 1BS0 scheme of work — two years, every sub-topic',
    description:
      'All 39 sub-topics in specification order, week by week, with assessment points and homework suggestions.',
    url: '/scheme-of-work',
    siteName: 'gcsebusiness',
    type: 'article',
    locale: 'en_GB',
  },
};

const YEAR_10 = TOPICS.filter((t) => t.theme === 1);
const YEAR_11 = TOPICS.filter((t) => t.theme === 2);

type Row =
  | { kind: 'week'; week: number; id: string; title: string }
  | { kind: 'assess'; week: number; label: string };
type Block = { title: string; rows: Row[] };

/** One week per sub-topic, then an assessment week at the end of each topic —
 *  the shape most departments already use, generated from the spec data so it
 *  can never drift out of sync with the pages it links to. Week numbers are
 *  assigned here, not while rendering, so a re-render cannot double-count. */
function buildYear(themes: typeof YEAR_10): Block[] {
  let week = 0;
  return themes.map((t) => {
    const rows: Row[] = [];
    for (const s of t.subtopics) {
      week += 1;
      rows.push({ kind: 'week', week, id: s.id, title: s.title });
    }
    week += 1;
    rows.push({ kind: 'assess', week, label: `Assessment — ${t.id} ${t.title}` });
    return { title: `${t.id} ${t.title}`, rows };
  });
}

function YearTable({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/60 bg-card/60">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-foreground/5 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="w-14 px-3 py-2 font-medium">Week</th>
            <th className="px-3 py-2 font-medium">Focus</th>
            <th className="hidden px-3 py-2 font-medium sm:table-cell">Homework</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((b) => (
            <Fragment key={b.title}>
              <tr className="border-t border-white/40">
                <td colSpan={3} className="bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
                  {b.title}
                </td>
              </tr>
              {b.rows.map((r) =>
                r.kind === 'week' ? (
                  <tr key={`w-${r.week}`} className="border-t border-white/30 align-top">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.week}</td>
                    <td className="px-3 py-2">
                      <Link href={`/spec/${r.id}`} className="font-medium underline underline-offset-2">
                        {r.id} {r.title}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                      Set 10 questions on {r.id} — instant marking
                    </td>
                  </tr>
                ) : (
                  <tr key={`a-${r.week}`} className="border-t border-white/30 bg-[var(--accent)]/20">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.week}</td>
                    <td className="px-3 py-2 font-medium" colSpan={2}>
                      {r.label}
                    </td>
                  </tr>
                )
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchemeOfWorkPage() {
  const y10 = buildYear(YEAR_10);
  const y11 = buildYear(YEAR_11);
  const totalWeeks =
    y10.reduce((n, b) => n + b.rows.length, 0) + y11.reduce((n, b) => n + b.rows.length, 0);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Free Edexcel GCSE Business (1BS0) scheme of work',
    description:
      'A two-year scheme of work for Edexcel GCSE Business 1BS0 covering all 39 specification sub-topics with assessment points.',
    author: { '@type': 'Person', name: 'gcsebusiness' },
    publisher: { '@type': 'Organization', name: 'gcsebusiness', url: BASE },
    mainEntityOfPage: `${BASE}/scheme-of-work`,
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Free resource · 1BS0</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          The whole two-year course, week by week.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every one of the 39 sub-topics of Edexcel GCSE (9–1) Business (1BS0), in specification order, with an
          assessment week at the end of each topic and a homework suggestion for each week. {totalWeeks} teaching rows
          across the two years. Print it, adapt it, hand it to an NQT.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing to sign up for and nothing to download — it is all on this page.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Year 10 <span className="text-muted-foreground font-normal">· Theme 1</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Investigating small business — 20 sub-topics across five topics, plus an assessment at the end of each.
        </p>
        <YearTable blocks={y10} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Year 11 <span className="text-muted-foreground font-normal">· Theme 2</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Building a business — 19 sub-topics across five topics. Most departments finish teaching by February and use
          the rest for mocks and past papers.
        </p>
        <YearTable blocks={y11} />
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">Where the revision time goes</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The four calculation-heavy sub-topics — 1.3.2 (revenue, costs and profit), 1.3.3 (cash and cash-flow), 2.4.1
          (business calculations) and 2.3.2 (stock and suppliers) — carry disproportionate marks in both papers and are
          where students lose them. Build a re-teach week for each into the spring term rather than discovering them in
          the mock.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Free calculators for those four live at{' '}
          <Link href="/tools" className="font-medium underline underline-offset-2">
            the tools page
          </Link>
          , including the formulas written out the way the mark scheme wants them.
        </p>
      </section>

      <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">The homework column, automated</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every “set 10 questions on 1.3.3” in the tables above is a real quiz in the bank, tagged to that sub-topic.
          Set it, and it marks itself — students see the explanation, you see who got what.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try questions — no sign-up
          </Link>
          <Link href="/pricing" className="text-sm font-medium underline underline-offset-2">
            £250 a year for the school
          </Link>
        </div>
      </div>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">How to use this</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          It is a sequence, not a straitjacket. Departments that teach in two-week blocks can pair adjacent sub-topics
          (1.2.1 with 1.2.2 works well, as does 2.2.1 with 2.2.2). Departments that start Theme 2 in Year 10 should move
          the 2.1 block forward — nothing after it depends on the Year 10 content.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Print: use your browser’s print option. The tables collapse the homework column on narrow screens, so print
          from a laptop rather than a phone if you want the full width.
        </p>
      </section>
    </MarketingShell>
  );
}
