import { NextResponse } from 'next/server';
import { merge } from '@/lib/firebase';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { markAttempt } from '@/lib/marking';
import { assessRisk, pointsFor } from '@/lib/risk';
import { generateFeedback } from '@/lib/ai';
import { toReview } from '@/lib/sanitize';
import { TOPIC_MAP } from '@/lib/topics';
import type { Attempt, PerQTelemetry, TelemetryEvent } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

interface SubmitBody {
  answers?: Record<string, string>;
  perQ?: Record<string, PerQTelemetry>;
  events?: TelemetryEvent[];
  wallMs?: number;
  hiddenMs?: number;
}

const MAX_EVENTS = 400;

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const attempt = access.attempt;
  const isSelfTest = attempt.mode === 'selftest';
  if (attempt.status === 'submitted') {
    return NextResponse.json({ error: 'Already submitted.', alreadySubmitted: true }, { status: 409 });
  }

  const body = (await req.json().catch(() => ({}))) as SubmitBody;
  const answers: Record<string, string> = { ...(attempt.answers ?? {}) };
  const writtenIds = new Set(attempt.questions.filter((q) => q.type === 'written').map((q) => q.id));
  for (const [qid, val] of Object.entries(body.answers ?? {})) {
    if (typeof qid === 'string' && attempt.questions.some((q) => q.id === qid)) {
      // confirmed answers are locked server-side; unchecked ones accept the client value
      if (!attempt.checked?.[qid]) answers[qid] = (val ?? '').toString().slice(0, writtenIds.has(qid) ? 5000 : 300);
    }
  }
  const perQ: Record<string, PerQTelemetry> = {};
  for (const [qid, val] of Object.entries(body.perQ ?? {})) {
    if (typeof qid === 'string' && val && typeof val === 'object') {
      perQ[qid] = {
        ms: Math.max(0, Math.min(3_600_000, Number(val.ms) || 0)),
        ks: Math.max(0, Math.min(5000, Number(val.ks) || 0)),
        ch: Math.max(0, Math.min(500, Number(val.ch) || 0)),
      };
    }
  }
  const events: TelemetryEvent[] = (body.events ?? [])
    .filter((e) => e && typeof e.e === 'string')
    .slice(0, MAX_EVENTS)
    .map((e) => ({
      e: e.e as TelemetryEvent['e'],
      t: Math.max(0, Number(e.t) || 0),
      d: typeof e.d === 'string' ? e.d.slice(0, 240) : undefined,
    }));
  const wallMs = Math.max(0, Math.min(24 * 3600_000, Number(body.wallMs) || 0));
  const hiddenMs = Math.max(0, Math.min(wallMs, Number(body.hiddenMs) || 0));

  // deterministic marking
  const marked = markAttempt(attempt.questions, answers);
  const correctMap: Record<string, boolean> = {};
  for (const [qid, rec] of Object.entries(marked.perQ)) correctMap[qid] = rec.correct;

  // integrity analysis
  const risk = assessRisk({
    questions: attempt.questions,
    answers,
    perQ,
    events,
    wallMs,
    hiddenMs,
    perQCorrect: correctMap,
  });

  const points = isSelfTest ? 0 : pointsFor(marked.score, marked.total, marked.pct); // self-tests earn no points
  const timeTakenSec = Math.round(wallMs / 1000);

  // feedback (AI with template fallback — never blocks the result)
  const topicTitles: Record<string, string> = Object.fromEntries(
    (marked.topicStats ?? []).map((s) => [s.topic, TOPIC_MAP[s.topic]?.title ?? s.topic])
  );
  const sortedTopics = [...(marked.topicStats ?? [])]
    .map((s) => ({ tid: s.topic, pct: s.t ? (s.c / s.t) * 100 : 0 }))
    .sort((a, b) => a.pct - b.pct);
  const feedback = await generateFeedback({
    studentName: attempt.studentName,
    quizTitle: attempt.assignmentTitle,
    pct: marked.pct,
    score: marked.score,
    total: marked.total,
    topicStats: marked.topicStats,
    topicTitles,
    weakTopics: sortedTopics.filter((t) => t.pct < 60).map((t) => t.tid),
    strongTopics: sortedTopics.filter((t) => t.pct >= 80).map((t) => t.tid),
    timeTakenSec,
  });

  const result: NonNullable<Attempt['result']> = {
    score: marked.score,
    total: marked.total,
    pct: marked.pct,
    perQ: marked.perQ,
    topicStats: marked.topicStats,
    timeTakenSec,
    points,
    feedback: feedback.text,
    feedbackBy: feedback.by,
    riskScore: risk.score,
    riskBand: risk.band,
    riskSignals: risk.signals,
    submittedAt: Date.now(),
    writtenPending: marked.writtenPending,
  };

  await merge('attempts', attempt.id, {
    status: 'submitted' as const,
    answers,
    checked: attempt.checked ?? {},
    perQ,
    events,
    wallMs,
    hiddenMs,
    result,
  });

  const reviews = attempt.questions.map((q, i) => {
    const rec = marked.perQ[q.id];
    return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct), rec);
  });

  return NextResponse.json({
    ok: true,
    attemptId: attempt.id,
    result,
    reviews,
    topicStats: marked.topicStats,
  });
}
