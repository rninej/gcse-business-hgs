// Server-side notification helpers — writes the little bell messages
// students see when work is set for them or they're nudged about it.
// Records live in Firebase under /hgs/notifications keyed by id.

import { randomUUID } from 'crypto';
import { colCached, put, values } from './firebase';
import type { StudentNotification, NotificationKind } from './types';

export interface NewNote {
  kind: NotificationKind;
  title: string;
  body: string;
  assignmentId?: string;
  fromId?: string;
}

/** Create one notification per student — writes fly in parallel (each is an
 *  independent RTDB round-trip to Belgium, so batches stay ~one trip long).
 *  Failures are swallowed per-student so a single bad record can't break the
 *  publish/nudge flow. */
export async function notifyStudents(studentIds: string[], note: NewNote): Promise<number> {
  const results = await Promise.allSettled(
    studentIds.map(async (studentId) => {
      const record: StudentNotification = {
        id: `n_${randomUUID().replace(/-/g, '').slice(0, 10)}`,
        studentId,
        kind: note.kind,
        title: note.title.slice(0, 90),
        body: note.body.slice(0, 240),
        createdAt: Date.now(),
        readAt: null,
        ...(note.assignmentId ? { assignmentId: note.assignmentId } : {}),
        ...(note.fromId ? { fromId: note.fromId } : {}),
      };
      await put('notifications', record.id, record);
    })
  );
  return results.filter((r) => r.status === 'fulfilled').length;
}

/** All notifications for one student, newest first (server-side only). */
export async function notificationsFor(studentId: string): Promise<StudentNotification[]> {
  const all = values(await colCached<StudentNotification>('notifications'));
  return all
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);
}

/** Students who were already nudged about this assignment by this teacher
 *  within the cooldown window — used to stop repeat-spamming. */
export async function recentlyReminded(
  assignmentId: string,
  fromId: string,
  cooldownMs: number
): Promise<Set<string>> {
  const all = values(await colCached<StudentNotification>('notifications'));
  const cutoff = Date.now() - cooldownMs;
  return new Set(
    all
      .filter((n) => n.kind === 'remind' && n.assignmentId === assignmentId && n.fromId === fromId && n.createdAt >= cutoff)
      .map((n) => n.studentId)
  );
}
