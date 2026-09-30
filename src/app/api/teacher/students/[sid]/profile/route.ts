import { NextResponse } from 'next/server';
import { colCached, item, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { decryptPassword } from '@/lib/passwords';
import { streaksFrom } from '@/lib/streaks';
import { toReview } from '@/lib/sanitize';
import { finalizeExpired } from '@/lib/finalize';
import type { Attempt, QReview, RiskBand, Student } from '@/lib/types';

type Ctx = { params: Promise<{ sid: string }> };

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

  // every attempt of this student that is not a teacher self-test; finalise
  // expired timed attempts so the numbers are up to date
  const mine = await finalizeExpired(
    values(await colCached<Attempt>('attempts')).filter(
      (x) => x.studentId === sid && x.mode !== 'selftest'
    )
  );
  mine.sort((a, b) => a.startedAt - b.startedAt);

  const submitted = mine.filter((x) => x.status === 'submitted' && x.result);

  // ---- per-attempt cards -------------------------------------------------
  const attempts = mine.map((x) => {
    const r = x.result;
    let reviews: QReview[] = [];
    if (r) {
      reviews = x.questions.map((q, i) => {
        const rec = r.perQ?.[q.id];
        return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct));
      });
    }
    return {
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

  return NextResponse.json({
    student: {
      id: student.id,
      displayName: student.displayName,
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
    attempts: attempts.reverse(), // newest first for the list
  });
}
