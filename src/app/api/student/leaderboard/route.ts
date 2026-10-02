import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { streaksFrom } from '@/lib/streaks';
import { allLite } from '@/lib/attemptLite';
import type { Student } from '@/lib/types';

/**
 * Weekly class leaderboard: points earned in the last 7 days, plus all-time
 * points and current streaks. Students only ever see their own class.
 */
export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const classmates = values(students)
    .filter((s) => s.classId === me.classId)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const weekAgo = Date.now() - 7 * 86_400_000;
  // slim feed — the leaderboard never needs question snapshots or telemetry
  const attempts = (await allLite()).filter(
    (a) => a.classId === me.classId && a.status === 'submitted' && a.result
  );
  // avatars live in their own collection so the students one stays light
  const avatars = await colCached<{ img?: string }>('avatars');

  interface Row {
    studentId: string;
    displayName: string;
    avatar: string | null;
    weekPoints: number;
    totalPoints: number;
    streak: number;
    quizzesDone: number;
    isMe: boolean;
  }

  const rows: Row[] = classmates.map((s) => {
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
      weekPoints,
      totalPoints,
      streak,
      quizzesDone: mine.length,
      isMe: s.id === session.uid,
    };
  });

  rows.sort((a, b) => b.weekPoints - a.weekPoints || b.totalPoints - a.totalPoints);
  const myRank = rows.findIndex((r) => r.isMe) + 1;

  return NextResponse.json({
    className: session.className,
    myRank: rows.length ? myRank : null,
    totalStudents: rows.length,
    rows,
  });
}
