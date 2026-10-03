// AI question generation with strict validation, arithmetic verification and
// curated-bank fallback. Used by /api/teacher/generate.

import { randomUUID } from 'crypto';
import { askAI, extractJson } from './ai';
import { KNOWLEDGE, knowledgeForTopics } from '@/data/knowledge';
import { TOPIC_MAP } from './topics';
import type { NumericQuestion, Question, QuestionType } from './types';
import { QUIZZES } from '@/data/bank';

export interface GenParams {
  topics: string[];
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

const SCHEMA_HINT = `Return ONLY a JSON array (no prose, no markdown fences). Each element:
{"type":"mcq","topic":"<topic id>","difficulty":1|2|3,"marks":1,"stem":"...","extract":{"title":"...","text":"..."} (optional),"diagram":null,"options":["A","B","C","D"] (exactly 4, exactly ONE correct — put the correct option in a RANDOM position, never always first; all four options MUST be similar in length and detail — the correct one must never stand out as the longest or most qualified; make at least one distractor longer than the correct option),"correct":0|1|2|3,"explain":"1-2 sentence explanation"}
{"type":"term","topic":"...","difficulty":...,"marks":1,"stem":"...","accept":["term","plural or common misspelling-free variant"],"explain":"..."}   // student types a word/term; list 2-4 accepted spellings incl. hyphen/space variants
{"type":"fib","topic":"...","stem":"sentence with ________ blank asking for ONE word","accept":["word"],"explain":"..."}
{"type":"truefalse","topic":"...","stem":"statement","answer":true|false,"explain":"..."}
{"type":"numeric","topic":"...","stem":"... (state rounding required, e.g. 1 decimal place)","value":<number>,"tol":<number>,"unit":"%"|"£"|"loaves"|null,"dp":<number>,"explain":"full working"}
{"type":"written","topic":"...","difficulty":3,"marks":<2-12>,"stem":"exam-style question demanding analysis or evaluation (e.g. Discuss…, Justify…, To what extent…)","extract":{...} (optional but recommended),"points":[{"text":"one marking point: what the student must say","marks":1|2|3}, ... 2-6 points summing to the total marks],"explain":"a model answer in full sentences covering every marking point"}`;

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
function validateOne(raw: Record<string, unknown>, allowedTopics: Set<string>): Question | null {
  const type = raw.type;
  const topic = typeof raw.topic === 'string' ? raw.topic : '';
  const stem = typeof raw.stem === 'string' ? stripMd(raw.stem.trim()) : '';
  const explain = typeof raw.explain === 'string' ? stripMd(raw.explain.trim()) : '';
  const difficultyRaw = Number(raw.difficulty);
  const difficulty = (raw.difficulty === 1 || raw.difficulty === 2 || raw.difficulty === 3 ? raw.difficulty : 2) as 1 | 2 | 3;
  const marks = Math.min(3, Math.max(1, Number(raw.marks) || 1));
  if (!stem || stem.length < 12 || !explain || explain.length < 10) return null;
  if (!allowedTopics.has(topic)) return null;

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
    return { id: '', type: 'mcq', topic, difficulty, marks, stem, extract, explain, options, correct };
  }
  if (type === 'term' || type === 'fib') {
    const accept = Array.isArray(raw.accept) ? raw.accept.map((a) => stripMd(String(a).trim())).filter(Boolean) : [];
    if (accept.length < 1 || accept.length > 6) return null;
    if (accept.some((a) => a.length > 40)) return null;
    return { id: '', type, topic, difficulty, marks, stem, extract, explain, accept };
  }
  if (type === 'truefalse') {
    if (typeof raw.answer !== 'boolean') return null;
    return { id: '', type: 'truefalse', topic, difficulty, marks, stem, extract, explain, answer: raw.answer };
  }
  if (type === 'numeric') {
    const value = Number(raw.value);
    const tol = Number(raw.tol);
    if (!Number.isFinite(value) || !Number.isFinite(tol) || tol < 0 || tol > 2) return null;
    const unit = typeof raw.unit === 'string' && ['%', '£', 'loaves', 'units', 'kg'].includes(raw.unit) ? raw.unit : undefined;
    const dp = Number.isInteger(raw.dp) && (raw.dp as number) >= 0 && (raw.dp as number) <= 3 ? (raw.dp as number) : undefined;
    return { id: '', type: 'numeric', topic, difficulty, marks, stem, extract, explain, value, tol, unit, dp };
  }
  if (type === 'written') {
    // AI-written extended-response question with its own mark scheme
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
    if (total < 2 || total > 12) return null;
    if (stem.length < 25) return null; // real exam-style command needed
    return { id: '', type: 'written', topic, difficulty: 3, marks: total, stem, extract, explain, points };
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

/** Curated-bank fallback when every AI provider fails */
export function bankFallback(params: GenParams): Question[] {
  const pool: Question[] = [];
  for (const quiz of QUIZZES) {
    if (quiz.topics.some((t) => params.topics.includes(t))) pool.push(...quiz.questions);
  }
  if (pool.length < 5) {
    for (const quiz of QUIZZES) pool.push(...quiz.questions);
  }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(params.count, 5)).map((q) => ({ ...q, id: `ai:${q.id}:${randomUUID().slice(0, 6)}` }));
}

export async function generateQuestions(params: GenParams): Promise<GenResult> {
  const count = Math.max(5, Math.min(30, params.count));
  let topics = params.topics.filter((t) => KNOWLEDGE[t]);
  // with a brief but no topics, the teacher leaves topic choice to the AI —
  // allow every spec topic in that case (validation needs the full set)
  if (topics.length === 0 && params.brief) {
    topics = Object.keys(KNOWLEDGE).filter((t) => TOPIC_MAP[t]);
  }
  if (topics.length === 0) topics.push('1.1', '2.1');

  const typeLine = params.types.length ? params.types.join(', ') : 'a natural mix (mostly mcq and term)';
  const diffLine = params.difficulty === 'mixed' ? 'roughly 40% easy, 40% medium, 20% hard' : `all difficulty ${params.difficulty}`;

  const system = `You are a senior Edexcel GCSE (9-1) Business examiner and question writer for a UK school platform. You write in crisp, neutral British English at the reading level of a 14-16 year old. Questions must be exam-accurate: every real-world fact must be true and verifiable; use real UK businesses with correct figures, or realistic fictional small businesses with clean, internally consistent numbers. Never invent statistics about real companies. Never mention AI, robots or that these questions were generated. Avoid Americanisms (lift, shop, autumn, maths, £).`;

  const briefLine = params.brief
    ? `\nTEACHER'S BRIEF (follow it closely — it overrides the type/difficulty/case-study preferences above when they conflict; the question count and the JSON schema always stand):\n${params.brief.slice(0, 600)}\n`
    : '';

  const user = `Write ${count} GCSE Business questions on: ${topics.map((t) => `${t} ${TOPIC_MAP[t]?.title ?? ''}`).join('; ')}.

QUESTION TYPES wanted: ${typeLine}.
DIFFICULTY: ${diffLine}.
CASE STUDY EXTRACTS: ${params.caseStudies ? 'include short case-study extracts above roughly a third of the questions (real businesses or clearly realistic small firms, 2-4 sentences)' : 'mostly standalone questions; at most one short extract'}.
${briefLine}

Rules:
- One correct answer only, no trick wording, no "all of the above".
- MCQ length parity is CRITICAL: all four options must be comparable in length and specificity. The correct option must NOT be the longest or the most detailed — students exploit that. Write distractors that are just as specific and roughly as long as the correct option (make at least one distractor longer).
- Never let one question give away another's answer: a term that one question asks the student to type must not appear in any other question's stem, options or explanation.
- "term" questions ask for a key term (1-3 words) — provide accepted spellings including obvious spacing/hyphen variants and the plural.
- "numeric" questions must state the rounding (e.g. "to 1 decimal place"); the value must be mathematically certain from the stem/extract; tolerance 0.05-0.5; include the full working in the explanation, ENDING with the final answer.
- Topics use Edexcel spec ids: 1.1 1.2 1.3 1.4 1.5 2.1 2.2 2.3 2.4 2.5.
- Explanations are 1-2 sentences, teacher-quality.

Use this knowledge (from the endorsed textbook) as your factual grounding:
${knowledgeForTopics(topics).slice(0, 6000)}

${SCHEMA_HINT}`;

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

  const allowedTopics = new Set(topics);
  let valid = parsed
    .map((r) => (r && typeof r === 'object' ? validateOne(r as Record<string, unknown>, allowedTopics) : null))
    .filter((q): q is Question => q !== null);
  valid = dedupe(valid);
  valid = await verifyNumeric(valid);
  valid = valid.slice(0, count);
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
