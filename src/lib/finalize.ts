// Server-side finalization of timed attempts whose clock ran out while the
// student was away. Without this, an expired attempt stays "in-progress"
// forever (the teacher sees "still working" indefinitely and class stats miss
// it). Checked answers already live on the attempt, so marking is fully
// deterministic; feedback uses the instant template (no slow AI call inside a
// read route's hot path).

import { merge } from './firebase';
import { markAttempt } from './marking';
import { assessRisk, pointsFor } from './risk';
import { templateFeedback } from './ai';
import { TOPIC_MAP } from './topics';
import type { Attempt, AttemptResult } from './types';

/** attempts currently being finalized (guards double-sweeps within this process) */
const inFlight = new Set<string>();

/**
 * Finalize any in-progress attempts whose time limit has elapsed.
 * Returns the (possibly updated) attempts so callers build fresh rows.
 */
export async function finalizeExpired(attempts: Attempt[]): Promise<Attempt[]> {
  const out: Attempt[] = [];
  const now = Date.now();

  for (const a of attempts) {
    const expired =
      a.status === 'in-progress' &&
      a.timeLimitMin != null &&
      a.timeLimitMin > 0 &&
      now > a.startedAt + a.timeLimitMin * 60_000;

    if (!expired || inFlight.has(a.id)) {
      out.push(a);
      continue;
    }

    inFlight.add(a.id);
    try {
      const finalized = await finalizeOne(a, now);
      out.push(finalized);
    } catch {
      out.push(a); // never let a sweep failure break the route
    } finally {
      inFlight.delete(a.id);
    }
  }

  return out;
}

async function finalizeOne(a: Attempt, now: number): Promise<Attempt> {
  const limitMs = (a.timeLimitMin ?? 0) * 60_000;
  // stored answers = everything the student confirmed before the clock ran out
  const answers = a.answers ?? {};
  const marked = markAttempt(a.questions, answers);

  const correctMap: Record<string, boolean> = {};
  for (const [qid, rec] of Object.entries(marked.perQ)) correctMap[qid] = rec.correct;

  const wallMs = Math.max(0, Math.min(now - a.startedAt, limitMs));
  const hiddenMs = Math.max(0, Math.min(a.wallMs || wallMs, a.hiddenMs ?? 0));
  const risk = assessRisk({
    questions: a.questions,
    answers,
    perQ: a.perQ ?? {},
    events: a.events ?? [],
    wallMs,
    hiddenMs,
    perQCorrect: correctMap,
  });

  const points = pointsFor(marked.score, marked.total, marked.pct);
  const timeTakenSec = Math.round(wallMs / 1000);

  const topicTitles: Record<string, string> = Object.fromEntries(
    (marked.topicStats ?? []).map((s) => [s.topic, TOPIC_MAP[s.topic]?.title ?? s.topic])
  );
  const sortedTopics = [...(marked.topicStats ?? [])]
    .map((s) => ({ tid: s.topic, pct: s.t ? (s.c / s.t) * 100 : 0 }))
    .sort((x, y) => x.pct - y.pct);

  const feedback = templateFeedback({
    studentName: a.studentName,
    quizTitle: a.assignmentTitle,
    pct: marked.pct,
    score: marked.score,
    total: marked.total,
    topicStats: marked.topicStats ?? [],
    topicTitles,
    weakTopics: sortedTopics.filter((t) => t.pct < 60).map((t) => t.tid),
    strongTopics: sortedTopics.filter((t) => t.pct >= 80).map((t) => t.tid),
    timeTakenSec,
  });

  const result: AttemptResult = {
    score: marked.score,
    total: marked.total,
    pct: marked.pct,
    perQ: marked.perQ,
    topicStats: marked.topicStats ?? [],
    timeTakenSec,
    points,
    feedback,
    feedbackBy: 'template',
    riskScore: risk.score,
    riskBand: risk.band,
    riskSignals: risk.signals,
    submittedAt: now,
    writtenPending: marked.writtenPending,
  };

  await merge('attempts', a.id, {
    status: 'submitted' as const,
    answers,
    checked: a.checked ?? {},
    perQ: a.perQ ?? {},
    events: a.events ?? [],
    wallMs,
    hiddenMs,
    result,
  });

  return { ...a, status: 'submitted', wallMs, hiddenMs, result, answers };
}
