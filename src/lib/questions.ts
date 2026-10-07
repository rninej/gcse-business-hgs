// AI question generation with strict validation, arithmetic verification and
// curated-bank fallback. Used by /api/teacher/generate.
//
// Three hard guarantees (teacher-reported regressions, R41):
//   1. QUESTION TYPES: when the teacher picks styles, ONLY those types reach
//      the preview — prompt says so, validation enforces it, the bank
//      fallback filters by it.
//   2. WRITTEN TARIFFS: AI-marked written questions are EXACTLY 3 marks
//      (Edexcel "Explain one…") unless the teacher's brief names a real
//      Edexcel extended tariff (6, 9 or 12) — never 4, 5, 7…
//   3. EDEXCEL 1BS0 STYLE: every question reads like it came from a real
//      paper — the real command words, Section A MCQ shape, "Complete the
//      sentence…" fills, "Calculate…" with stated rounding.

import { randomUUID } from 'crypto';
import { askAI, extractJson } from './ai';
import { KNOWLEDGE, knowledgeForTopics } from '@/data/knowledge';
import { SUBTOPIC_MAP, TOPIC_MAP } from './topics';
import type { NumericQuestion, Question, QuestionType } from './types';
import { QUIZZES } from '@/data/bank';

export interface GenParams {
  topics: string[];
  /** individually selected sub-topics (e.g. ['2.1.3']) — when present these
   *  are the hard boundaries: no questions from the rest of the topic */
  subtopics?: string[];
  count: number; // 5..30
  types: QuestionType[];
  difficulty: 1 | 2 | 3 | 'mixed';
  caseStudies: boolean;
  /** free-text teacher brief, e.g. "a quiz on a local bakery's break-even,
   *  mostly calculations, one case study" — steers generation when present */
  brief?: string;
}

export interface GenResult {
  questions: Question[];
  provider: 'gemini' | 'groq' | 'zai' | 'bank';
  note: string; // teacher-facing note (never shown to students)
}

function schemaHint(writtenTariffs: number[]): string {
  const marksBit = writtenTariffs.length
    ? `"marks":3 or ${writtenTariffs.join(' or ')} — exactly the tariff the teacher's brief asks for, never any other total`
    : `"marks":3 (fixed — never any other total)`;
  return `Return ONLY a JSON array (no prose, no markdown fences). Each element:
{"type":"mcq","topic":"<topic id>","difficulty":1|2|3,"marks":1,"stem":"...","extract":{"title":"...","text":"..."} (optional),"diagram":null,"options":["A","B","C","D"] (exactly 4, exactly ONE correct — put the correct option in a RANDOM position, never always first; all four options MUST be similar in length and detail — the correct one must never stand out as the longest or most qualified; make at least one distractor longer than the correct option),"correct":0|1|2|3,"explain":"1-2 sentence explanation"}
{"type":"term","topic":"...","difficulty":...,"marks":1,"stem":"Which term means …?","accept":["term","plural or common misspelling-free variant"],"explain":"..."}   // student types a word/term; list 2-4 accepted spellings incl. hyphen/space variants
{"type":"fib","topic":"...","stem":"Complete the sentence below with one word: … ________ …","accept":["word"],"explain":"..."}
{"type":"truefalse","topic":"...","stem":"statement","answer":true|false,"explain":"..."}
{"type":"numeric","topic":"...","stem":"Calculate … (state rounding required, e.g. 1 decimal place)","value":<number>,"tol":<number>,"unit":"%"|"£"|"loaves"|null,"dp":<number>,"explain":"full working"}
{"type":"written","topic":"...","difficulty":3,${marksBit},"stem":"an Edexcel 'Explain one …' question demanding a short chain of reasoning (at 6+ marks: 'Discuss…', 'Justify which…' or 'Evaluate…')","extract":{...} (optional but recommended),"points":[{"text":"one marking point: what the student must say","marks":1|2|3}, ... 2-6 points summing EXACTLY to the question's marks],"explain":"a model answer in full sentences covering every marking point"}`;
}

/** every question type the platform knows — used to spell out the FORBIDDEN
 *  types in the prompt (models follow an explicit ban much better than an
 *  implicit allow-list) */
const ALL_TYPES: QuestionType[] = ['mcq', 'term', 'fib', 'numeric', 'truefalse', 'written'];

function isQuestionType(v: unknown): v is QuestionType {
  return v === 'mcq' || v === 'term' || v === 'fib' || v === 'numeric' || v === 'truefalse' || v === 'written';
}

/** LLMs love markdown; students see plain text — strip the common markers. */
function stripMd(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/__([^_]+)__/g, '$1') // __bold__
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2') // *italic* on its own
    .replace(/`([^`]+)`/g, '$1') // `code`
    .replace(/^#{1,4}\s+/gm, '') // headings
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Structural validation of one AI-produced question */
function validateOne(
  raw: Record<string, unknown>,
  allowedTopics: Set<string>,
  allowedSubtopics?: Set<string>,
  /** permitted totals for written questions — {3} by default, plus any real
   *  Edexcel tariff (6/9/12) the teacher's brief explicitly asks for */
  allowedWrittenMarks?: Set<number>
): Question | null {
  const type = raw.type;
  const topic = typeof raw.topic === 'string' ? raw.topic : '';
  const stem = typeof raw.stem === 'string' ? stripMd(raw.stem.trim()) : '';
  const explain = typeof raw.explain === 'string' ? stripMd(raw.explain.trim()) : '';
  const difficultyRaw = Number(raw.difficulty);
  const difficulty = (raw.difficulty === 1 || raw.difficulty === 2 || raw.difficulty === 3 ? raw.difficulty : 2) as 1 | 2 | 3;
  const marks = Math.min(3, Math.max(1, Number(raw.marks) || 1));
  if (!stem || stem.length < 12 || !explain || explain.length < 10) return null;
  if (!allowedTopics.has(topic)) return null;
  // the AI may tag its question with the sub-topic it targeted — keep it only
  // when it's one of the teacher's selected sub-topics (never invent one)
  const rawSub = typeof raw.subtopic === 'string' ? raw.subtopic : '';
  const subtopic =
    allowedSubtopics && allowedSubtopics.has(rawSub) ? rawSub : undefined;

  const extract =
    raw.extract && typeof raw.extract === 'object'
      ? {
          title: stripMd(String((raw.extract as Record<string, unknown>).title ?? 'Case study')).slice(0, 80),
          text: stripMd(String((raw.extract as Record<string, unknown>).text ?? '').trim()),
        }
      : undefined;
  if (extract && (extract.text.length < 30 || extract.text.length > 900)) return null;

  if (type === 'mcq') {
    const options = Array.isArray(raw.options) ? raw.options.map((o) => stripMd(String(o).trim())) : [];
    const correct = Number(raw.correct);
    if (options.length !== 4 || !Number.isInteger(correct) || correct < 0 || correct > 3) return null;
    if (options.some((o) => !o || o.length > 120)) return null;
    if (new Set(options.map((o) => o.toLowerCase())).size !== 4) return null;
    // length-parity guard: students quickly learn "pick the longest option" —
    // reject questions where the correct option is conspicuously the longest
    const cLen = options[correct].length;
    const others = options.filter((_, i) => i !== correct).map((o) => o.length);
    const avgOthers = others.reduce((a, b) => a + b, 0) / others.length;
    if (cLen > Math.max(...others) && cLen > avgOthers * 1.75) return null;
    return { id: '', type: 'mcq', topic, subtopic, difficulty, marks, stem, extract, explain, options, correct };
  }
  if (type === 'term' || type === 'fib') {
    const accept = Array.isArray(raw.accept) ? raw.accept.map((a) => stripMd(String(a).trim())).filter(Boolean) : [];
    if (accept.length < 1 || accept.length > 6) return null;
    if (accept.some((a) => a.length > 40)) return null;
    return { id: '', type, topic, subtopic, difficulty, marks, stem, extract, explain, accept };
  }
  if (type === 'truefalse') {
    if (typeof raw.answer !== 'boolean') return null;
    return { id: '', type: 'truefalse', topic, subtopic, difficulty, marks, stem, extract, explain, answer: raw.answer };
  }
  if (type === 'numeric') {
    const value = Number(raw.value);
    const tol = Number(raw.tol);
    if (!Number.isFinite(value) || !Number.isFinite(tol) || tol < 0 || tol > 2) return null;
    const unit = typeof raw.unit === 'string' && ['%', '£', 'loaves', 'units', 'kg'].includes(raw.unit) ? raw.unit : undefined;
    const dp = Number.isInteger(raw.dp) && (raw.dp as number) >= 0 && (raw.dp as number) <= 3 ? (raw.dp as number) : undefined;
    return { id: '', type: 'numeric', topic, subtopic, difficulty, marks, stem, extract, explain, value, tol, unit, dp };
  }
  if (type === 'written') {
    // AI-written extended-response question with its own mark scheme.
    // Tariffs are a HARD boundary: exactly 3 marks ("Explain one…") unless
    // the teacher's brief named a real Edexcel tariff — 4-markers and other
    // odd totals are rejected outright, not silently kept.
    const rawPoints = Array.isArray(raw.points) ? raw.points : [];
    if (rawPoints.length < 2 || rawPoints.length > 8) return null;
    const points: { text: string; marks: number }[] = [];
    let total = 0;
    for (const p of rawPoints) {
      const obj = p as Record<string, unknown>;
      const text = typeof obj.text === 'string' ? stripMd(obj.text.trim()) : '';
      const pm = Math.round(Number(obj.marks));
      if (text.length < 5 || !Number.isInteger(pm) || pm < 1 || pm > 3) return null;
      points.push({ text: text.slice(0, 400), marks: pm });
      total += pm;
    }
    const allowed = allowedWrittenMarks ?? new Set([3]);
    if (!allowed.has(total)) return null;
    if (stem.length < 25) return null; // real exam-style command needed
    return { id: '', type: 'written', topic, subtopic, difficulty: 3, marks: total, stem, extract, explain, points };
  }
  return null;
}

/** Fisher–Yates shuffle that never biases — used for MCQ option order. */
function shuffledIndices(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/** Randomise the position of the correct option on every MCQ. LLMs (and
 *  busy humans writing banks) put the correct answer first far too often —
  * this guarantees an even spread of A/B/C/D no matter where questions come
 *  from. Call when an attempt is created or a set is generated. */
export function shuffleMcqOptions<T extends Question>(questions: T[]): T[] {
  return questions.map((q) => {
    if (q.type !== 'mcq') return q;
    const order = shuffledIndices(q.options.length);
    return {
      ...q,
      options: order.map((i) => q.options[i]),
      correct: order.indexOf(q.correct),
    } as T;
  });
}

/** Randomise QUESTION ORDER so the types interleave (an mcq, then a fib, then
 *  a numeric, another mcq…) instead of arriving in authored blocks — banks
 *  are written in type runs (5 MCQs, then 5 fill-ins, then 3 calculations),
 *  which reads as a patterned slog. Extended-response (written) questions
 *  always sink to the end: students answer the quickfire run first, then
 *  write. Called when an attempt is created, so every student sees a fresh
 *  order. */
export function shuffleQuestionOrder<T extends Question>(questions: T[]): T[] {
  const quick = questions.filter((q) => q.type !== 'written');
  for (let i = quick.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quick[i], quick[j]] = [quick[j], quick[i]];
  }
  const written = questions.filter((q) => q.type === 'written');
  return [...quick, ...written];
}

/** Deterministic guard: every numeric question's explanation must contain a number
 *  matching the claimed value within tolerance. Catches arithmetic slips that the
 *  AI cross-check misses (e.g. explanation says 0.0% while value claims 2.2). */
function numericMatchesExplanation(q: { value: number; tol: number; explain: string }): boolean {
  const nums = (q.explain.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return false;
  return nums.some((n) => Math.abs(n - q.value) <= q.tol + 1e-9);
}

/** Cross-check the arithmetic of numeric questions with an independent AI pass */
async function verifyNumeric(questions: Question[]): Promise<Question[]> {
  const numeric = questions.filter((q) => q.type === 'numeric');
  if (numeric.length === 0) return questions;
  const payload = numeric.map((q) => ({
    stem: q.stem,
    extract: q.extract?.text?.slice(0, 400),
    claimed: (q as { value: number }).value,
    tolerance: (q as { tol: number }).tol,
    explain: q.explain,
  }));
  const outcome = await askAI({
    system:
      'You are an examiner auditing GCSE Business maths questions. For each item, recompute the answer from the stem and extract. Reply ONLY with a JSON array of booleans, same order, true if the claimed answer is correct to the stated rounding, false otherwise.',
    user: JSON.stringify(payload, null, 1),
    maxTokens: 400,
    temperature: 0,
    timeoutMs: 25_000,
  });
  if (!outcome) return questions.filter((q) => q.type !== 'numeric'); // can't verify → drop numeric
  const verdicts = extractJson<unknown[]>(outcome.text);
  if (!Array.isArray(verdicts) || verdicts.length !== numeric.length) {
    return questions.filter((q) => q.type !== 'numeric');
  }
  const okSet = new Set<string>();
  numeric.forEach((q, i) => {
    if (verdicts[i] === true) okSet.add(q.id);
  });
  const aiVerified = questions.filter((q) => q.type !== 'numeric' || okSet.has(q.id));
  // deterministic final guard: the working in the explanation must reach the claimed answer
  return aiVerified.filter((q) => q.type !== 'numeric' || numericMatchesExplanation(q as NumericQuestion));
}

function dedupe(questions: Question[]): Question[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.stem.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 70);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Curated-bank fallback when every AI provider fails. The teacher's
 *  QUESTION TYPES are honoured exactly like generation is (a teacher who
 *  picked mcq/term/written must never see a true/false, even here) — the
 *  scope widens before the types do, and the types only widen if the bank
 *  genuinely cannot fill the quiz. */
export function bankFallback(params: GenParams): Question[] {
  const subSet = new Set((params.subtopics ?? []).filter((s) => SUBTOPIC_MAP[s]));
  const typeSet = new Set(params.types);
  const matchesTypes = (q: Question) => typeSet.size === 0 || typeSet.has(q.type);

  // stage 1: the teacher's exact scope AND the teacher's exact types
  const scoped: Question[] = [];
  for (const quiz of QUIZZES) {
    // sub-topic selections are hard boundaries — only questions tagged with
    // one of the chosen sub-topics qualify (a globalisation-only quiz must
    // never serve growth questions, even in the fallback)
    if (subSet.size > 0) {
      for (const q of quiz.questions) if (q.subtopic && subSet.has(q.subtopic) && matchesTypes(q)) scoped.push(q);
      continue;
    }
    if (quiz.topics.some((t) => params.topics.includes(t))) scoped.push(...quiz.questions.filter(matchesTypes));
  }
  // stage 2: whole-spec pool, still the teacher's types (right type beats
  // right topic when the bank is thin — the types were the explicit pick)
  let pool = scoped.length >= 5 ? scoped : QUIZZES.flatMap((quiz) => quiz.questions.filter(matchesTypes));
  // stage 3 (never in practice with 567 bank questions): ignore types too —
  // a usable quiz beats an empty one
  if (pool.length < 5) pool = QUIZZES.flatMap((quiz) => quiz.questions);

  // written questions are rich 6-12 mark tasks — cap them like generation
  // does so a fallback quiz keeps a real-paper shape (quick objective run,
  // a couple of extended pieces) unless written is ALL the teacher asked for
  const wants = Math.max(params.count, 5);
  const writtenOnly = typeSet.size === 1 && typeSet.has('written');
  const cap = writtenOnly ? pool.length : Math.max(1, Math.round(wants * 0.25));
  if (typeSet.size === 0 || !writtenOnly) {
    let seen = 0;
    const capped = pool.filter((q) => {
      if (q.type !== 'written') return true;
      seen += 1;
      return seen <= cap;
    });
    if (capped.length >= 5) pool = capped;
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, wants).map((q) => ({ ...q, id: `ai:${q.id}:${randomUUID().slice(0, 6)}` }));
}

/** The teacher's brief named a bigger written tariff (6/9/12) but the main
 *  pass produced none at it — models anchor hard on the schema's "marks":3
 *  example. One focused follow-up ask GUARANTEES the requested tariff
 *  question exists, validated with the same strictness as everything else. */
async function askTariffWritten(
  tariff: number,
  ctx: {
    system: string;
    targetLine: string;
    scopeLine: string;
    allowedTopics: Set<string>;
    allowedSubtopics: Set<string>;
  }
): Promise<Question | null> {
  const command =
    tariff === 6 ? 'Discuss…' : tariff === 9 ? 'Justify which…' : 'Evaluate… / Do you think…? Justify your answer.';
  const outcome = await askAI({
    system: ctx.system,
    user: `Write ONE GCSE Business written question on: ${ctx.targetLine}.

The question is worth EXACTLY ${tariff} marks — an Edexcel ${command} command-word question. Its marking points must sum to exactly ${tariff}.
${ctx.scopeLine}
Return ONLY a JSON array containing this single element:
{"type":"written","topic":"<the parent topic id, e.g. 2.1>","subtopic":"<the exact sub-topic id, when sub-topics are listed>","difficulty":3,"marks":${tariff},"stem":"${command.replace('…', ' …')} style question","extract":{"title":"...","text":"..."} (optional),"points":[{"text":"one marking point","marks":1|2|3}, ... 3-6 points summing to EXACTLY ${tariff}],"explain":"a model answer covering every marking point"}`,
    maxTokens: 1600,
    temperature: 0.85,
    timeoutMs: 45_000,
  });
  if (!outcome) return null;
  const arr = extractJson<unknown[]>(outcome.text);
  if (!Array.isArray(arr)) return null;
  for (const r of arr) {
    if (!r || typeof r !== 'object') continue;
    const q = validateOne(r as Record<string, unknown>, ctx.allowedTopics, ctx.allowedSubtopics, new Set([tariff]));
    if (q) return q;
  }
  return null;
}

export async function generateQuestions(params: GenParams): Promise<GenResult> {
  const count = Math.max(5, Math.min(30, params.count));
  // individual sub-topics selected — these are the teacher's hard boundaries
  const subtopics = (params.subtopics ?? []).filter((s) => SUBTOPIC_MAP[s]);
  const subParents = [...new Set(subtopics.map((s) => s.split('.').slice(0, 2).join('.')))];
  let topics = params.topics.filter((t) => KNOWLEDGE[t]);
  // with a brief but no topics, the teacher leaves topic choice to the AI —
  // allow every spec topic in that case (validation needs the full set)
  if (topics.length === 0 && subParents.length === 0 && params.brief) {
    topics = Object.keys(KNOWLEDGE).filter((t) => TOPIC_MAP[t]);
  }
  if (topics.length === 0 && subParents.length === 0) topics.push('1.1', '2.1');

  // written-question tariffs: exactly 3 marks ("Explain one…") unless the
  // teacher's brief names a bigger REAL Edexcel tariff — "one 6-mark written
  // question at the end" (the AskFirst placeholder suggests exactly that)
  // unlocks 6/9/12 too. 4, 5, 7… are never allowed — they are not what the
  // platform's written questions are.
  const briefTariffs = new Set(
    [...(params.brief?.matchAll(/(\d{1,2})\s*[-\u2013\u2014\s]?mark/gi) ?? [])]
      .map((m) => Number(m[1]))
      .filter((n) => n === 6 || n === 9 || n === 12)
  );
  const allowedWrittenMarks = new Set([3, ...briefTariffs]);

  // exact mix plan for the model: models obey counts far better than
  // adjectives, so when the teacher hand-picks types we say precisely how
  // many of each to write and name the forbidden types. Written questions
  // sit at a quarter of the quiz at most — a real-paper shape (quick
  // objective run first, a few extended pieces) — unless written is ALL
  // the teacher asked for.
  const writtenCap = Math.max(1, Math.round(count * 0.25));
  let mixLines: string;
  if (params.types.length === 0) {
    mixLines = `QUESTION TYPES wanted: a natural mix (mostly mcq and term). At most ${writtenCap} written question${writtenCap === 1 ? '' : 's'} in total.`;
  } else if (params.types.every((t) => t === 'written')) {
    mixLines = `QUESTION TYPES (critical): the teacher has selected ONLY written questions — write all ${count} questions as "written".`;
  } else {
    const objective = params.types.filter((t) => t !== 'written');
    const wantsWritten = params.types.includes('written');
    const writtenN = wantsWritten ? Math.min(writtenCap, Math.max(1, count - 1)) : 0;
    const objectiveN = count - writtenN;
    const forbidden = ALL_TYPES.filter((t) => !params.types.includes(t));
    // when the brief names a bigger Edexcel tariff, spell it out right here
    // where the counts live — buried in the rules it loses to the mix counts
    const tariffNote = wantsWritten && briefTariffs.size
      ? ` Among them, include the ${[...briefTariffs].sort((a, b) => a - b).join('/')}-mark written question(s) the teacher asked for — written at exactly that tariff with points summing to it — and keep every other written question at 3 marks.`
      : '';
    mixLines = [
      `QUESTION TYPES (critical): the teacher has hand-picked these question types — ${params.types.join(', ')}. Produce ONLY these types. ${forbidden.length ? `A ${forbidden.join(' or ')} question is WRONG and will be discarded before the teacher ever sees it.` : ''}`,
      wantsWritten
        ? `Mix plan: exactly ${objectiveN} objective question${objectiveN === 1 ? '' : 's'} split across ${objective.join(', ')}, plus exactly ${writtenN} written question${writtenN === 1 ? '' : 's'} (${count} in total).${tariffNote}`
        : `Mix plan: all ${count} questions split across ${objective.join(', ')}. NO written questions, nothing else.`,
    ].join('\n');
  }

  const diffLine = params.difficulty === 'mixed' ? 'roughly 40% easy, 40% medium, 20% hard' : `all difficulty ${params.difficulty}`;

  const system = `You are a senior Edexcel GCSE (9-1) Business (1BS0) examiner and question writer for a UK school platform. You write in crisp, neutral British English at the reading level of a 14-16 year old. Questions must be exam-accurate: every real-world fact must be true and verifiable; use real UK businesses with correct figures, or realistic fictional small businesses with clean, internally consistent numbers. Never invent statistics about real companies. Never mention AI, robots or that these questions were generated. Avoid Americanisms (lift, shop, autumn, maths, £).

EDEXCEL 1BS0 EXAM STYLE (critical — every question must read like it came from a real past paper):
- Use the real papers' command words: State / Outline / Explain / Calculate / Analyse / Justify / Discuss / Evaluate. No quiz-app phrasing.
- mcq — Section A style: a clear stem (sometimes one sentence of business context) with exactly four options, one unambiguously correct, no "all of the above".
- term — one-mark key-term recall in the papers' voice, e.g. "Which term means the money received from selling an output?".
- fib — "Complete the sentence below with one word:" followed by the sentence with a single blank, exactly as the papers print them.
- truefalse — one self-contained statement a student can judge as printed.
- numeric — "Calculate …": a genuine 1BS0 calculation (percentage change, profit margin, break-even, cash flow, ARR…) with the required rounding stated in the stem.
- written (3 marks) — "Explain one …": one short chain of reasoning, e.g. "Explain one benefit to a sole trader of becoming a limited company."`;

  const briefLine = params.brief
    ? `\nTEACHER'S BRIEF (follow it closely — it steers the quiz's content and context, and may override the difficulty and case-study preferences when they conflict. It NEVER overrides the QUESTION TYPES constraint, the written-question tariff rules, the question count or the JSON schema):\n${params.brief.slice(0, 600)}\n`
    : '';

  // targeting line: whole topics read as before; sub-topic selections come
  // with their official spec content so the model knows the exact boundary
  const targetLine = [
    ...topics.map((t) => `${t} ${TOPIC_MAP[t]?.title ?? ''} (the whole topic)`),
    ...subtopics.map(
      (s) => `${s} ${SUBTOPIC_MAP[s].title} — ONLY this sub-topic: ${SUBTOPIC_MAP[s].focus}`
    ),
  ].join('; ');
  const scopeLine =
    subtopics.length > 0
      ? `\nSCOPE (critical): the teacher has selected specific sub-topics. Every question must sit INSIDE the sub-topics marked "ONLY this sub-topic". Do NOT write about anything else from the parent topic — e.g. if only 2.1.3 Business and globalisation is listed, questions about mergers, takeovers, organic growth or changing aims are WRONG even though they belong to topic 2.1. Set each question's "topic" field to the sub-topic's parent topic id (e.g. "2.1") and add a "subtopic" field with the exact sub-topic id (e.g. "2.1.3").\n`
      : '';

  const user = `Write ${count} GCSE Business questions on: ${targetLine}.

${mixLines}
DIFFICULTY: ${diffLine}.
CASE STUDY EXTRACTS: ${params.caseStudies ? 'include short case-study extracts above roughly a third of the questions (real businesses or clearly realistic small firms, 2-4 sentences)' : 'mostly standalone questions; at most one short extract'}.
${briefLine}${scopeLine}

Rules:
- One correct answer only, no trick wording, no "all of the above".
- MCQ length parity is CRITICAL: all four options must be comparable in length and specificity. The correct option must NOT be the longest or the most detailed — students exploit that. Write distractors that are just as specific and roughly as long as the correct option (make at least one distractor longer).
- Never let one question give away another's answer: a term that one question asks the student to type must not appear in any other question's stem, options or explanation.
- "term" questions ask for a key term (1-3 words) — provide accepted spellings including obvious spacing/hyphen variants and the plural.
- "numeric" questions must state the rounding (e.g. "to 1 decimal place"); the value must be mathematically certain from the stem/extract; tolerance 0.05-0.5; include the full working in the explanation, ENDING with the final answer.
- "written" questions are worth EXACTLY 3 marks each — Edexcel "Explain one …" style — with marking points summing to exactly 3 (three 1-mark points, or one 1-mark plus one 2-mark point).${briefTariffs.size ? ` The teacher's brief explicitly asks for ${[...briefTariffs].sort((a, b) => a - b).join('/')}-mark written question(s): write those at exactly that tariff (6 = "Discuss…", 9 = "Justify which…", 12 = "Evaluate…" / "Do you think…? Justify your answer.") and keep every other written question at 3 marks.` : ' Never write a 4, 5, 6, 7, 8, 9, 10, 11 or 12-mark written question.'}
- Topics use Edexcel spec ids: 1.1 1.2 1.3 1.4 1.5 2.1 2.2 2.3 2.4 2.5. When sub-topics are listed, also set "subtopic" to the exact sub-topic id (e.g. "2.1.3").
- Explanations are 1-2 sentences, teacher-quality.

Use this knowledge (from the endorsed textbook) as your factual grounding:
${knowledgeForTopics([...new Set([...topics, ...subParents])]).slice(0, 6000)}

${schemaHint([...briefTariffs].sort((a, b) => a - b))}`;

  const outcome = await askAI({
    system,
    user,
    maxTokens: 8000,
    temperature: 0.85,
    timeoutMs: 90_000,
  });

  if (!outcome) {
    return {
      questions: bankFallback({ ...params, count }),
      provider: 'bank',
      note: 'All AI providers were unreachable — questions were drawn from the human-authored gcsebusiness bank instead.',
    };
  }

  const parsed = extractJson<unknown[]>(outcome.text);
  if (!Array.isArray(parsed)) {
    return {
      questions: bankFallback({ ...params, count }),
      provider: 'bank',
      note: 'AI output could not be parsed — questions were drawn from the human-authored bank instead.',
    };
  }

  const allowedTopics = new Set([...topics, ...subParents]);
  const allowedSubtopics = new Set(subtopics);
  let valid = parsed
    .map((r) => (r && typeof r === 'object' ? validateOne(r as Record<string, unknown>, allowedTopics, allowedSubtopics, allowedWrittenMarks) : null))
    .filter((q): q is Question => q !== null);
  // the teacher's selected types are a hard boundary — anything the model
  // produced outside them is discarded before it can reach the preview (a
  // teacher who picked mcq/term/written must never see a true/false)
  if (params.types.length > 0) {
    const typeSet = new Set(params.types);
    valid = valid.filter((q) => typeSet.has(q.type));
  }
  // keep a real-paper shape: written questions capped at a quarter of the
  // quiz (min 1) unless written is the ONLY type the teacher asked for
  if (!(params.types.length === 1 && params.types[0] === 'written')) {
    let seen = 0;
    valid = valid.filter((q) => {
      if (q.type !== 'written') return true;
      seen += 1;
      return seen <= writtenCap;
    });
  }
  valid = dedupe(valid);
  valid = await verifyNumeric(valid);
  valid = valid.slice(0, count);
  // tariff guarantee: if the teacher's brief named a bigger Edexcel written
  // tariff and none made it through, one focused second ask writes it — a
  // 3-mark written gives way so the quiz keeps its size and real-paper shape
  if (
    briefTariffs.size > 0 &&
    (params.types.length === 0 || params.types.includes('written'))
  ) {
    const present = new Set(valid.filter((q) => q.type === 'written').map((q) => q.marks));
    const missing = [...briefTariffs].filter((t) => !present.has(t));
    if (missing.length > 0) {
      const q = await askTariffWritten(missing[0]!, {
        system,
        targetLine,
        scopeLine,
        allowedTopics,
        allowedSubtopics,
      });
      if (q) {
        if (valid.length >= count) {
          const idx = valid.findIndex((x) => x.type === 'written' && x.marks === 3);
          if (idx >= 0) valid.splice(idx, 1);
          else valid.pop();
        }
        valid.push(q);
      }
    }
  }
  // even out the correct-answer positions — the model loves putting it first
  valid = shuffleMcqOptions(valid);

  if (valid.length < Math.max(4, Math.floor(count * 0.5))) {
    return {
      questions: bankFallback({ ...params, count }),
      provider: 'bank',
      note: `AI output failed quality checks (${valid.length} usable) — supplemented from the human-authored bank.`,
    };
  }

  const prefix = `ai:${outcome.provider}:${randomUUID().slice(0, 6)}`;
  return {
    questions: valid.map((q) => ({ ...q, id: `${prefix}:${q.id || randomUUID().slice(0, 4)}` })),
    provider: outcome.provider,
    note: `Generated by ${providerLabel(outcome.provider)} and passed ${valid.length}/${count} validation checks.`,
  };
}

/** Human-friendly, neutral name for the AI provider in teacher-facing notes. */
export function providerLabel(provider: string): string {
  if (provider === 'gemini') return 'Gemini';
  if (provider === 'groq') return 'Groq';
  if (provider === 'zai') return 'AI';
  return 'AI';
}
