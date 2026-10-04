import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { QUIZ_MAP } from '@/data/bank';
import { item, put } from '@/lib/firebase';
import { liteForStudent, upsertLite } from '@/lib/attemptLite';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions, shuffleQuestionOrder } from '@/lib/questions';
import type { Attempt, Question, Teacher } from '@/lib/types';

/** Teacher self-test WITHOUT an assignment — try a library quiz from the
 *  preview, or an edited question set straight from the builder, exactly as
 *  a student would see it. Private selftest attempts never appear in class
 *  statistics, leaderboards or points.
 *
 *  Body:  { quizId }                  — any bank quiz (practice or assignment pool)
 *         { title, questions: [...] } — an inline set (e.g. AI-generated in
 *                                        the builder). Never resumed — fresh
 *                                        every time, because the teacher may
 *                                        have edited the questions since. */

function validQuestion(q: unknown): q is Question {
  if (!q || typeof q !== 'object') return false;
  const o = q as Record<string, unknown>;
  const type = o.type;
  const okType =
    type === 'mcq' || type === 'term' || type === 'fib' || type === 'numeric' || type === 'truefalse' || type === 'written';
  return okType && typeof o.id === 'string' && typeof o.stem === 'string' && o.stem.length > 0;
}

export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await item<Teacher>('teachers', session.uid);
  if (!me) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    quizId?: unknown;
    title?: unknown;
    questions?: unknown;
  };

  let title: string;
  let questions: Question[];

  if (typeof body.quizId === 'string' && body.quizId.length < 60) {
    const quiz = QUIZ_MAP[body.quizId];
    if (!quiz) return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
    title = `${quiz.title} · self-test`;
    questions = quiz.questions.map((q) => ({ ...q }));
    // library quizzes can be resumed (their content never changes)
    const existing = (await liteForStudent(session.uid)).find(
      (a) => a.mode === 'selftest' && a.status === 'in-progress' && a.assignmentTitle === title
    );
    if (existing) return NextResponse.json({ ok: true, attemptId: existing.id, resumed: true });
  } else {
    if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > 40) {
      return NextResponse.json({ error: 'Send between 1 and 40 questions.' }, { status: 400 });
    }
    if (!body.questions.every(validQuestion)) {
      return NextResponse.json({ error: 'Those questions do not look valid.' }, { status: 400 });
    }
    const base = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 80) : 'My draft quiz';
    title = `${base} · self-test`;
    questions = body.questions.map((q) => ({ ...(q as Question) }));
  }

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'selftest',
    status: 'in-progress',
    studentId: session.uid, // the teacher's own id — access control checks this
    studentName: `${me.name} (self-test)`,
    teacherId: session.uid,
    classId: null,
    assignmentId: null,
    assignmentTitle: title,
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null, // no timer for a dry run
    questions: shuffleMcqOptions(shuffleQuestionOrder(questions)),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, attempt);
  await upsertLite(attempt);
  return NextResponse.json({ ok: true, attemptId, resumed: false });
}
