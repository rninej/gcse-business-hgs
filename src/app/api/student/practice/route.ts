import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { QUIZ_MAP } from '@/data/bank';
import { col, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Attempt, Student } from '@/lib/types';

/** Start (or resume) a self-study practice attempt on a library quiz */
export async function POST(req: Request) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await col<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const body = (await req.json()) as { quizId?: string };
  const quiz = body.quizId ? QUIZ_MAP[body.quizId] : undefined;
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  // students may only self-study on the practice pool — never a teacher-set quiz
  if (quiz.audience !== 'practice') {
    return NextResponse.json({ error: 'This quiz is only available as a teacher-set task.' }, { status: 403 });
  }

  // NB: Firebase RTDB drops null values, so assignmentId reads back as
  // undefined for practice attempts — treat both as "no assignment".
  const attempts = values(await col<Attempt>('attempts'))
    .filter((x) => x.studentId === session.uid && !x.assignmentId);
  const practiceTitle = `${quiz.title} · practice`;
  const existing = attempts.find(
    (x) => x.assignmentTitle === practiceTitle && x.status === 'in-progress'
  );
  if (existing) {
    return NextResponse.json({ ok: true, attemptId: existing.id, resumed: true });
  }

  // fresh order + shuffled mcq options for practice variety
  const questions = [...quiz.questions];
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  const shuffled = questions.map((q) => {
    if (q.type === 'mcq') {
      const idx = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: idx.map((i) => q.options[i]),
        correct: idx.indexOf(q.correct),
      };
    }
    return { ...q };
  });

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'practice',
    status: 'in-progress',
    studentId: session.uid,
    studentName: me.displayName,
    teacherId: me.teacherId,
    classId: me.classId,
    assignmentId: null,
    assignmentTitle: practiceTitle,
    quizId: quiz.id,
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null,
    questions: shuffled,
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, attempt);
  return NextResponse.json({ ok: true, attemptId, resumed: false });
}
