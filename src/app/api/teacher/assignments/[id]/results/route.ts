import { NextResponse } from 'next/server';
import { col, colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { finalizeExpired } from '@/lib/finalize';
import { topicTitle } from '@/lib/topics';
import { assignmentTargetsStudent, type Attempt, type Assignment, type RiskBand, type Student, type TeacherStudentResult } from '@/lib/types';

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

  const allStudents = values(await colCached<Student>('students')).filter((s) => assignmentTargetsStudent(a, s));
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

  // question-level analysis (latest go per student) — per-question answer
  // distribution + who said what, for the Topics & questions tab
  const latestByStudent = new Map<string, Attempt>();
  for (const s of submitted) {
    const at = (byStudent.get(s.studentId) ?? []).filter((x) => x.status === 'submitted').pop();
    if (at) latestByStudent.set(s.studentId, at);
  }

  const qAnalysis = a.questions.map((q, qi) => {
    let correct = 0;
    let answered = 0;
    const answers: { studentId: string; name: string; given: string; correct: boolean; awarded?: number }[] = [];
    for (const s of submitted) {
      const at = latestByStudent.get(s.studentId);
      const rec = at?.result?.perQ?.[q.id];
      if (!rec) continue;
      answered += 1;
      if (rec.correct) correct += 1;
      // human-friendly given: MCQ index → "B. option text"
      let given = rec.given;
      if (q.type === 'mcq' && q.options) {
        const idx = Number.parseInt(given, 10);
        given = Number.isInteger(idx) && idx >= 0 && idx < q.options.length ? `${String.fromCharCode(65 + idx)}. ${q.options[idx]}` : given;
      } else if (q.type === 'truefalse') {
        given = given === 'true' ? 'True' : given === 'false' ? 'False' : given;
      }
      answers.push({
        studentId: s.studentId,
        name: s.displayName,
        given,
        correct: rec.correct,
        awarded: q.type === 'written' ? rec.awarded : undefined,
      });
    }

    // distribution: what share of the class gave each answer
    let distribution: { label: string; count: number; pct: number; correct: boolean }[] | null = null;
    if (q.type === 'mcq' && q.options) {
      distribution = q.options.map((opt, i) => {
        const count = answers.filter((x) => x.given.startsWith(`${String.fromCharCode(65 + i)}. `)).length;
        return {
          label: `${String.fromCharCode(65 + i)}. ${opt}`,
          count,
          pct: answered ? Math.round((count / answered) * 100) : 0,
          correct: i === q.correct,
        };
      });
    } else if (q.type === 'truefalse') {
      distribution = (['True', 'False'] as const).map((label) => {
        const count = answers.filter((x) => x.given === label).length;
        return {
          label,
          count,
          pct: answered ? Math.round((count / answered) * 100) : 0,
          correct: (q.answer ? 'True' : 'False') === label,
        };
      });
    } else if (q.type === 'term' || q.type === 'fib' || q.type === 'numeric') {
      // group typed/numeric answers by their normalised form
      const groups = new Map<string, { label: string; count: number; correct: boolean }>();
      for (const ans of answers) {
        if (ans.given === '—' || ans.given === '') continue;
        const key = ans.given.trim().toLowerCase().replace(/\s+/g, ' ');
        const g = groups.get(key) ?? { label: ans.given, count: 0, correct: ans.correct };
        g.count += 1;
        groups.set(key, g);
      }
      distribution = [...groups.values()]
        .sort((x, y) => y.count - x.count)
        .slice(0, 8)
        .map((g) => ({ ...g, pct: answered ? Math.round((g.count / answered) * 100) : 0 }));
    }

    let expected = '';
    if (q.type === 'mcq') expected = q.options[q.correct] ?? '';
    else if (q.type === 'truefalse') expected = q.answer ? 'True' : 'False';
    else if (q.type === 'term' || q.type === 'fib') expected = q.accept[0] ?? '';
    else if (q.type === 'numeric') expected = `${q.value}${q.unit === '%' ? '%' : q.unit ? ' ' + q.unit : ''}`;
    else if (q.type === 'written') expected = `AI marked · ${q.marks} marks`;

    // written questions: average marks awarded (null while marking is pending)
    let avgAwarded: number | null = null;
    if (q.type === 'written') {
      const marks = answers.map((x) => x.awarded).filter((m): m is number => typeof m === 'number');
      avgAwarded = marks.length ? Math.round((marks.reduce((x, y) => x + y, 0) / marks.length) * 10) / 10 : null;
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
      marks: q.marks,
      expected,
      options: q.type === 'mcq' ? q.options : undefined,
      distribution,
      answers,
      avgAwarded,
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
