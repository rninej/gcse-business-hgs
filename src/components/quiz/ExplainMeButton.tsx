'use client';

// "Explain it to me" — appears whenever a student gets a question wrong.
// One click writes a friendly step-by-step explanation (AI, with a built-in
// fallback); repeat visits to the same question replay the stored text
// instantly. Shared by the quiz runner and the results review.

import { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/** attemptId + qid → explanation, shared across the session */
const cache = new Map<string, string>();

export function ExplainMeButton({
  attemptId,
  qid,
  className,
  size = 'sm',
}: {
  attemptId: string;
  qid: string;
  className?: string;
  size?: 'sm' | 'default';
}) {
  const key = `${attemptId}:${qid}`;
  const [text, setText] = useState<string | null>(() => cache.get(key) ?? null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function explain() {
    if (busy || text) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await api.post<{ text: string }>(`/api/student/attempts/${attemptId}/explain`, { qid });
      cache.set(key, res.text);
      setText(res.text);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (text) {
    return (
      <div className={cn('rounded-lg border border-primary/25 bg-primary/5 p-3.5', className)} data-testid="explain-me">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Explained for you
        </p>
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button variant="outline" size={size} onClick={() => void explain()} disabled={busy} className="gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <GraduationCap className="h-3.5 w-3.5" aria-hidden />}
        {busy ? 'Writing your explanation…' : 'Explain it to me'}
      </Button>
      {failed ? (
        <p className="text-xs text-[var(--danger)] mt-1.5">
          Could not load the explanation — tap again in a moment.
        </p>
      ) : null}
    </div>
  );
}
