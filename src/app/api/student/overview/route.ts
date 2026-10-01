import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { streaksFrom } from '@/lib/streaks';
import { topicTitle } from '@/lib/topics';
import { collectWrongPool } from '@/lib/wrongPool';
import type { Attempt, Student } from '@/lib/types';

export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const attempts = values(await colCached<Attempt>('attempts'))
    .filter((a) => a.studentId === session.uid && a.status === 'submitted' && a.result)
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

  // the wrong-answer pool: questions whose most recent outcome is wrong,
  // across every submitted quiz — powers the smart-practice nudge
  const wrongPool = collectWrongPool(attempts).length;

  return NextResponse.json({
    stats: {
      quizzesDone: attempts.length,
      avgPct,
      points,
      bestPct: pcts.length ? Math.max(...pcts) : null,
    },
    streak,
    activity,
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
      hasTeacherFeedback: Boolean(a.teacherFeedback?.text),
    })),
    mastery,
  });
}
