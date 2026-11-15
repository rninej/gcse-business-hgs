import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { TOPICS } from '@/lib/topics';

const BASE = 'https://www.gcse.business';

export const metadata: Metadata = {
  title: 'Edexcel GCSE Business specification 1BS0 — every sub-topic',
  description:
    'Every sub-topic of Edexcel GCSE (9–1) Business (1BS0), 1.1.1 to 2.5.4, each with free notes, key terms and a worked question with the answer explained.',
  alternates: { canonical: '/spec' },
  openGraph: {
    title: 'Edexcel GCSE Business 1BS0 — every sub-topic',
    description: 'All 39 spec sub-topics, each with free notes and a worked question.',
    url: '/spec',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

export default function SpecIndexPage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">The specification, sub-topic by sub-topic</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          All 39 sub-topics of Edexcel GCSE Business.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every numbered section of the Pearson specification (1BS0), from 1.1.1 to 2.5.4. Each page has what the spec
          says, the terms you are expected to use, and a worked question with the answer explained.
        </p>
      </div>

      <div className="mt-8 space-y-7">
        {TOPICS.map((t) => (
          <section key={t.id}>
            <h2 className="text-lg font-semibold tracking-tight">
              <span className="text-primary">{t.id}</span> {t.title}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {t.subtopics.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/spec/${s.id}`}
                    className="flex items-baseline gap-2 rounded-lg border border-white/60 bg-card/60 px-3.5 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="font-semibold text-primary tabular-nums">{s.id}</span>
                    <span className="leading-snug">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/demo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try six questions — no sign-up
        </Link>
        <Link href="/tools" className="text-sm font-medium underline underline-offset-2">
          Free calculators
        </Link>
        <Link href="/scheme-of-work" className="text-sm font-medium underline underline-offset-2">
          Free scheme of work
        </Link>
      </div>
    </MarketingShell>
  );
}
