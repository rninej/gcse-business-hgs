// Anti-cheat integrity engine.
// The client quietly records behavioural signals while a quiz is open; the
// server combines them into a weighted 0-100 risk score. Only teachers ever
// see the output. Thresholds are deliberately conservative to avoid
// penalising quick, honest students.

import type { Question, RiskBand, RiskSignal, TelemetryEvent, PerQTelemetry } from './types';
import { normalize } from './marking';

export interface RiskInput {
  questions: Question[];
  answers: Record<string, string>;
  perQ: Record<string, PerQTelemetry>;
  events: TelemetryEvent[];
  wallMs: number;
  hiddenMs: number;
  perQCorrect: Record<string, boolean>;
}

export interface RiskAssessment {
  score: number;
  band: RiskBand;
  signals: RiskSignal[];
  pasteCount: number;
  tabSwitches: number;
  avgMsPerQ: number | null;
}

function bandOf(score: number): RiskBand {
  if (score < 20) return 'low';
  if (score < 45) return 'moderate';
  if (score < 70) return 'elevated';
  return 'high';
}

export function assessRisk(input: RiskInput): RiskAssessment {
  const signals: RiskSignal[] = [];
  const events = input.events ?? [];
  const pastes = events.filter((ev) => ev.e === 'paste');
  const copies = events.filter((ev) => ev.e === 'copy' || ev.e === 'cut');
  const hides = events.filter((ev) => ev.e === 'hide');
  const blurs = events.filter((ev) => ev.e === 'blur');

  let score = 0;
  const add = (label: string, points: number) => {
    if (points > 0) {
      score += points;
      signals.push({ label, points });
    }
  };

  // 1. Paste events
  if (pastes.length > 0) {
    add('Text pasted into the quiz', Math.min(12 * pastes.length, 40));
  }
  if (copies.length >= 3) {
    add('Repeated copying while the quiz was open', Math.min(4 * copies.length, 12));
  }

  // 2. Pasted content that matches a correct answer
  let pasteMatch = false;
  for (const p of pastes) {
    const pd = normalize(p.d ?? '');
    if (pd.length < 3) continue;
    for (const q of input.questions) {
      if (q.type !== 'term' && q.type !== 'fib') continue;
      const given = normalize(input.answers[q.id] ?? '');
      if (given.length > 0 && (given === pd || given.includes(pd) || pd.includes(given)) && given.length >= 4) {
        if (input.perQCorrect[q.id]) {
          pasteMatch = true;
        }
      }
    }
  }
  if (pasteMatch) add('Pasted text matches the answer submitted', 25);

  // 3. Typed answers with almost no keystrokes recorded
  let typedNoKeys = 0;
  for (const q of input.questions) {
    if (q.type !== 'term' && q.type !== 'fib') continue;
    const t = input.perQ[q.id];
    const ans = (input.answers[q.id] ?? '').toString();
    const len = normalize(ans).replace(/\s/g, '').length;
    if (len >= 4 && (!t || t.ks <= Math.max(1, Math.floor(len / 4)))) {
      typedNoKeys++;
    }
  }
  if (typedNoKeys >= 2) add('Answers submitted with very little typing activity', 20);
  else if (typedNoKeys === 1) add('One answer submitted with little typing activity', 8);

  // 4. Tab switches / lost focus
  if (hides.length >= 2) add('Switched away from the quiz tab', Math.min(5 * hides.length, 25));
  if (blurs.length > 3) add('Browser window repeatedly lost focus', Math.min(3 * blurs.length, 12));

  // 5. Long stretches hidden
  const wall = Math.max(input.wallMs, 1);
  if (input.hiddenMs / wall > 0.35 && input.hiddenMs > 45_000) {
    add('Spent a large share of the time with the quiz hidden', 12);
  }

  // 6. Answer pacing
  const times: number[] = [];
  for (const q of input.questions) {
    const t = input.perQ[q.id];
    if (t && t.ms > 0) times.push(t.ms);
  }
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  if (times.length >= 6) {
    const veryFast = times.filter((t) => t < 2500).length;
    if (veryFast >= 4) add('Several answers given within seconds of the question appearing', 18);
    else if (veryFast >= 2) add('Some unusually quick answers', 8);

    const correctCount = Object.values(input.perQCorrect).filter(Boolean).length;
    const totalQ = input.questions.length;
    const pctCorrect = totalQ ? (correctCount / totalQ) * 100 : 0;
    if (avg !== null && avg < 3500 && pctCorrect >= 85 && totalQ >= 8) {
      add('Very quick pace combined with a near-perfect score', 20);
    }
    const mean = avg ?? 0;
    const variance = times.reduce((a, b) => a + (b - mean) * (b - mean), 0) / times.length;
    const sd = Math.sqrt(variance);
    if (times.length >= 8 && mean < 6000 && sd < 800) {
      add('Unrealistically steady answering pace', 8);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    band: bandOf(score),
    signals: signals.sort((a, b) => b.points - a.points),
    pasteCount: pastes.length,
    tabSwitches: hides.length,
    avgMsPerQ: avg !== null ? Math.round(avg) : null,
  };
}

export function pointsFor(score: number, total: number, pct: number): number {
  const base = score * 10;
  const bonus = pct >= 100 ? 50 : pct >= 90 ? 25 : pct >= 80 ? 10 : 0;
  return base + bonus;
}
