import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { WorkedExample } from '@/components/marketing/WorkedExample';
import { SUBTOPICS, SUBTOPIC_MAP, TOPIC_MAP, subtopicTopic } from '@/lib/topics';
import { examplesForSubtopic } from '@/data/topicExamples';
import { FLASHCARD_DECKS } from '@/data/flashcards';
import type { Flashcard } from '@/lib/types';

const BASE = 'https://www.gcse.business';

export function generateStaticParams() {
  return SUBTOPICS.map((s) => ({ subtopic: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}): Promise<Metadata> {
  const { subtopic } = await params;
  const s = SUBTOPIC_MAP[subtopic];
  if (!s) return { title: 'Sub-topic not found | gcsebusiness' };
  const title = `${s.id} ${s.title} — notes, key terms and questions | Edexcel GCSE Business`;
  const description = `${s.id} ${s.title} for Edexcel GCSE Business 1BS0: what the specification covers, the key terms, and a free worked question with the answer explained.`;
  return {
    title,
    description,
    alternates: { canonical: `/spec/${s.id}` },
    openGraph: {
      title: `${s.id} ${s.title}`,
      description,
      url: `/spec/${s.id}`,
      siteName: 'gcsebusiness',
      type: 'article',
      locale: 'en_GB',
    },
  };
}

/** Cards from the parent deck whose wording actually appears in this
 *  sub-topic's spec text. Deterministic and different per sub-topic, so
 *  sibling pages do not carry identical blocks. */
function keyTermsFor(subId: string, title: string, focus: string): Flashcard[] {
  const parentId = subtopicTopic(subId);
  const deck = FLASHCARD_DECKS.find((d) => d.topic === parentId);
  if (!deck) return [];
  const wanted = new Set(`${title} ${focus}`.toLowerCase().match(/[a-z]{5,}/g) ?? []);
  return deck.cards
    .map((card) => {
      const tokens = card.front.toLowerCase().match(/[a-z]{5,}/g) ?? [];
      return { card, hits: tokens.filter((w) => wanted.has(w)).length };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 6)
    .map((x) => x.card);
}

export default async function SubtopicPage({ params }: { params: Promise<{ subtopic: string }> }) {
  const { subtopic } = await params;
  const s = SUBTOPIC_MAP[subtopic];
  if (!s) notFound();

  const parentId = subtopicTopic(s.id);
  const parent = parentId ? TOPIC_MAP[parentId] : undefined;
  if (!parent) notFound();

  const siblings = parent.subtopics;
  const idx = siblings.findIndex((x) => x.id === s.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const terms = keyTermsFor(s.id, s.title, s.focus);
  const example = examplesForSubtopic(s.id)[0];

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Topics', item: `${BASE}/topics` },
        { '@type': 'ListItem', position: 2, name: `${parent.id} ${parent.title}`, item: `${BASE}/topics/${parent.id}` },
        { '@type': 'ListItem', position: 3, name: `${s.id} ${s.title}`, item: `${BASE}/spec/${s.id}` },
      ],
    },
    ...(example
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: example.stem,
                acceptedAnswer: { '@type': 'Answer', text: example.explain },
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/topics" className="underline hover:text-foreground">
          Topics
        </Link>{' '}
        /{' '}
        <Link href={`/topics/${parent.id}`} className="underline hover:text-foreground">
          {parent.id}
        </Link>{' '}
        / <span>{s.id}</span>
      </nav>

      <div className="mt-3 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Theme {parent.theme} · Edexcel GCSE (9–1) Business, spec 1BS0
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {s.id} {s.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Free notes on {s.title.toLowerCase()}, the terms the examiner expects you to use, and a worked question with
          the answer explained. This is one numbered section of the Pearson specification — part of{' '}
          {parent.id} {parent.title}.
        </p>
      </div>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">What {s.id} covers</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.focus}</p>
      </section>

      {terms.length > 0 ? (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-lg font-semibold tracking-tight">Key terms for {s.id}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Definitions in the wording the mark scheme rewards — short enough to learn, exact enough to score.
          </p>
          <dl className="mt-3 space-y-2">
            {terms.map((t) => (
              <div key={t.front} className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-3.5">
                <dt className="text-sm font-semibold">{t.front}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.back}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {example ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{s.id} worked example</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One question from the bank, exactly as a student sees it — with the answer and the explanation that follows
            a submission.
          </p>
          <div className="mt-4">
            <WorkedExample question={example} index={1} />
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Set {s.id} homework that marks itself</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every question in the bank is tagged to its sub-topic, so you can set work on {s.id} alone. Students get
          instant marking and an explanation; you get the class breakdown.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try questions — no sign-up
          </Link>
          <Link href="/tools" className="text-sm font-medium underline underline-offset-2">
            Free calculators
          </Link>
        </div>
      </section>

      <nav className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/40 pt-5 text-sm">
        {prev ? (
          <Link href={`/spec/${prev.id}`} className="font-medium underline underline-offset-2">
            ← {prev.id} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/spec/${next.id}`} className="font-medium underline underline-offset-2">
            {next.id} {next.title} →
          </Link>
        ) : null}
      </nav>

      <p className="mt-4 text-xs text-muted-foreground">
        Back to{' '}
        <Link href={`/topics/${parent.id}`} className="underline hover:text-foreground">
          {parent.id} {parent.title}
        </Link>{' '}
        or{' '}
        <Link href="/spec" className="underline hover:text-foreground">
          all sub-topics
        </Link>
        .
      </p>
    </MarketingShell>
  );
}
