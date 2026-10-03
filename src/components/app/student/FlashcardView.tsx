'use client';

// Revise section — two modes behind a segmented toggle: flashcard decks for
// every spec topic (flip, shuffle, self-mark "knew it / didn't know it";
// marks persist per deck in localStorage, with a session summary and a
// re-run-the-missed-cards screen — pure client-side, instant, touch and
// keyboard), and Revision notes — structured per-topic notes (sections, key
// terms, formulas, examiner tips) distilled from the endorsed textbook, each
// ending in a "Practise this topic" quiz. The chosen mode persists in
// localStorage, so returning students land where they left off.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  BookMarked,
  Check,
  ChevronRight,
  Clock,
  Layers,
  Lightbulb,
  Notebook,
  PlayCircle,
  RotateCcw,
  Shuffle,
  Sigma,
  Target,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, ThemedSkeleton, EmptyState } from '@/components/shared';
import { FLASHCARD_DECKS } from '@/data/flashcards';
import { TOPIC_NOTES, type TopicNote } from '@/data/notes';
import { TOPIC_MAP } from '@/lib/topics';
import type { FlashcardDeck } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Persisted "knew it" progress — localStorage only, per deck topic.    */
/* { "1.1": [0, 3, 7], "2.4": [1] } — card indices the student knows. */
/* ------------------------------------------------------------------ */

const KNOWN_KEY = 'hgs.cards.known';

function readKnown(): Record<string, number[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KNOWN_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeKnown(data: Record<string, number[]>) {
  try {
    localStorage.setItem(KNOWN_KEY, JSON.stringify(data));
  } catch {
    /* private mode — progress just won't persist */
  }
  // always drop the memo and notify — even when no DeckCard is mounted
  // (e.g. marks made inside the runner), so a later remount reads fresh data
  knownCache = null;
  knownListeners.forEach((l) => l());
}

/* ---- external-store plumbing (useSyncExternalStore) ------------------
 * getSnapshot must return a cached reference, so the parsed blob lives in a
 * module cache that is dropped by writeKnown() whenever anything writes.
 * Components subscribe via knownListeners (direct) + the storage event
 * (other tabs). */

const EMPTY_KNOWN: Record<string, number[]> = {};
let knownCache: Record<string, number[]> | null = null;
const knownListeners = new Set<() => void>();

function subscribeKnown(cb: () => void) {
  knownListeners.add(cb);
  window.addEventListener('storage', bumpKnown); // another tab wrote
  return () => {
    knownListeners.delete(cb);
    window.removeEventListener('storage', bumpKnown);
  };
}

function bumpKnown() {
  knownCache = null;
  knownListeners.forEach((l) => l());
}

function getKnownSnapshot(): Record<string, number[]> {
  if (!knownCache) knownCache = readKnown();
  return knownCache;
}

function getKnownServerSnapshot(): Record<string, number[]> {
  return EMPTY_KNOWN;
}

/* ---- persisted mode — which half of Revise the student lands on -------- */

const MODE_KEY = 'hgs.revise.mode';
type ReviseMode = 'cards' | 'notes';

function readMode(): ReviseMode {
  if (typeof window === 'undefined') return 'cards';
  try {
    return localStorage.getItem(MODE_KEY) === 'notes' ? 'notes' : 'cards';
  } catch {
    return 'cards';
  }
}

export function FlashcardView() {
  const go = useApp((s) => s.go);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [mode, setMode] = useState<ReviseMode>(readMode);
  const [noteTopic, setNoteTopic] = useState<string | null>(null);

  function changeMode(m: ReviseMode) {
    setMode(m);
    setNoteTopic(null); // detail pages are full takeovers — always return to a library
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* private mode — preference just won't persist */
    }
  }

  if (deck) {
    return (
      <DeckRunner
        deck={deck}
        onlyUnknown={onlyUnknown}
        onExit={() => {
          setDeck(null);
          setOnlyUnknown(false);
        }}
      />
    );
  }

  const note = noteTopic ? TOPIC_NOTES[noteTopic] : undefined;
  if (mode === 'notes' && noteTopic) {
    return note ? (
      <NoteTopicPage note={note} onBack={() => setNoteTopic(null)} />
    ) : (
      // unknown topic id — never trap the student on a dead page
      <>
        <PageHeader title="Revision notes" />
        <EmptyState
          icon={Notebook}
          title="Notes not found"
          body="That topic doesn’t have notes yet — pick another from the list."
          action={
            <Button size="sm" onClick={() => setNoteTopic(null)}>
              All topics
            </Button>
          }
        />
      </>
    );
  }

  const t1 = FLASHCARD_DECKS.filter((d) => TOPIC_MAP[d.topic]?.theme === 1);
  const t2 = FLASHCARD_DECKS.filter((d) => TOPIC_MAP[d.topic]?.theme === 2);
  const n1 = Object.keys(TOPIC_NOTES).filter((id) => TOPIC_MAP[id]?.theme === 1);
  const n2 = Object.keys(TOPIC_NOTES).filter((id) => TOPIC_MAP[id]?.theme === 2);

  return (
    <>
      <PageHeader
        title={mode === 'notes' ? 'Revision notes' : 'Flashcards'}
        sub={
          mode === 'notes'
            ? 'Condensed notes for every spec topic — sections, key terms, formulas and examiner tips.'
            : 'Flip through the key terms for every topic — definitions, formulas and facts from the spec.'
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => go({ name: 's-practice' })}>
            Quizzes
          </Button>
        }
      />

      {/* mode toggle — segmented, remembered for next time */}
      <div
        className="glass-soft rounded-xl p-1 inline-flex gap-1 mb-6"
        role="group"
        aria-label="Revision mode"
      >
        <button
          type="button"
          onClick={() => changeMode('cards')}
          aria-pressed={mode === 'cards'}
          className={cn(
            'rounded-lg h-9 px-4 text-sm font-medium inline-flex items-center gap-2 press transition-colors',
            mode === 'cards'
              ? 'glass-selected font-semibold text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Layers className="h-4 w-4" aria-hidden /> Flashcards
        </button>
        <button
          type="button"
          onClick={() => changeMode('notes')}
          aria-pressed={mode === 'notes'}
          className={cn(
            'rounded-lg h-9 px-4 text-sm font-medium inline-flex items-center gap-2 press transition-colors',
            mode === 'notes'
              ? 'glass-selected font-semibold text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Notebook className="h-4 w-4" aria-hidden /> Notes
        </button>
      </div>

      {mode === 'notes'
        ? [
            { title: 'Theme 1 · Investigating small business', rows: n1 },
            { title: 'Theme 2 · Building a business', rows: n2 },
          ].map((group) => (
            <section key={group.title} className="mb-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <Notebook className="h-4 w-4" aria-hidden /> {group.title}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.rows.map((id) => (
                  <NoteCard key={id} note={TOPIC_NOTES[id]} onOpen={setNoteTopic} />
                ))}
              </div>
            </section>
          ))
        : [
            { title: 'Theme 1 · Investigating small business', rows: t1 },
            { title: 'Theme 2 · Building a business', rows: t2 },
          ].map((group) => (
            <section key={group.title} className="mb-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <Layers className="h-4 w-4" /> {group.title}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.rows.map((d) => (
                  <DeckCard key={d.topic} deck={d} onOpen={(focus) => {
                    setOnlyUnknown(focus);
                    setDeck(d);
                  }} />
                ))}
              </div>
            </section>
          ))}
    </>
  );
}

/* ---------------- notes library card ---------------- */

function NoteCard({ note, onOpen }: { note: TopicNote; onOpen: (topic: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(note.topic)}
      aria-label={`Read revision notes for ${note.topic} ${note.title} — ${note.readMins} minute read`}
      className="rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm outline-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">
            <span className="text-primary tabular-nums">{note.topic}</span> {note.title}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{note.blurb}</p>
        </div>
        <Badge variant="secondary" className="tabular-nums shrink-0 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden /> {note.readMins} min
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {note.keyTerms.length} key terms{note.formulas ? ` · ${note.formulas.length} formulas` : ''}
        </span>
        <span className="text-xs font-medium text-primary inline-flex items-center gap-0.5">
          Read <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}

/* ---------------- single-topic notes page ---------------- */

function NoteTopicPage({ note, onBack }: { note: TopicNote; onBack: () => void }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [starting, setStarting] = useState(false);

  async function practise() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await api.post<{ attemptId: string; questionCount: number }>('/api/student/practice', {
        topics: [note.topic],
      });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      toast({ title: 'Could not start the quiz', description: (e as Error).message });
      setStarting(false);
    }
  }

  const termsId = `note-terms-${note.topic}`;
  const formulasId = `note-formulas-${note.topic}`;
  const tipsId = `note-tips-${note.topic}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> All topics
        </Button>
        <Badge variant="secondary" className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden /> {note.readMins} min read
        </Badge>
      </div>

      <article className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          <span className="text-primary tabular-nums">{note.topic}</span> {note.title}
        </h1>
        <p className="text-sm text-muted-foreground">{note.blurb}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="outline">{note.sections.length} sections</Badge>
          <Badge variant="outline">{note.keyTerms.length} key terms</Badge>
          {note.formulas ? <Badge variant="outline">{note.formulas.length} formulas</Badge> : null}
        </div>

        {/* main notes */}
        <div className="mt-6 space-y-4">
          {note.sections.map((s) => (
            <section key={s.heading} className="rounded-xl border bg-card p-5 sm:p-6">
              <h2 className="text-base font-semibold">{s.heading}</h2>
              <ul className="mt-3 space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary/55 shrink-0" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* key terms */}
        <section className="mt-8" aria-labelledby={termsId}>
          <h2
            id={termsId}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3"
          >
            <BookMarked className="h-4 w-4" aria-hidden /> Key terms
          </h2>
          <dl className="grid sm:grid-cols-2 gap-3">
            {note.keyTerms.map((kt) => (
              <div key={kt.term} className="rounded-xl border bg-card p-4">
                <dt className="text-sm font-semibold">{kt.term}</dt>
                <dd className="text-sm text-muted-foreground mt-1 leading-relaxed">{kt.def}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* formulas — mono, kbd-style, each with a worked example */}
        {note.formulas?.length ? (
          <section className="mt-8" aria-labelledby={formulasId}>
            <h2
              id={formulasId}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3"
            >
              <Sigma className="h-4 w-4" aria-hidden /> Formulas
            </h2>
            <div className="space-y-3">
              {note.formulas.map((f) => (
                <div key={f.name} className="rounded-xl border bg-card p-4 sm:p-5">
                  <div className="text-sm font-semibold">{f.name}</div>
                  <div className="mt-2 rounded-lg border border-black/5 bg-secondary/80 px-3.5 py-2.5 font-mono text-[13px] leading-relaxed shadow-[inset_0_1px_0_0_rgb(255_255_255/0.45)]">
                    {f.formula}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    <span className="font-semibold">e.g.</span> {f.example}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* examiner tips — accent callout */}
        <section
          className="mt-8 rounded-xl border bg-[var(--accent)]/25 p-5 sm:p-6"
          aria-labelledby={tipsId}
        >
          <h2
            id={tipsId}
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--accent-foreground)]"
          >
            <Lightbulb className="h-4 w-4" aria-hidden /> Examiner tips
          </h2>
          <ul className="mt-3 space-y-2.5">
            {note.examTips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-foreground)]/10 text-[11px] font-bold tabular-nums text-[var(--accent-foreground)]"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* straight into practice */}
        <div className="glass rounded-2xl p-5 sm:p-6 mt-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="font-semibold">Test yourself on this topic</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              An untimed practice quiz on {note.topic} — unlimited goes, instant marking.
            </p>
          </div>
          <Button
            onClick={() => void practise()}
            disabled={starting}
            className="w-full sm:w-auto shrink-0 shadow-[0_8px_24px_-8px_var(--primary)]"
          >
            <PlayCircle className="h-4 w-4" />
            {starting ? 'Loading…' : 'Practise this topic'}
          </Button>
        </div>
      </article>
    </>
  );
}

/* ---------------- deck card with persisted progress ---------------- */

function DeckCard({ deck, onOpen }: { deck: FlashcardDeck; onOpen: (focusUnknown: boolean) => void }) {
  const knownData = useSyncExternalStore(subscribeKnown, getKnownSnapshot, getKnownServerSnapshot);
  const known = useMemo(() => new Set(knownData[deck.topic] ?? []), [knownData, deck.topic]);

  const knownCount = known.size;
  const total = deck.cards.length;
  const unknownCount = total - knownCount;
  const pct = total ? Math.round((knownCount / total) * 100) : 0;
  const started = knownCount > 0;

  return (
    <div className="rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">
            <span className="text-primary tabular-nums">{deck.topic}</span> {deck.title}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{deck.blurb}</p>
        </div>
        <Badge variant="secondary" className="tabular-nums shrink-0">{total} cards</Badge>
      </div>

      {started ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">
              You know <span className="font-semibold text-foreground tabular-nums">{knownCount}</span> of {total}
              <span className="text-muted-foreground"> · {pct}%</span>
            </span>
            {pct === 100 ? (
              <span className="font-medium text-[var(--success)]">sorted!</span>
            ) : null}
          </div>
          <div className="h-2 rounded-full bg-secondary/90 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', pct === 100 ? 'bg-[var(--success)]' : 'bg-primary')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {unknownCount > 0 ? (
              <Button size="sm" className="h-8 text-xs" onClick={() => onOpen(true)}>
                <Target className="h-3.5 w-3.5" /> Focus on the {unknownCount} left
              </Button>
            ) : null}
            <Button
              size="sm"
              variant={unknownCount > 0 ? 'outline' : 'default'}
              className="h-8 text-xs"
              onClick={() => onOpen(false)}
            >
              <Shuffle className="h-3.5 w-3.5" /> Practise all
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          className="h-8 text-xs mt-3"
          variant="outline"
          onClick={() => onOpen(false)}
        >
          <Shuffle className="h-3.5 w-3.5" /> Start deck
        </Button>
      )}
    </div>
  );
}

/* ---------------- deck runner ---------------- */

function DeckRunner({
  deck,
  onlyUnknown,
  onExit,
}: {
  deck: FlashcardDeck;
  /** start with only the cards not yet marked "knew it" (persisted) */
  onlyUnknown: boolean;
  onExit: () => void;
}) {
  const [order, setOrder] = useState<number[]>(() => {
    const base = deck.cards.map((_, i) => i);
    if (onlyUnknown) {
      const known = new Set(readKnown()[deck.topic] ?? []);
      return base.filter((i) => !known.has(i));
    }
    return base;
  });
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [hint, setHint] = useState(false);
  const done = pos >= order.length;

  // persist "knew it" marks for this deck — writeKnown also notifies any
  // mounted deck cards (the library) so their progress bars update live
  const persist = useCallback(
    (idx: number, ok: boolean) => {
      const data = readKnown();
      const set = new Set(data[deck.topic] ?? []);
      if (ok) set.add(idx);
      else set.delete(idx);
      if (set.size === 0) delete data[deck.topic];
      else data[deck.topic] = [...set];
      writeKnown(data);
    },
    [deck.topic]
  );

  const restart = useCallback(
    (indices: number[]) => {
      const arr = [...indices];
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
    },
    []
  );

  const shuffle = useCallback(() => restart(deck.cards.map((_, i) => i)), [deck, restart]);

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
      persist(idx, ok);
      setFlipped(false);
      setHint(false);
      setPos((p) => p + 1);
    },
    [order, pos, persist]
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

  const progressPct = order.length ? Math.round((pos / order.length) * 100) : 100;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-4 w-4" /> All decks
        </Button>
        <div className="flex items-center gap-2">
          {unknown.size > 0 ? (
            <Button variant="outline" size="sm" onClick={() => restart([...unknown])}>
              <Target className="h-3.5 w-3.5" /> Revisit {unknown.size} missed
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={shuffle}>
            <Shuffle className="h-3.5 w-3.5" /> Shuffle & restart
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        <span className="text-primary tabular-nums">{deck.topic}</span> {deck.title}
        {onlyUnknown ? (
          <Badge variant="secondary" className="ml-2 align-middle">focus mode</Badge>
        ) : null}
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

      {order.length === 0 ? (
        <div className="max-w-xl mx-auto text-center py-10 space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15">
            <Check className="h-8 w-8 text-[var(--success)]" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Nothing left to focus on</h2>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ve marked every card in this deck as known — brilliant. Start the full deck to keep it fresh.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={shuffle}>
              <RotateCcw className="h-4 w-4" /> Practise the full deck
            </Button>
            <Button variant="outline" onClick={onExit}>All decks</Button>
          </div>
        </div>
      ) : done ? (
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
          <div className="flex flex-wrap gap-2 justify-center">
            {unknown.size > 0 ? (
              <Button onClick={() => restart([...unknown])}>
                <Target className="h-4 w-4" /> Revisit the {unknown.size} I missed
              </Button>
            ) : null}
            <Button variant={unknown.size > 0 ? 'outline' : 'default'} onClick={shuffle}>
              <RotateCcw className="h-4 w-4" /> {unknown.size > 0 ? 'Full deck again' : 'Go again'}
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
