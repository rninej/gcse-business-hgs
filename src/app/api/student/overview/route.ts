import { NextResponse } from 'next/server';
import { colCached } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { streaksFrom, hasQuizToday } from '@/lib/streaks';
import { topicTitle } from '@/lib/topics';
import { liteForStudent } from '@/lib/attemptLite';
import { readWrongPool } from '@/lib/wrongPoolFeed';
import { computeBadges } from '@/lib/badges';
import type { Student } from '@/lib/types';

export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  // the student's OWN slim feed — a few KB, never anyone else's attempts
  const attempts = (await liteForStudent(session.uid))
    .filter((a) => a.status === 'submitted' && a.result)
    .sort((a, b) => (b.result?.submittedAt ?? 0) - (a.result?.submittedAt ?? 0));

  const pcts = attempts.map((a) => a.result!.pct);
  const avgPct = pcts.length ? Math.round((pcts.reduce((x, y) => x + y, 0) / pcts.length) * 10) / 10 : null;

  const topicAgg = new Map<string, { c: number; t: number }>();
  for (const at of attempts) {
    for (const v of at.result?.topicStats ?? []) {
      const agg = topicAgg.get(v.topic) ?? { c: 0, t: 0 };
      agg.c += v.c;
      agg.t += v.t;
      topicAgg.set(v.topic, agg);
    }
  }
  const mastery = [...topicAgg.entries()]
    .map(([tid, v]) => ({
      topic: tid,
      title: topicTitle(tid),
      pct: v.t ? Math.round((v.c / v.t) * 100) : 0,
      attempts: v.t,
    }))
    .sort((x, y) => x.pct - y.pct);

  const points = attempts.reduce((sum, a) => sum + (a.result?.points ?? 0), 0);
  const streak = streaksFrom(attempts.map((a) => a.result?.submittedAt ?? 0));

  // submitted-at timestamps — feeds the activity heatmap (client buckets
  // them into LOCAL days so a 23:00 quiz lands on the right day)
  const activity = attempts.map((a) => a.result!.submittedAt);

  // has the streak already been secured today? (same UTC day boundary the
  // streak maths uses — drives the "streak at risk" nudge on the dashboard)
  const quizToday = hasQuizToday(activity);

  // the wrong-answer pool feed is maintained at submit time — counting it is
  // one tiny read of the student's own data
  const wrongPool = Object.keys(await readWrongPool(session.uid)).length;

  // ---- achievements: badge unlock maths on facts already loaded ----
  // (hours use server time; the deployment runs UTC, which matches the
  // students' UK clocks in winter and is one hour off during BST)
  const perfectCount = attempts.filter((a) => a.result!.pct === 100).length;
  const topicsSeen = [...topicAgg.keys()];
  const submitHours = [...new Set(attempts.map((a) => new Date(a.result!.submittedAt).getHours()))];
  const times = attempts.map((a) => a.result!.submittedAt).sort((x, y) => x - y);
  let comeback = false;
  for (let i = 1; i < times.length; i++) {
    if (times[i] - times[i - 1] >= 7 * 86_400_000) {
      comeback = true;
      break;
    }
  }
  const badges = computeBadges({
    quizzesDone: attempts.length,
    points,
    bestPct: pcts.length ? Math.max(...pcts) : null,
    avgPct,
    streakBest: streak.best,
    perfectCount,
    topicsSeen,
    submitHours,
    comeback,
  });

  return NextResponse.json({
    stats: {
      quizzesDone: attempts.length,
      avgPct,
      points,
      bestPct: pcts.length ? Math.max(...pcts) : null,
    },
    streak,
    activity,
    quizToday,
    wrongPool,
    // true the very first time a brand-new account lands on its dashboard —
    // StudentHome uses it to offer the optional password-change popup once
    firstLogin: !me.firstLoginDone,
    recent: attempts.slice(0, 8).map((a) => ({
      id: a.id,
      title: a.assignmentTitle,
      mode: a.mode,
      pct: a.result!.pct,
      score: a.result!.score,
      total: a.result!.total,
      submittedAt: a.result!.submittedAt,
      feedbackBy: a.result!.feedbackBy,
      hasTeacherFeedback: a.hasTeacherFeedback,
    })),
    mastery,
    // achievement badges — small DTOs, definition order (see src/lib/badges.ts)
    badges,
  });
}
