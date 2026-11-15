import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { SCHOOL_PLAN } from '@/lib/plan';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Edexcel GCSE Business homework that marks itself',
  description:
    'Use Edexcel GCSE Business self-marking homework free: email only, no card, no trial clock, every class and every feature. The £250 school licence is only for a school that wants to adopt it formally.',
  alternates: { canonical: '/free' },
  openGraph: {
    title: 'Free for every teacher, no card',
    description: 'Every class, every feature, free. Email only, no trial clock. The licence is for whole-school adoption.',
    url: '/free',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

const TRIAL_INCLUDES = [
  'Every class you teach — no limit during the trial',
  'All 245 questions across every topic, 1.1 to 2.5',
  'Instant marking with an explanation on every question',
  'Class analytics: scores, topic gaps, question-level breakdown',
  'Timed quizzes, due dates, CSV export and integrity watch',
  'AI question writing on any sub-topic',
  'No card, no invoice, no call — an email address is the whole sign-up',
];

const LICENCE_ADDS = [
  'Unlimited classes for every business teacher, after the trial',
  'AI question writing, kept on',
  'One invoice a year and one DPA covering the school',
  'Nothing deleted when the trial ends — the work stays',
];

export default function FreePage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Free</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Free for every teacher. No card, no clock.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sign up with an email address and use the whole product on real classes for as long as you like. Nothing is
          charged, no card details are ever asked for, and there is nothing to cancel or expire. A school that wants
          to adopt it formally takes the {SCHOOL_PLAN.price} {SCHOOL_PLAN.cadence} licence — that adds the invoice, the
          DPA and the whole-school rollout, not access.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/#create"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Start using it — free
          </Link>
          <Link href="/demo" className="rounded-md border border-foreground/15 px-4 py-2.5 text-sm font-medium hover:bg-foreground/5">
            Try six questions first
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold tracking-tight">What you get, free</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {TRIAL_INCLUDES.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {SCHOOL_PLAN.label} — {SCHOOL_PLAN.price} {SCHOOL_PLAN.cadence}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LICENCE_ADDS.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/upgrade" className="mt-4 inline-block text-sm font-medium underline underline-offset-2">
            How the licence works, step by step →
          </Link>
        </div>
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight">What the licence is for</h2>
        <p className="mt-1 text-sm text-muted-foreground">The honest version, because finding out later is worse:</p>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            'Every class, every topic and every marking feature stays free — nothing expires',
            `The ${SCHOOL_PLAN.price} ${SCHOOL_PLAN.cadence} licence is for a school that wants one invoice, a signed DPA and a formal rollout`,
            'It does not unlock features you cannot already use',
            'No card is taken automatically, because no card was ever given',
          ].map((f, i) => (
            <li key={f} className="flex gap-2">
              {i === 0 ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
        <h2 className="text-lg font-semibold tracking-tight">Why give it away</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Because a teacher should not have to ask a finance office for permission to find out whether marking is any
          good. Use it on real classes, for as long as it is useful. If it saves you an evening a week, {SCHOOL_PLAN.price}{' '}
          for the whole school is an easy case to make — and the licence is how a school makes it official.
        </p>
      </section>
    </MarketingShell>
  );
}
