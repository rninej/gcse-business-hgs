import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { QUIZ_MAP, QUIZZES } from '@/data/bank';
import { item, put } from '@/lib/firebase';
import { liteForStudent, upsertLite } from '@/lib/attemptLite';
import { shuffleMcqOptions } from '@/lib/questions';
import { requireRole } from '@/lib/session';
import { TOPIC_MAP } from '@/lib/topics';
import type { Attempt, Question, Student } from '@/lib/types';

/** Body of the custom-mix branch — fields are validated, never trusted. */
interface MixBody {
  topics?: unknown;
  count?: unknown;
  difficulty?: unknown;
}

/**
 * Start (or resume) a self-study practice attempt.
 *
 * Two modes:
 *  • {quizId}                — a pre-built library quiz from the practice pool
 *                              (resumes an in-progress attempt of the same quiz)
 *  • {topics, count, difficulty} — "Build your own quiz": a one-off mix drawn
 *                              from every practice-pool question in the chosen
 *                              topics. quizId wins if both are sent. Custom
 *                              mixes are never resumed — every click is fresh.
 */
export async function POST(req: Request) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await item<Student>('students', session.uid);
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { quizId?: string } & MixBody;

  // ---- "Build your own quiz" — topics present without a quizId ----
  if (!body.quizId && body.topics !== undefined) {
    return startCustomMix(session.uid, me, body);
  }

  // ---- library quiz mode (existing behaviour) ----
  const quiz = body.quizId ? QUIZ_MAP[body.quizId] : undefined;
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  // students may only self-study on the practice pool — never a teacher-set quiz
  if (quiz.audience !== 'practice') {
    return NextResponse.json({ error: 'This quiz is only available as a teacher-set task.' }, { status: 403 });
  }

  // NB: Firebase RTDB drops null values, so assignmentId reads back as
  // undefined for practice attempts — treat both as "no assignment".
  const myLite = await liteForStudent(session.uid);
  const practiceTitle = `${quiz.title} · practice`;
  const existing = myLite.find(
    (x) => !x.assignmentId && x.assignmentTitle === practiceTitle && x.status === 'in-progress'
  );
  if (existing) {
    return NextResponse.json({ ok: true, attemptId: existing.id, resumed: true });
  }

  // fresh order + shuffled mcq options for practice variety — but written
  // questions always sink to the end (quickfire first, extended response last)
  const quick = quiz.questions.filter((q) => q.type !== 'written');
  const written = quiz.questions.filter((q) => q.type === 'written');
  for (let i = quick.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quick[i], quick[j]] = [quick[j], quick[i]];
  }
  const shuffled = shuffleMcqOptions([...quick, ...written]);

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
  await upsertLite(attempt);
  return NextResponse.json({ ok: true, attemptId, resumed: false });
}

/** "Build your own quiz": one-off attempt from the practice pool, filtered by
 *  topic (and difficulty), shuffled, sliced to the requested count. */
async function startCustomMix(
  studentId: string,
  me: Student,
  body: MixBody
): Promise<NextResponse> {
  const topics = Array.isArray(body.topics)
    ? [...new Set(body.topics)].filter(
        (t): t is string => typeof t === 'string' && Boolean(TOPIC_MAP[t])
      )
    : [];
  if (topics.length === 0) {
    return NextResponse.json(
      { error: 'Pick at least one topic to build your quiz.' },
      { status: 400 }
    );
  }

  const diff =
    body.difficulty === '1' || body.difficulty === '2' || body.difficulty === '3'
      ? Number(body.difficulty)
      : null; // 'mixed' (or missing) — no difficulty filter
  const rawCount = Number(body.count);
  const count =
    Number.isFinite(rawCount) && rawCount > 0 ? Math.min(Math.round(rawCount), 50) : 10;

  // pool: every practice-pool question in the chosen topics, deduped by id
  // (question.topic is authoritative — a quiz's topic list is only metadata)
  const topicSet = new Set(topics);
  const pool = new Map<string, Question>();
  for (const qz of QUIZZES) {
    if (qz.audience !== 'practice') continue;
    for (const q of qz.questions) {
      if (!topicSet.has(q.topic)) continue;
      if (diff !== null && q.difficulty !== diff) continue;
      if (!pool.has(q.id)) pool.set(q.id, q);
    }
  }
  if (pool.size === 0) {
    return NextResponse.json(
      {
        error:
          'No practice questions for that mix yet — try another topic, or set the difficulty to Mixed.',
      },
      { status: 400 }
    );
  }

  // fresh order (Fisher–Yates) among the quick questions; written ones are
  // held back for the finale
  const quick = [...pool.values()].filter((q) => q.type !== 'written');
  const written = [...pool.values()].filter((q) => q.type === 'written');
  for (let i = quick.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quick[i], quick[j]] = [quick[j], quick[i]];
  }
  // fresh order (Fisher–Yates); a short mix (under 8 questions) skips the
  // written ones, longer mixes include exactly one as the finale
  const wantWritten = count >= 8 && written.length > 0 ? 1 : 0;
  const picked = shuffleMcqOptions([
    ...quick.slice(0, count - wantWritten),
    ...written.slice(0, wantWritten),
  ]);

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'practice',
    status: 'in-progress',
    studentId,
    studentName: me.displayName,
    teacherId: me.teacherId,
    classId: me.classId,
    assignmentId: null,
    assignmentTitle: `My mix · ${topics.sort().join(' + ')} · practice`,
    quizId: undefined, // no library quiz behind a custom mix
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null,
    questions: picked,
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
  return NextResponse.json({
    ok: true,
    attemptId,
    resumed: false,
    questionCount: picked.length,
  });
}
