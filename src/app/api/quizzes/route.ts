import { NextResponse } from 'next/server';
import { QUIZZES } from '@/data/bank';

/** Quiz catalogue for browsers. `?audience=practice` returns the student
 *  self-study pool, `?audience=assignment` the teacher pool; no param = all. */
export async function GET(req: Request) {
  const audience = new URL(req.url).searchParams.get('audience');
  const quizzes = QUIZZES.filter((q) => {
    if (audience === 'practice') return q.audience === 'practice';
    if (audience === 'assignment') return q.audience === 'assignment';
    return true;
  }).map((q) => ({
    id: q.id,
    title: q.title,
    blurb: q.blurb,
    theme: q.theme,
    topics: q.topics,
    audience: q.audience,
    questionCount: q.questions.length,
    types: [...new Set(q.questions.map((x) => x.type))],
  }));
  return NextResponse.json({ quizzes });
}
