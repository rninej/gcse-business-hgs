// Deterministic marking engine — every question type is marked objectively.
// The same input always produces the same verdict: this is what makes
// "always correctly marks" possible without any AI guesswork.
//
// Typed answers (term/fib) use a strict-but-fair comparison: normalised
// equality, plus a single-typo allowance for longer words so an honest
// spelling slip like "resillience" is never marked wrong. Short words must
// match exactly — that keeps genuinely different terms ("price" vs "pride",
// "good" vs "goods") safely apart.

import type { Question } from './types';
import type { PerQRecord } from './types';

export function normalize(s: string): string {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u2019']/g, '') // apostrophes
    .replace(/[.,!?;:"()£$%]/g, '')
    .replace(/[-–—_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseNumber(raw: string): number | null {
  let s = raw.toString().trim().toLowerCase();
  s = s.replace(/,/g, '');
  s = s.replace(/[£$]/g, '');
  s = s.replace(/%/g, '');
  s = s.replace(/\b(about|approx|approximately|roughly|around|circa|just over|just under|exactly)\b/g, '');
  s = s.replace(/~|\+/g, '');
  s = s.trim();
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const v = Number.parseFloat(m[0]);
  return Number.isFinite(v) ? v : null;
}

/* ------------------------------------------------------------------ */
/* Fair text matching — the heart of "never mismark an honest answer"  */
/* ------------------------------------------------------------------ */

/** Damerau-Levenshtein (optimal string alignment) distance, capped at `cap`.
 *  Substitutions, insertions, deletions AND transpositions ("teh"/"the")
 *  each count as one edit. */
export function editDistance(a: string, b: string, cap = 2): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > cap) return cap + 1;
  let prevPrev: Int32Array | null = null;
  let prev = new Int32Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  let cur = new Int32Array(lb + 1);
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prevPrev && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prevPrev[j - 2] + 1); // adjacent transposition
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > cap) return cap + 1; // every path is already too far
    prevPrev = prev;
    prev = cur;
    cur = new Int32Array(lb + 1);
  }
  return prev[lb];
}

/** Words that carry no meaning on their own in an answer phrase.
 *  Near-misses of articles ("teh") are forgiven too. */
function isArticle(w: string): boolean {
  if (w === 'a' || w === 'an' || w === 'the') return true;
  if (w.length <= 3 && editDistance(w, 'the', 1) <= 1) return true; // teh, the3…
  return false;
}

function wordsOf(s: string): string[] {
  return s.split(' ').filter((w) => w.length > 0 && !isArticle(w));
}

/** Business terms that sit one typo apart but mean genuinely different
 *  things — never confused for one another. */
const CONFUSABLE: ReadonlySet<string> = new Set(['loyalty|royalty', 'commerce|ecommerce']);

/** A single typo (edit or transposition) is forgiven — longer words only.
 *  7+ characters: "resillience"→"resilience" ✓, "determiantion"→"determination" ✓.
 *  Shorter words must be exact: "price"≠"pride", "good"≠"goods".
 *  Plurals of 5+ letter terms are always fine: "profit"="profits", "price"="prices". */
function wordMatches(g: string, e: string): boolean {
  if (g === e) return true;
  const pair = g < e ? `${g}|${e}` : `${e}|${g}`;
  if (CONFUSABLE.has(pair)) return false;
  const max = Math.max(g.length, e.length);
  const min = Math.min(g.length, e.length);
  if (min >= 5 && (g + 's' === e || e + 's' === g || g + 'es' === e || e + 'es' === g)) return true;
  if (max < 7) return false;
  return editDistance(g, e, 1) <= 1;
}

/** Compare a normalised typed answer against one normalised accepted answer. */
export function textMatches(givenNorm: string, acceptNorm: string): boolean {
  if (givenNorm === acceptNorm) return true;
  if (!givenNorm || !acceptNorm) return false;
  const g = wordsOf(givenNorm);
  const e = wordsOf(acceptNorm);
  if (g.length === 0 || e.length === 0) return false;
  if (g.length === e.length) {
    return g.every((w, i) => wordMatches(w, e[i]));
  }
  // spacing difference only: "breakeven" vs "break even"
  return g.join('') === e.join('');
}

export interface MarkOutcome {
  correct: boolean;
  expectedDisplay: string; // human-friendly expected answer
  givenDisplay: string;
}

export function expectedDisplay(q: Question): string {
  switch (q.type) {
    case 'mcq':
      return q.options[q.correct] ?? '';
    case 'truefalse':
      return q.answer ? 'True' : 'False';
    case 'term':
    case 'fib':
      return q.accept[0] ?? '';
    case 'numeric': {
      const dp = q.dp ?? 2;
      const num = Number(q.value.toFixed(dp)).toString();
      return q.unit ? `${num}${q.unit === '%' ? '%' : ' ' + q.unit}` : num;
    }
    case 'written':
      return `Marked by AI · ${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}`;
  }
}

export function markQuestion(q: Question, givenRaw: string | undefined | null): MarkOutcome {
  const given = (givenRaw ?? '').toString();
  const expected = expectedDisplay(q);
  let correct = false;

  switch (q.type) {
    case 'mcq': {
      const n = Number.parseInt(given.trim(), 10);
      correct = Number.isInteger(n) && n === q.correct;
      break;
    }
    case 'truefalse': {
      const g = normalize(given);
      correct = (q.answer && g === 'true') || (!q.answer && g === 'false');
      break;
    }
    case 'term':
    case 'fib': {
      const g = normalize(given);
      correct = g.length > 0 && q.accept.some((a) => textMatches(g, normalize(a)));
      break;
    }
    case 'numeric': {
      const n = parseNumber(given);
      correct = n !== null && Math.abs(n - q.value) <= q.tol + 1e-9;
      break;
    }
    case 'written': {
      // AI marks written answers after submission — never marked here
      correct = false;
      break;
    }
  }

  return {
    correct,
    expectedDisplay: expected,
    givenDisplay: given && given.trim() ? given.trim() : '—',
  };
}

export function markAttempt(
  questions: Question[],
  answers: Record<string, string>
): {
  perQ: Record<string, PerQRecord>;
  score: number;
  total: number;
  pct: number;
  topicStats: { topic: string; c: number; t: number }[];
  writtenPending: number; // written answers with content, not yet AI-marked
} {
  const perQ: Record<string, PerQRecord> = {};
  const topicAgg = new Map<string, { c: number; t: number }>();
  let score = 0;
  let total = 0;
  let writtenPending = 0;
  for (const q of questions) {
    const outcome = markQuestion(q, answers[q.id]);
    perQ[q.id] = { correct: outcome.correct, given: outcome.givenDisplay, expected: outcome.expectedDisplay };
    if (q.type === 'written') {
      total += q.marks;
      const hasAnswer = (answers[q.id] ?? '').toString().trim().length > 0;
      if (hasAnswer) {
        writtenPending += 1; // marked by the AI examiner after submission
      } else {
        perQ[q.id].awarded = 0; // blank written answer — nothing to mark
      }
      const agg = topicAgg.get(q.topic) ?? { c: 0, t: 0 };
      agg.t += q.marks;
      topicAgg.set(q.topic, agg);
    } else {
      score += outcome.correct ? q.marks : 0;
      total += q.marks;
      const agg = topicAgg.get(q.topic) ?? { c: 0, t: 0 };
      agg.t += q.marks;
      if (outcome.correct) agg.c += q.marks;
      topicAgg.set(q.topic, agg);
    }
  }
  const topicStats = [...topicAgg.entries()].map(([topic, v]) => ({ topic, c: v.c, t: v.t }));
  const pct = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;
  return { perQ, score, total, pct, topicStats, writtenPending };
}

/** Recompute score / total / pct / topic stats from stored per-question records
 *  (used after AI marking patches individual written answers). */
export function scoreFromPerQ(
  questions: Question[],
  perQ: Record<string, PerQRecord>
): { score: number; total: number; pct: number; topicStats: { topic: string; c: number; t: number }[] } {
  const topicAgg = new Map<string, { c: number; t: number }>();
  let score = 0;
  let total = 0;
  for (const q of questions) {
    const rec = perQ[q.id];
    total += q.marks;
    const agg = topicAgg.get(q.topic) ?? { c: 0, t: 0 };
    agg.t += q.marks;
    if (q.type === 'written') {
      const awarded = rec?.awarded ?? 0;
      score += awarded;
      agg.c += awarded;
    } else if (rec?.correct) {
      score += q.marks;
      agg.c += q.marks;
    }
    topicAgg.set(q.topic, agg);
  }
  const pct = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;
  return { score, total, pct, topicStats: [...topicAgg.entries()].map(([topic, v]) => ({ topic, c: v.c, t: v.t })) };
}
