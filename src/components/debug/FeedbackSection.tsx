'use client';

// /debug — the teacher needs inbox. Every questionnaire answer and feedback
// note teachers send lands here for the owner to read: this is how the
// product "asks teachers what they want" and how the answers turn into work.

import { useCallback, useEffect, useState } from 'react';
import { CheckCheck, Inbox, Loader2, MessageSquareHeart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { FeedbackEntry } from '@/lib/types';

const KIND_LABEL: Record<FeedbackEntry['kind'], string> = {
  onboarding: 'Questionnaire',
  feature: 'Feature request',
  issue: 'Problem',
  other: 'Note',
};

function entryWhen(at: number): string {
  return new Date(at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** the questionnaire's chip picks live in meta as JSON — surface them as badges */
function metaPicks(e: FeedbackEntry): string[] {
  if (!e.meta) return [];
  try {
    const m = JSON.parse(e.meta) as { wants?: string[]; dismissed?: boolean };
    const out: string[] = [];
    if (m.dismissed) out.push('dismissed without answering');
    for (const w of m.wants ?? []) out.push(`wants: ${w}`);
    return out;
  } catch {
    return [];
  }
}

export function FeedbackSection() {
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api
      .get<{ entries: FeedbackEntry[] }>('/api/feedback')
      .then((d) => setEntries(d.entries))
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  async function markSeen(e: FeedbackEntry) {
    if (busy) return;
    setBusy(e.id);
    try {
      await api.patch(`/api/feedback?id=${e.id}`, { seen: true });
      setEntries((prev) => prev?.map((x) => (x.id === e.id ? { ...x, seen: true } : x)) ?? prev);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(e: FeedbackEntry) {
    if (busy) return;
    setBusy(e.id);
    try {
      await api.del(`/api/feedback?id=${e.id}`);
      setEntries((prev) => prev?.filter((x) => x.id !== e.id) ?? prev);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const unseen = entries?.filter((e) => !e.seen).length ?? 0;

  return (
    <section aria-labelledby="feedback-h" id="feedback-section">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareHeart className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <h2 id="feedback-h" className="text-lg font-semibold leading-tight">
            Teacher needs inbox
            {unseen > 0 ? (
              <Badge className="ml-2 align-middle" variant="default">
                {unseen} new
              </Badge>
            ) : null}
          </h2>
          <p className="text-xs text-muted-foreground">
            Questionnaire answers and feedback notes from teachers — what they asked for lands here.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          {error ? <p className="text-sm text-[var(--warn)] mb-3">{error}</p> : null}
          {!entries ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Inbox className="h-5 w-5 shrink-0" aria-hidden />
              No feedback yet — entries appear the moment a teacher sends one (the questionnaire
              fires once per teacher on their dashboard).
            </div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto scroll-slim pr-1" role="list">
              {entries.map((e) => {
                const picks = metaPicks(e);
                return (
                  <li
                    key={e.id}
                    className={cn(
                      'rounded-lg border p-3.5 transition-colors',
                      e.seen ? 'bg-transparent' : 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant={e.kind === 'issue' ? 'destructive' : e.kind === 'onboarding' ? 'default' : 'secondary'}>
                        {KIND_LABEL[e.kind]}
                      </Badge>
                      <span className="text-sm font-medium">{e.teacherName}</span>
                      <span className="text-xs text-muted-foreground">{entryWhen(e.createdAt)}</span>
                      {!e.seen ? (
                        <span className="ml-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markSeen(e)}
                            disabled={busy === e.id}
                            aria-label="Mark as read"
                          >
                            <CheckCheck className="h-4 w-4" aria-hidden /> Read
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(e)}
                            disabled={busy === e.id}
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-muted-foreground"
                          onClick={() => remove(e)}
                          disabled={busy === e.id}
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      )}
                    </div>
                    {picks.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {picks.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px] font-normal">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-sm whitespace-pre-wrap break-words">{e.message}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
