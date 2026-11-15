'use client';

// /debug — the buy inbox. Every licence request sent from /upgrade lands here,
// whether or not the deployment could email it, so a school that asks for a
// quote is never invisible. The delivery badge is the point: "not emailed"
// next to an enquiry is the signal that mail is misconfigured.

import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Building2, CheckCheck, Loader2, Mail, MailX, Reply, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Enquiry } from '@/lib/types';

function when(at: number): string {
  return new Date(at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function EnquiriesSection() {
  const [entries, setEntries] = useState<Enquiry[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api
      .get<{ enquiries: Enquiry[] }>('/api/enquiry')
      .then((d) => setEntries(d.enquiries))
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  async function markSeen(e: Enquiry) {
    if (busy) return;
    setBusy(e.id);
    try {
      await api.patch(`/api/enquiry?id=${e.id}`, { seen: true });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(e: Enquiry) {
    if (busy) return;
    setBusy(e.id);
    try {
      await api.del(`/api/enquiry?id=${e.id}`);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const unseen = (entries ?? []).filter((e) => !e.seen).length;

  return (
    <section aria-labelledby="enquiries-h" id="enquiries-section">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <h2 id="enquiries-h" className="text-lg font-semibold leading-tight">
            Licence requests
            {unseen > 0 ? (
              <Badge className="ml-2 align-middle" variant="default">
                {unseen} new
              </Badge>
            ) : null}
          </h2>
          <p className="text-xs text-muted-foreground">
            Schools that filled in the form on /upgrade. Reply from your own mail client — the
            teacher's address is right here.
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
              <Building2 className="h-5 w-5 shrink-0" aria-hidden />
              No licence requests yet. A school that wants a quote fills in the form on /upgrade and
              appears here, with or without email delivery.
            </div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto scroll-slim pr-1" role="list">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className={cn(
                    'rounded-lg border p-3.5 transition-colors',
                    e.seen ? 'bg-transparent' : 'border-primary/30 bg-primary/5'
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium">{e.name}</span>
                    <span className="text-sm text-muted-foreground">· {e.school}</span>
                    {e.role ? <Badge variant="secondary">{e.role}</Badge> : null}
                    <span className="text-xs text-muted-foreground">{when(e.createdAt)}</span>
                    {e.emailed === 'sent' ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <BadgeCheck className="h-3 w-3" aria-hidden /> emailed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 text-[var(--warn)]">
                        <MailX className="h-3 w-3" aria-hidden />
                        {e.emailed === 'failed' ? 'email failed' : 'stored only'}
                      </Badge>
                    )}
                    {e.ackEmailed ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Mail className="h-3 w-3" aria-hidden /> teacher acknowledged
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <a
                      className="text-sm underline underline-offset-2 break-all"
                      href={`mailto:${e.email}?subject=${encodeURIComponent(`gcse.business licence — ${e.school}`)}`}
                    >
                      {e.email}
                    </a>
                  </div>

                  {e.message ? (
                    <p className="text-sm whitespace-pre-wrap break-words mb-2">{e.message}</p>
                  ) : null}
                  {e.emailed === 'failed' && e.emailError ? (
                    <p className="text-xs text-muted-foreground mb-1.5">Mail error: {e.emailError}</p>
                  ) : null}

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${e.email}?subject=${encodeURIComponent(`gcse.business licence — ${e.school}`)}`}>
                        <Reply className="h-4 w-4" aria-hidden /> Reply
                      </a>
                    </Button>
                    {!e.seen ? (
                      <Button variant="ghost" size="sm" onClick={() => markSeen(e)} disabled={busy === e.id}>
                        <CheckCheck className="h-4 w-4" aria-hidden /> Read
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => remove(e)} disabled={busy === e.id} aria-label="Delete enquiry">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
