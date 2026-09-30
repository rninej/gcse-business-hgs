'use client';

// Revise section — flashcard decks for every spec topic. Flip, shuffle and
// self-mark "knew it / didn't know it"; a session summary shows progress at
// the end. Pure client-side, instant, works on touch and keyboard.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Layers,
  Lightbulb,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { PageHeader, ThemedSkeleton, EmptyState } from '@/components/shared';
import { FLASHCARD_DECKS } from '@/data/flashcards';
import { TOPIC_MAP } from '@/lib/topics';
import type { FlashcardDeck } from '@/lib/types';
import { cn } from '@/lib/utils';

export function FlashcardView() {
  const go = useApp((s) => s.go);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);

  if (deck) {
    return <DeckRunner deck={deck} onExit={() => setDeck(null)} />;
  }

  const t1 = FLASHCARD_DECKS.filter((d) => TOPIC_MAP[d.topic]?.theme === 1);
  const t2 = FLASHCARD_DECKS.filter((d) => TOPIC_MAP[d.topic]?.theme === 2);

  return (
    <>
      <PageHeader
        title="Flashcards"
        sub="Flip through the key terms for every topic — definitions, formulas and facts from the spec."
        actions={
          <Button variant="outline" size="sm" onClick={() => go({ name: 's-practice' })}>
            Practice quizzes
          </Button>
        }
      />

      {[
        { title: 'Theme 1 · Investigating small business', rows: t1 },
        { title: 'Theme 2 · Building a business', rows: t2 },
      ].map((group) => (
        <section key={group.title} className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Layers className="h-4 w-4" /> {group.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {group.rows.map((d) => (
              <button
                key={d.topic}
                onClick={() => setDeck(d)}
                className="rounded-xl border bg-card p-5 text-left hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      <span className="text-primary tabular-nums">{d.topic}</span> {d.title}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{d.blurb}</p>
                  </div>
                  <Badge variant="secondary" className="tabular-nums shrink-0">{d.cards.length} cards</Badge>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/* ---------------- deck runner ---------------- */

function DeckRunner({ deck, onExit }: { deck: FlashcardDeck; onExit: () => void }) {
  const [order, setOrder] = useState<number[]>(() => deck.cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [hint, setHint] = useState(false);
  const done = pos >= order.length;

  const shuffle = useCallback(() => {
    const arr = deck.cards.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setPos(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setHint(false);
  }, [deck]);

  const card = deck.cards[order[pos]];

  const mark = useCallback(
    (ok: boolean) => {
      const idx = order[pos];
      setKnown((s) => {
        const n = new Set(s);
        n.delete(idx);
        if (ok) n.add(idx);
        return n;
      });
      setUnknown((s) => {
        const n = new Set(s);
        n.delete(idx);
        if (!ok) n.add(idx);
        return n;
      });
      setFlipped(false);
      setHint(false);
      setPos((p) => p + 1);
    },
    [order, pos]
  );

  // keyboard: space/enter flip, arrows self-mark once flipped
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === 'ArrowRight' && flipped) {
        mark(true);
      } else if (e.code === 'ArrowLeft' && flipped) {
        mark(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, mark, done]);

  const progressPct = Math.round((pos / order.length) * 100);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-4 w-4" /> All decks
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={shuffle}>
            <Shuffle className="h-3.5 w-3.5" /> Shuffle & restart
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        <span className="text-primary tabular-nums">{deck.topic}</span> {deck.title}
      </h1>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {Math.min(pos + (done ? 0 : 1), order.length)} of {order.length}
          {known.size > 0 ? ` · ${known.size} known` : ''}
          {unknown.size > 0 ? ` · ${unknown.size} to revisit` : ''}
        </span>
      </div>

      {done ? (
        <div className="max-w-xl mx-auto text-center py-8 space-y-5">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Deck complete</h2>
            <p className="text-sm text-muted-foreground mt-1">
              You knew {known.size} of {order.length}
              {unknown.size > 0 ? ` — ${unknown.size} to revisit.` : ' — brilliant work.'}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">To revisit</p>
            {unknown.size === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing — every card sorted!</p>
            ) : (
              <ul className="space-y-1.5 max-h-56 overflow-y-auto scroll-slim">
                {[...unknown].map((idx) => (
                  <li key={idx} className="text-sm">
                    <span className="font-medium">{deck.cards[idx].front}</span>
                    <span className="text-muted-foreground"> — {deck.cards[idx].back}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={shuffle}>
              <RotateCcw className="h-4 w-4" /> Go again
            </Button>
            <Button variant="outline" onClick={onExit}>
              Choose another deck
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-xl mx-auto">
            {/* flip card */}
            <button
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? 'Show the term' : 'Reveal the answer'}
              className="w-full text-left [perspective:1200px] focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl outline-none"
            >
              <div
                className={cn(
                  'relative w-full min-h-56 sm:min-h-64 transition-transform duration-500 [transform-style:preserve-3d]',
                  flipped && '[transform:rotateX(180deg)]'
                )}
              >
                {/* front */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl border bg-card p-6 sm:p-8 flex flex-col">
                  <Badge variant="outline" className="self-start text-[10px]">Term</Badge>
                  <p className="flex-1 flex items-center justify-center text-center text-lg sm:text-xl font-medium leading-relaxed px-2">
                    {card.front}
                  </p>
                  <p className="text-[11px] text-muted-foreground text-center">Tap the card to reveal</p>
                </div>
                {/* back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)] rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8 flex flex-col">
                  <Badge className="self-start bg-primary text-primary-foreground text-[10px]">Answer</Badge>
                  <p className="flex-1 flex items-center justify-center text-center text-base sm:text-lg leading-relaxed px-2 font-medium">
                    {card.back}
                  </p>
                  {card.hint && hint ? (
                    <p className="text-xs text-muted-foreground text-center">💡 {card.hint}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center">Did you know it?</p>
                  )}
                </div>
              </div>
            </button>

            {/* hint */}
            <div className="flex justify-center mt-3">
              {card.hint && !flipped ? (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setHint(true)}>
                  <Lightbulb className="h-3.5 w-3.5" /> Hint
                </Button>
              ) : null}
            </div>

            {/* self-mark */}
            {flipped ? (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  onClick={() => mark(false)}
                >
                  <X className="h-4 w-4" /> Didn&apos;t know it
                </Button>
                <Button
                  size="lg"
                  className="h-12"
                  onClick={() => mark(true)}
                >
                  <Check className="h-4 w-4" /> Knew it
                </Button>
              </div>
            ) : null}
            <p className="text-center text-[11px] text-muted-foreground mt-3 hidden sm:block">
              Space flips the card · ← didn&apos;t know it · → knew it
            </p>
          </div>
        </>
      )}
    </>
  );
}
