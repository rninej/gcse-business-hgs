import { NextResponse } from 'next/server';
import { col, colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { finalizeExpired } from '@/lib/finalize';
import { topicTitle } from '@/lib/topics';
import type {
  Attempt,
  Assignment,
  RiskBand,
  Student,
  TeacherStudentResult,
} from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const allStudents = values(await colCached<Student>('students')).filter((s) => s.classId === a.classId);
  // finalize timed attempts whose clock ran out (students who never reopened);
  // teacher self-tests are excluded — they never count as class statistics
  const allAttempts = await finalizeExpired(
    values(await colCached<Attempt>('attempts')).filter((x) => x.assignmentId === id && x.mode !== 'selftest')
  );
  // students may redo the assignment — group every attempt per student,
  // oldest first; the latest go is the headline row, the rest stay in history
  const byStudent = new Map<string, Attempt[]>();
  for (const x of allAttempts) {
    const list = byStudent.get(x.studentId) ?? [];
    list.push(x);
    byStudent.set(x.studentId, list);
  }
  for (const list of byStudent.values()) list.sort((x, y) => x.startedAt - y.startedAt);

  const rows: TeacherStudentResult[] = allStudents
    .sort((s1, s2) => s1.displayName.localeCompare(s2.displayName))
    .map((s) => {
      const mine = byStudent.get(s.id) ?? [];
      if (mine.length === 0) {
        return { studentId: s.id, displayName: s.displayName, username: s.username, status: 'not-started' as const };
      }
      const history = mine
        .filter((x) => x.status === 'submitted' && x.result)
        .map((x) => ({
          id: x.id,
          score: x.result!.score,
          total: x.result!.total,
          pct: x.result!.pct,
          submittedAt: x.result!.submittedAt,
          timeTakenSec: x.result!.timeTakenSec,
          riskScore: x.result!.riskScore,
          riskBand: x.result!.riskBand,
        }));
      const attempt = mine[mine.length - 1];
      if (attempt.status !== 'submitted') {
        return {
          studentId: s.id,
          displayName: s.displayName,
          username: s.username,
          status: 'in-progress' as const,
          attemptCount: mine.length,
          history,
        };
      }
      const r = attempt.result;
      const late = a.dueAt ? attempt.result!.submittedAt > a.dueAt + 3_600_000 : false;
      return {
        studentId: s.id,
        displayName: s.displayName,
        username: s.username,
        status: late ? ('late' as const) : ('submitted' as const),
        score: r?.score,
        total: r?.total,
        pct: r?.pct,
        submittedAt: r?.submittedAt,
        timeTakenSec: r?.timeTakenSec,
        riskScore: r?.riskScore,
        riskBand: r?.riskBand,
        riskSignals: r?.riskSignals,
        attemptCount: mine.length,
        history,
      };
    });

  // fill avgMsPerQ from attempts (not stored on result) — compute where available
  for (const row of rows) {
    const at = (byStudent.get(row.studentId) ?? []).filter((x) => x.status === 'submitted').pop();
    if (row.status === 'submitted' || row.status === 'late') {
      if (at && at.result) {
        const times = Object.values(at.perQ ?? {}).map((p) => p.ms).filter((m) => m > 0);
        row.avgMsPerQ = times.length ? Math.round(times.reduce((x, y) => x + y, 0) / times.length) : undefined;
        row.pasteCount = (at.events ?? []).filter((e) => e.e === 'paste').length;
        row.tabSwitches = (at.events ?? []).filter((e) => e.e === 'hide').length;
      }
    }
  }

  const submitted = rows.filter((r) => r.status === 'submitted' || r.status === 'late');
  const pcts = submitted.map((r) => r.pct ?? 0);
  const avgPct = pcts.length ? Math.round((pcts.reduce((x, y) => x + y, 0) / pcts.length) * 10) / 10 : null;

  const riskDistribution: Record<RiskBand, number> = { low: 0, moderate: 0, elevated: 0, high: 0 };
  for (const r of submitted) {
    if (r.riskBand) riskDistribution[r.riskBand] += 1;
  }

  // aggregate topic stats across submitted attempts (latest go per student)
  const topicAgg = new Map<string, { c: number; t: number }>();
  for (const s of submitted) {
    const at = (byStudent.get(s.studentId) ?? []).filter((x) => x.status === 'submitted').pop();
    for (const v of at?.result?.topicStats ?? []) {
      const agg = topicAgg.get(v.topic) ?? { c: 0, t: 0 };
      agg.c += v.c;
      agg.t += v.t;
      topicAgg.set(v.topic, agg);
    }
  }

  // question-level analysis (latest go per student)
  const qAnalysis = a.questions.map((q, qi) => {
    let correct = 0;
    let answered = 0;
    for (const s of submitted) {
      const at = (byStudent.get(s.studentId) ?? []).filter((x) => x.status === 'submitted').pop();
      const rec = at?.result?.perQ?.[q.id];
      if (!rec) continue;
      answered += 1;
      if (rec.correct) correct += 1;
    }
    return {
      n: qi + 1,
      id: q.id,
      type: q.type,
      topic: q.topic,
      topicTitle: topicTitle(q.topic),
      stem: q.stem.slice(0, 120) + (q.stem.length > 120 ? '…' : ''),
      pctCorrect: answered ? Math.round((correct / answered) * 100) : null,
      correct,
      answered,
    };
  });
  const hardest = [...qAnalysis].filter((x) => x.answered > 0).sort((x, y) => (x.pctCorrect ?? 100) - (y.pctCorrect ?? 100)).slice(0, 5);

  return NextResponse.json({
    assignment: {
      id: a.id,
      title: a.title,
      classTitle: a.classTitle,
      dueAt: a.dueAt,
      timeLimitMin: a.timeLimitMin,
      source: a.source,
      generatedBy: a.generatedBy,
      createdAt: a.createdAt,
      questionCount: a.questions.length,
      totalMarks: a.questions.reduce((x, q) => x + q.marks, 0),
    },
    rows,
    stats: {
      totalStudents: allStudents.length,
      submitted: submitted.length,
      inProgress: rows.filter((r) => r.status === 'in-progress').length,
      notStarted: rows.filter((r) => r.status === 'not-started').length,
      avgPct,
      completion: allStudents.length ? Math.round((submitted.length / allStudents.length) * 100) : 0,
      riskDistribution,
      topicStats: [...topicAgg.entries()].map(([topic, v]) => ({ topic, c: v.c, t: v.t })),
    },
    qAnalysis,
    hardest,
  });
}
