// AI model health tracking — keeps usage spread across every model on every
// provider. On site visits a tiny background probe (one cheap request per
// model, at most every few minutes, shared across instances via Firebase)
// classifies each configured Gemini/Groq model as ok / rate-limited / dead.
// Request-time ordering prefers healthy models; models that just hit their
// free-tier limit (429) are put on a short cooldown and the next model on the
// SAME api is used instead — so quotas on one key get used across all models.

import { fb } from './firebase';

export type Provider = 'gemini' | 'groq';
export type ModelStatus = 'ok' | 'limited' | 'dead' | 'unknown';

export interface ModelHealth {
  status: ModelStatus;
  checkedAt: number; // epoch ms of last probe
  cooldownUntil?: number; // epoch ms — skip while now < cooldownUntil
  latencyMs?: number;
}

interface HealthDb {
  gemini?: Record<string, ModelHealth>;
  groq?: Record<string, ModelHealth>;
  meta?: { lastProbeAt?: number };
}

const PROBE_INTERVAL_MS = 4 * 60 * 1000; // re-probe at most every 4 minutes
const RATE_LIMIT_COOLDOWN_MS = 75 * 1000; // quota windows are per-minute
const DB_TTL_MS = 30 * 1000; // read Firebase at most every 30s

/** Health truth is environment-specific (a model blocked in one region can be
 *  fine in another), so each deployment keeps its own namespace: the Vercel
 *  production URL on Vercel, 'local' in the dev sandbox. */
const HEALTH_NS = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  'local'
).replace(/[^a-z0-9-]/gi, '-');

let memory: HealthDb = {};
let dbReadAt = 0;
let probing = false;

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_KEY = process.env.GROQ_API_KEY || '';

export function configuredModels(): { gemini: string[]; groq: string[] } {
  const split = (v: string | undefined, fallback: string) =>
    (process.env[v as 'GEMINI_MODELS'] || fallback)
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
  return {
    gemini: split('GEMINI_MODELS', 'gemini-3.8-flash,gemini-flash-latest,gemini-3.5-flash-lite'),
    groq: split('GROQ_MODELS', 'llama-3.3-70b-versatile,llama-3.1-8b-instant,openai/gpt-oss-120b'),
  };
}

async function readDb(force = false): Promise<HealthDb> {
  const now = Date.now();
  if (!force && now - dbReadAt < DB_TTL_MS) return memory;
  try {
    const v = await fb.get<HealthDb>(`aiHealth/${HEALTH_NS}`);
    if (v) memory = v;
  } catch {
    /* keep memory */
  }
  dbReadAt = now;
  return memory;
}

/** Firebase forbids '.' and '/' in keys — sanitise model ids consistently
 *  everywhere so memory, Firebase and readers all agree. */
function modelKey(model: string): string {
  return model.replace(/[./]/g, '_');
}

async function writeModel(provider: Provider, model: string, h: ModelHealth): Promise<void> {
  memory[provider] = memory[provider] ?? {};
  memory[provider]![modelKey(model)] = h;
  try {
    await fb.patch(`aiHealth/${HEALTH_NS}/${provider}`, { [modelKey(model)]: h });
  } catch {
    /* non-fatal */
  }
}

/** One minimal request to classify a model. Costs one request of that model's
 *  per-minute quota — negligible next to real traffic. */
async function probeOne(provider: Provider, model: string): Promise<ModelHealth> {
  const started = Date.now();
  let status: ModelStatus = 'unknown';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    if (provider === 'gemini') {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'hi' }] }],
            generationConfig: { maxOutputTokens: 1 },
          }),
        }
      );
    } else {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
    }
    clearTimeout(timer);
    if (res.ok) status = 'ok';
    else if (res.status === 429) status = 'limited';
    else if (res.status === 404 || res.status === 400 || res.status === 403) status = 'dead';
    else status = 'unknown'; // 500s, timeouts… leave order unchanged
  } catch {
    status = 'unknown';
  }
  const h: ModelHealth = {
    status,
    checkedAt: Date.now(),
    latencyMs: Date.now() - started,
    ...(status === 'limited' ? { cooldownUntil: Date.now() + RATE_LIMIT_COOLDOWN_MS } : {}),
  };
  await writeModel(provider, model, h);
  return h;
}

/** Probe every configured model in parallel (background-safe). */
export async function probeAll(): Promise<void> {
  if (probing) return;
  probing = true;
  try {
    const cfg = configuredModels();
    const jobs: Promise<unknown>[] = [];
    for (const m of cfg.gemini) if (GEMINI_KEY) jobs.push(probeOne('gemini', m));
    for (const m of cfg.groq) if (GROQ_KEY) jobs.push(probeOne('groq', m));
    await Promise.allSettled(jobs);
    const now = Date.now();
    memory.meta = { lastProbeAt: now };
    try {
      await fb.patch(`aiHealth/${HEALTH_NS}/meta`, { lastProbeAt: now });
    } catch {
      /* non-fatal */
    }
  } finally {
    probing = false;
  }
}

/** Kick off a background refresh if the shared snapshot is stale. Called on
 *  site visits — returns immediately, never blocks the response. */
export async function maybeProbe(): Promise<void> {
  try {
    const db = await readDb(true);
    const last = db.meta?.lastProbeAt ?? 0;
    if (Date.now() - last > PROBE_INTERVAL_MS) void probeAll();
  } catch {
    /* ignore */
  }
}

/** Best-first ordering: healthy first (freshest check first), then unprobed,
 *  then rate-limited after their cooldown, dead last. Never drops a model —
 *  a degraded chain still beats no chain. */
export async function orderedModels(provider: Provider, models: string[]): Promise<string[]> {
  const db = await readDb();
  const table = db[provider] ?? {};
  const now = Date.now();
  const score = (m: string): number => {
    const h = table[m.replace(/[./]/g, '_')] ?? table[m]; // legacy keys kept readable
    if (!h) return 1; // unknown — try after healthy
    if (h.status === 'ok') return 0;
    if (h.status === 'limited') return h.cooldownUntil && now < h.cooldownUntil ? 3 : 2;
    if (h.status === 'dead') return 4;
    return 1;
  };
  return [...models].sort((a, b) => score(a) - score(b) || a.localeCompare(b));
}

/** Called from the request path when a model answers 429 — flips it onto a
 *  cooldown so subsequent requests use the next model on the same provider. */
export async function markRateLimited(provider: Provider, model: string): Promise<void> {
  await writeModel(provider, model, {
    status: 'limited',
    checkedAt: Date.now(),
    cooldownUntil: Date.now() + RATE_LIMIT_COOLDOWN_MS,
  });
}

/** Called when a model is permanently unusable (404 retired key, 400/403). */
export async function markDead(provider: Provider, model: string): Promise<void> {
  await writeModel(provider, model, { status: 'dead', checkedAt: Date.now() });
}

/** Snapshot for the health endpoint. */
export async function healthSnapshot(): Promise<{
  lastProbeAt: number | null;
  models: { provider: Provider; model: string; status: ModelStatus; latencyMs?: number }[];
}> {
  const db = await readDb();
  const cfg = configuredModels();
  const models: { provider: Provider; model: string; status: ModelStatus; latencyMs?: number }[] = [];
  for (const m of cfg.gemini) {
    const h = db.gemini?.[m.replace(/[./]/g, '_')];
    models.push({ provider: 'gemini', model: m, status: h?.status ?? 'unknown', latencyMs: h?.latencyMs });
  }
  for (const m of cfg.groq) {
    const h = db.groq?.[m.replace(/[./]/g, '_')];
    models.push({ provider: 'groq', model: m, status: h?.status ?? 'unknown', latencyMs: h?.latencyMs });
  }
  return { lastProbeAt: db.meta?.lastProbeAt ?? null, models };
}
