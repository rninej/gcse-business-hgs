'use client';

// Teacher tools for looking inside a student's work.
//
//  • StudentProfileDialog — everything about one student: account and login,
//    headline stats, a progress-over-time graph, every quiz they have ever
//    taken (assignments and practice) with their exact answers, per-quiz AI
//    probability and an overall AI probability.
//  • StudentAnswersDialog — one assignment: every go with exact answers plus
//    a feedback box the teacher writes to the student in.

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Flame,
  KeyRound,
  MessageSquareHeart,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { displayGiven } from '@/lib/sanitize';
import { ProgressLine, RiskMeter } from '@/components/charts';
import { PctChip, TypeBadge } from '@/components/shared';
import type { QReview, RiskBand, RiskSignal } from '@/lib/types';

// ---------------------------------------------------------------- types --

interface FeedbackNote {
  text: string;
  at: number;
  byName: string;
}

export interface AttemptDetail {
  id: string;
  mode: 'assignment' | 'practice';
  title: string;
  status: 'submitted' | 'in-progress';
  score: number | null;
  total: number | null;
  pct: number | null;
  timeTakenSec: number | null;
  submittedAt: number | null;
  riskScore: number | null;
  riskBand: RiskBand | null;
  riskSignals: RiskSignal[];
  aiFeedback: string | null;
  teacherFeedback: FeedbackNote | null;
  reviews: QReview[];
}

interface ProfileData {
  student: {
    id: string;
    displayName: string;
    username: string;
    password: string | null;
    createdAt: number;
    className: string;
  };
  stats: {
    quizzesDone: number;
    inProgress: number;
    avgPct: number | null;
    bestPct: number | null;
    points: number;
    overallRisk: number | null;
    overallBand: RiskBand | null;
    streakCurrent: number;
    streakBest: number;
    activeDays: number;
    lastActive: number | null;
  };
  progress: { at: number; pct: number; title: string; mode: string }[];
  attempts: AttemptDetail[];
}

// --------------------------------------------------------- shared pieces --

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '')).toUpperCase() || '?';
}

const BAND_COLOR: Record<RiskBand, string> = {
  low: 'var(--success)',
  moderate: 'var(--warn)',
  elevated: 'oklch(0.72 0.16 55)',
  high: 'var(--danger)',
};

/** Small "AI 34%" chip — probability the answers weren't the student's own. */
function RiskChip({ score, band }: { score: number | null; band: RiskBand | null }) {
  if (score === null || band === null) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums"
      style={{ color: BAND_COLOR[band], borderColor: `${BAND_COLOR[band]}55`, background: `${BAND_COLOR[band]}12` }}
      title="AI probability — how strongly the behaviour signals point to pasted or generated answers rather than the student's own work"
    >
      <ShieldAlert className="h-3 w-3" aria-hidden /> AI {score}%
    </span>
  );
}

function fmtDate(t: number | null | undefined, withTime = false): string {
  if (!t) return '—';
  return new Date(t).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: withTime ? undefined : 'numeric',
    hour: withTime ? '2-digit' : undefined,
    minute: withTime ? '2-digit' : undefined,
  });
}

/** The student's exact answer to every question of one attempt. */
export function AnswersList({ reviews }: { reviews: QReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No answers recorded on this attempt.</p>;
  }
  return (
    <ol className="space-y-2">
      {reviews.map((q) => (
        <li
          key={q.qid}
          className={cn(
            'rounded-lg border p-3 text-sm',
            q.correct ? 'border-[var(--success)]/25 bg-[var(--success)]/[0.04]' : 'border-[var(--danger)]/25 bg-[var(--danger)]/[0.04]'
          )}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
            <span className="font-bold text-primary tabular-nums">Q{q.n}</span>
            <TypeBadge type={q.type} />
            <span className="text-muted-foreground">{q.topic}</span>
            {q.correct ? (
              <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[var(--success)]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> correct · {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[var(--danger)]">
                <XCircle className="h-3.5 w-3.5" aria-hidden /> incorrect · 0/{q.marks}
              </span>
            )}
          </div>
          <p className="font-medium leading-snug">{q.stem}</p>
          <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            <p className={cn('rounded-md px-2 py-1.5 border', q.correct ? 'bg-[var(--success)]/10 border-[var(--success)]/20' : 'bg-[var(--danger)]/10 border-[var(--danger)]/20')}>
              <span className="text-muted-foreground block mb-0.5">Their answer</span>
              <span className="font-semibold">{q.given && q.given !== '—' ? displayGiven(q, q.given) : '— left blank —'}</span>
            </p>
            <p className="rounded-md px-2 py-1.5 border bg-secondary/40">
              <span className="text-muted-foreground block mb-0.5">Correct answer</span>
              <span className="font-semibold">{q.expected}</span>
            </p>
          </div>
          {!q.correct && q.explain ? <p className="text-xs text-muted-foreground mt-2">{q.explain}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/** Teacher's written note to the student about this quiz. */
export function FeedbackEditor({
  attemptId,
  initial,
  onSaved,
}: {
  attemptId: string;
  initial: FeedbackNote | null;
  onSaved?: (note: FeedbackNote | null) => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState(initial?.text ?? '');
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<FeedbackNote | null>(initial);

  useEffect(() => {
    setText(initial?.text ?? '');
    setSavedNote(initial);
  }, [attemptId, initial]);

  async function save() {
    setSaving(true);
    try {
      const res = await api.post<{ ok: true; teacherFeedback?: FeedbackNote; cleared?: boolean }>(
        `/api/teacher/attempts/${attemptId}/feedback`,
        { text }
      );
      const note = res.cleared ? null : (res.teacherFeedback ?? null);
      setSavedNote(note);
      onSaved?.(note);
      toast({ title: note ? 'Feedback saved — the student will see it on their result' : 'Feedback cleared' });
    } catch (e) {
      toast({ title: 'Could not save feedback', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border bg-[var(--accent)]/20 p-3">
      <label htmlFor={`fb-${attemptId}`} className="flex items-center gap-1.5 text-xs font-semibold mb-2">
        <MessageSquareHeart className="h-3.5 w-3.5 text-primary" aria-hidden /> Your feedback to the student
      </label>
      <Textarea
        id={`fb-${attemptId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. Great work on the calculations — revisit break-even (Q4) and re-read the cash flow forecast question before Friday."
        className="text-sm bg-card"
      />
      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-[11px] text-muted-foreground">
          {savedNote ? `Last saved ${fmtDate(savedNote.at, true)} by ${savedNote.byName}` : 'Nothing sent yet'}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={saving || (savedNote?.text ?? '') === '' || text === (savedNote?.text ?? '')}
            onClick={() => {
              setText('');
              void save();
            }}
          >
            Clear
          </Button>
          <Button size="sm" disabled={saving || text.trim().length === 0 || text === (savedNote?.text ?? '')} onClick={() => void save()}>
            <Send className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Send feedback'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Header strip with the key numbers of one attempt. */
function AttemptSummary({ a }: { a: AttemptDetail }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {a.pct !== null ? (
        <>
          <span className="tabular-nums font-semibold text-foreground">
            {a.score}/{a.total} marks
          </span>
          <PctChip pct={a.pct} />
        </>
      ) : (
        <Badge variant="secondary" className="text-[10px]">Still in progress</Badge>
      )}
      <span className="tabular-nums inline-flex items-center gap-1">
        <Timer className="h-3.5 w-3.5" aria-hidden />
        {a.timeTakenSec !== null ? `${Math.floor(a.timeTakenSec / 60)}m ${a.timeTakenSec % 60}s` : '—'}
      </span>
      {a.submittedAt ? <span className="tabular-nums">{fmtDate(a.submittedAt, true)}</span> : null}
      <RiskChip score={a.riskScore} band={a.riskBand} />
    </div>
  );
}

// ------------------------------------------------------ answers dialog --
// One assignment, one student: every go with exact answers + feedback box.

export function StudentAnswersDialog({
  studentName,
  assignmentTitle,
  attemptIds,
  open,
  onOpenChange,
}: {
  studentName: string;
  assignmentTitle: string;
  attemptIds: string[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [state, setState] = useState<{ key: string; details: Record<string, AttemptDetail>; error: string | null } | null>(null);
  const [sel, setSel] = useState(0);
  const key = attemptIds.join(',');

  const current = state?.key === key ? state : null;
  const loading = open && key !== '' && !current;
  const ordered = attemptIds.map((id) => current?.details[id]).filter(Boolean) as AttemptDetail[];

  useEffect(() => {
    if (!open || key === '') return;
    let cancelled = false;
    Promise.all(
      attemptIds.map((id) =>
        api
          .get<AttemptDetail>(`/api/teacher/attempts/${id}`)
          .then((d) => [id, d] as const)
          .catch(() => [id, null] as const)
      )
    ).then((pairs) => {
      if (cancelled) return;
      const map: Record<string, AttemptDetail> = {};
      for (const [id, d] of pairs) if (d) map[id] = d;
      // show the LATEST go by default (ids arrive oldest-first)
      const okIds = attemptIds.filter((id) => map[id]);
      setSel(Math.max(0, okIds.length - 1));
      setState({ key, details: map, error: okIds.length === 0 ? 'No submitted answers to show yet.' : null });
    });
    return () => {
      cancelled = true;
    };
  }, [open, key]);

  const errorText = current?.error ?? null;
  const selected = ordered[sel];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="text-left shrink-0">
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
            <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden />
            {studentName} — {assignmentTitle}
          </DialogTitle>
          <DialogDescription>
            Every answer exactly as {studentName.split(' ')[0]} gave it, across {attemptIds.length} go{attemptIds.length === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scroll-slim -mx-1 px-1 space-y-4 grow">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : errorText ? (
            <p className="text-sm text-muted-foreground">{errorText}</p>
          ) : selected ? (
            <>
              {ordered.length > 1 ? (
                <div className="flex flex-wrap gap-1.5">
                  {ordered.map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => setSel(i)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                        i === sel ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary/60'
                      )}
                      aria-pressed={i === sel}
                    >
                      Go {i + 1}
                      {i === ordered.length - 1 ? ' · latest' : ''} · {a.pct ?? '—'}%
                    </button>
                  ))}
                </div>
              ) : null}

              <AttemptSummary a={selected} />

              {selected.aiFeedback ? (
                <div className="rounded-lg border bg-card p-3 text-sm flex gap-2.5">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Auto feedback given to the student: </span>
                    {selected.aiFeedback}
                  </p>
                </div>
              ) : null}

              <FeedbackEditor attemptId={selected.id} initial={selected.teacherFeedback} />

              <AnswersList reviews={selected.reviews} />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------ profile dialog --
// Everything about one student, opened from Classes or Results.

export function StudentProfileDialog({
  studentId,
  open,
  onOpenChange,
}: {
  studentId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  // state is keyed by student id so switching students never shows stale data
  const [state, setState] = useState<{ id: string; data: ProfileData | null; error: string | null } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !studentId) return;
    let cancelled = false;
    api
      .get<ProfileData>(`/api/teacher/students/${studentId}/profile`)
      .then((d) => {
        if (!cancelled) setState({ id: studentId, data: d, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ id: studentId, data: null, error: (e as Error).message });
      });
    return () => {
      cancelled = true;
    };
  }, [open, studentId]);

  const load = useCallback(() => {
    if (!studentId) return;
    api
      .get<ProfileData>(`/api/teacher/students/${studentId}/profile`)
      .then((d) => setState({ id: studentId!, data: d, error: null }))
      .catch((e) => setState({ id: studentId!, data: null, error: (e as Error).message }));
  }, [studentId]);

  function copy(text: string, what: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: `${what} copied` }));
  }

  const live = state?.id === studentId ? state : null;
  const data = live?.data ?? null;
  const error = live?.error ?? null;
  const s = data?.stats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col">
        <DialogHeader className="text-left shrink-0">
          <DialogTitle className="pr-6">Student profile</DialogTitle>
          <DialogDescription>Everything about this student — stats, progress, every quiz and every answer.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scroll-slim -mx-1 px-1 space-y-5 grow">
          {error ? (
            <p className="text-sm text-[var(--danger)]">{error}</p>
          ) : !data || !s ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              {/* identity */}
              <div className="rounded-xl border bg-card p-4 flex flex-wrap items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary" aria-hidden>
                  {initials(data.student.displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-lg leading-tight">{data.student.displayName}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                    {data.student.className ? <span>{data.student.className}</span> : null}
                    <span>joined {fmtDate(data.student.createdAt)}</span>
                    {s.lastActive ? <span>last active {fmtDate(s.lastActive, true)}</span> : <span>not active yet</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => copy(data.student.username, 'Username')}
                    className="inline-flex items-center gap-1.5 rounded-md border bg-secondary/40 px-2.5 py-1.5 font-mono text-xs hover:bg-secondary transition-colors"
                    title="Copy username"
                  >
                    {data.student.username} <Copy className="h-3 w-3 text-muted-foreground" aria-hidden />
                  </button>
                  {data.student.password ? (
                    <button
                      onClick={() => copy(data.student.password ?? '', 'Password')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-mono text-xs text-primary hover:bg-primary/10 transition-colors"
                      title="Copy password"
                    >
                      <KeyRound className="h-3 w-3" aria-hidden /> {data.student.password} <Copy className="h-3 w-3 opacity-60" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* headline stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Quizzes done', value: String(s.quizzesDone), sub: s.inProgress ? `${s.inProgress} in progress` : 'all submitted' },
                  { label: 'Average', value: s.avgPct === null ? '—' : `${s.avgPct}%`, sub: s.bestPct === null ? '' : `best ${s.bestPct}%` },
                  { label: 'Points', value: s.points.toLocaleString(), sub: 'all-time' },
                  { label: 'Streak', value: `${s.streakCurrent}d`, sub: `best ${s.streakBest}d` },
                  { label: 'Active days', value: String(s.activeDays), sub: 'since joining' },
                  {
                    label: 'Overall AI probability',
                    value: s.overallRisk === null ? '—' : `${s.overallRisk}%`,
                    valueColor: s.overallBand ? BAND_COLOR[s.overallBand] : undefined,
                    sub: s.overallBand ? `${s.overallBand} risk` : 'no quizzes yet',
                  },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border bg-card p-3">
                    <div className="text-[11px] text-muted-foreground leading-tight">{c.label}</div>
                    <div className="text-xl font-bold tabular-nums mt-1" style={c.valueColor ? { color: c.valueColor } : undefined}>
                      {c.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* progress over time */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden /> Progress over time
                </h3>
                <ProgressLine points={data.progress} />
              </div>

              {/* overall integrity meter */}
              {s.overallRisk !== null ? (
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" aria-hidden /> Overall AI probability
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Weighted across every quiz they have taken. An indicator, not proof — use it to start a conversation.
                  </p>
                  <RiskMeter score={s.overallRisk} band={s.overallBand ?? 'low'} />
                </div>
              ) : null}

              {/* every quiz */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-primary" aria-hidden /> Every quiz they&rsquo;ve taken
                  <Badge variant="secondary" className="text-[10px] font-normal">{data.attempts.length} total</Badge>
                </h3>
                {data.attempts.length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-xl border bg-card p-4">
                    This student hasn&rsquo;t started any quiz yet — assignments and practice both show up here.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.attempts.map((a) => {
                      const isOpen = expanded === a.id;
                      return (
                        <li key={a.id} className="rounded-xl border bg-card overflow-hidden">
                          <button
                            className="w-full text-left p-3.5 hover:bg-secondary/30 transition-colors flex flex-wrap items-center gap-x-3 gap-y-1.5"
                            onClick={() => setExpanded(isOpen ? null : a.id)}
                            aria-expanded={isOpen}
                          >
                            <span className="font-medium text-sm min-w-0 flex-1 truncate">{a.title}</span>
                            <Badge variant={a.mode === 'assignment' ? 'default' : 'secondary'} className="text-[10px]">
                              {a.mode === 'assignment' ? 'Task' : 'Practice'}
                            </Badge>
                            <span className="text-xs text-muted-foreground tabular-nums">{fmtDate(a.submittedAt ?? null)}</span>
                            {a.pct !== null ? <PctChip pct={a.pct} /> : <Badge variant="outline" className="text-[10px]">in progress</Badge>}
                            <RiskChip score={a.riskScore} band={a.riskBand} />
                          </button>
                          {isOpen ? (
                            <div className="border-t px-3.5 py-3.5 space-y-3 bg-[var(--sidebar)]/40">
                              <AttemptSummary a={a} />
                              {a.teacherFeedback ? (
                                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
                                  <p className="text-xs font-semibold flex items-center gap-1.5 mb-1">
                                    <MessageSquareHeart className="h-3.5 w-3.5 text-primary" aria-hidden /> Your feedback
                                    <span className="text-muted-foreground font-normal">· {fmtDate(a.teacherFeedback.at, true)}</span>
                                  </p>
                                  {a.teacherFeedback.text}
                                </div>
                              ) : null}
                              {a.status === 'submitted' ? (
                                <FeedbackEditor
                                  attemptId={a.id}
                                  initial={a.teacherFeedback}
                                  onSaved={() => load()}
                                />
                              ) : null}
                              {a.aiFeedback ? (
                                <div className="rounded-lg border bg-card p-3 text-sm flex gap-2.5">
                                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                                  <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Auto feedback the student received: </span>
                                    {a.aiFeedback}
                                  </p>
                                </div>
                              ) : null}
                              <AnswersList reviews={a.reviews} />
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* quick facts row */}
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" aria-hidden /> points come from marks + bonuses</span>
                <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" aria-hidden /> streak counts consecutive days with a submission</span>
                <span className="inline-flex items-center gap-1"><ShieldAlert className="h-3 w-3" aria-hidden /> AI probability blends paste, typing and timing signals</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
