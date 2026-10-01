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
    brief?: string;
  };
  const topics = (body.topics ?? []).filter((t) => typeof t === 'string');
  const brief = typeof body.brief === 'string' ? body.brief.trim().slice(0, 600) : '';
  // topics are optional when the teacher describes the quiz instead —
  // the AI then picks them from the whole spec
  if (topics.length === 0 && !brief) {
    return NextResponse.json({ error: 'Select at least one topic — or describe the quiz you want.' }, { status: 400 });
  }

  const gen = await generateQuestions({
    topics,
    count: Math.max(5, Math.min(30, Number(body.count) || 10)),
    types: (body.types ?? []).filter((t) => typeof t === 'string'),
    difficulty:
      body.difficulty === 1 || body.difficulty === 2 || body.difficulty === 3 ? body.difficulty : 'mixed',
    caseStudies: Boolean(body.caseStudies),
    brief: brief || undefined,
  });

  return NextResponse.json({
    ok: true,
    provider: gen.provider,
    note: gen.note,
    questions: gen.questions,
  });
}
