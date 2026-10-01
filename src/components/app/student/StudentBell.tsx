'use client';

// Student notification bell — the small in-app feed where students learn a
// quiz was set for them or get a nudge about one they haven't handed in.
// Two presentations of the same popover: an icon button (mobile top bar)
// and a full-width row (desktop sidebar). Polls lightly while open-tabbed;
// opening the panel marks everything read.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellRing, ClipboardList, MessageSquareHeart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { StudentNotification } from '@/lib/types';

type Feed = { notifications: StudentNotification[]; unread: number };

function timeAgo(ms: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

const KIND_ICON: Record<string, { icon: typeof Bell; tone: string }> = {
  assignment: { icon: ClipboardList, tone: 'text-primary bg-primary/10' },
  remind: { icon: BellRing, tone: 'text-[var(--warn)] bg-[var(--warn)]/15' },
  feedback: { icon: MessageSquareHeart, tone: 'text-primary bg-primary/10' },
};

export function StudentBell({ variant = 'icon' }: { variant?: 'icon' | 'row' }) {
  const go = useApp((s) => s.go);
  const setBellUnread = useApp((s) => s.setBellUnread);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [open, setOpen] = useState(false);
  const markTimer = useRef<number | null>(null);

  const load = useCallback(() => {
    api
      .get<Feed>('/api/student/notifications')
      .then((f) => {
        setFeed(f);
        setBellUnread(f.unread); // feeds the mobile Home-tab badge too
      })
      .catch(() => undefined); // the bell must never break the page
  }, [setBellUnread]);

  useEffect(load, [load]);

  // light polling — a nudge sent mid-session shows up within a minute
  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !open) load();
    }, 60_000);
    return () => window.clearInterval(t);
  }, [load, open]);

  // opening the panel marks everything read after a beat — the badge visibly
  // clears as the student looks at the list, then the dot says "seen"
  useEffect(() => {
    if (!open) return;
    markTimer.current = window.setTimeout(() => {
      api
        .post('/api/student/notifications', {})
        .then(() => {
          setFeed((f) => (f ? { ...f, unread: 0 } : f));
          setBellUnread(0);
        })
        .catch(() => undefined);
    }, 1200);
    return () => {
      if (markTimer.current) window.clearTimeout(markTimer.current);
    };
  }, [open, setBellUnread]);

  const unread = feed?.unread ?? 0;
  const notes = feed?.notifications ?? [];

  const content = (
    <div className="w-80 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden /> Notifications
        </p>
        {unread > 0 ? (
          <span className="text-[11px] font-medium text-primary tabular-nums">{unread} new</span>
        ) : notes.length > 0 ? (
          <span className="text-[11px] text-muted-foreground">all caught up</span>
        ) : null}
      </div>
      {notes.length === 0 ? (
        <div className="py-6 px-1 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 anim-float" aria-hidden />
          <p className="text-sm text-muted-foreground mt-2">Nothing yet — quizzes your teacher sets will land here.</p>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto scroll-slim pr-0.5 divide-y divide-white/25">
          {notes.map((n) => {
            const k = KIND_ICON[n.kind] ?? KIND_ICON.assignment;
            return (
              <li key={n.id} className="py-1 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    // feedback notes deep-link straight to that result screen;
                    // everything else goes to the quiz list
                    if (n.attemptId) go({ name: 'result', attemptId: n.attemptId });
                    else go({ name: 's-practice' });
                  }}
                  className={cn(
                    'w-full text-left flex gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60',
                    !n.readAt && 'bg-primary/[0.06]'
                  )}
                >
                  <span className={cn('relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', k.tone)} aria-hidden>
                    <k.icon className="h-4 w-4" />
                    {!n.readAt ? (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-[var(--popover)]" aria-hidden />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium leading-snug block truncate">{n.title}</span>
                    <span className="block text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.body}</span>
                    <span className="block text-[10px] text-muted-foreground/80 mt-1">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[10px] text-muted-foreground px-1 pt-2 mt-1 border-t border-white/40">
        Tap a notification to open your quizzes.
      </p>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" aria-label={`Notifications${unread ? ` — ${unread} unread` : ''}`} className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground tabular-nums shadow-sm"
                aria-hidden
              >
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between relative"
            aria-label={`Notifications${unread ? ` — ${unread} unread` : ''}`}
          >
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </span>
            {unread > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground tabular-nums" aria-hidden>
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={variant === 'icon' ? 'end' : 'start'} side={variant === 'icon' ? 'bottom' : 'right'} className="glass w-auto p-3">
        {content}
      </PopoverContent>
    </Popover>
  );
}
