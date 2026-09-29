import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, colCached, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { generateQuestions } from '@/lib/questions';
import { QUIZ_MAP } from '@/data/bank';
import { TOPICS } from '@/lib/topics';
import type { Attempt, Assignment, Question, QuestionType, Student, StudentClass } from '@/lib/types';

type CustomInput = Partial<Question> & { type: QuestionType };

function validateCustom(raw: CustomInput): Question | null {
  const topic = typeof raw.topic === 'string' && TOPICS.some((t) => t.id === raw.topic) ? raw.topic : null;
  const stem = (raw.stem ?? '').toString().trim();
  const explain = (raw.explain ?? '').toString().trim();
  const marks = Math.min(3, Math.max(1, Number(raw.marks) || 1));
  if (!topic || stem.length < 8 || explain.length < 5) return null;

  const extract =
    raw.extract && typeof raw.extract === 'object'
      ? {
          title: (raw.extract.title ?? 'Case study').toString().slice(0, 80),
          text: (raw.extract.text ?? '').toString().trim().slice(0, 900),
        }
      : undefined;
  if (extract && extract.text.length < 20) return null;

  if (raw.type === 'mcq') {
    const options = (raw.options ?? []).map((o) => String(o ?? '').trim());
    const correct = Number(raw.correct);
    if (options.length !== 4 || options.some((o) => !o)) return null;
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) return null;
    return { id: '', type: 'mcq', topic, difficulty: 2, marks, stem, extract, explain, options, correct };
  }
  if (raw.type === 'term' || raw.type === 'fib') {
    const accept = (raw.accept ?? []).map((a) => String(a ?? '').trim()).filter(Boolean);
    if (accept.length < 1) return null;
    return { id: '', type: raw.type, topic, difficulty: 2, marks, stem, extract, explain, accept };
  }
  if (raw.type === 'truefalse') {
    if (typeof raw.answer !== 'boolean') return null;
    return { id: '', type: 'truefalse', topic, difficulty: 2, marks, stem, extract, explain, answer: raw.answer };
  }
  if (raw.type === 'numeric') {
    const value = Number(raw.value);
    const tol = Number(raw.tol);
    if (!Number.isFinite(value) || !Number.isFinite(tol) || tol < 0) return null;
    return {
      id: '',
      type: 'numeric',
      topic,
      difficulty: 2,
      marks,
      stem,
      extract,
      explain,
      value,
      tol,
      unit: typeof raw.unit === 'string' ? raw.unit : undefined,
      dp: Number.isInteger(raw.dp) ? (raw.dp as number) : undefined,
    };
  }
  return null;
}

export async function GET() {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assignments = values(await colCached<Assignment>('assignments')).filter((a) => a.teacherId === session.uid);
  const students = values(await colCached<Student>('students')).filter((s) => s.teacherId === session.uid);
  const attempts = values(await colCached<Attempt>('attempts')).filter((a) => a.teacherId === session.uid);

  const rows = assignments
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((a) => {
      const classStudents = students.filter((s) => s.classId === a.classId);
      // count unique students who have handed in — a redo must not inflate this
      const submitted = new Set(
        attempts
          .filter((x) => x.assignmentId === a.id && x.status === 'submitted')
          .map((x) => x.studentId)
      ).size;
      return {
        id: a.id,
        title: a.title,
        classId: a.classId,
        classTitle: a.classTitle,
        dueAt: a.dueAt,
        timeLimitMin: a.timeLimitMin,
        createdAt: a.createdAt,
        questionCount: a.questions.length,
        source: a.source,
        submitted,
        totalStudents: classStudents.length,
      };
    });
  return NextResponse.json({ assignments: rows });
}

interface CreateBody {
  classId?: string;
  title?: string;
  description?: string;
  dueAt?: number | null;
  timeLimitMin?: number | null;
  mode?: 'library' | 'ai' | 'custom';
  quizId?: string;
  aiParams?: { topics: string[]; count: number; types: QuestionType[]; difficulty: number | 'mixed'; caseStudies: boolean };
  customQuestions?: CustomInput[];
}

export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as CreateBody;
  const title = (body.title ?? '').toString().trim();
  if (title.length < 3 || title.length > 80) {
    return NextResponse.json({ error: 'Give your assignment a name (3–80 characters).' }, { status: 400 });
  }
  const timeLimitMin =
    body.timeLimitMin && Number(body.timeLimitMin) >= 3 && Number(body.timeLimitMin) <= 180
      ? Math.round(Number(body.timeLimitMin))
      : null;
  const dueAt = body.dueAt && Number(body.dueAt) > Date.now() - 86400000 ? Number(body.dueAt) : null;

  const classes = await col<StudentClass>('classes');
  const cls = classes[body.classId ?? ''];
  if (!cls || cls.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Choose one of your classes.' }, { status: 400 });
  }

  const mode = body.mode === 'library' || body.mode === 'ai' || body.mode === 'custom' ? body.mode : null;
  if (!mode) return NextResponse.json({ error: 'Unknown assignment mode.' }, { status: 400 });

  let questions: Question[] = [];
  let source: Assignment['source'] = mode === 'library' ? 'library' : mode === 'ai' ? 'ai' : 'custom';
  let generatedBy = '';

  if (mode === 'library') {
    const quiz = body.quizId ? QUIZ_MAP[body.quizId] : undefined;
    if (!quiz) return NextResponse.json({ error: 'Choose a quiz from the library.' }, { status: 400 });
    questions = quiz.questions.map((q) => ({ ...q }));
    generatedBy = `Learn Business bank · ${quiz.title}`;
  } else if (mode === 'ai') {
    const p = body.aiParams;
    if (!p || !Array.isArray(p.topics) || p.topics.length === 0) {
      return NextResponse.json({ error: 'Select at least one topic.' }, { status: 400 });
    }
    const gen = await generateQuestions({
      topics: p.topics,
      count: Math.max(5, Math.min(30, Number(p.count) || 10)),
      types: Array.isArray(p.types) ? p.types : [],
      difficulty: (p.difficulty === 1 || p.difficulty === 2 || p.difficulty === 3 ? p.difficulty : 'mixed'),
      caseStudies: Boolean(p.caseStudies),
    });
    questions = gen.questions;
    generatedBy = gen.provider === 'bank' ? 'Learn Business bank (AI unavailable)' : `AI · ${gen.provider}`;
    if (gen.provider === 'bank') source = 'library';
  } else {
    const custom = Array.isArray(body.customQuestions) ? body.customQuestions : [];
    if (custom.length < 1) return NextResponse.json({ error: 'Add at least one question.' }, { status: 400 });
    if (custom.length > 40) return NextResponse.json({ error: 'Up to 40 custom questions.' }, { status: 400 });
    const parsed = custom.map(validateCustom).filter((q): q is Question => q !== null);
    if (parsed.length < 1) {
      return NextResponse.json({ error: 'Some questions were incomplete. Check each one has a stem, answer and explanation.' }, { status: 400 });
    }
    questions = parsed;
    generatedBy = 'Written by teacher';
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: 'No valid questions could be created.' }, { status: 400 });
  }

  const prefix = randomUUID().replace(/-/g, '').slice(0, 8);
  const snapshot: Question[] = questions.map((q, i) => ({ ...q, id: q.id || `c${prefix}-${i}` }));

  const id = `a_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const assignment: Assignment = {
    id,
    teacherId: session.uid,
    classId: cls.id,
    classTitle: cls.name,
    title,
    description: (body.description ?? '').toString().slice(0, 300),
    dueAt,
    timeLimitMin,
    createdAt: Date.now(),
    source,
    generatedBy,
    questions: snapshot,
  };
  await put('assignments', id, assignment);
  return NextResponse.json({ ok: true, assignmentId: id, questionCount: snapshot.length, generatedBy });
}
