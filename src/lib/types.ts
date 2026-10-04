// gcsebusiness — shared domain types
// Single source of truth used by the question bank, API routes and UI.

export type Role = 'teacher' | 'student';

export type QuestionType = 'mcq' | 'term' | 'fib' | 'numeric' | 'truefalse' | 'written';

export type DiagramKey =
  | 'breakeven'
  | 'plc'
  | 'cashflow'
  | 'orgchart'
  | 'marketshare'
  | 'growthchart'
  | 'economies'
  | 'shareprice'
  | 'luxgrowth'
  | 'primarkstores'
  | 'qcflow'
  | 'financesources'
  | 'automation'
  | 'growpaths';

export interface QExtract {
  title: string;
  text: string;
  image?: string; // path under /public, shown beside the extract
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  topic: string; // topic id, e.g. '2.1'
  difficulty: 1 | 2 | 3;
  marks: number;
  stem: string;
  extract?: QExtract;
  diagram?: DiagramKey;
  image?: string;
  explain: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
  correct: number; // index into options
}

/** 'term' = type the term/word; 'fib' = fill in the blank (single word) — same marking */
export interface TextQuestion extends BaseQuestion {
  type: 'term' | 'fib';
  accept: string[]; // accepted spellings; matched after normalisation
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  value: number;
  tol: number; // +/- tolerance
  unit?: string; // e.g. '%', '£', 'units'
  dp?: number; // decimal places hint for display
}

export interface TFQuestion extends BaseQuestion {
  type: 'truefalse';
  answer: boolean;
}

/** One line of a written-question mark scheme. */
export interface WrittenPoint {
  text: string;
  marks: number;
}

/** Large written-answer question, marked by AI against the mark scheme. */
export interface WrittenQuestion extends BaseQuestion {
  type: 'written';
  points: WrittenPoint[]; // mark scheme — total marks = sum of point marks
}

export type Question = MCQQuestion | TextQuestion | NumericQuestion | TFQuestion | WrittenQuestion;

/** Question with the answer stripped — safe to send to the browser */
export interface ClientQuestion {
  id: string;
  n: number;
  type: QuestionType;
  topic: string;
  marks: number;
  stem: string;
  extract?: QExtract;
  diagram?: DiagramKey;
  image?: string;
  options?: string[]; // mcq only
  unit?: string; // numeric display hint
  dp?: number;
}

// ---------- People ----------
export interface Teacher {
  id: string;
  name: string;
  email: string; // lowercase, unique
  pw: string; // scrypt hash
  createdAt: number;
}

export interface StudentClass {
  id: string;
  teacherId: string;
  name: string;
  createdAt: number;
}

export interface Student {
  id: string;
  teacherId: string;
  classId: string;
  username: string; // lowercase, globally unique
  displayName: string;
  pw: string;
  pwEnc?: string; // AES-GCM copy so the teacher can always view the login
  createdAt: number;
  /** Set once the student has been offered (and dismissed or used) the
   *  first-login password-change popup. */
  firstLoginDone?: boolean;
}

// ---------- Quizzes / assignments ----------
export interface Quiz {
  id: string;
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  /** practice = student self-study pool only; assignment = teacher-set pool only.
   *  The two pools never share questions, so practice can never leak homework. */
  audience: 'practice' | 'assignment';
  questions: Question[];
}

export type AssignmentSource = 'library' | 'ai' | 'custom';
export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  classTitle: string;
  /** Multi-class posting: every class listed here (plus classId) receives it. */
  classIds?: string[];
  /** Specific individuals (on top of / instead of whole classes). */
  studentIds?: string[];
  title: string;
  description: string;
  dueAt: number | null; // epoch ms
  timeLimitMin: number | null;
  createdAt: number;
  source: AssignmentSource;
  generatedBy: string; // provider label for the teacher's eyes only
  /** Draft assignments are invisible to students until published. */
  draft?: boolean;
  questions: Question[];
  /** Scheduled publishing: while publishAt (epoch ms) is in the future the
   *  assignment is hidden from students. The first student dashboard load
   *  after the moment passes flips it live and rings every targeted
   *  student's bell. */
  publishAt?: number;
  /** Set once the go-live notifications have been written — the dedupe
   *  guard so a later poll never rings the same bell twice. */
  notifiedAt?: number;
}

/** Does this assignment reach the given student? (their class is targeted,
 *  or they were picked as an individual.) */
export function assignmentTargetsStudent(
  a: Pick<Assignment, 'classId' | 'classIds' | 'studentIds'>,
  student: { id: string; classId: string | null }
): boolean {
  if (a.studentIds?.includes(student.id)) return true;
  if (student.classId && (a.classId === student.classId || a.classIds?.includes(student.classId))) return true;
  return false;
}

// ---------- Student notifications ----------

export type NotificationKind = 'assignment' | 'remind' | 'feedback';

/** A small in-app message on a student's bell — created when a teacher sets
 *  work for them, nudges them about an un-submitted assignment, or leaves
 *  feedback on one of their answers. */
export interface StudentNotification {
  id: string;
  studentId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  readAt: number | null;
  /** deep link — the Quizzes view opens with this assignment highlighted */
  assignmentId?: string;
  /** deep link — feedback notifications jump straight to that result screen */
  attemptId?: string;
  /** who sent it (teacher uid) — used to de-dupe repeated nudges */
  fromId?: string;
}

// ---------- Attempts ----------
export type AttemptMode = 'assignment' | 'practice' | 'selftest';
export type AttemptStatus = 'in-progress' | 'submitted';

/** Per-question outcome, stored the moment a student confirms an answer */
export interface CheckedState {
  a: string; // the confirmed answer
  correct: boolean;
  expected: string;
  explain: string;
  at: number;
}

/** Stored "explain it to me" explanation for a wrong answer */
export interface ExplainNote {
  text: string;
  by: 'gemini' | 'groq' | 'zai' | 'template';
}

export interface TelemetryEvent {
  e: 'paste' | 'copy' | 'cut' | 'blur' | 'focus' | 'hide' | 'show';
  t: number; // ms since start
  d?: string; // pasted/copied text (truncated)
}

export interface PerQTelemetry {
  ms: number; // time on question
  ks: number; // keystrokes
  ch: number; // answer changes
}

export interface TopicStat {
  topic: string;
  c: number;
  t: number;
}

export interface RiskSignal {
  label: string;
  points: number;
}

export type RiskBand = 'low' | 'moderate' | 'elevated' | 'high';

/** A written answer after AI marking (stored on the attempt's per-question record). */
export interface WrittenMarkPoint extends WrittenPoint {
  awarded: boolean;
  why: string;
}

export interface QReview {
  qid: string;
  n: number;
  type: QuestionType;
  topic: string;
  stem: string;
  extract?: QExtract;
  diagram?: DiagramKey;
  image?: string;
  options?: string[];
  given: string;
  expected: string;
  correct: boolean;
  marks: number;
  explain: string;
  // written questions only
  points?: WrittenPoint[]; // the mark scheme
  awarded?: number; // marks the AI awarded
  comment?: string; // examiner-style comment
  markedBy?: 'gemini' | 'groq' | 'zai' | 'template';
  pointResults?: WrittenMarkPoint[];
  pendingMark?: boolean; // answer saved, AI marking not finished
}

export interface AttemptResult {
  score: number; // marks earned
  total: number; // marks available
  pct: number;
  perQ: Record<string, PerQRecord>;
  topicStats: TopicStat[];
  timeTakenSec: number;
  points: number;
  feedback: string;
  feedbackBy: 'gemini' | 'groq' | 'zai' | 'template';
  riskScore: number;
  riskBand: RiskBand;
  riskSignals: RiskSignal[];
  submittedAt: number;
  writtenPending?: number; // written answers still awaiting AI marking
}

/** Per-question outcome stored on a submitted attempt's result. */
export interface PerQRecord {
  correct: boolean;
  given: string;
  expected: string;
  // written questions (after AI marking)
  awarded?: number;
  comment?: string;
  markedBy?: 'gemini' | 'groq' | 'zai' | 'template';
  pointResults?: WrittenMarkPoint[];
}

/** Written feedback a teacher leaves on a student's submitted quiz */
export interface TeacherFeedback {
  text: string;
  at: number;
  byName: string;
}

export interface Attempt {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  studentId: string;
  studentName: string;
  teacherId: string;
  classId: string | null;
  assignmentId: string | null;
  assignmentTitle: string;
  quizId?: string; // library quiz id — set for practice attempts so they can be redone
  startedAt: number;
  dueAt: number | null;
  timeLimitMin: number | null;
  /** Heartbeat: last moment the student was actively inside a timed quiz.
   *  Timed attempts whose heartbeat goes stale are auto-submitted — leaving
   *  a timed quiz ends it (rejoining is only for untimed quizzes). */
  lastSeenAt?: number;
  questions: Question[]; // full snapshot — SERVER ONLY, never sent to client pre-submission
  answers: Record<string, string>; // confirmed (checked) answers are persisted here
  checked: Record<string, CheckedState>; // qid -> outcome, filled as the student confirms
  explanations?: Record<string, ExplainNote>; // qid -> stored "explain it to me" text
  teacherFeedback?: TeacherFeedback; // teacher's written note on the submitted quiz
  perQ: Record<string, PerQTelemetry>;
  events: TelemetryEvent[];
  wallMs: number;
  hiddenMs: number;
  result: AttemptResult | null;
  /** Streak milestone crossed by THIS submission (3/7/14/30/50/100), captured
   *  at submit time so the celebration persists on the attempt forever — a
   *  later same-day quiz would otherwise mask it when the result is re-read. */
  streakMilestone?: number | null;
}

// ---------- Flashcards ----------
export interface Flashcard {
  front: string; // term or prompt
  back: string; // definition or answer
  hint?: string;
}

export interface FlashcardDeck {
  topic: string; // topic id e.g. '1.1'
  title: string;
  blurb: string;
  cards: Flashcard[];
}

// ---------- API DTOs ----------
export interface SessionInfo {
  uid: string;
  role: Role;
  name: string;
  sub?: string; // username (student) / email (teacher)
  classId?: string;
  className?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  createdAt: number;
  studentCount: number;
}

export interface StudentRow {
  id: string;
  username: string;
  displayName: string;
  password: string | null; // memorable password, visible to the teacher
  createdAt: number;
}

export interface AssignmentRow {
  id: string;
  title: string;
  classId: string;
  classTitle: string;
  classTitles?: string[]; // every targeted class (multi-class posting)
  studentCount?: number; // individually-targeted students (on top of classes)
  dueAt: number | null;
  timeLimitMin: number | null;
  createdAt: number;
  questionCount: number;
  source: AssignmentSource;
  draft?: boolean;
  submitted: number;
  totalStudents: number;
}

/** One submitted attempt of an assignment — a student may redo the work,
 *  and the teacher sees every go. */
export interface AttemptSummary {
  id: string;
  score: number;
  total: number;
  pct: number;
  submittedAt: number;
  timeTakenSec: number;
  riskScore: number;
  riskBand: RiskBand;
}

export interface TeacherStudentResult {
  studentId: string;
  displayName: string;
  /** student's chosen avatar (data URL / "emoji:…") — set by the results
   *  leaderboard routes so the teacher sees the same face students do */
  avatar?: string | null;
  username: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'late';
  score?: number;
  total?: number;
  pct?: number;
  submittedAt?: number;
  timeTakenSec?: number;
  riskScore?: number;
  riskBand?: RiskBand;
  riskSignals?: RiskSignal[];
  avgMsPerQ?: number;
  pasteCount?: number;
  tabSwitches?: number;
  attemptCount?: number; // total attempts (redos included)
  history?: AttemptSummary[]; // every submitted attempt, oldest first
  /** true while a student with a finished attempt is doing ANOTHER go — the
   *  headline row keeps showing the last completed attempt (score, time and
   *  integrity included) instead of a blank "in progress" row */
  retaking?: boolean;
}
