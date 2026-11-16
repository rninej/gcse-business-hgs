#!/usr/bin/env node
/**
 * Public smoke check — the pages a cold visitor sees, with no account.
 *
 *   node scripts/smoke-public.mjs
 *   node scripts/smoke-public.mjs https://staging.example   # another origin
 *
 * Every check is read-only: it fetches a page and looks for text that must be
 * there for the offer to make sense. It intentionally does not sign in, create
 * records or send mail, so it is safe to run against production any time.
 */

const ORIGIN = (process.argv[2] || 'https://www.gcse.business').replace(/\/$/, '');

/** @type {{name: string, path: string, must: string[]}[]} */
const PAGES = [
  {
    name: 'homepage',
    path: '/',
    must: ['GCSE Business homework that marks itself', '30 days free, no card', 'Start the 30-day trial'],
  },
  {
    name: 'trial signup',
    path: '/free',
    must: ['30 days free', 'no card'],
  },
  {
    name: 'pricing',
    path: '/pricing',
    must: ['£250', '1 class stays free'],
    mustHtml: ['id="enquiry"'],
  },
  {
    name: 'licence page',
    path: '/upgrade',
    must: ['£250 per year', '1 class free'],
  },
  {
    name: 'demo quiz',
    path: '/demo',
    must: ['Try a real quiz'],
  },
  {
    name: 'topics',
    path: '/topics',
    must: ['Edexcel'],
  },
];

const FORBIDDEN = ['free forever', 'unlimited free', 'free for life'];

/** Visible text only: tags out, entities decoded, whitespace collapsed. Copy
 *  often spans <strong> and <span>, so matching raw HTML gives false alarms. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&pound;/g, '£')
    .replace(/&#163;/g, '£')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ');
}

let failures = 0;
const ok = (m) => console.log(`PASS  ${m}`);
const bad = (m) => {
  failures += 1;
  console.log(`FAIL  ${m}`);
};

console.log(`Public smoke check against ${ORIGIN}\n`);

for (const page of PAGES) {
  const res = await fetch(ORIGIN + page.path, { redirect: 'follow' }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
  const html = await res.text();
  if (!res.ok) {
    bad(`${page.name} (${page.path}) — HTTP ${res.status}`);
    continue;
  }
  const text = visibleText(html);
  const missing = page.must.filter((needle) => !text.includes(needle));
  const missingHtml = (page.mustHtml || []).filter((needle) => !html.includes(needle));
  if (missing.length || missingHtml.length) {
    bad(`${page.name} (${page.path}) — missing ${JSON.stringify([...missing, ...missingHtml])}`);
  } else {
    const n = page.must.length + (page.mustHtml || []).length;
    ok(`${page.name} (${page.path}) — ${res.status}, all ${n} expected strings present`);
  }

  const forbidden = FORBIDDEN.filter((phrase) => text.toLowerCase().includes(phrase));
  if (forbidden.length) bad(`${page.name} — forbidden wording ${JSON.stringify(forbidden)}`);
}

// The offer must be reachable from every marketing page: header link plus a
// call to action that leads to the signup form.
{
  const res = await fetch(ORIGIN + '/topics');
  const html = await res.text();
  const hasTrialLink = /href="\/free"[^>]*>\s*(Free trial|Start the 30-day trial)/i.test(html);
  if (hasTrialLink) ok('shared header offers "Free trial" on a deep marketing page');
  else bad('shared header has no trial link on /topics');
}

// Health is how the owner (and this script) knows which sender is live.
{
  const res = await fetch(ORIGIN + '/api/health');
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok && data.db === 'connected') {
    ok(`/api/health — build ${data.build}, email ${data.email}, contact ${data.contact}`);
    if (data.email !== 'resend') {
      console.log('NOTE  email mode is not "resend" — licence enquiries are stored and swept by the GitHub relay, not mailed by the app.');
    }
  } else {
    bad(`/api/health — HTTP ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  }
}

// Signed-out visitors must not be able to read teacher data.
{
  const res = await fetch(ORIGIN + '/api/teacher/plan');
  if (res.status === 401) ok('teacher API refuses a signed-out request (401)');
  else bad(`teacher API returned ${res.status} without a session`);
}

console.log(failures === 0 ? '\nRESULT: site is healthy' : `\nRESULT: ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
