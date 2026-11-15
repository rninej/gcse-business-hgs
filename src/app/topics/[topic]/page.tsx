import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { WorkedExample } from '@/components/marketing/WorkedExample';
import { TOPICS, TOPIC_MAP } from '@/lib/topics';
import { examplesForTopic } from '@/data/topicExamples';

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
  const title = `${t.id} ${t.title} — questions and answers | Edexcel GCSE Business`;
  const description = `Edexcel GCSE (9–1) Business ${t.id} (${t.title}): every official sub-topic, plus free worked questions with answers and explanations.`;
  return {
    title,
    description,
    alternates: { canonical: `/topics/${t.id}` },
    openGraph: {
      title,
      description,
      url: `/topics/${t.id}`,
      siteName: 'gcsebusiness',
      type: 'article',
      locale: 'en_GB',
    },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = TOPIC_MAP[topic];
  if (!t) notFound();

  const index = TOPICS.findIndex((x) => x.id === t.id);
  const prev = index > 0 ? TOPICS[index - 1] : null;
  const next = index < TOPICS.length - 1 ? TOPICS[index + 1] : null;
  const examples = examplesForTopic(t.id);

  // FAQPage structured data: the questions are genuine Q&A content, so Google
  // may surface them directly in results — free traffic with no ad spend.
  const faqLd =
    examples.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: examples.map((q) => ({
            '@type': 'Question',
            name: q.stem,
            acceptedAnswer: { '@type': 'Answer', text: q.explain },
          })),
        }
      : null;

  return (
    <MarketingShell>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }}
        />
      ) : null}

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
        <p className="mt-2 text-sm">
          <Link href="/spec" className="font-medium underline underline-offset-2">
            Every sub-topic in the specification, 1.1.1 to 2.5.4 →
          </Link>
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">What {t.id} covers</h2>
        <ul className="mt-3 space-y-3">
          {t.subtopics.map((s) => (
            <li key={s.id}>
              <Link
                href={`/spec/${s.id}`}
                className="block rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-xs font-semibold text-primary">{s.id}</span>
                <span className="mt-0.5 block font-medium leading-snug">{s.title}</span>
                <span className="mt-1.5 block text-sm text-muted-foreground leading-relaxed">{s.focus}</span>
                <span className="mt-2 block text-xs font-medium text-primary underline underline-offset-2">
                  Notes and a worked question on {s.id} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {examples.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.id} questions and answers — free worked examples
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Two questions on {t.id}, exactly as they appear in the bank, with the answer and the explanation a
            student would see after submitting.
          </p>
          <div className="mt-4 space-y-3">
            {examples.map((q, i) => (
              <WorkedExample key={q.id} question={q} index={i + 1} />
            ))}
          </div>
        </section>
      ) : null}

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
            £250 a year for the school
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
