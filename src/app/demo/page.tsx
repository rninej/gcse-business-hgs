import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { DemoQuiz } from '@/components/marketing/DemoQuiz';
import { DEMO_CLIENT_QUESTIONS } from '@/data/demo';

export const metadata: Metadata = {
  title: 'Try a real Edexcel GCSE Business quiz — no sign-up | gcsebusiness',
  description:
    'Six real Edexcel GCSE (9–1) Business (1BS0) questions — case studies, calculations and typed answers — marked instantly with explanations. No account needed.',
  alternates: { canonical: '/demo' },
  openGraph: {
    title: 'Try a real Edexcel GCSE Business quiz — no sign-up',
    description:
      'Six real 1BS0 questions, marked instantly with explanations. No account needed.',
    url: '/demo',
    siteName: 'gcsebusiness',
    type: 'website',
    locale: 'en_GB',
  },
};

export default function DemoPage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">No sign-up</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Try a real quiz — exactly what your students see.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Six questions from the live bank of 245, covering topics your class is doing now. Answer what you like
          and press mark: the same deterministic engine marks your students&apos; homework, so a correct answer
          always gets the mark — every time, on every device.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Capitals and stray punctuation never cost marks. Spelling does.
        </p>
      </div>

      <div className="mt-8">
        <DemoQuiz questions={DEMO_CLIENT_QUESTIONS} />
      </div>

      <section className="mt-12 rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">What happens next in the real product</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• You pick a topic (or all of them), a question count and a due date — under a minute.</li>
          <li>• Students log in with a username you generated; nobody needs an email address.</li>
          <li>• You get the class average, topic gaps and a question-level breakdown, exportable as CSV.</li>
          <li>• Timed quizzes auto-submit at zero; late hand-ins are tagged for you.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="font-medium underline underline-offset-2">
            Set your school up
          </Link>
          <Link href="/pricing" className="font-medium underline underline-offset-2">
            Pricing
          </Link>
          <Link href="/topics" className="font-medium underline underline-offset-2">
            Every topic, 1.1 to 2.5
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
