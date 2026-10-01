import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { streaksFrom } from '@/lib/streaks';
import type { Attempt, Student, StudentClass } from '@/lib/types';

/**
 * Class leaderboard for the teacher dashboard: points earned in the last
 * 7 days, all-time points and current streaks — the same numbers students
 * see on their own leaderboard, but for any of the teacher's classes.
 */
export async function GET(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const wanted = url.searchParams.get('classId');

  const classes = values(await colCached<StudentClass>('classes'))
    .filter((c) => c.teacherId === session.uid)
    .sort((a, b) => a.name.localeCompare(b.name));
  const cls = classes.find((c) => c.id === wanted) ?? classes[0];
  if (!cls) return NextResponse.json({ classes: [], className: null, rows: [] });

  const students = values(await colCached<Student>('students'))
    .filter((s) => s.classId === cls.id)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const weekAgo = Date.now() - 7 * 86_400_000;
  const attempts = values(await colCached<Attempt>('attempts')).filter(
    (a) => a.classId === cls.id && a.status === 'submitted' && a.result && a.mode !== 'selftest'
  );
  // avatars live in their own collection so the students one stays light
  const avatars = await colCached<{ img?: string }>('avatars');

  const rows = students.map((s) => {
    const mine = attempts.filter((a) => a.studentId === s.id);
    const weekPoints = mine
      .filter((a) => (a.result?.submittedAt ?? 0) >= weekAgo)
      .reduce((sum, a) => sum + (a.result?.points ?? 0), 0);
    const totalPoints = mine.reduce((sum, a) => sum + (a.result?.points ?? 0), 0);
    const streak = streaksFrom(mine.map((a) => a.result?.submittedAt ?? 0)).current;
    return {
      studentId: s.id,
      displayName: s.displayName,
      avatar: avatars[s.id]?.img ?? null,
      username: s.username,
      weekPoints,
      totalPoints,
      streak,
      quizzesDone: mine.length,
    };
  });

  rows.sort((a, b) => b.weekPoints - a.weekPoints || b.totalPoints - a.totalPoints);

  return NextResponse.json({
    className: cls.name,
    classes: classes.map((c) => ({ id: c.id, name: c.name })),
    rows,
  });
}
