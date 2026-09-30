import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { generateQuestions } from '@/lib/questions';
import type { QuestionType } from '@/lib/types';

/** Teacher-only preview: generate questions with AI (fallback: curated bank).
 *  Nothing is stored — the teacher reviews, then creates the assignment. */
export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as {
    topics?: string[];
    count?: number;
    types?: QuestionType[];
    difficulty?: number | 'mixed';
    caseStudies?: boolean;
  };
  const topics = (body.topics ?? []).filter((t) => typeof t === 'string');
  if (topics.length === 0) {
    return NextResponse.json({ error: 'Select at least one topic.' }, { status: 400 });
  }

  const gen = await generateQuestions({
    topics,
    count: Math.max(5, Math.min(30, Number(body.count) || 10)),
    types: (body.types ?? []).filter((t) => typeof t === 'string'),
    difficulty:
      body.difficulty === 1 || body.difficulty === 2 || body.difficulty === 3 ? body.difficulty : 'mixed',
    caseStudies: Boolean(body.caseStudies),
  });

  return NextResponse.json({
    ok: true,
    provider: gen.provider,
    note: gen.note,
    questions: gen.questions,
  });
}
