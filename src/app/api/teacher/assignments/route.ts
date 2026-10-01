import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, colCached, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { generateQuestions } from '@/lib/questions';
import { notifyStudents } from '@/lib/notify';
import { QUIZ_MAP } from '@/data/bank';
import { TOPICS } from '@/lib/topics';
import { assignmentTargetsStudent, type Attempt, type Assignment, type Question, type QuestionType, type Student, type StudentClass } from '@/lib/types';

type CustomInput = Partial<Question> & { type: QuestionType };

/** Written questions: a stem plus a mark scheme of 1–8 points (1–3 marks
 *  each, 12 marks max). The AI examiner marks students' answers against it. */
function validateWritten(raw: CustomInput, isPreview: boolean): Question | null {
  const topic = typeof raw.topic === 'string' && TOPICS.some((t) => t.id === raw.topic) ? raw.topic : null;
  const stem = (raw.stem ?? '').toString().trim();
  const explain = (raw.explain ?? '').toString().trim();
  if (!topic || stem.length < (isPreview ? 12 : 15) || explain.length < 10) return null;

  const rawPoints = Array.isArray((raw as { points?: unknown }).points) ? ((raw as { points: unknown[] }).points) : [];
  if (rawPoints.length < 1 || rawPoints.length > 8) return null;
  const points: { text: string; marks: number }[] = [];
  let total = 0;
  for (const p of rawPoints) {
    const obj = p as { text?: unknown; marks?: unknown };
    const text = (obj?.text ?? '').toString().trim();
    const marks = Math.round(Number(obj?.marks));
    if (text.length < 5 || !Number.isInteger(marks) || marks < 1 || marks > 3) return null;
    points.push({ text: text.slice(0, 400), marks });
    total += marks;
  }
  if (total < 1 || total > 12) return null;

  const extract =
    raw.extract && typeof raw.extract === 'object'
      ? { title: (raw.extract.title ?? 'Case study').toString().slice(0, 80), text: (raw.extract.text ?? '').toString().trim().slice(0, 900) }
      : undefined;
  if (extract && extract.text.length < 20) return null;

  return { id: '', type: 'written', topic, difficulty: 3, marks: total, stem: stem.slice(0, 900), extract, explain, points };
}

/** Validate a question that comes from the teacher-reviewed AI preview.
 *  These were already validated once by /api/teacher/generate — this is a
 *  defensive re-check so a tampered client can't smuggle malformed data in. */
function validatePreview(raw: CustomInput): Question | null {
  if (!raw || typeof raw !== 'object') return null;
  const topic = typeof raw.topic === 'string' && TOPICS.some((t) => t.id === raw.topic) ? raw.topic : null;
  const stem = (raw.stem ?? '').toString().trim();
  const explain = (raw.explain ?? '').toString().trim();
  const marks = Math.min(3, Math.max(1, Number(raw.marks) || 1));
  const difficulty = raw.difficulty === 1 || raw.difficulty === 2 || raw.difficulty === 3 ? raw.difficulty : 2;
  if (!topic || stem.length < 12 || explain.length < 10) return null;

  const extract =
    raw.extract && typeof raw.extract === 'object'
      ? { title: (raw.extract.title ?? 'Case study').toString().slice(0, 80), text: (raw.extract.text ?? '').toString().trim().slice(0, 900) }
      : undefined;
  if (extract && extract.text.length < 20) return null;

  if (raw.type === 'mcq') {
    const options = (raw.options ?? []).map((o) => String(o ?? '').trim()).slice(0, 4);
    const correct = Number(raw.correct);
    if (options.length !== 4 || options.some((o) => !o)) return null;
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) return null;
    return { id: '', type: 'mcq', topic, difficulty, marks, stem, extract, explain, options, correct };
  }
  if (raw.type === 'term' || raw.type === 'fib') {
    const accept = (raw.accept ?? []).map((a) => String(a ?? '').trim()).filter(Boolean).slice(0, 6);
    if (accept.length < 1) return null;
    return { id: '', type: raw.type, topic, difficulty, marks, stem, extract, explain, accept };
  }
  if (raw.type === 'truefalse') {
    if (typeof raw.answer !== 'boolean') return null;
    return { id: '', type: 'truefalse', topic, difficulty, marks, stem, extract, explain, answer: raw.answer };
  }
  if (raw.type === 'numeric') {
    const value = Number(raw.value);
    const tol = Number(raw.tol);
    if (!Number.isFinite(value) || !Number.isFinite(tol) || tol < 0 || tol > 2) return null;
    return {
      id: '', type: 'numeric', topic, difficulty, marks, stem, extract, explain, value, tol,
      unit: typeof raw.unit === 'string' ? raw.unit : undefined,
      dp: Number.isInteger(raw.dp) ? (raw.dp as number) : undefined,
    };
  }
  if (raw.type === 'written') {
    return validateWritten(raw, true);
  }
  return null;
}

function validateCustom(raw: CustomInput): Question | null {
  // written questions have their own shape and mark rules (up to 12 marks)
  if (raw.type === 'written') return validateWritten(raw, false);
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
  const classes = values(await colCached<StudentClass>('classes')).filter((c) => c.teacherId === session.uid);
  const attempts = values(await colCached<Attempt>('attempts')).filter((a) => a.teacherId === session.uid);

  const rows = assignments
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((a) => {
      // recipients = every student in a targeted class + picked individuals
      const recipients = students.filter((s) => assignmentTargetsStudent(a, s));
      // count unique students who have handed in — a redo must not inflate this
      const submitted = new Set(
        attempts
          .filter((x) => x.assignmentId === a.id && x.status === 'submitted')
          .map((x) => x.studentId)
      ).size;
      const classNames = [a.classId, ...(a.classIds ?? [])]
        .map((cid) => classes.find((c) => c.id === cid)?.name)
        .filter((n): n is string => Boolean(n));
      return {
        id: a.id,
        title: a.title,
        classId: a.classId,
        classTitle: a.classTitle,
        classTitles: Array.from(new Set(classNames)),
        studentCount: a.studentIds?.length ?? 0,
        dueAt: a.dueAt,
        timeLimitMin: a.timeLimitMin,
        createdAt: a.createdAt,
        questionCount: a.questions.length,
        source: a.source,
        draft: Boolean(a.draft),
        submitted,
        totalStudents: recipients.length,
      };
    });
  return NextResponse.json({ assignments: rows });
}

interface CreateBody {
  /** primary class (kept for back-compat) — must be one of the teacher's */
  classId?: string;
  /** every extra class that receives this assignment too */
  classIds?: string[];
  /** specific individuals (on top of / instead of whole classes) */
  studentIds?: string[];
  title?: string;
  description?: string;
  dueAt?: number | null;
  timeLimitMin?: number | null;
  mode?: 'library' | 'ai' | 'custom';
  quizId?: string;
  aiParams?: { topics: string[]; count: number; types: QuestionType[]; difficulty: number | 'mixed'; caseStudies: boolean };
  customQuestions?: CustomInput[];
  /** AI-marked written questions appended on top of any mode's question set. */
  extraWritten?: CustomInput[];
  /** Questions the teacher already reviewed in the AI preview — skips a second,
   *  slow generation round-trip on the server. Validated below all the same. */
  previewQuestions?: (Partial<Question> & { type: QuestionType })[];
  /** Save as a draft — invisible to students until published. */
  draft?: boolean;
  /** When set: update this existing draft instead of creating a new one. */
  updateId?: string;
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
  const myClasses = Object.values(classes).filter((c) => c.teacherId === session.uid);
  // resolve every targeted class (primary + extras); all must belong to the teacher
  const wantedClassIds = Array.from(new Set([body.classId, ...(body.classIds ?? [])].filter(Boolean) as string[]));
  const targeted = wantedClassIds.map((cid) => myClasses.find((c) => c.id === cid)).filter((c): c is StudentClass => Boolean(c));

  // specific individuals must be the teacher's own students
  const studentsCol = await col<Student>('students');
  const wantedStudentIds = Array.from(new Set((body.studentIds ?? []).filter(Boolean)));
  const targetedStudents = wantedStudentIds
    .map((sid) => studentsCol[sid])
    .filter((s): s is Student => Boolean(s) && s.teacherId === session.uid);

  const updating = body.updateId ? (await col<Assignment>('assignments'))[body.updateId] : null;
  const isUpdate = Boolean(updating && updating.teacherId === session.uid && updating.draft);
  if (body.updateId && !isUpdate) {
    return NextResponse.json({ error: 'Draft not found — it may already be live.' }, { status: 404 });
  }

  if (targeted.length === 0 && targetedStudents.length === 0) {
    return NextResponse.json({ error: 'Choose at least one class or student.' }, { status: 400 });
  }

  const mode = body.mode === 'library' || body.mode === 'ai' || body.mode === 'custom' ? body.mode : null;
  if (!mode) return NextResponse.json({ error: 'Unknown assignment mode.' }, { status: 400 });

  let questions: Question[] = [];
  let source: Assignment['source'] = mode === 'library' ? 'library' : mode === 'ai' ? 'ai' : 'custom';
  let generatedBy = '';

  if (mode === 'library') {
    const quiz = body.quizId ? QUIZ_MAP[body.quizId] : undefined;
    if (!quiz) return NextResponse.json({ error: 'Choose a quiz from the library.' }, { status: 400 });
    // teachers may only set assignment-pool quizzes — the student practice pool
    // stays separate so self-study can never be the homework itself
    if (quiz.audience !== 'assignment') {
      return NextResponse.json({ error: 'This quiz is reserved for student practice.' }, { status: 400 });
    }
    questions = quiz.questions.map((q) => ({ ...q }));
    generatedBy = `Quiz bank · ${quiz.title}`;
  } else if (mode === 'ai') {
    // Fast path: the teacher already reviewed these questions in the preview —
    // accept them as-is instead of generating a fresh set server-side.
    // Draft updates may legitimately carry fewer than 4 questions.
    const preview = Array.isArray(body.previewQuestions) ? body.previewQuestions : [];
    const parsedPreview = preview.map(validatePreview).filter((q): q is Question => q !== null);
    if (parsedPreview.length >= (isUpdate ? 1 : 4)) {
      questions = parsedPreview as Question[];
      generatedBy = 'AI generated';
    } else {
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
      generatedBy = gen.provider === 'bank' ? 'Human-written quiz bank' : 'AI generated';
      if (gen.provider === 'bank') source = 'library';
    }
  } else {
    const custom = Array.isArray(body.customQuestions) ? body.customQuestions : [];
    if (custom.length < 1) return NextResponse.json({ error: 'Add at least one question.' }, { status: 400 });
    if (custom.length > 40) return NextResponse.json({ error: 'Up to 40 custom questions.' }, { status: 400 });
    const parsed = custom.map(validateCustom).filter((q): q is Question => q !== null);
    if (parsed.length < 1) {
      return NextResponse.json({ error: 'Some questions were incomplete. Check each one has a stem, answer and explanation.' }, { status: 400 });
    }
    questions = parsed;
    generatedBy = 'Written by you';
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: 'No valid questions could be created.' }, { status: 400 });
  }

  // teacher-added written questions ride on top of any source (library, AI or custom)
  const extraRaw = Array.isArray(body.extraWritten) ? body.extraWritten : [];
  if (extraRaw.length > 6) {
    return NextResponse.json({ error: 'Up to 6 written questions per assignment.' }, { status: 400 });
  }
  const extra = extraRaw.map((raw) => validateWritten(raw, false)).filter((q): q is Question => q !== null);
  if (extra.length > 0) questions = [...questions, ...extra];

  const prefix = randomUUID().replace(/-/g, '').slice(0, 8);
  const snapshot: Question[] = questions.map((q, i) => ({ ...q, id: q.id || `c${prefix}-${i}` }));

  const primary = targeted[0];
  const draft = Boolean(body.draft);
  const classIds = targeted.map((c) => c.id);

  if (isUpdate && updating) {
    // publish or re-save an existing draft
    const merged: Assignment = {
      ...updating,
      title,
      description: (body.description ?? '').toString().slice(0, 300),
      dueAt,
      timeLimitMin,
      classId: primary ? primary.id : updating.classId,
      classTitle: primary ? primary.name : updating.classTitle,
      classIds,
      studentIds: targetedStudents.map((s) => s.id),
      draft,
      questions: snapshot,
    };
    await put('assignments', updating.id, merged);
    // a draft going live is the moment students learn about it — ring the bell
    if (!draft && updating.draft) {
      const recipients = studentsCol
        ? values(studentsCol).filter((s) => assignmentTargetsStudent(merged, s)).map((s) => s.id)
        : [];
      if (recipients.length > 0) {
        void notifyStudents(recipients, {
          kind: 'assignment',
          title: `New quiz set: “${title}”`,
          body: `${merged.classTitle} · ${snapshot.length} questions${dueAt ? ` · due ${new Date(dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`,
          assignmentId: merged.id,
          fromId: session.uid,
        });
      }
    }
    return NextResponse.json({ ok: true, assignmentId: updating.id, questionCount: snapshot.length, draft });
  }

  const id = `a_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const assignment: Assignment = {
    id,
    teacherId: session.uid,
    classId: primary ? primary.id : '',
    classTitle: primary ? primary.name : 'Specific students',
    classIds,
    studentIds: targetedStudents.map((s) => s.id),
    title,
    description: (body.description ?? '').toString().slice(0, 300),
    dueAt,
    timeLimitMin,
    createdAt: Date.now(),
    source,
    generatedBy,
    draft,
    questions: snapshot,
  };
  await put('assignments', id, assignment);
  // ring every targeted student's bell the moment a live assignment lands
  if (!draft) {
    const classIdSet = new Set(classIds);
    const recipients = [
      ...targetedStudents.map((s) => s.id),
      ...values(studentsCol).filter((s) => s.classId && classIdSet.has(s.classId)).map((s) => s.id),
    ];
    const unique = uniqueIdList(recipients);
    if (unique.length > 0) {
      void notifyStudents(unique, {
        kind: 'assignment',
        title: `New quiz set: “${title}”`,
        body: `${assignment.classTitle} · ${snapshot.length} questions${dueAt ? ` · due ${new Date(dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`,
        assignmentId: id,
        fromId: session.uid,
      });
    }
  }
  return NextResponse.json({ ok: true, assignmentId: id, questionCount: snapshot.length, draft, generatedBy });
}

/** de-dupe a list of ids without Set-order surprises */
function uniqueIdList(ids: string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
}
