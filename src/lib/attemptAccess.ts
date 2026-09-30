// Access control for quiz attempts. Students own their attempts; teachers may
// access the self-test attempts they created (so they can try their own
// assignments without appearing in class statistics).
import { item } from './firebase';
import { currentSession } from './session';
import type { Attempt, SessionInfo } from './types';

export interface AttemptAccess {
  session: SessionInfo;
  attempt: Attempt;
}

/** Load an attempt the current session is allowed to use, or null. */
export async function loadAccessibleAttempt(id: string): Promise<AttemptAccess | null> {
  const session = await currentSession();
  if (!session) return null;
  const attempt = await item<Attempt>('attempts', id);
  if (!attempt) return null;
  if (attempt.studentId !== session.uid) return null;
  if (session.role === 'teacher' && attempt.mode !== 'selftest') return null;
  return { session, attempt };
}
