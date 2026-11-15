import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FREE_PLAN, SCHOOL_PLAN } from '@/lib/plan';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free for one class — Edexcel GCSE Business homework that marks itself',
  description:
    'Create a free teacher account, add one class and set self-marking Edexcel GCSE Business homework. No card, no invoice, no phone call. The £250 school licence is only needed for a second class.',
  alternates: { canonical: '/free' },
  openGraph: {
    title: 'Free for one class — no card',
    description:
      'One class, every topic, instant marking. No card details, no invoice, no call. The school licence is for a second class.',
    url: '/free',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

const FREE_INCLUDES = [
  'One class, with as many students in it as you actually teach',
  'All 245 questions across every topic, 1.1 to 2.5',
  'Instant marking with an explanation on every question',
  'Class analytics: scores, topic gaps, question-level breakdown',
  'Timed quizzes, due dates and student practice',
  'No card, no trial countdown and nothing to cancel',
];

const LICENCE_ADDS = [
  'Unlimited classes — every group you teach',
  'Every business teacher in the school, on one account',
  'Export, integrity watch and the full teacher toolkit',
  'AI question writing on any sub-topic',
  'One invoice a year, one DPA covering the school',
];

export default function FreePage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Free tier</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          One class. Free. No card, no invoice, no call.
        </h1>
        <p className="mt-3 text-muted-foreground">
          {FREE_PLAN.summary} You can be setting homework on it in the next two minutes, and nothing on this site ever
          asks for card details.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/#create"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create my free account
          </Link>
          <Link href="/demo" className="rounded-md border border-foreground/15 px-4 py-2.5 text-sm font-medium hover:bg-foreground/5">
            Try six questions first
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold tracking-tight">Free — one class</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FREE_INCLUDES.map((f) => (
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
        <h2 className="text-lg font-semibold tracking-tight">What the free plan does not include</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Said plainly, because finding out later is worse:
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            'A second class — the free plan is exactly one',
            'A second teacher account sharing your classes',
            'AI question writing (it costs money to run, so it sits on the paid plan)',
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
        <h2 className="text-lg font-semibold tracking-tight">Why it is free at all</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Because a teacher should not have to raise a purchase order to find out whether homework marks itself. The
          free class is the whole product for one group. If it saves you an evening a week, a second class is where the
          licence starts — {SCHOOL_PLAN.price} for the school, not per teacher.
        </p>
      </section>
    </MarketingShell>
  );
}
