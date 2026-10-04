'use client';

// /debug — interface flags: server-side presentation switches the owner can
// flip for every user. This is the "undo" panel for new interface designs:
// each new layout ships as the default, and if the owner prefers the old one
// the switch here restores it globally without a deploy.

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PanelRightOpen, SlidersHorizontal, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Flags {
  caseLayout?: 'drawer' | 'side';
}

export function InterfaceFlagsSection() {
  const [flags, setFlags] = useState<Flags | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api
      .get<Flags>('/api/owner/ui-flags')
      .then(setFlags)
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  async function setCaseLayout(v: 'drawer' | 'side') {
    if (busy || flags?.caseLayout === v) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.put<Flags & { ok: boolean }>('/api/owner/ui-flags', { caseLayout: v });
      setFlags({ caseLayout: res.caseLayout });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const current = flags?.caseLayout ?? 'drawer';

  return (
    <section aria-labelledby="uiflags-h">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SlidersHorizontal className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <h2 id="uiflags-h" className="text-lg font-semibold leading-tight">
            Interface switches
          </h2>
          <p className="text-xs text-muted-foreground">
            Presentation choices for every user — the undo panel for new designs.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {/* case-study layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex flex-wrap items-center gap-2">
                Desktop case studies
                <Badge variant="outline" className="text-[10px]">
                  {current === 'drawer' ? 'New layout live' : 'Classic layout live'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                How a case study appears next to a question on desktop. Mobile always shows it inline
                above the question, exactly as before.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Desktop case study layout">
              <Button
                size="sm"
                variant={current === 'drawer' ? 'default' : 'outline'}
                onClick={() => void setCaseLayout('drawer')}
                disabled={busy}
                className="gap-1.5"
                aria-pressed={current === 'drawer'}
              >
                <PanelRightOpen className="h-3.5 w-3.5" aria-hidden /> Reading drawer
              </Button>
              <Button
                size="sm"
                variant={current === 'side' ? 'default' : 'outline'}
                onClick={() => void setCaseLayout('side')}
                disabled={busy}
                className="gap-1.5"
                aria-pressed={current === 'side'}
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden /> Side-by-side
              </Button>
              {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden /> : null}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            <div
              className={cn(
                'rounded-lg border p-3',
                current === 'drawer' ? 'border-primary/40 bg-primary/5' : 'border-border'
              )}
            >
              <span className="font-semibold">Reading drawer</span>
              <p className="text-muted-foreground mt-1">
                The question keeps the full width. A “Case study” bar above it opens a slide-over
                reading panel (it swings open automatically the first time each case appears).
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg border p-3',
                current === 'side' ? 'border-primary/40 bg-primary/5' : 'border-border'
              )}
            >
              <span className="font-semibold">Side-by-side (classic)</span>
              <p className="text-muted-foreground mt-1">
                The case study sits in a sticky column to the right of the question — the original
                desktop layout.
              </p>
            </div>
          </div>

          {error ? <p className="text-sm text-[var(--danger)]" role="alert">{error}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}
