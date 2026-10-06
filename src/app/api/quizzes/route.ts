import { NextResponse } from 'next/server';
import { QUIZZES } from '@/data/bank';

/** Quiz catalogue for browsers. `?audience=practice` returns the student
 *  self-study pool, `?audience=assignment` the teacher pool; no param = all.
 *
 *  Each row also carries `subtopics` — the official spec sub-topics its
 *  questions cover (e.g. ['2.1.3', '2.1.4']) — and `subtopicCounts` for the
 *  whole pool, so the library can show/filter by exact sub-topic coverage
 *  (teachers target e.g. 2.1.3 Business and globalisation, not just 2.1). */
export async function GET(req: Request) {
  const audience = new URL(req.url).searchParams.get('audience');
  const pool = QUIZZES.filter((q) => {
    if (audience === 'practice') return q.audience === 'practice';
    if (audience === 'assignment') return q.audience === 'assignment';
    return true;
  });
  // bank-wide coverage per sub-topic (same pool as the rows above)
  const subtopicCounts: Record<string, number> = {};
  for (const quiz of pool) {
    for (const question of quiz.questions) {
      if (question.subtopic) {
        subtopicCounts[question.subtopic] = (subtopicCounts[question.subtopic] ?? 0) + 1;
      }
    }
  }
  const quizzes = pool.map((q) => ({
    id: q.id,
    title: q.title,
    blurb: q.blurb,
    theme: q.theme,
    topics: q.topics,
    subtopics: [...new Set(q.questions.map((x) => x.subtopic).filter(Boolean))] as string[],
    audience: q.audience,
    questionCount: q.questions.length,
    types: [...new Set(q.questions.map((x) => x.type))],
  }));
  return NextResponse.json({ quizzes, subtopicCounts });
}
