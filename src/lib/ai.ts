// AI provider chain — always try in this order: Gemini → Groq → z.ai
// Model order inside Gemini/Groq is health-aware (src/lib/aiHealth.ts):
// models that just hit their free-tier limit are skipped for a short cooldown
// and the next model on the SAME provider is used, spreading usage across
// every model each API offers.
import ZAI from 'z-ai-web-dev-sdk';
import { markDead, markRateLimited, orderedModels } from './aiHealth';
import type { AttemptResult } from './types';

export type Provider = 'gemini' | 'groq' | 'zai';

export interface AIAttempt {
  provider: Provider;
  ok: boolean;
  error?: string;
}

export interface AIOutcome {
  text: string;
  provider: Provider;
  model: string;
  attempts: AIAttempt[];
}

export interface AIRequest {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

const GEMINI_MODELS = (process.env.GEMINI_MODELS || 'gemini-3.8-flash,gemini-flash-latest,gemini-3.5-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_MODELS = (process.env.GROQ_MODELS || 'llama-3.3-70b-versatile,llama-3.1-8b-instant,openai/gpt-oss-120b')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const GROQ_KEY = process.env.GROQ_API_KEY || '';

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(timer) };
}

// ---------- Gemini ----------
async function tryGemini(req: AIRequest): Promise<string> {
  if (!GEMINI_KEY) throw new Error('no gemini key');
  let lastErr = 'unknown';
  for (const model of await orderedModels('gemini', GEMINI_MODELS)) {
    const t = withTimeout(req.timeoutMs ?? 30_000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: t.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${req.system}\n\n${req.user}` }] }],
            generationConfig: {
              temperature: req.temperature ?? 0.7,
              maxOutputTokens: req.maxTokens ?? 4096,
            },
          }),
        }
      );
      if (!res.ok) {
        lastErr = `gemini ${model} -> ${res.status}`;
        if (res.status === 429) await markRateLimited('gemini', model);
        else if (res.status === 404 || res.status === 400) await markDead('gemini', model);
        continue;
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();
      if (!text) {
        lastErr = `gemini ${model} -> empty`;
        continue;
      }
      return text;
    } catch (e) {
      lastErr = `gemini ${model} -> ${(e as Error).message}`;
    } finally {
      t.done();
    }
  }
  throw new Error(lastErr);
}

// ---------- Groq ----------
async function tryGroq(req: AIRequest): Promise<string> {
  if (!GROQ_KEY) throw new Error('no groq key');
  let lastErr = 'unknown';
  for (const model of await orderedModels('groq', GROQ_MODELS)) {
    const t = withTimeout(req.timeoutMs ?? 30_000);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        signal: t.signal,
        body: JSON.stringify({
          model,
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens ?? 4096,
          messages: [
            { role: 'system', content: req.system },
            { role: 'user', content: req.user },
          ],
        }),
      });
      if (!res.ok) {
        lastErr = `groq ${model} -> ${res.status}`;
        if (res.status === 429) await markRateLimited('groq', model);
        else if (res.status === 404 || res.status === 400 || res.status === 403) await markDead('groq', model);
        continue;
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = (data.choices?.[0]?.message?.content ?? '').trim();
      if (!text) {
        lastErr = `groq ${model} -> empty`;
        continue;
      }
      return text;
    } catch (e) {
      lastErr = `groq ${model} -> ${(e as Error).message}`;
    } finally {
      t.done();
    }
  }
  throw new Error(lastErr);
}

// ---------- z.ai ----------
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

async function tryZai(req: AIRequest): Promise<string> {
  const zai = await getZai();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: req.system },
      { role: 'user', content: req.user },
    ],
    thinking: { type: 'disabled' },
  });
  const text = (completion.choices?.[0]?.message?.content ?? '').trim();
  if (!text) throw new Error('zai -> empty');
  return text;
}

// ---------- Chain ----------
export async function askAI(req: AIRequest): Promise<AIOutcome | null> {
  const attempts: AIAttempt[] = [];
  const chain: { provider: Provider; run: () => Promise<string> }[] = [
    { provider: 'gemini', run: () => tryGemini(req) },
    { provider: 'groq', run: () => tryGroq(req) },
    { provider: 'zai', run: () => tryZai(req) },
  ];
  for (const step of chain) {
    try {
      const text = await step.run();
      attempts.push({ provider: step.provider, ok: true });
      return { text, provider: step.provider, model: step.provider, attempts };
    } catch (e) {
      attempts.push({ provider: step.provider, ok: false, error: (e as Error).message });
    }
  }
  return null;
}

/** Tolerant JSON extraction — strips fences, finds the outermost JSON array/object */
export function extractJson<T = unknown>(text: string): T | null {
  let s = text.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const tryParse = (str: string): T | null => {
    try {
      return JSON.parse(str) as T;
    } catch {
      return null;
    }
  };
  const direct = tryParse(s);
  if (direct !== null) return direct;
  for (const [open, close] of [
    ['[', ']'],
    ['{', '}'],
  ] as const) {
    const start = s.indexOf(open);
    const end = s.lastIndexOf(close);
    if (start !== -1 && end > start) {
      const parsed = tryParse(s.slice(start, end + 1));
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

// ---------- Student feedback ----------
export interface FeedbackInput {
  studentName: string;
  quizTitle: string;
  pct: number;
  score: number;
  total: number;
  topicStats: { topic: string; c: number; t: number }[];
  topicTitles: Record<string, string>;
  weakTopics: string[];
  strongTopics: string[];
  timeTakenSec: number;
}

export function templateFeedback(input: FeedbackInput): string {
  const pct = input.pct;
  let opening: string;
  if (pct >= 90) opening = `Outstanding work, ${input.studentName} — ${pct}% on “${input.quizTitle}”.`;
  else if (pct >= 75) opening = `A strong effort, ${input.studentName} — ${pct}% on “${input.quizTitle}”.`;
  else if (pct >= 55) opening = `A solid attempt, ${input.studentName} — ${pct}% on “${input.quizTitle}”.`;
  else if (pct >= 40) opening = `There is plenty to build on, ${input.studentName} — ${pct}% on “${input.quizTitle}”.`;
  else opening = `This one was tough, ${input.studentName} — ${pct}% on “${input.quizTitle}”. Let’s turn it around.`;

  const lines: string[] = [opening];
  if (input.strongTopics.length) {
    const strong = input.strongTopics.map((t) => input.topicTitles[t] ?? t).slice(0, 2);
    lines.push(`You were strongest on ${strong.join(' and ')}.`);
  }
  if (input.weakTopics.length) {
    const weak = input.weakTopics.map((t) => input.topicTitles[t] ?? t).slice(0, 2);
    lines.push(
      `Your next step is to revisit ${weak.join(' and ')} — re-read the notes, then retry a practice quiz on those topics.`
    );
  } else {
    lines.push(`Keep testing yourself — short, regular practice is what makes definitions stick.`);
  }
  if (pct < 55) {
    lines.push(`Focus first on learning the key terms word-for-word; most marks at GCSE start with accurate terminology.`);
  }
  if (input.timeTakenSec > 0 && input.timeTakenSec < 60 && input.total >= 10) {
    lines.push(`Take a little more time per question — accuracy improves when you read each stem twice.`);
  }
  return lines.join(' ');
}

export async function generateFeedback(
  input: FeedbackInput
): Promise<{ text: string; by: AttemptResult['feedbackBy'] }> {
  const topicLines = (input.topicStats ?? []).map(
    (s) => `${input.topicTitles[s.topic] ?? s.topic}: ${s.c}/${s.t} correct`
  );
  const system = `You are a supportive GCSE Business teacher writing feedback for a student aged 14-16. British English. Warm, specific, honest. Never mention AI or that you are generating feedback. 4-6 sentences maximum, no markdown, no lists. Mention one strength, one improvement with a concrete action, and close with encouragement. Address the student by name.`;
  const user = `Student: ${input.studentName}
Quiz: ${input.quizTitle}
Score: ${input.score}/${input.total} (${input.pct}%)
Time taken: ${Math.round(input.timeTakenSec)} seconds
Topic breakdown:
${topicLines.join('\n') || 'no topic data'}

Write the feedback now.`;
  const outcome = await askAI({
    system,
    user,
    maxTokens: 500,
    temperature: 0.6,
    timeoutMs: 25_000,
  });
  if (outcome && outcome.text.length > 40 && outcome.text.length < 1200) {
    return { text: outcome.text, by: outcome.provider };
  }
  return { text: templateFeedback(input), by: 'template' };
}
