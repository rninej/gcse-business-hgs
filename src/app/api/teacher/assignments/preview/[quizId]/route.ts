import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { QUIZ_MAP } from '@/data/bank';
import { TOPIC_MAP } from '@/lib/topics';

type Ctx = { params: Promise<{ quizId: string }> };

/** Teacher-only: full questions (with answers) for previewing a library quiz */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { quizId } = await ctx.params;

  const quiz = QUIZ_MAP[quizId];
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      blurb: quiz.blurb,
      theme: quiz.theme,
      topics: quiz.topics,
      topicTitles: quiz.topics.map((t) => TOPIC_MAP[t]?.title ?? t),
    },
    questions: quiz.questions,
  });
}
