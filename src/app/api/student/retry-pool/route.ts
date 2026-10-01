import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { put, colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions } from '@/lib/questions';
import { collectWrongPool, rankWrongPool } from '@/lib/wrongPool';
import type { Attempt } from '@/lib/types';

/** Cap — a smart-practice session stays focused instead of becoming a marathon. */
const MAX_POOL_QUESTIONS = 20;

/**
 * "Practise everything you've got wrong": builds one untimed practice attempt
 * from the wrong-answer pool across ALL of this student's submitted quizzes.
 *
 * A question stays in the pool only while its most recent outcome is wrong
 * (get it right on a retry and it drops out) — so this quiz is always exactly
 * the outstanding material. Highest-priority items (missed most often /
 * wrong the longest) are chosen first, up to 20, then shuffled for the quiz.
 */
export async function POST() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attempts = values(await colCached<Attempt>('attempts')).filter(
    (a) => a.studentId === session.uid && a.status === 'submitted' && a.result
  );

  const ranked = rankWrongPool(collectWrongPool(attempts));
  if (ranked.length === 0) {
    return NextResponse.json(
      { error: 'Nothing to practise — every question you have been set is answered correctly!' },
      { status: 400 }
    );
  }

  // most-valuable first, but renumbered + option-shuffled for the quiz itself
  const picked = ranked.slice(0, MAX_POOL_QUESTIONS).map((e, i) => ({ ...e.q, n: i + 1 }));

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const poolSize = ranked.length;
  const title =
    poolSize > MAX_POOL_QUESTIONS
      ? `Smart practice · top ${picked.length} of ${poolSize} to revisit`
      : `Smart practice · ${picked.length} question${picked.length === 1 ? '' : 's'}`;

  // inherits class/teacher from the student's most recent submitted attempt
  const latest = [...attempts].sort(
    (a, b) => (b.result?.submittedAt ?? 0) - (a.result?.submittedAt ?? 0)
  )[0];

  const retry: Attempt = {
    id: attemptId,
    mode: 'practice',
    status: 'in-progress',
    studentId: session.uid,
    studentName: latest?.studentName ?? 'Student',
    teacherId: latest?.teacherId ?? '',
    classId: latest?.classId ?? null,
    assignmentId: null,
    assignmentTitle: title,
    quizId: undefined,
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null,
    questions: shuffleMcqOptions(picked),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, retry);
  return NextResponse.json({ ok: true, attemptId, questionCount: picked.length, poolSize });
}
