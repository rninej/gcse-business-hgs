import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { CONTACT_EMAIL, INCLUDED, PRICING_PROMISES, SCHOOL_PRICE } from '@/lib/pricing';
import { FREE_PLAN, PAYMENT_STEPS } from '@/lib/plan';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — £250 a year for the whole school | gcsebusiness',
  description:
    'One price: £250 a year per school for Edexcel GCSE Business self-marking homework. Every teacher, class and student included, invoiced to the school, no per-student charges.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: '£250 a year for the whole school | gcsebusiness',
    description:
      'One price for Edexcel GCSE Business self-marking homework: every teacher, class and student included. Invoiced to the school, no per-student charges.',
    url: '/pricing',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

const FAQ = [
  {
    q: 'What exactly does £250 cover?',
    a: 'One school, for a year: every business teacher, every class, every student, and every topic 1.1 to 2.5. There is no per-seat charge, so adding a second teacher or a larger class costs nothing extra.',
  },
  {
    q: 'Is every question really aligned to 1BS0?',
    a: 'Yes. Every question is tagged to the official Pearson sub-topic (1.1.1 through 2.5.4) and written against the current specification — case studies, calculations and the five question styles used in the papers.',
  },
  {
    q: 'Does it replace marking?',
    a: 'It replaces the marking you do not need to do by hand: multiple choice, typed terms, fill-the-blank, true/false and calculations — marked objectively, with an explanation every time. Written answers are marked by AI against a mark scheme and you can override any mark. You still judge the extended evaluation, but in a fraction of the time.',
  },
  {
    q: 'What happens to pupil data?',
    a: 'Students never need an email address — a username and display name is enough. Data is stored in the UK on Google Firebase, and the Privacy Policy, Data Processing Agreement and Terms are published openly so your data protection lead can sign them off before you buy.',
  },
  {
    q: 'How does a school actually pay?',
    a: 'By invoice, annually, with a PO number. We are happy to complete your supplier forms and send a quote on school letterhead. If your finance office prefers a card, say so and we will sort it out.',
  },
  {
    q: 'We are a trust with several schools.',
    a: 'Email us with the number of schools and we will quote for the trust as a whole — the same approach as the single-school price, with one invoice and one DPA covering all of them.',
  },
  {
    q: 'We teach AQA, not Edexcel.',
    a: 'Then this is not for you yet, and we would rather say so. The question bank is built entirely around 1BS0. Email us and we will tell you when an AQA bank exists.',
  },
];

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          One price for the whole school.
        </h1>
        <p className="mt-3 text-muted-foreground">
          No tiers to compare and no per-seat maths. {SCHOOL_PRICE.price} a year for the school, invoiced once,
          covering every business teacher and every student.
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold tracking-tight">Free to use — no card, no clock</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every class and every feature, email only, for as long as you want it. {FREE_PLAN.summary}
            </p>
          </div>
          <Link
            href="/#create"
            className="rounded-md border border-foreground/15 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
Start using it — free
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-primary/50 bg-primary/5 p-6 ring-2 ring-primary/20">
          <p className="text-sm font-semibold uppercase tracking-wide">The school licence</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">{SCHOOL_PRICE.price}</span>
            <span className="text-sm text-muted-foreground">{SCHOOL_PRICE.cadence}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{SCHOOL_PRICE.summary}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Set your school up
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('gcse.business — £250 school licence')}`}
              className="rounded-md border border-foreground/15 px-4 py-2.5 text-center text-sm font-medium hover:bg-foreground/5"
            >
              Request a quote or ask a question
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Excludes VAT. One invoice a year, one DPA, no per-student charges.
          </p>
        </div>

        <div className="rounded-xl border border-white/60 bg-card/70 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight">Everything is included</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {INCLUDED.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold tracking-tight">What happens at the payment step</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No card details are taken anywhere on this site. Payment is by invoice, and this is the whole process:
        </p>
        <ol className="mt-4 space-y-3">
          {PAYMENT_STEPS.map((s, i) => (
            <li key={s.title} className="text-sm">
              <p className="font-semibold">
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          Card payment is not live — there is no payment processor behind this site, so nothing can be charged
          automatically. If invoice is impossible for your school, say so in the email and you will get a straight
          answer rather than a sales pitch.
        </p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="text-lg font-semibold tracking-tight">How a school buys this</h2>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1.</span> Create a teacher account and set up a real
              class — no card needed to look around.
            </li>
            <li>
              <span className="font-semibold text-foreground">2.</span> Email us the school name and a PO number, or
              forward your supplier form and we will complete it.
            </li>
            <li>
              <span className="font-semibold text-foreground">3.</span> Sign the DPA, get the annual invoice, carry on
              teaching. Student data is deleted within 30 days if you ever stop.
            </li>
          </ol>
          <a
            className="mt-4 inline-block text-sm font-medium underline underline-offset-2"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('gcse.business — £250 school licence')}`}
          >
            Request a quote or ask a question →
          </a>
        </div>

        <div className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5">
          <h2 className="text-lg font-semibold tracking-tight">On the licence</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {PRICING_PROMISES.map((p) => (
              <li key={p} className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Read the{' '}
            <Link href="/legal" className="underline hover:text-foreground">
              privacy policy, DPA and terms
            </Link>{' '}
            before you speak to your data protection lead.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Questions teachers actually ask</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-lg border border-white/60 bg-card/50 p-4">
              <dt className="text-sm font-semibold">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/demo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try six questions first
        </Link>
        <Link href="/topics" className="text-sm font-medium underline underline-offset-2">
          See every topic covered
        </Link>
      </div>
    </MarketingShell>
  );
}
