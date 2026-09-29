// Compiles human-authored quiz definitions into the runtime bank.
// Author files use short local ids ('g1', 'g2'...); the compiler re-keys them
// to '<quiz-slug>:<local-id>' so ids can never collide across files.

import type { Question, Quiz } from './types';

export interface QuizDef {
  id: string; // slug, e.g. 'growth'
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  questions: Question[];
}

export function compileQuiz(def: QuizDef): Quiz {
  return {
    id: def.id,
    title: def.title,
    blurb: def.blurb,
    theme: def.theme,
    topics: def.topics,
    questions: def.questions.map((q) => ({ ...q, id: `${def.id}:${q.id}` })),
  };
}
