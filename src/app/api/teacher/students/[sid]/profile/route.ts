import { NextResponse } from 'next/server';
import { colCached, item } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { decryptPassword } from '@/lib/passwords';
import { streaksFrom } from '@/lib/streaks';
import { toReview } from '@/lib/sanitize';
import { finalizeExpired } from '@/lib/finalize';
import { liteForStudent } from '@/lib/attemptLite';
import type { Attempt, QReview, RiskBand, Student } from '@/lib/types';

type Ctx = { params: Promise<{ sid: string }> };

/** Raw behavioural evidence recorded on one attempt — what the AI probability
 *  score is actually built from. Read straight off the stored telemetry; the
 *  score itself was computed at submission time (src/lib/risk.ts). */
function attemptEvidence(x: Attempt) {
  const events = x.events ?? [];
  const times = Object.values(x.perQ ?? {})
    .map((t) => t?.ms ?? 0)
    .filter((ms) => ms > 0);
  const wallMs = x.wallMs ?? 0;
  return {
    pasteCount: events.filter((e) => e.e === 'paste').length,
    copyCount: events.filter((e) => e.e === 'copy' || e.e === 'cut').length,
    tabSwitches: events.filter((e) => e.e === 'hide').length,
    blurCount: events.filter((e) => e.e === 'blur').length,
    avgMsPerQ: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
    hiddenPct: wallMs > 0 ? Math.round(((x.hiddenMs ?? 0) / wallMs) * 1000) / 10 : 0,
    wallSec: Math.round(wallMs / 1000),
  };
}

/**
 * GET /api/teacher/students/[sid]/profile
 * Everything about one student: account, stats, progress over time and every
 * quiz they have ever taken (assignments and practice, self-tests excluded)
 * with their exact answers, per-quiz AI probability and overall probability.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { sid } = await ctx.params;

  const student = await item<Student>('students', sid);
  if (!student || student.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const classes = await colCached<{ id: string; name: string }>('classes');
  const className = student.classId ? (classes[student.classId]?.name ?? '') : '';

  // every attempt of this student that is not a teacher self-test. The slim
  // feed gives us the ids (a tiny per-student read); the full records are
  // then fetched one by one — this dialog genuinely needs questions, answers
  // and telemetry, and it's a one-off open, not a poll.
  const idx = (await liteForStudent(sid)).filter((x) => x.mode !== 'selftest');
  const fulls = (
    await Promise.all(idx.map((x) => item<Attempt>('attempts', x.id)))
  ).filter((x): x is Attempt => Boolean(x));
  const mine = await finalizeExpired(fulls);
  mine.sort((a, b) => a.startedAt - b.startedAt);

  const submitted = mine.filter((x) => x.status === 'submitted' && x.result);

  // ---- per-attempt cards -------------------------------------------------
  const attempts = mine.map((x) => {
    const r = x.result;
    let reviews: QReview[] = [];
    if (r) {
      reviews = x.questions.map((q, i) => {
        const rec = r.perQ?.[q.id];
        return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct), rec);
      });
    }
    return {
      evidence: r ? attemptEvidence(x) : null,
      id: x.id,
      mode: x.mode as 'assignment' | 'practice',
      title: x.assignmentTitle,
      status: x.status as 'submitted' | 'in-progress',
      score: r?.score ?? null,
      total: r?.total ?? null,
      pct: r?.pct ?? null,
      points: r?.points ?? null,
      timeTakenSec: r?.timeTakenSec ?? null,
      submittedAt: r?.submittedAt ?? null,
      riskScore: r?.riskScore ?? null,
      riskBand: (r?.riskBand ?? null) as RiskBand | null,
      riskSignals: r?.riskSignals ?? [],
      writtenPending: r?.writtenPending ?? 0,
      aiFeedback: r?.feedback ?? null,
      teacherFeedback: x.teacherFeedback?.text ?? null,
      teacherFeedbackAt: x.teacherFeedback?.at ?? null,
      reviews,
    };
  });

  // ---- headline stats ----------------------------------------------------
  const pcts = submitted.map((x) => x.result!.pct);
  const avgPct = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : null;
  const points = submitted.reduce((sum, x) => sum + (x.result?.points ?? 0), 0);

  // overall AI probability: question-count-weighted mean of per-quiz risk
  let wSum = 0;
  let wCount = 0;
  for (const x of submitted) {
    const w = x.questions.length || 1;
    wSum += (x.result?.riskScore ?? 0) * w;
    wCount += w;
  }
  const overallRisk = wCount ? Math.round(wSum / wCount) : null;
  const overallBand: RiskBand | null =
    overallRisk === null ? null : overallRisk < 20 ? 'low' : overallRisk < 45 ? 'moderate' : overallRisk < 70 ? 'elevated' : 'high';

  const streak = streaksFrom(submitted.map((x) => x.result?.submittedAt ?? 0));

  // ---- behavioural evidence behind the overall AI probability -------------
  // aggregated across every submitted quiz, straight from the stored telemetry
  const allTimes: number[] = [];
  const signalTally = new Map<string, number>();
  for (const x of submitted) {
    for (const t of Object.values(x.perQ ?? {})) {
      if ((t?.ms ?? 0) > 0) allTimes.push(t.ms);
    }
    for (const s of x.result?.riskSignals ?? []) {
      signalTally.set(s.label, (signalTally.get(s.label) ?? 0) + 1);
    }
  }
  const evidence = {
    pasteCount: submitted.reduce((n, x) => n + (x.events ?? []).filter((e) => e.e === 'paste').length, 0),
    copyCount: submitted.reduce((n, x) => n + (x.events ?? []).filter((e) => e.e === 'copy' || e.e === 'cut').length, 0),
    tabSwitches: submitted.reduce((n, x) => n + (x.events ?? []).filter((e) => e.e === 'hide').length, 0),
    totalHiddenMin: Math.round((submitted.reduce((n, x) => n + (x.hiddenMs ?? 0), 0) / 6000)) / 10,
    avgMsPerQ: allTimes.length ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length) : null,
    fastAnswers: allTimes.filter((ms) => ms < 2500).length,
    quizzesWithSignals: submitted.filter((x) => (x.result?.riskSignals ?? []).length > 0).length,
    // most frequent integrity signals first — label → how many quizzes it fired in
    signalCounts: [...signalTally.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  };

  return NextResponse.json({
    student: {
      id: student.id,
      displayName: student.displayName,
      avatar: (await item<{ img?: string }>('avatars', student.id))?.img ?? null,
      username: student.username,
      password: decryptPassword(student.pwEnc),
      createdAt: student.createdAt,
      classId: student.classId,
      className,
    },
    stats: {
      quizzesDone: submitted.length,
      inProgress: mine.filter((x) => x.status === 'in-progress').length,
      avgPct,
      bestPct: pcts.length ? Math.max(...pcts) : null,
      points,
      overallRisk,
      overallBand,
      streakCurrent: streak.current,
      streakBest: streak.best,
      activeDays: streak.activeDays,
      lastActive: submitted.length ? Math.max(...submitted.map((x) => x.result?.submittedAt ?? 0)) : null,
    },
    // progress over time — one point per submitted quiz, oldest first
    progress: submitted.map((x) => ({
      at: x.result!.submittedAt,
      pct: x.result!.pct,
      title: x.assignmentTitle,
      mode: x.mode as 'assignment' | 'practice',
    })),
    evidence, // aggregated telemetry behind the overall AI probability
    attempts: attempts.reverse(), // newest first for the list
  });
}
