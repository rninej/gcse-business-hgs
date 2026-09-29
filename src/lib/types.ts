// HGSBusiness — shared domain types
// Single source of truth used by the question bank, API routes and UI.

export type Role = 'teacher' | 'student';

export type QuestionType = 'mcq' | 'term' | 'fib' | 'numeric' | 'truefalse';

export type DiagramKey =
  | 'breakeven'
  | 'plc'
  | 'cashflow'
  | 'orgchart'
  | 'marketshare'
  | 'growthchart'
  | 'economies';

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

export type Question = MCQQuestion | TextQuestion | NumericQuestion | TFQuestion;

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
}

// ---------- Quizzes / assignments ----------
export interface Quiz {
  id: string;
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  questions: Question[];
}

export type AssignmentSource = 'library' | 'ai' | 'custom';

export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  classTitle: string;
  title: string;
  description: string;
  dueAt: number | null; // epoch ms
  timeLimitMin: number | null;
  createdAt: number;
  source: AssignmentSource;
  generatedBy: string; // provider label for the teacher's eyes only
  questions: Question[];
}

// ---------- Attempts ----------
export type AttemptMode = 'assignment' | 'practice';
export type AttemptStatus = 'in-progress' | 'submitted';

/** Per-question outcome, stored the moment a student confirms an answer */
export interface CheckedState {
  a: string; // the confirmed answer
  correct: boolean;
  expected: string;
  explain: string;
  at: number;
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
}

export interface AttemptResult {
  score: number; // marks earned
  total: number; // marks available
  pct: number;
  perQ: Record<string, { correct: boolean; given: string; expected: string }>;
  topicStats: TopicStat[];
  timeTakenSec: number;
  points: number;
  feedback: string;
  feedbackBy: 'gemini' | 'groq' | 'zai' | 'template';
  riskScore: number;
  riskBand: RiskBand;
  riskSignals: RiskSignal[];
  submittedAt: number;
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
  startedAt: number;
  dueAt: number | null;
  timeLimitMin: number | null;
  questions: Question[]; // full snapshot — SERVER ONLY, never sent to client pre-submission
  answers: Record<string, string>; // confirmed (checked) answers are persisted here
  checked: Record<string, CheckedState>; // qid -> outcome, filled as the student confirms
  perQ: Record<string, PerQTelemetry>;
  events: TelemetryEvent[];
  wallMs: number;
  hiddenMs: number;
  result: AttemptResult | null;
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
  dueAt: number | null;
  timeLimitMin: number | null;
  createdAt: number;
  questionCount: number;
  source: AssignmentSource;
  submitted: number;
  totalStudents: number;
}

export interface TeacherStudentResult {
  studentId: string;
  displayName: string;
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
}
