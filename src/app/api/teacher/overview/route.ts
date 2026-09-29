import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { topicTitle } from '@/lib/topics';
import type { Attempt, Assignment, Student, StudentClass } from '@/lib/types';

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
  const myAttempts = values(attempts).filter((a) => a.teacherId === session.uid);

  const submitted = myAttempts.filter((a) => a.status === 'submitted' && a.result);
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
      const subs = myAttempts.filter(
        (x) => x.assignmentId === a.id && x.status === 'submitted'
      ).length;
      const total = myStudents.filter((s) => s.classId === a.classId).length;
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
  });
}
