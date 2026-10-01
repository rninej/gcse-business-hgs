import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, put } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions } from '@/lib/questions';
import { classFixPool } from '@/lib/classPool';
import type { Assignment, StudentClass } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/** Cap — one focused revision quiz, not a marathon. */
const MAX_QUESTIONS = 20;

/**
 * "Mistake fixer": builds one untimed assignment for the whole class from
 * the questions its students are collectively stuck on — every student's
 * wrong pool is combined, then ranked so questions tripping the MOST
 * students come first. Questions from quizzes set in the last 24h are
 * excluded (still fresh). Published immediately (never a draft), no due date.
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

  const pool = await classFixPool(id, session.uid);
  if (pool.ranked.length === 0) {
    return NextResponse.json(
      {
        error:
          pool.totalQuestions === 0
            ? 'Nothing to fix — every question this class has been set is currently answered correctly!'
            : 'Everything this class is stuck on comes from quizzes set in the last 24 hours — still fresh in students\u2019 minds. Try again tomorrow.',
      },
      { status: 400 }
    );
  }

  const ranked = pool.ranked;

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
