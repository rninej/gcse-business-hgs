import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FREE_PLAN, SCHOOL_PLAN } from '@/lib/plan';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: '30 days free, no card — Edexcel GCSE Business homework that marks itself',
  description:
    'Start a 30-day trial of Edexcel GCSE Business self-marking homework. Email only, no card, every class, unlimited students and every feature. After the trial one class stays free; the £250 school licence covers the whole school.',
  alternates: { canonical: '/free' },
  openGraph: {
    title: '30 days free, no card',
    description: 'Every class, unlimited students, every feature, no card. Email only. After the trial one class stays free.',
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
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">30-day trial</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          30 days. Every class, every student. No card.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sign up with an email address and use the whole product on real classes for 30 days: as many classes as you
          teach, as many students as you have, every feature. Nothing is charged, no card details are asked for, and
          there is nothing to cancel. When the trial ends, one class stays free — the work you have already set
          keeps working.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/#create"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Start my 30-day trial
          </Link>
          <Link href="/demo" className="rounded-md border border-foreground/15 px-4 py-2.5 text-sm font-medium hover:bg-foreground/5">
            Try six questions first
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold tracking-tight">During the 30 days</h2>
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
        <h2 className="text-lg font-semibold tracking-tight">What happens when the trial ends</h2>
        <p className="mt-1 text-sm text-muted-foreground">Said plainly, because finding out later is worse:</p>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            'Nothing is deleted and nothing breaks — every class and result stays exactly where it is',
            `You keep ${FREE_PLAN.classes} class at no cost after the trial, with unlimited students in it`,
            'A second class, and AI question writing, need the school licence',
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
        <h2 className="text-lg font-semibold tracking-tight">Why 30 days and not 14</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Because a fortnight is one homework cycle, and you would still be working out whether the marking is any good.
          A month covers a full topic, a set of homework and a test — long enough to know, with every class and every
          student in your timetable. If it saves you an evening a week, {SCHOOL_PLAN.price} for the whole school is an
          easy case to make.
        </p>
      </section>
    </MarketingShell>
  );
}
