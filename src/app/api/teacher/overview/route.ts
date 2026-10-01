import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { topicTitle } from '@/lib/topics';
import { classFixPool } from '@/lib/classPool';
import type { Attempt, Assignment, Student, StudentClass } from '@/lib/types';
import { assignmentTargetsStudent } from '@/lib/types';

export async function GET() {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [classes, students, assignments, attempts] = await Promise.all([
    colCached<StudentClass>('classes'),
    colCached<Student>('students'),
    colCached<Assignment>('assignments'),
    colCached<Attempt>('attempts'),
  ]);

  const myClasses = values(classes).filter((c) => c.teacherId === session.uid);
  const myStudents = values(students).filter((s) => s.teacherId === session.uid);
  const myAssignments = values(assignments)
    .filter((a) => a.teacherId === session.uid)
    .sort((a, b) => b.createdAt - a.createdAt);
  const myAttempts = values(attempts).filter((a) => a.teacherId === session.uid && a.mode !== 'selftest');

  // students may redo assignments — use each student's LATEST submitted go per
  // assignment for dashboard stats, so redos don't inflate counts or averages
  const latestByKey = new Map<string, Attempt>();
  for (const at of myAttempts) {
    if (at.status !== 'submitted' || !at.result || !at.assignmentId) continue;
    const key = `${at.studentId}:${at.assignmentId}`;
    const prev = latestByKey.get(key);
    if (!prev || at.result.submittedAt > prev.result!.submittedAt) latestByKey.set(key, at);
  }
  const submitted = [...latestByKey.values()];
  const pcts = submitted.map((a) => a.result!.pct);
  const avgPct = pcts.length ? Math.round((pcts.reduce((x, y) => x + y, 0) / pcts.length) * 10) / 10 : null;

  // weak topics across all submitted attempts
  const topicAgg = new Map<string, { c: number; t: number }>();
  for (const at of submitted) {
    for (const v of at.result?.topicStats ?? []) {
      const agg = topicAgg.get(v.topic) ?? { c: 0, t: 0 };
      agg.c += v.c;
      agg.t += v.t;
      topicAgg.set(v.topic, agg);
    }
  }
  const topicRows = [...topicAgg.entries()]
    .map(([tid, v]) => ({
      topic: tid,
      title: topicTitle(tid),
      pct: v.t ? Math.round((v.c / v.t) * 100) : 0,
    }))
    .sort((x, y) => x.pct - y.pct);

  const flagged = submitted.filter((a) => a.result && (a.result.riskBand === 'elevated' || a.result.riskBand === 'high'));

  // common slips across ALL classes — the same pool the class-page mistake
  // fixer uses (freshness rule included), aggregated per question so the
  // dashboard can show what the whole cohort is stuck on right now
  const fixPools: { classId: string; name: string; questions: number; students: number }[] = [];
  const slipAgg = new Map<
    string,
    { id: string; stem: string; studentsWrong: number; timesWrong: number; classes: { classId: string; name: string; studentsWrong: number }[] }
  >();
  for (const c of myClasses) {
    const pool = await classFixPool(c.id, session.uid);
    if (pool.ranked.length > 0) {
      fixPools.push({ classId: c.id, name: c.name, questions: pool.ranked.length, students: pool.studentsAffected });
    }
    for (const e of pool.ranked) {
      const agg = slipAgg.get(e.q.id);
      if (agg) {
        agg.studentsWrong += e.studentsWrong;
        agg.timesWrong += e.timesWrong;
        agg.classes.push({ classId: c.id, name: c.name, studentsWrong: e.studentsWrong });
      } else {
        slipAgg.set(e.q.id, {
          id: e.q.id,
          stem: e.q.stem,
          studentsWrong: e.studentsWrong,
          timesWrong: e.timesWrong,
          classes: [{ classId: c.id, name: c.name, studentsWrong: e.studentsWrong }],
        });
      }
    }
  }
  const commonSlips = [...slipAgg.values()]
    .sort((a, b) => b.studentsWrong - a.studentsWrong || b.timesWrong - a.timesWrong)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      classCount: myClasses.length,
      studentCount: myStudents.length,
      assignmentCount: myAssignments.length,
      submittedCount: submitted.length,
      avgPct,
      flaggedCount: flagged.length,
    },
    recentAssignments: myAssignments.slice(0, 6).map((a) => {
      const subs = new Set(
        myAttempts
          .filter((x) => x.assignmentId === a.id && x.status === 'submitted')
          .map((x) => x.studentId)
      ).size;
      const total = myStudents.filter((s) => assignmentTargetsStudent(a, s)).length;
      return {
        id: a.id,
        title: a.title,
        classTitle: a.classTitle,
        dueAt: a.dueAt,
        questionCount: a.questions.length,
        submitted: subs,
        totalStudents: total,
      };
    }),
    weakTopics: topicRows.slice(0, 6),
    commonSlips,
    fixPools,
  });
}
