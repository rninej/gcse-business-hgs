import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { TOPICS, TOPIC_MAP } from '@/lib/topics';

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = TOPIC_MAP[topic];
  if (!t) return { title: 'Topic not found | gcsebusiness' };
  return {
    title: `${t.id} ${t.title} — free self-marking quiz | Edexcel GCSE Business`,
    description: `What Edexcel GCSE (9–1) Business ${t.id} (${t.title}) covers: ${t.subtopics
      .map((s) => s.title)
      .join(', ')}. Try free self-marking questions on this topic.`,
    alternates: { canonical: `/topics/${t.id}` },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = TOPIC_MAP[topic];
  if (!t) notFound();

  const index = TOPICS.findIndex((x) => x.id === t.id);
  const prev = index > 0 ? TOPICS[index - 1] : null;
  const next = index < TOPICS.length - 1 ? TOPICS[index + 1] : null;

  return (
    <MarketingShell>
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/topics" className="underline hover:text-foreground">
          All topics
        </Link>{' '}
        / <span>{t.id}</span>
      </nav>

      <div className="mt-3 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Theme {t.theme} · Edexcel GCSE (9–1) Business, spec 1BS0
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {t.id} {t.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          This is the official sub-topic breakdown for {t.id} on the current Pearson specification — the same
          numbers your students are examined on, and the same tags every question in the bank carries.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">What {t.id} covers</h2>
        <ul className="mt-3 space-y-3">
          {t.subtopics.map((s) => (
            <li key={s.id} className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4">
              <p className="text-xs font-semibold text-primary">{s.id}</p>
              <p className="mt-0.5 font-medium leading-snug">{s.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.focus}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Set {t.id} homework that marks itself</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every question is tagged to {t.id}, so you can set work on this section alone — or the whole topic with
          one click. Students get instant marking and an explanation; you get the class breakdown.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try questions — no sign-up
          </Link>
          <Link href="/pricing" className="text-sm font-medium underline underline-offset-2">
            See pricing
          </Link>
        </div>
      </section>

      <nav className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/40 pt-5 text-sm">
        {prev ? (
          <Link href={`/topics/${prev.id}`} className="font-medium underline underline-offset-2">
            ← {prev.id} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/topics/${next.id}`} className="font-medium underline underline-offset-2">
            {next.id} {next.title} →
          </Link>
        ) : null}
      </nav>
    </MarketingShell>
  );
}
