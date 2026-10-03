// Question-bank quality audit — enforces the rules that make quizzes fair:
//
//   1. CROSS-ANSWER LEAKS (the big one): a typed answer (term/fib) must not
//      appear in any other question's visible text — stem, options, case
//      extract, or explanation (explanations appear as soon as an answer is
//      checked, so they count). Written questions' explain/points are
//      post-submission only, so only their stem/extract are scanned.
//      Practice quizzes are order-SHUFFLED at runtime, so leaks are checked
//      regardless of question order.
//   2. MCQ LENGTH BIAS: the correct option must not be conspicuously the
//      longest option (students learn "pick the longest one").
//   3. COMPOSITION: per-quiz counts by type and difficulty, and a numeric
//      arithmetic sanity check (the explanation must mention the answer).
//
// Run with:  bun run scripts/audit-bank.ts
// Exit code 0 = clean (warnings allowed), 1 = errors found.

import { QUIZZES } from '../src/data/bank';
import type { Question } from '../src/lib/types';

interface Issue {
  level: 'ERROR' | 'WARN';
  quiz: string;
  qid: string;
  msg: string;
}

/** normalise an accepted answer into searchable terms */
function answerTerms(accept: string[]): string[] {
  const terms = new Set<string>();
  for (const raw of accept) {
    let t = raw.toLowerCase().trim();
    t = t.replace(/^(a|an|the)\s+/, '');
    // drop entries that are too short to be meaningful (e.g. "4ps")
    if (t.length < 4) continue;
    terms.add(t);
  }
  return [...terms];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** does `text` mention the answer term (incl. simple plurals)? */
function mentions(text: string, term: string): boolean {
  const body = escapeRe(term).replace(/\\ /g, '\\s+');
  const re = new RegExp(`\\b${body}(?:s|es)?\\b`, 'i');
  return re.test(text);
}

/** all visible-before-submission text of a question */
function visibleText(q: Question, includeExplain: boolean): string {
  const parts: (string | undefined)[] = [
    q.stem,
    q.extract?.title,
    q.extract?.text,
    ...('options' in q ? q.options : []),
  ];
  if (includeExplain) parts.push(q.explain);
  return parts.filter(Boolean).join('\n');
}

const issues: Issue[] = [];

function auditQuiz(quizId: string, questions: Question[], audience: string) {
  // ---- 1. cross-answer leaks within this quiz ----
  for (const q of questions) {
    if (q.type !== 'term' && q.type !== 'fib') continue;
    const terms = answerTerms(q.accept);
    if (terms.length === 0) continue;
    for (const o of questions) {
      if (o.id === q.id) continue;
      const hay = visibleText(o, o.type !== 'written');
      for (const t of terms) {
        if (mentions(hay, t)) {
          issues.push({
            level: 'ERROR',
            quiz: quizId,
            qid: q.id,
            msg: `typed answer "${t}" is leaked by ${o.id} (${o.type}) — visible text mentions it`,
          });
        }
      }
    }
  }

  // ---- 2. MCQ length bias ----
  let longestWins = 0;
  let mcqCount = 0;
  for (const q of questions) {
    if (q.type !== 'mcq') continue;
    mcqCount++;
    const lens = q.options.map((o) => o.length);
    const cLen = lens[q.correct];
    const others = lens.filter((_, i) => i !== q.correct);
    const avg = others.reduce((a, b) => a + b, 0) / others.length;
    const isLongest = cLen > Math.max(...others);
    if (isLongest) longestWins++;
    if (isLongest && cLen > avg * 1.5) {
      issues.push({
        level: 'ERROR',
        quiz: quizId,
        qid: q.id,
        msg: `MCQ correct option is the LONGEST and ${(cLen / avg).toFixed(2)}× the average distractor — dead giveaway`,
      });
    } else if (isLongest && cLen > avg * 1.25) {
      issues.push({
        level: 'WARN',
        quiz: quizId,
        qid: q.id,
        msg: `MCQ correct option is longest (${(cLen / avg).toFixed(2)}× avg) — consider balancing`,
      });
    }
  }

  // ---- 3. numeric sanity: the explanation must reach the claimed value ----
  for (const q of questions) {
    if (q.type !== 'numeric') continue;
    const nums = (q.explain.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (!nums.some((n) => Math.abs(n - q.value) <= q.tol + 1e-9)) {
      issues.push({
        level: 'WARN',
        quiz: quizId,
        qid: q.id,
        msg: `numeric answer ${q.value}±${q.tol} is not mentioned in its own explanation`,
      });
    }
  }

  // ---- 4. composition report ----
  const byType: Record<string, number> = {};
  const byDiff: Record<string, number> = {};
  for (const q of questions) {
    byType[q.type] = (byType[q.type] ?? 0) + 1;
    byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
  }
  const typeStr = Object.entries(byType)
    .map(([t, n]) => `${t}:${n}`)
    .join(' ');
  const diffStr = Object.entries(byDiff)
    .sort()
    .map(([d, n]) => `d${d}:${n}`)
    .join(' ');
  console.log(`\n${quizId} (${audience}) — ${questions.length} Qs · ${typeStr} · ${diffStr}` + (mcqCount > 0 ? ` · correct-longest ${longestWins}/${mcqCount}` : ''));
  if (audience === 'practice' && questions.length !== 15) {
    issues.push({ level: 'ERROR', quiz: quizId, qid: '-', msg: `practice quiz must have exactly 15 questions (has ${questions.length})` });
  }
}

// ---- cross-file leak check across the whole practice pool ----
// ("Build your own quiz" mixes questions from several practice files.)
function auditCrossPool() {
  const practice = QUIZZES.filter((z) => z.audience === 'practice');
  const all: Question[] = practice.flatMap((z) => z.questions);
  for (const q of all) {
    if (q.type !== 'term' && q.type !== 'fib') continue;
    const terms = answerTerms(q.accept);
    if (terms.length === 0) continue;
    for (const o of all) {
      if (o.id === q.id) continue;
      const hay = visibleText(o, o.type !== 'written');
      for (const t of terms) {
        if (mentions(hay, t)) {
          issues.push({
            level: 'WARN',
            quiz: 'practice-pool',
            qid: q.id,
            msg: `cross-file: "${t}" (${q.id}) also appears in ${o.id}`,
          });
        }
      }
    }
  }
}

for (const z of QUIZZES) auditQuiz(z.id, z.questions, z.audience);
auditCrossPool();

// ---- summary ----
const errors = issues.filter((i) => i.level === 'ERROR');
const warns = issues.filter((i) => i.level === 'WARN');
console.log('\n================ AUDIT RESULT ================');
if (issues.length === 0) {
  console.log('CLEAN — no leaks, no length bias, all compositions pass.');
} else {
  for (const i of issues) {
    console.log(`[${i.level}] ${i.quiz} · ${i.qid}: ${i.msg}`);
  }
  console.log(`------------- ${errors.length} error(s), ${warns.length} warning(s) -------------`);
}
process.exit(errors.length > 0 ? 1 : 0);
