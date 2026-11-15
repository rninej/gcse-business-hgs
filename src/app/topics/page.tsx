import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { TOPICS } from '@/lib/topics';

export const metadata: Metadata = {
  title: 'Every Edexcel GCSE Business topic, 1.1 to 2.5 | gcsebusiness',
  description:
    'The full Edexcel GCSE (9–1) Business (1BS0) specification, topic by topic — 1.1 Enterprise to 2.5 Human resources — with the official sub-topics and a free self-marking quiz for each.',
  alternates: { canonical: '/topics' },
};

export default function TopicsPage() {
  const themes: Array<{ theme: 1 | 2; title: string; blurb: string }> = [
    { theme: 1, title: 'Theme 1 — Investigating small business', blurb: 'The paper 1 half of the specification.' },
    { theme: 2, title: 'Theme 2 — Building a business', blurb: 'The paper 2 half of the specification.' },
  ];

  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">The specification</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Every topic, 1.1 to 2.5 — and a free quiz for each.
        </h1>
        <p className="mt-3 text-muted-foreground">
          The whole of Edexcel GCSE (9–1) Business (1BS0), laid out by the official sub-topic ids your students are
          examined on. Pick a topic to see exactly what it covers and try questions on it.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {themes.map((t) => (
          <section key={t.theme}>
            <h2 className="text-lg font-semibold tracking-tight">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.blurb}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {TOPICS.filter((topic) => topic.theme === t.theme).map((topic) => (
                <li key={topic.id}>
                  <Link
                    href={`/topics/${topic.id}`}
                    className="block h-full rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-xs font-semibold text-primary">{topic.id}</span>
                    <span className="mt-1 block font-medium leading-snug">{topic.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {topic.subtopics.length} sub-topics · {topic.subtopics.map((s) => s.id).join(', ')}
                    </span>
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
        <Link href="/pricing" className="text-sm font-medium underline underline-offset-2">
          Pricing
        </Link>
      </div>
    </MarketingShell>
  );
}
