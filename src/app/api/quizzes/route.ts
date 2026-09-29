import { NextResponse } from 'next/server';
import { QUIZZES } from '@/data/bank';

export async function GET() {
  return NextResponse.json({
    quizzes: QUIZZES.map((q) => ({
      id: q.id,
      title: q.title,
      blurb: q.blurb,
      theme: q.theme,
      topics: q.topics,
      questionCount: q.questions.length,
      types: [...new Set(q.questions.map((x) => x.type))],
    })),
  });
}
