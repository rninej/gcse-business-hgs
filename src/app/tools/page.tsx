import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { Calculators } from '@/components/marketing/Calculators';

export const metadata: Metadata = {
  title: 'Free GCSE Business calculators — break-even, profit margin, ARR, cash flow',
  description:
    'Four free calculators for Edexcel GCSE Business (1BS0): break-even output and margin of safety, monthly cash flow, gross and net profit margin, and average rate of return. No sign-up.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free GCSE Business calculators',
    description:
      'Break-even, cash flow, profit margin and ARR — the four calculations that lose marks, worked out for you.',
    url: '/tools',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

const FAQ = [
  {
    q: 'How do you calculate break-even output?',
    a: 'Break-even output = fixed costs ÷ (selling price per unit − variable cost per unit). The bracket is the contribution each unit makes towards covering the fixed costs.',
  },
  {
    q: 'What is the margin of safety?',
    a: 'Margin of safety = actual (or budgeted) output − break-even output. It is the number of units sales can fall by before the business starts making a loss.',
  },
  {
    q: 'What is the difference between gross and net profit margin?',
    a: 'Gross profit margin = gross profit ÷ revenue × 100. Net profit margin = net profit ÷ revenue × 100. The gap between them is the running expenses of the business.',
  },
  {
    q: 'How is ARR calculated?',
    a: 'Average rate of return = (average annual profit ÷ initial investment) × 100. Average annual profit is the total profit over the life of the project divided by the number of years.',
  },
];

export default function ToolsPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Free tools · 1BS0</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          The four calculations that cost the most marks.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Break-even, cash flow, profit margins and ARR — type your numbers in and see the working. Free, no sign-up,
          nothing to install.
        </p>
      </div>

      <Calculators />

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">Show the working, not just the answer</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Method marks are usually awarded before the final figure, so write the formula, substitute the numbers, then
          give the answer with its unit. “Contribution = £20 − £12 = £8” earns the mark even if the division afterwards
          goes wrong; “£1,000” on its own does not.
        </p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Each calculator above shows the formula it used at the bottom of the card, which is the line to write in the
          exam.
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Practise the questions behind the numbers</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The quizzes mark themselves and explain every wrong answer — including the calculation ones, where most
          mistakes are a missing unit or a divided-by-the-wrong-thing.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try six questions — no sign-up
          </Link>
          <Link href="/pricing" className="text-sm font-medium underline underline-offset-2">
            £250 a year for the school
          </Link>
        </div>
      </div>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">Common questions</h2>
        <dl className="mt-3 space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4">
              <dt className="text-sm font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </MarketingShell>
  );
}
