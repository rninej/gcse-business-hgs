// Slim, per-student mirror of the full attempts collection — the hot-path
// data plane. Full attempt records carry complete question snapshots, answer
// telemetry and event logs (~16KB each, 700KB+ for the whole collection);
// dashboards, leaderboards, assignment lists and results tables only need
// scores, outcomes and risk data, so they read this feed instead:
//
//   attemptLite/{studentId}/{attemptId}  →  ~3-5KB per attempt
//
// A student's dashboard downloads ONLY their own feed; a teacher's results
// page reads the whole feed (a few hundred KB at school scale, and the
// version channel makes re-reads ~free). Crucially the feed is untouched by
// quiz-runner noise — heartbeats, answer confirms and explain requests write
// to the full record only, so an open results tab re-validating every 12
// seconds stays at ~200 bytes while a class is mid-quiz.
//
// Maintained at every meaningful attempt write site (create, submit,
// finalize, AI written-marking, teacher feedback). The full `attempts`
// collection remains the source of truth for detail views (result screen,
// resume, per-student answers dialog, integrity drill-down).

import { colCached, fb, flatValues } from './firebase';
import type { Attempt, AttemptResult, AttemptMode, AttemptStatus } from './types';

export interface AttemptLite {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  studentId: string;
  studentName: string;
  teacherId: string;
  classId: string | null;
  assignmentId: string | null;
  assignmentTitle: string;
  quizId?: string;
  startedAt: number;
  dueAt: number | null;
  timeLimitMin: number | null;
  /** full result block on submitted attempts (scores, per-question outcomes,
   *  topic stats, risk, feedback) — everything list views render */
  result: AttemptResult | null;
  hasTeacherFeedback: boolean;
  /** telemetry summary the results table needs, without the event log */
  pasteCount: number;
  tabSwitches: number;
  /** per-question milliseconds (from the telemetry map) */
  ms: Record<string, number>;
}

export function toLite(a: Attempt): AttemptLite {
  const events = a.events ?? [];
  const ms: Record<string, number> = {};
  for (const [qid, t] of Object.entries(a.perQ ?? {})) {
    if (t && typeof t.ms === 'number' && t.ms > 0) ms[qid] = t.ms;
  }
  return {
    id: a.id,
    mode: a.mode,
    status: a.status,
    studentId: a.studentId,
    studentName: a.studentName,
    teacherId: a.teacherId,
    classId: a.classId ?? null,
    assignmentId: a.assignmentId ?? null,
    assignmentTitle: a.assignmentTitle ?? '',
    quizId: a.quizId,
    startedAt: a.startedAt,
    dueAt: a.dueAt ?? null,
    timeLimitMin: a.timeLimitMin ?? null,
    result: a.result ?? null,
    hasTeacherFeedback: Boolean(a.teacherFeedback?.text),
    pasteCount: events.filter((e) => e.e === 'paste').length,
    tabSwitches: events.filter((e) => e.e === 'hide').length,
    ms,
  };
}

/** Write (or overwrite) one attempt's feed entry. */
export async function upsertLite(a: Attempt, opts?: { bg?: boolean }): Promise<void> {
  await fb.set(`attemptLite/${a.studentId}/${a.id}`, toLite(a), opts);
}

/** Patch selected feed fields (e.g. hasTeacherFeedback after a note lands). */
export async function patchLite(
  studentId: string,
  attemptId: string,
  partial: Partial<AttemptLite>
): Promise<void> {
  await fb.patch(`attemptLite/${studentId}/${attemptId}`, partial);
}

/** One student's own feed, newest first — the student dashboard's only
 *  attempt read (a few KB, never anyone else's data). */
export async function liteForStudent(studentId: string): Promise<AttemptLite[]> {
  const feed = await colCached<AttemptLite>(`attemptLite/${studentId}`);
  return Object.values(feed ?? {}).sort((a, b) => b.startedAt - a.startedAt);
}

/** Every student's feed entries — teacher-side views (results, leaderboards,
 *  dashboards). Reads the top-level collection once through the versioned
 *  cache, so polling tabs cost ~200 bytes when nothing changed. */
export async function allLite(): Promise<AttemptLite[]> {
  const nested = await colCached<Record<string, AttemptLite>>('attemptLite');
  return flatValues(nested);
}
