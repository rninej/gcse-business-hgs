import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, colCached, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions } from '@/lib/questions';
import { collectClassWrongPool, rankClassWrongPool } from '@/lib/wrongPool';
import type { Attempt, Assignment, StudentClass } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/** Cap — one focused revision quiz, not a marathon. */
const MAX_QUESTIONS = 20;

/**
 * "Mistake fixer": builds one untimed assignment for the whole class from
 * the questions its students are collectively stuck on — every student's
 * wrong pool is combined, then ranked so questions tripping the MOST
 * students come first. Published immediately (never a draft), no due date.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const classes = await col<StudentClass>('classes');
  const cls = classes[id];
  if (!cls || cls.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  const attempts = values(await colCached<Attempt>('attempts')).filter(
    (a) => a.classId === id && a.studentId && a.status === 'submitted' && a.result
  );

  const perStudent = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const list = perStudent.get(a.studentId) ?? [];
    list.push(a);
    perStudent.set(a.studentId, list);
  }

  const ranked = rankClassWrongPool(collectClassWrongPool([...perStudent.values()]));
  if (ranked.length === 0) {
    return NextResponse.json(
      { error: 'Nothing to fix — every question this class has been set is currently answered correctly!' },
      { status: 400 }
    );
  }

  // most-students-stuck first, then renumbered + option-shuffled for the quiz
  const picked = ranked.slice(0, MAX_QUESTIONS).map((e, i) => ({ ...e.q, n: i + 1 }));
  const worst = ranked[0];

  const assignmentId = `as_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const title =
    ranked.length > MAX_QUESTIONS
      ? `Mistake fixer · top ${picked.length} of ${ranked.length} slips`
      : `Mistake fixer · ${picked.length} question${picked.length === 1 ? '' : 's'}`;

  const assignment: Assignment = {
    id: assignmentId,
    teacherId: session.uid,
    classId: id,
    classTitle: cls.name,
    title,
    description: `Auto-built from this class's wrong answers — the ${picked.length} questions still tripping students, worst first.`,
    dueAt: null,
    timeLimitMin: null,
    createdAt: Date.now(),
    source: 'custom',
    generatedBy: 'class-mistakes',
    questions: shuffleMcqOptions(picked),
  };
  await put('assignments', assignmentId, assignment);

  return NextResponse.json({
    ok: true,
    assignmentId,
    questionCount: picked.length,
    poolSize: ranked.length,
    worstStudents: worst.studentsWrong,
  });
}
