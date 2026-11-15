import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FREE_PLAN, PAYMENT_STEPS, SCHOOL_PLAN } from '@/lib/plan';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The school licence — what happens next | gcsebusiness',
  description:
    'You have used the free class. Here is exactly what the £250 school licence adds, and exactly what happens at the payment step: an invoice, a DPA, and the licence switched on.',
  alternates: { canonical: '/upgrade' },
  robots: { index: false, follow: true },
};

const mailto = `mailto:${SCHOOL_PLAN.contactEmail}?subject=${encodeURIComponent(
  'gcse.business school licence — invoice request'
)}&body=${encodeURIComponent(
  [
    'School:',
    'Business teacher / head of department:',
    'PO number (or "supplier form needed"):',
    'Number of classes next term:',
    '',
    'Anything else your finance office needs:',
  ].join('\n')
)}`;

export default function UpgradePage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">School licence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Your trial has done its job. Here is exactly what happens next.
        </h1>
        <p className="mt-3 text-muted-foreground">
          After the 30-day trial the account keeps {FREE_PLAN.classes} class free — that is{' '}
          <span className="font-medium text-foreground">deliberate</span>, so the class you have been using does not
          stop mid-term. Everything else, including AI question writing and every additional class, is part of the{' '}
          {SCHOOL_PLAN.price} {SCHOOL_PLAN.cadence} licence, which covers every teacher and class in the school.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold tracking-tight">On the licence</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              'Unlimited classes, for every business teacher',
              'AI question writing on any sub-topic',
              'CSV export, integrity watch and full analytics',
              'One invoice a year and one DPA for the school',
              'Cancel at the end of the year; student data deleted within 30 days',
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="text-lg font-semibold tracking-tight">What you do not have to do</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>No card details — this site never has a card field.</li>
            <li>No subscription to cancel and nothing renews automatically.</li>
            <li>No demo call, and no card was taken at the start of the trial.</li>
            <li>No per-student maths to take to your finance office.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">The payment step, in order</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two of these are automatic or immediate. The third is a person — that is the honest version.
        </p>
        <ol className="mt-4 space-y-3">
          {PAYMENT_STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4">
              <p className="text-sm font-semibold">
                {i + 1}. {s.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Start the invoice</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This opens a pre-filled email — school name, PO number, how many classes. Send it and the invoice comes back
          with the DPA attached.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={mailto}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Email the licence request
          </a>
          <Link href="/pricing" className="text-sm font-medium underline underline-offset-2">
            Read the full pricing and data terms
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Card payment is not live: there is no payment processor behind this site, so no card can be taken here and
          none is stored. If your school can only pay by card, say so in the email and you will get a straight answer.
        </p>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Still deciding?{' '}
        <Link href="/demo" className="font-medium underline underline-offset-2">
          Try the questions again
        </Link>{' '}
        or{' '}
        <Link href="/scheme-of-work" className="font-medium underline underline-offset-2">
          take the free scheme of work
        </Link>
        .
      </p>
    </MarketingShell>
  );
}
