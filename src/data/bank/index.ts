// HGSBusiness — pre-made quiz library.
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

const DEFS = [
  // Theme 1
  enterprise,
  opportunity,
  financesources,
  ownership,
  external,
  examt1,
  // Theme 2
  growth,
  finance,
  marketing,
  operations,
  hr,
  globalisation,
  examt2,
  casesgrowth,
  casesfinance,
];

export const QUIZZES: Quiz[] = DEFS.map(compileQuiz);

export const QUIZ_MAP: Record<string, Quiz> = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));
