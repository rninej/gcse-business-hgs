// gcsebusiness — pre-made quiz library.
// Two disjoint pools:
//   • assignment (default) — what teachers set as homework
//   • practice — student self-study only; never the quizzes teachers set
// New bank files register here.

import { compileQuiz } from '@/lib/bank';
import type { Quiz } from '@/lib/types';
import growth from './growth';
import finance from './finance';
import enterprise from './enterprise';
import opportunity from './opportunity';
import financesources from './finance-sources';
import ownership from './ownership';
import external from './external';
import marketing from './marketing';
import operations from './operations';
import hr from './hr';
import globalisation from './globalisation';
import examt1 from './exam-t1';
import examt2 from './exam-t2';
import casesgrowth from './cases-growth';
import casesfinance from './cases-finance';
import cashflowbreakeven from './cashflow-breakeven';
import legislationeconomy from './legislation-economy';
import marketingmixaction from './marketing-mix-action';
import growthstrategies from './growth-strategies';
import financecalcs from './finance-calcs';
import peopleperformance from './people-performance';
import practice11 from './practice-t1-11';
import practice12 from './practice-t1-12';
import practice13 from './practice-t1-13';
import practice14 from './practice-t1-14';
import practice15 from './practice-t1-15';
import practice21 from './practice-t2-21';
import practice22 from './practice-t2-22';
import practice23 from './practice-t2-23';
import practice24 from './practice-t2-24';
import practice25 from './practice-t2-25';

const DEFS = [
  // Theme 1 — teacher assignment pool
  enterprise,
  opportunity,
  financesources,
  ownership,
  external,
  examt1,
  cashflowbreakeven,
  legislationeconomy,
  // Theme 2 — teacher assignment pool
  growth,
  finance,
  marketing,
  operations,
  hr,
  globalisation,
  examt2,
  casesgrowth,
  casesfinance,
  marketingmixaction,
  growthstrategies,
  financecalcs,
  peopleperformance,
  // Student practice pool (never shown to teachers as settable homework)
  practice11,
  practice12,
  practice13,
  practice14,
  practice15,
  practice21,
  practice22,
  practice23,
  practice24,
  practice25,
];

export const QUIZZES: Quiz[] = DEFS.map(compileQuiz);

export const QUIZ_MAP: Record<string, Quiz> = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));
