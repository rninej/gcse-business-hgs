import { NextResponse } from 'next/server';
import { col, fb, item, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Assignment, Question, Teacher } from '@/lib/types';

/**
 * Teacher-to-teacher quiz sharing. A teacher turns one of THEIR assignments
 * into a 6-character share code; any other teacher redeems the code in the
 * assignment builder and gets the full question set (editable, like their
 * own written questions) to set for their own classes.
 *
 *   POST   { assignmentId }        → { code }   (create or return the existing code)
 *   GET    ?code=XXXXXX            → the shared quiz (any signed-in teacher)
 *   GET    (no params)             → my shared codes (for the share dialog)
 *   DELETE ?code=XXXXXX            → revoke (creator only)
 *
 * Codes are unguessable in practice (32^6 ≈ 1.1 billion) and carry the full
 * questions including answers — that is fine: both ends of a share are
 * verified teacher accounts, and teachers already see answers for every
 * quiz they set.
 */

/** unambiguous uppercase alphabet (no 0/O, 1/I/l) */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LEN = 6;

interface SharedQuiz {
  code: string;
  assignmentId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  questionCount: number;
  questions: Question[];
  createdAt: number;
  revoked?: boolean;
}

function newCode(): string {
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

function normaliseCode(raw: string): string {
  return raw.replaceAll(/[\s-]/g, '').toUpperCase();
}

function validQuestion(q: unknown): q is Question {
  if (!q || typeof q !== 'object') return false;
  const o = q as Record<string, unknown>;
  const okType =
    o.type === 'mcq' || o.type === 'term' || o.type === 'fib' || o.type === 'numeric' || o.type === 'truefalse' || o.type === 'written';
  return okType && typeof o.id === 'string' && typeof o.stem === 'string' && o.stem.length > 0;
}

export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await item<Teacher>('teachers', session.uid);
  if (!me) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { assignmentId?: unknown };
  if (typeof body.assignmentId !== 'string' || !body.assignmentId.startsWith('a_')) {
    return NextResponse.json({ error: 'Which assignment? Send { assignmentId }.' }, { status: 400 });
  }

  const a = await item<Assignment>('assignments', body.assignmentId);
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
  }
  if (!a.questions || a.questions.length === 0) {
    return NextResponse.json({ error: 'That assignment has no questions to share.' }, { status: 400 });
  }

  // reuse the existing code when this assignment was already shared
  const mine = values(await col<SharedQuiz>('sharedQuizzes')).filter(
    (s) => s.assignmentId === a.id && !s.revoked
  );
  if (mine.length > 0 && mine[0].code) {
    return NextResponse.json({ code: mine[0].code, reused: true });
  }

  // generate a fresh unique code (collision odds are ~nothing, but check)
  const taken = new Set(Object.keys(await col<SharedQuiz>('sharedQuizzes')));
  let code = newCode();
  while (taken.has(code)) code = newCode();

  const record: SharedQuiz = {
    code,
    assignmentId: a.id,
    teacherId: session.uid,
    teacherName: me.name,
    title: a.title,
    questionCount: a.questions.length,
    questions: a.questions,
    createdAt: Date.now(),
  };
  await put('sharedQuizzes', code, record);
  return NextResponse.json({ code });
}

export async function GET(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);

  const rawCode = url.searchParams.get('code');
  if (rawCode) {
    const code = normaliseCode(rawCode);
    if (code.length !== CODE_LEN) {
      return NextResponse.json({ error: 'Share codes are 6 characters, like K7P2XQ.' }, { status: 400 });
    }
    const rec = await item<SharedQuiz>('sharedQuizzes', code);
    if (!rec || rec.revoked) {
      return NextResponse.json({ error: 'That code is not valid — check it with the teacher who sent it.' }, { status: 404 });
    }
    const questions = (rec.questions ?? []).filter(validQuestion);
    if (questions.length === 0) {
      return NextResponse.json({ error: 'That shared quiz has no usable questions.' }, { status: 410 });
    }
    return NextResponse.json({
      title: rec.title,
      fromName: rec.teacherName,
      questionCount: questions.length,
      questions,
    });
  }

  // list my shares (for the dialog's "already shared" state)
  const mine = values(await col<SharedQuiz>('sharedQuizzes'))
    .filter((s) => s.teacherId === session.uid && !s.revoked)
    .sort((x, y) => y.createdAt - x.createdAt)
    .map((s) => ({ code: s.code, assignmentId: s.assignmentId, title: s.title, createdAt: s.createdAt }));
  return NextResponse.json({ shares: mine });
}

export async function DELETE(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const rawCode = url.searchParams.get('code');
  if (!rawCode) return NextResponse.json({ error: 'Which code? Send ?code=XXXXXX.' }, { status: 400 });
  const code = normaliseCode(rawCode);

  const rec = await item<SharedQuiz>('sharedQuizzes', code);
  if (!rec || rec.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
  }
  await fb.remove(`sharedQuizzes/${code}`);
  return NextResponse.json({ ok: true });
}
