// Deterministic marking engine — every question type is marked objectively.
// The same input always produces the same verdict: this is what makes
// "always correctly marks" possible without any AI guesswork.

import type { Question } from './types';

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
      correct = g.length > 0 && q.accept.some((a) => normalize(a) === g);
      break;
    }
    case 'numeric': {
      const n = parseNumber(given);
      correct = n !== null && Math.abs(n - q.value) <= q.tol + 1e-9;
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
  perQ: Record<string, { correct: boolean; given: string; expected: string }>;
  score: number;
  total: number;
  pct: number;
  topicStats: { topic: string; c: number; t: number }[];
} {
  const perQ: Record<string, { correct: boolean; given: string; expected: string }> = {};
  const topicAgg = new Map<string, { c: number; t: number }>();
  let score = 0;
  let total = 0;
  for (const q of questions) {
    const outcome = markQuestion(q, answers[q.id]);
    perQ[q.id] = { correct: outcome.correct, given: outcome.givenDisplay, expected: outcome.expectedDisplay };
    score += outcome.correct ? q.marks : 0;
    total += q.marks;
    const agg = topicAgg.get(q.topic) ?? { c: 0, t: 0 };
    agg.t += q.marks;
    if (outcome.correct) agg.c += q.marks;
    topicAgg.set(q.topic, agg);
  }
  const topicStats = [...topicAgg.entries()].map(([topic, v]) => ({ topic, c: v.c, t: v.t }));
  const pct = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;
  return { perQ, score, total, pct, topicStats };
}
