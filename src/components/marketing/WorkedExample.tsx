// A single published worked example. Server component: the answer is in the
// DOM inside <details> so it works with no JavaScript and is visible to
// crawlers — which is the whole point of putting it on a public page.

import { expectedDisplay } from '@/lib/marking';
import type { Question } from '@/lib/types';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function WorkedExample({ question, index }: { question: Question; index: number }) {
  const options = question.type === 'mcq' ? question.options : null;

  return (
    <article className="rounded-xl border border-white/60 bg-card/60 backdrop-blur-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span className="rounded bg-foreground/5 px-1.5 py-0.5">Question {index}</span>
        <span>
          {question.topic}
          {question.subtopic ? ` · ${question.subtopic}` : ''}
        </span>
        <span>
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </span>
      </div>

      {question.extract ? (
        <div className="mt-3 rounded-lg border border-white/50 bg-[var(--accent)]/25 px-3.5 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-foreground)]">
            Case study · {question.extract.title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{question.extract.text}</p>
        </div>
      ) : null}

      <p className="mt-3 text-sm font-medium leading-snug">{question.stem}</p>

      {options ? (
        <ol className="mt-2.5 space-y-1.5 text-sm">
          {options.map((opt, i) => (
            <li key={i} className="flex gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">{LETTERS[i]}</span>
              <span>{opt}</span>
            </li>
          ))}
        </ol>
      ) : null}

      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-sm font-medium text-primary underline underline-offset-2">
          Show the answer and explanation
        </summary>
        <div className="mt-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/8 px-3.5 py-2.5 text-sm">
          <p>
            <span className="font-semibold">Answer:</span> {expectedDisplay(question)}
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">{question.explain}</p>
        </div>
      </details>
    </article>
  );
}
