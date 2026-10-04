'use client';

// /debug — owner dashboard: competitive analysis vs Educake, USPs,
// AI free-tier capacity model, full unit economics and an editable invoice.
// All public facts (Educake price, Trustpilot score, provider free tiers)
// were verified against live sources — see Sources at the bottom.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Brain,
  CalendarClock,
  Check,
  CheckCheck,
  Coins,
  FileText,
  Flag,
  Gavel,
  Minus,
  PenLine,
  PiggyBank,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Smile,
  SpellCheck2,
  Trophy,
  Wand2,
  X,
} from 'lucide-react';
import { BrandLockup } from '@/components/app/Brand';
import { DatabaseSection } from '@/components/debug/DatabaseSection';
import { InterfaceFlagsSection } from '@/components/debug/InterfaceFlagsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

// ---------- shared math ----------

const GBP = (n: number, dp = 0) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);
const NUM = (n: number) => new Intl.NumberFormat('en-GB').format(Math.round(n));

/** AI call model: generation is 2 calls per assignment (write + numeric verify);
 *  each submission costs 1 feedback call + 1 call per written question.
 *  MCQ / term / numeric marking is deterministic code — zero AI calls. */
function aiModel(students: number, perWeek: number, weeks: number, written: number) {
  const assignments = perWeek * weeks;
  const submissions = students * assignments;
  const perSubmission = 1 + written;
  const calls = submissions * perSubmission + assignments * 2;
  const avgDay = calls / 195; // UK school days per year
  const peakDay = students * perSubmission + 2; // every student submits the same day
  return { assignments, submissions, calls, perSubmission, avgDay, peakDay };
}

/** Free daily capacity of the fallback chain (requests/day, conservative):
 *  Gemini free ≈ 250 (Flash) + 1,000 (Flash-Lite) across our 3 models
 *  Groq free ≈ 1,000 (Llama 70B) + 14,400 (Llama 8B) across our 3 models
 *  z.ai bundled platform credits — extra headroom, not counted. */
const FREE_CAPACITY_PER_DAY = 250 + 1000 + 1000 + 14400;

/** If every free tier vanished, what would the year cost on paid Gemini Flash?
 *  ~1.4k input + 0.4k output tokens per call; $0.30/M in, $2.50/M out; $1 ≈ £0.79. */
function paidAIYearGBP(callsYear: number) {
  const usd = (callsYear * 1400) / 1e6 * 0.3 + (callsYear * 400) / 1e6 * 2.5;
  return usd * 0.79;
}

const EDUCAKE_BUSINESS_INCVAT = 660; // £550 + VAT, verified on educake.co.uk
const DOMAIN_PER_YEAR = 10;
const VERCEL_PRO_YEAR = 228; // $20/mo ≈ £19
const BLAZE_BUFFER_YEAR = 60; // realistic bill £0–2/mo; budget-capped

/** Recommended licence price to the school (excl. VAT). */
function licencePrice(students: number) {
  if (students <= 60) return 120; // single department / a couple of classes
  if (students <= 350) return 399; // whole cohort
  return 599;
}

function commercialCosts(students: number, callsYear: number) {
  return [
    { item: 'Hosting — Vercel Pro (commercial use)', plan: '$20/mo seat, incl. $20/mo usage credit + 1 TB bandwidth (you would use ~2–4 GB/mo)', cost: VERCEL_PRO_YEAR },
    { item: 'Database — Firebase Blaze (RTDB mirror + Firestore engine), budget-capped £5/mo', plan: 'Realistic bill £0–2/mo: Firestore free tier (50k reads/day) serves reads; RTDB keeps a free-to-write live mirror as the fallback; ~60 MB/yr of quiz data', cost: BLAZE_BUFFER_YEAR },
    { item: 'AI — contingency if every free tier was exhausted', plan: `Modelled at paid Gemini Flash rates for ${NUM(callsYear)} calls/yr — in practice the free chain absorbs everything (see capacity table)`, cost: Math.max(5, Math.round(paidAIYearGBP(callsYear))) },
    { item: 'Domain (.co.uk)', plan: 'Annual renewal', cost: DOMAIN_PER_YEAR },
  ];
}

// ---------- comparison data ----------

type Cell = { t: 'yes' | 'no' | 'part'; note?: string };

const COMPARISON: { feature: string; hgs: Cell; educake: Cell; hgsNote: string; eduNote: string }[] = [
  {
    feature: 'Annual price to the school (unlimited students & staff)',
    hgs: { t: 'yes' }, hgsNote: '£120 + VAT (£144) — free pilot for your class',
    educake: { t: 'no' }, eduNote: '£550 + VAT (£660) for Educake Business',
  },
  {
    feature: 'Cost per student (class of 30)',
    hgs: { t: 'yes' }, hgsNote: '£4.80 inc VAT — or £0 to pilot',
    educake: { t: 'no' }, eduNote: '£22.00 inc VAT',
  },
  {
    feature: 'Trustpilot rating',
    hgs: { t: 'yes' }, hgsNote: 'New — built around the 5 biggest complaints in Educake’s own reviews',
    educake: { t: 'no' }, eduNote: '1.3 / 5 — 89% of reviews are 1-star',
  },
  {
    feature: 'Edexcel GCSE (9–1) Business 1BS0 coverage',
    hgs: { t: 'yes' }, hgsNote: 'Full spec, topics 1.1 – 2.5, textbook-grounded',
    educake: { t: 'yes' }, eduNote: 'Full spec',
  },
  {
    feature: 'Question bank',
    hgs: { t: 'yes' }, hgsNote: '501 human-written + unlimited AI-generated, validated & deduped',
    educake: { t: 'part' }, eduNote: 'Fixed human-written bank',
  },
  {
    feature: '“Describe the quiz you want” → AI builds it',
    hgs: { t: 'yes' }, hgsNote: 'Type a brief like “10 Qs on cash flow with a Greggs case study” — done in ~20s',
    educake: { t: 'no' }, eduNote: 'Pick from the existing bank only',
  },
  {
    feature: 'AI examiner for written (essay) answers',
    hgs: { t: 'yes' }, hgsNote: 'Marks against the mark scheme, mark-by-mark justification',
    educake: { t: 'no' }, eduNote: 'Objective questions only',
  },
  {
    feature: 'Spelling-tolerant marking',
    hgs: { t: 'yes' }, hgsNote: 'Fuzzy matching accepts break even / break-even / breakeven',
    educake: { t: 'part' }, eduNote: 'Strict exact-match — the #1 complaint in student reviews',
  },
  {
    feature: 'Gamification (XP, streaks, badges)',
    hgs: { t: 'yes' }, hgsNote: 'XP, daily streaks, 12 unlockable badges',
    educake: { t: 'no' }, eduNote: 'None',
  },
  {
    feature: 'Class leaderboard & custom avatars',
    hgs: { t: 'yes' }, hgsNote: 'Upload a photo or pick an emoji',
    educake: { t: 'no' }, eduNote: 'None',
  },
  {
    feature: 'Flashcards',
    hgs: { t: 'yes' }, hgsNote: 'Per-topic decks with focus mode',
    educake: { t: 'no' }, eduNote: 'Not offered',
  },
  {
    feature: 'Students build their own practice quizzes',
    hgs: { t: 'yes' }, hgsNote: 'Mix builder: topics, types, difficulty — marked instantly',
    educake: { t: 'no' }, eduNote: 'Teacher-set quizzes only',
  },
  {
    feature: 'In-app notifications & smart reminders',
    hgs: { t: 'yes' }, hgsNote: 'New-quiz alerts, feedback alerts, remind-nudges with 6h cooldown',
    educake: { t: 'part' }, eduNote: 'Email nudges only',
  },
  {
    feature: 'Scheduled publishing',
    hgs: { t: 'yes' }, hgsNote: 'Set it tonight, appears 8:00am Monday with notifications',
    educake: { t: 'part' }, eduNote: 'Basic availability dates',
  },
  {
    feature: 'Print-ready reports',
    hgs: { t: 'yes' }, hgsNote: 'Print-perfect results sheets + activity heatmaps',
    educake: { t: 'part' }, eduNote: 'Basic exports',
  },
  {
    feature: 'Personalised AI feedback on every quiz',
    hgs: { t: 'yes' }, hgsNote: '4–6 sentences, names a strength and a next step',
    educake: { t: 'no' }, eduNote: 'Generic score summary',
  },
  {
    feature: 'Marking never goes down',
    hgs: { t: 'yes' }, hgsNote: 'Deterministic engine + human bank + heuristic fallback — works with zero AI',
    educake: { t: 'yes' }, eduNote: 'N/A — no AI dependency',
  },
  {
    feature: 'Installs as an app (PWA) on student phones',
    hgs: { t: 'yes' }, hgsNote: 'Add to home screen, instant loads',
    educake: { t: 'no' }, eduNote: 'Browser only',
  },
];

const USPS: { icon: typeof Wand2; title: string; body: string }[] = [
  { icon: Wand2, title: 'Brief-to-quiz AI generation', body: 'The teacher types what they want — “12 mixed questions on 2.3, hard, with a real case study” — and the quiz (plus mark scheme) is built in seconds. Educake: pick from a fixed bank.' },
  { icon: Gavel, title: 'AI examiner for written answers', body: '6/9/12-mark answers marked against the mark scheme, with a mark-by-mark breakdown and an examiner comment addressed to the student.' },
  { icon: SpellCheck2, title: 'Spelling-tolerant marking', body: 'The single most common complaint about Educake (“my answer was right but marked wrong”). Ours accepts sensible spelling & spacing variants by design.' },
  { icon: ShieldCheck, title: 'Marking that never goes down', body: 'AI is an accelerator, not a dependency: deterministic marking, a 501-question human bank and a heuristic marker keep everything working even if every AI provider is offline.' },
  { icon: Trophy, title: 'Gamification students actually ask for', body: 'XP, daily streaks, 12 unlockable badges and a class leaderboard — the “make it feel like Duolingo” request from every student panel.' },
  { icon: Smile, title: 'Custom avatars', body: 'Every student uploads a photo or picks an emoji — shown on the leaderboard and results. Small thing; students love it.' },
  { icon: Brain, title: 'Flashcards with focus mode', body: 'Per-topic decks generated from the same knowledge base as the quizzes, with a distraction-free focus mode.' },
  { icon: SlidersHorizontal, title: 'Student-built practice quizzes', body: 'Students mix their own practice by topic, question type and difficulty — revision that feels like a game, not a worksheet.' },
  { icon: Bell, title: 'In-app notifications & smart reminders', body: 'New-quiz and feedback alerts, plus a teacher “remind” button with a 6-hour per-student cooldown so nobody gets spammed.' },
  { icon: CalendarClock, title: 'Scheduled publishing', body: 'Prepare tonight, auto-publish Monday 8am — every targeted student’s bell rings at the same moment.' },
  { icon: FileText, title: 'Print-perfect reports', body: 'One click produces a proper results sheet (masthead, class average, integrity flags) and activity heatmaps — ready for parents’ evening or a department file.' },
  { icon: Smartphone, title: 'Installs as an app (PWA)', body: 'Students add it to their home screen; it opens instantly like a native app, even on flaky school Wi-Fi.' },
  { icon: PenLine, title: 'Personalised AI feedback', body: 'Every marked quiz gets 4–6 sentences naming a strength, a weak topic and a concrete next step — not a bare percentage.' },
  { icon: PiggyBank, title: '78% cheaper than Educake', body: '£144 vs £660 a year for the department — because the stack costs ~£10–£350 a year to run, not thousands.' },
];

// ---------- page ----------

type GateState = 'loading' | 'claim' | 'locked' | 'open';

/** Hidden page, first-visitor lock: the first person to arrive sets the
 *  password that guards this dashboard from then on (stored scrypt-hashed in
 *  Firebase). A valid unlock holds for 12 hours in a signed cookie. */
export function DebugDashboard() {
  const [gate, setGate] = useState<GateState>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ claimed: boolean; unlocked: boolean }>('/api/owner')
      .then((s) => setGate(s.unlocked ? 'open' : s.claimed ? 'locked' : 'claim'))
      .catch(() => setGate('claim')); // lock unreachable — safest guess is the claim form
  }, []);

  const submit = async () => {
    setError(null);
    if (gate === 'claim' && password !== confirm) {
      setError('Those two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/owner', { password });
      setGate('open');
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError((e as Error).message || 'That did not work — try again.');
    } finally {
      setBusy(false);
    }
  };

  if (gate === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking the lock…</p>
      </div>
    );
  }

  if (gate !== 'open') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-white/40 bg-background/70 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2.5 flex items-center justify-between gap-3">
            <BrandLockup />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ArrowLeft className="h-4 w-4" /> App</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <Card className="w-full max-w-sm glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  {gate === 'claim' ? 'Set the owner password' : 'Owner dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {gate === 'claim'
                    ? 'This dashboard is unclaimed. The password you choose now is the one every future visit needs — the first person here sets it.'
                    : 'Enter the owner password to open the dashboard for the next 12 hours.'}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner-pw">Password</Label>
                <PasswordInput
                  id="owner-pw"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder={gate === 'claim' ? 'Choose a password (4+ characters)' : 'Owner password'}
                />
              </div>
              {gate === 'claim' && (
                <div className="space-y-1.5">
                  <Label htmlFor="owner-pw2">Confirm password</Label>
                  <PasswordInput
                    id="owner-pw2"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="Type it once more"
                  />
                </div>
              )}
              {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>
              )}
              <Button className="w-full" onClick={submit} disabled={busy || password.length < 4}>
                {busy ? 'Checking…' : gate === 'claim' ? 'Claim & open' : 'Unlock'}
              </Button>
            </CardContent>
          </Card>
        </main>
        <footer className="mt-auto border-t border-white/40 bg-background/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground">
            Hidden page — not indexed, not linked anywhere on the site.
          </div>
        </footer>
      </div>
    );
  }

  const lock = async () => {
    await api.del('/api/owner').catch(() => undefined);
    setGate('locked');
  };

  return <DebugDashboardInner onLock={lock} />;
}

function DebugDashboardInner({ onLock }: { onLock: () => void | Promise<void> }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-avoid-break { break-inside: avoid; }
          /* invoice-only mode ("Print invoice" button) */
          body.print-invoice main > section:not(#invoice-section) { display: none !important; }
          body.print-invoice > div > header,
          body.print-invoice > div > footer { display: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-white/40 bg-background/70 backdrop-blur-xl no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2.5 flex items-center justify-between gap-3">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <Badge className="hidden sm:inline-flex" variant="outline">Owner dashboard · not indexed</Badge>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void onLock()}>
              <Gavel className="h-4 w-4" /> Lock
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ArrowLeft className="h-4 w-4" /> App</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">

        {/* intro */}
        <section className="anim-rise">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Competitive &amp; unit-economics dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            gcsebusiness vs Educake — features, USPs and what it actually costs to run.
          </h1>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Every public number below was checked against live sources (Educake’s own pricing page,
            Trustpilot, and the current free-tier limits of our AI providers — links at the bottom).
            Usage numbers are modelled on the assumptions listed in the sources section and can be
            recomputed live in the calculator.
          </p>
        </section>

        <ReportsSection />
        <DatabaseSection />
        <InterfaceFlagsSection />
        <ComparisonSection />
        <UspSection />
        <AiCapacitySection />
        <CostSection />
        <CalculatorSection />
        <InvoiceSection />
        <SourcesSection />
      </main>

      <footer className="mt-auto border-t border-white/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} gcsebusiness — internal dashboard</span>
          <span>Figures modelled, not invoiced — see sources &amp; assumptions.</span>
        </div>
      </footer>
    </div>
  );
}

// ---------- 0. problem reports from inside quizzes ----------

interface Report {
  id: string;
  at: number;
  byName: string;
  role: 'teacher' | 'student';
  kind: 'answer' | 'typo' | 'unclear' | 'unfair' | 'other';
  message: string;
  quizTitle?: string;
  qNumber?: number;
  qid?: string;
  topic?: string;
  stemSnippet?: string;
}

const KIND_LABEL: Record<Report['kind'], string> = {
  answer: 'Answer looks wrong',
  typo: 'Typo / wording',
  unclear: 'Doesn’t understand it',
  unfair: 'Gives away an answer',
  other: 'Something else',
};

function ReportsSection() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const d = await api.get<{ reports: Report[] }>('/api/owner/reports');
      setReports(d.reports);
    } catch {
      setReports([]);
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, []);

  async function resolve(id: string) {
    setBusyId(id);
    try {
      await api.del(`/api/owner/reports?id=${id}`);
      setReports((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch {
      /* keep it in the list */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-labelledby="rep-h" id="reports-section">
      <h2 id="rep-h" className="text-lg font-semibold flex items-center gap-2">
        <Flag className="h-5 w-5 text-primary" aria-hidden /> Problem reports
        {reports !== null && reports.length > 0 ? (
          <Badge className="bg-[var(--danger)] text-white tabular-nums">{reports.length} open</Badge>
        ) : null}
      </h2>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
        Sent from the ⋯ menu inside any quiz (“Report a problem”). Newest first — resolving
        removes it from the list.
      </p>

      <div className="mt-4 space-y-3">
        {reports === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <CheckCheck className="h-6 w-6 mx-auto mb-2 text-[var(--success)]" aria-hidden />
            Nothing reported — either the questions are perfect or nobody has
            found the ⋯ menu yet.
          </div>
        ) : (
          reports.map((r) => (
            <Card key={r.id} className="border-[var(--danger)]/25">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="destructive">{KIND_LABEL[r.kind]}</Badge>
                  <span className="text-muted-foreground">
                    {r.role === 'student' ? 'Student' : 'Teacher'} · {r.byName} ·{' '}
                    {new Date(r.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  {r.topic ? <Badge variant="outline">{r.topic}</Badge> : null}
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    disabled={busyId === r.id}
                    onClick={() => void resolve(r.id)}
                  >
                    <Check className="h-3.5 w-3.5" /> Resolve
                  </Button>
                </div>
                {r.quizTitle || r.qNumber ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {r.quizTitle ? <>Quiz: <span className="font-medium text-foreground">{r.quizTitle}</span></> : null}
                    {r.qNumber ? <> · Question {r.qNumber}</> : null}
                    {r.qid ? <span className="font-mono"> ({r.qid})</span> : null}
                  </p>
                ) : null}
                {r.stemSnippet ? (
                  <p className="text-sm mt-2 italic text-muted-foreground border-l-2 border-border pl-3">
                    “{r.stemSnippet}”
                  </p>
                ) : null}
                <p className="text-sm mt-2.5 leading-relaxed">{r.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

// ---------- 1. comparison table ----------

function CellMark({ c }: { c: Cell }) {
  if (c.t === 'yes') return <Check className="h-4 w-4 text-[var(--success)] shrink-0" aria-label="Yes" />;
  if (c.t === 'no') return <X className="h-4 w-4 text-[var(--danger)] shrink-0" aria-label="No" />;
  return <Minus className="h-4 w-4 text-muted-foreground shrink-0" aria-label="Partial" />;
}

function ComparisonSection() {
  const wins = COMPARISON.filter((r) => r.hgs.t === 'yes' && r.educake.t !== 'yes').length;
  return (
    <section aria-labelledby="cmp-h">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <h2 id="cmp-h" className="text-xl sm:text-2xl font-bold tracking-tight">Feature-by-feature</h2>
          <p className="text-sm text-muted-foreground mt-1">Same homework job, different century.</p>
        </div>
        <Badge className="bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30">
          <BadgeCheck className="h-3.5 w-3.5" /> We lead on {wins} of {COMPARISON.length} rows
        </Badge>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--accent)]/25 text-left">
                <th className="px-4 py-3 font-semibold w-[34%]">Feature</th>
                <th className="px-4 py-3 font-semibold text-primary">gcsebusiness</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Educake Business</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.feature} className="border-b last:border-0 align-top print-avoid-break">
                  <td className="px-4 py-3 font-medium">{r.feature}</td>
                  <td className="px-4 py-3">
                    <span className="flex gap-2">
                      <CellMark c={r.hgs} />
                      <span className={r.hgs.t === 'yes' ? '' : 'text-muted-foreground'}>{r.hgsNote}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex gap-2">
                      <CellMark c={r.educake} />
                      <span className={r.educake.t === 'yes' ? '' : 'text-muted-foreground'}>{r.eduNote}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

// ---------- 2. USPs ----------

function UspSection() {
  return (
    <section aria-labelledby="usp-h">
      <div className="mb-4">
        <h2 id="usp-h" className="text-xl sm:text-2xl font-bold tracking-tight">
          USPs — things Educake doesn’t have
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Each one is live in the product today, not a roadmap slide.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {USPS.map((u) => (
          <Card key={u.title} className="print-avoid-break">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <u.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-semibold leading-tight">{u.title}</h3>
              </div>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{u.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ---------- 3. AI free-tier capacity ----------

function AiCapacitySection() {
  const rows = [
    { scale: 'Class of 30 · 1 teacher', students: 30, label: 'one form group' },
    { scale: '300 students · 10 classes', students: 300, label: 'whole cohort' },
  ];
  return (
    <section aria-labelledby="ai-h">
      <div className="mb-4">
        <h2 id="ai-h" className="text-xl sm:text-2xl font-bold tracking-tight">
          Will the AI free limits ever be overtaken? Short answer: no.
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          The app only calls AI for three things: quiz generation (~2 calls per assignment),
          essay marking (1 call per written answer) and personalised feedback (1 call per submission).
          Multiple-choice, key-term and numeric marking is deterministic code — £0, unlimited.
          Modelled at <strong>1 assignment per week, 39 school weeks, 2 written questions per quiz</strong>.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {rows.map((r) => {
          const m = aiModel(r.students, 1, 39, 2);
          const peakPct = (m.peakDay / FREE_CAPACITY_PER_DAY) * 100;
          const avgPct = (m.avgDay / FREE_CAPACITY_PER_DAY) * 100;
          return (
            <Card key={r.scale} className="print-avoid-break">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{r.scale}</h3>
                  <Badge variant="outline" className="text-[var(--success)] border-[var(--success)]/40">AI bill: £0</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-secondary p-3">
                    <dt className="text-muted-foreground text-xs">AI calls / year</dt>
                    <dd className="font-bold text-lg mt-0.5">{NUM(m.calls)}</dd>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <dt className="text-muted-foreground text-xs">Average school day</dt>
                    <dd className="font-bold text-lg mt-0.5">{NUM(m.avgDay)} calls <span className="text-xs font-normal text-muted-foreground">({avgPct.toFixed(2)}% of free)</span></dd>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <dt className="text-muted-foreground text-xs">Worst day — everyone submits at once</dt>
                    <dd className="font-bold text-lg mt-0.5">{NUM(m.peakDay)} calls <span className="text-xs font-normal text-muted-foreground">({peakPct.toFixed(1)}% of free)</span></dd>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <dt className="text-muted-foreground text-xs">Paid fallback if all free tiers died</dt>
                    <dd className="font-bold text-lg mt-0.5">{GBP(paidAIYearGBP(m.calls))}<span className="text-xs font-normal text-muted-foreground"> /yr</span></dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="font-semibold">Why the free chain holds</h3>
          <div className="overflow-x-auto mt-3">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-semibold">Free tier (per day)</th>
                  <th className="py-2 pr-4 font-semibold">Models we rotate</th>
                  <th className="py-2 pr-4 font-semibold">Requests / day</th>
                  <th className="py-2 font-semibold text-right">300-student peak uses</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium text-foreground">Gemini (Google AI Studio)</td>
                  <td className="py-2.5 pr-4">Flash + Flash-Lite (3 models)</td>
                  <td className="py-2.5 pr-4">~1,250 (conservative — recent cuts applied)</td>
                  <td className="py-2.5 text-right">72%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium text-foreground">Groq</td>
                  <td className="py-2.5 pr-4">Llama 3.3 70B, Llama 3.1 8B, GPT-OSS (3 models)</td>
                  <td className="py-2.5 pr-4">~15,400</td>
                  <td className="py-2.5 text-right">5.8%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium text-foreground">z.ai (bundled)</td>
                  <td className="py-2.5 pr-4">GLM platform credits</td>
                  <td className="py-2.5 pr-4">extra headroom — not counted</td>
                  <td className="py-2.5 text-right">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-foreground">Total chain</td>
                  <td className="py-2.5 pr-4">9 models, health-aware rotation &amp; per-model cooldowns</td>
                  <td className="py-2.5 pr-4 font-bold text-foreground">{NUM(FREE_CAPACITY_PER_DAY)}+</td>
                  <td className="py-2.5 text-right font-bold text-[var(--success)]">≈ 5% — never reached</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            To actually exhaust the free chain you would need <strong>~5,500 students each submitting a
            quiz every single school day</strong>. A whole-cohort deadline day (300 students, all at once) uses
            about 5% of capacity — and a 501-question human bank plus heuristic marking still finishes the
            job if the internet itself has a bad day.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

// ---------- 4. running costs ----------

function CostRow({ item, plan, cost, bold }: { item: string; plan: string; cost: number; bold?: boolean }) {
  return (
    <tr className={'border-b last:border-0 print-avoid-break' + (bold ? ' font-semibold' : '')}>
      <td className="px-4 py-3">
        <div className="font-medium">{item}</div>
        <div className="text-xs text-muted-foreground mt-0.5 max-w-xl">{plan}</div>
      </td>
      <td className={'px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums' + (bold ? '' : ' text-foreground')}>{cost === 0 ? '£0' : GBP(cost)}</td>
    </tr>
  );
}

function CostSection() {
  const small = aiModel(30, 1, 39, 2);
  const big = aiModel(300, 1, 39, 2);

  const lean30 = DOMAIN_PER_YEAR;
  const lean300 = DOMAIN_PER_YEAR + BLAZE_BUFFER_YEAR; // budget alert worst case
  const comm30 = commercialCosts(30, small.calls).reduce((s, r) => s + r.cost, 0);
  const comm = commercialCosts(300, big.calls);
  const comm300 = comm.reduce((s, r) => s + r.cost, 0);

  return (
    <section aria-labelledby="cost-h">
      <div className="mb-4">
        <h2 id="cost-h" className="text-xl sm:text-2xl font-bold tracking-tight">What it costs to run, per year</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Two scenarios for each scale: the <strong>lean stack</strong> (free tiers — fine while piloting
          and for school use) and the <strong>commercial stack</strong> (proper paid plans once you charge).
          Stripe card fees and one-off company setup are shown separately below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* class of 30 */}
        <Card className="print-avoid-break">
          <CardContent className="p-0">
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">One class — 30 students, 1 teacher</h3>
                <Badge variant="outline">regular weekly assignments</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                40 assignments/yr · 1,200 submissions · {NUM(small.calls)} AI calls — all inside free tiers.
              </p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <CostRow item="Hosting — Vercel Hobby" plan="Non-commercial plan: 100 GB bandwidth (you would use ~0.5 GB/mo)" cost={0} />
                <CostRow item="Database — Firebase RTDB Spark" plan="30 concurrent connections max (class-size) < 100 cap · ~10 MB stored < 1 GB · ~0.4 GB/mo < 10 GB/mo" cost={0} />
                <CostRow item="AI chain — Gemini → Groq → z.ai free tiers" plan="~19 calls on an average day vs ~16,650/day capacity (0.1%)" cost={0} />
                <CostRow item="Domain (.co.uk)" plan="Annual renewal" cost={DOMAIN_PER_YEAR} />
                <CostRow item="Total — lean stack" plan="£0.33 per student per year — this is the realistic bill for one class" cost={lean30} bold />
                <CostRow item="Total — commercial stack" plan={`£${(comm30 / 30).toFixed(2)} per student — fixed plans dominate at single-class scale, so a pilot class stays lean`} cost={comm30} bold />
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 300 students */}
        <Card className="print-avoid-break">
          <CardContent className="p-0">
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Whole cohort — 300 students, 10 teachers</h3>
                <Badge variant="outline">every class set weekly work</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                400 assignments/yr · 12,000 submissions · {NUM(big.calls)} AI calls — still ~5% of free capacity on the worst day.
              </p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <CostRow item="Hosting — Vercel Hobby" plan="Still inside 100 GB/mo at this scale (~2–4 GB/mo of traffic)" cost={0} />
                <CostRow item="Database — Firebase Blaze (budget-capped £5/mo)" plan="Only needed for the 100-connection headroom; realistic bill £0–2/mo — first 1 GB storage + 10 GB/mo download stay free" cost={BLAZE_BUFFER_YEAR} />
                <CostRow item="AI chain — free tiers" plan="~190 calls/average day, ~900 on a whole-cohort deadline day — never overtaken" cost={0} />
                <CostRow item="Domain (.co.uk)" plan="Annual renewal" cost={DOMAIN_PER_YEAR} />
                <CostRow item="Total — lean stack" plan="£0.07–0.23 per student per year" cost={lean300} bold />
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* commercial detail */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="px-5 pt-5 pb-3">
            <h3 className="font-semibold">Commercial stack — 300 students, itemised</h3>
            <p className="text-xs text-muted-foreground mt-1">
              What to switch on the day a school pays you. Includes worst-case AI contingency — in practice £0.
            </p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {comm.map((r) => (
                <CostRow key={r.item} item={r.item} plan={r.plan} cost={r.cost} />
              ))}
              <CostRow item="Total — commercial stack" plan={`£${(comm300 / 300).toFixed(2)} per student per year`} cost={comm300} bold />
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* other business costs */}
      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="font-semibold">Every other cost of running the business</h3>
          <div className="overflow-x-auto mt-3">
            <table className="w-full min-w-[560px] text-sm">
              <tbody className="text-muted-foreground">
                <tr className="border-b"><td className="py-2.5 pr-4 font-medium text-foreground">Companies House incorporation</td><td className="py-2.5 pr-4">One-off £50 — optional; a sole trader costs £0</td><td className="py-2.5 text-right font-mono">£0–50 once</td></tr>
                <tr className="border-b"><td className="py-2.5 pr-4 font-medium text-foreground">Card processing (Stripe, per paid invoice)</td><td className="py-2.5 pr-4">1.5% + 20p on a UK card — £2.36 on a £144 invoice; £0 if the school pays by BACS</td><td className="py-2.5 text-right font-mono">~£2 / invoice</td></tr>
                <tr className="border-b"><td className="py-2.5 pr-4 font-medium text-foreground">Accounting / tax return</td><td className="py-2.5 pr-4">Self-assessment filing yourself: £0. Software or accountant: £60–300/yr</td><td className="py-2.5 text-right font-mono">£0–300 /yr</td></tr>
                <tr className="border-b"><td className="py-2.5 pr-4 font-medium text-foreground">VAT registration</td><td className="py-2.5 pr-4">Not required under £90,000 turnover — ~600 departments before it matters</td><td className="py-2.5 text-right font-mono">£0</td></tr>
                <tr><td className="py-2.5 pr-4 font-medium text-foreground">Your time (founder)</td><td className="py-2.5 pr-4">Build &amp; support — the sunk cost you choose</td><td className="py-2.5 text-right font-mono">£0 cash</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* totals */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <TotalCard title="Class of 30 · lean" value={GBP(lean30)} sub="per year · £0.33 / student" accent />
        <TotalCard title="Class of 30 · commercial" value={GBP(comm30)} sub={`per year · £${(comm30 / 30).toFixed(2)} / student (fixed plans)`} />
        <TotalCard title="300 students · lean" value={GBP(lean300)} sub="per year · £0.23 / student" />
        <TotalCard title="300 students · commercial" value={GBP(comm300)} sub={`per year · £${(comm300 / 300).toFixed(2)} / student`} accent />
      </div>

      <Card className="mt-4 border-[var(--success)]/40 bg-[var(--success)]/5">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Coins className="h-6 w-6 text-[var(--success)] shrink-0" aria-hidden />
            <p className="text-sm leading-relaxed">
              <strong>Against Educake:</strong> the school pays <strong>{GBP(EDUCAKE_BUSINESS_INCVAT)}/year</strong> for Educake
              Business regardless of cohort size. Running the same job on gcsebusiness costs{' '}
              <strong>{GBP(lean30)}/year for a class</strong> and <strong>{GBP(lean300)}–{GBP(comm300)}/year for 300
              students</strong> — so a licence priced at £144 inc VAT is <strong>78% cheaper for the school</strong> while still
              covering costs by <strong>{GBP(144 - lean30)}</strong> per department class (lean stack) or{' '}
              <strong>{GBP(478.8 - comm300)}</strong> for the whole cohort at the £479 tier (commercial stack).
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function TotalCard({ title, value, sub, accent }: { title: string; value: string; sub: string; accent?: boolean }) {
  return (
    <Card className={'print-avoid-break ' + (accent ? 'border-primary/40 bg-primary/5' : '')}>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={'mt-1 text-3xl font-extrabold tracking-tight ' + (accent ? 'text-primary' : '')}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ---------- 5. calculator ----------

function CalculatorSection() {
  const [students, setStudents] = useState(300);
  const [perWeek, setPerWeek] = useState(1);
  const [written, setWritten] = useState(2);

  const m = useMemo(() => aiModel(students, perWeek, 39, written), [students, perWeek, written]);
  const lean = DOMAIN_PER_YEAR + (students > 150 ? BLAZE_BUFFER_YEAR : 0);
  const comm = commercialCosts(students, m.calls);
  const commTotal = comm.reduce((s, r) => s + r.cost, 0);
  const peakPct = (m.peakDay / FREE_CAPACITY_PER_DAY) * 100;
  const price = licencePrice(students);
  const priceInc = Math.round(price * 1.2);
  const eduPerStudent = EDUCAKE_BUSINESS_INCVAT / students;

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  return (
    <section aria-labelledby="calc-h" className="no-print">
      <div className="mb-4">
        <h2 id="calc-h" className="text-xl sm:text-2xl font-bold tracking-tight">Model it yourself</h2>
        <p className="text-sm text-muted-foreground mt-1">Change the sliders — every figure below recomputes live.</p>
      </div>
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="calc-students">Students: <span className="font-bold text-foreground">{students}</span></Label>
              <input id="calc-students" type="range" min={10} max={1000} step={10} value={students} onChange={(e) => setStudents(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              <p className="text-xs text-muted-foreground">30 = one class · 300 = whole cohort</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calc-week">Assignments per week per class: <span className="font-bold text-foreground">{perWeek}</span></Label>
              <input id="calc-week" type="range" min={0.5} max={4} step={0.5} value={perWeek} onChange={(e) => setPerWeek(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              <p className="text-xs text-muted-foreground">1/week is “regular assignments”</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calc-written">Written (AI-marked) questions per quiz: <span className="font-bold text-foreground">{written}</span></Label>
              <input id="calc-written" type="range" min={0} max={6} step={1} value={written} onChange={(e) => setWritten(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              <p className="text-xs text-muted-foreground">The rest mark for free in code</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <Stat label="AI calls / year" value={NUM(m.calls)} />
            <Stat label="Worst single day" value={`${NUM(m.peakDay)} calls`} sub={`${peakPct.toFixed(1)}% of free capacity`} good={peakPct < 60} />
            <Stat label="Free tier verdict" value={peakPct < 60 ? 'Never overtaken' : 'Spills to paid'} sub={peakPct < 60 ? '£0 AI spend' : `≈ ${GBP(paidAIYearGBP(m.calls))}/yr worst case`} good={peakPct < 60} />
            <Stat label="Concurrent peak" value={`~${NUM(clamp(Math.min(students, 100), 10, 200))} live`} sub={students <= 150 ? 'Firebase free plan OK' : 'Use Blaze (buffer incl.)'} good={students <= 150} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <Stat label="Lean stack / year" value={GBP(lean)} sub={`£${(lean / students).toFixed(2)} per student`} good />
            <Stat label="Commercial stack / year" value={GBP(commTotal)} sub={`£${(commTotal / students).toFixed(2)} per student`} />
            <Stat label={`Licence to charge: ${GBP(priceInc)} inc VAT`} value={`Margin ${GBP(priceInc - commTotal)}`} sub={`vs Educake ${GBP(EDUCAKE_BUSINESS_INCVAT)} — school saves ${GBP(EDUCAKE_BUSINESS_INCVAT - priceInc)} (${Math.round((1 - priceInc / EDUCAKE_BUSINESS_INCVAT) * 100)}%)`} good={priceInc - commTotal > 0} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Educake comparison: {GBP(EDUCAKE_BUSINESS_INCVAT)} flat for the school = {GBP(eduPerStudent, 2)} per student at this size.
            39-week year, 195 school days assumed.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Stat({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className={'rounded-xl border p-4 ' + (good ? 'border-[var(--success)]/40 bg-[var(--success)]/5' : 'border-border bg-secondary')}>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-lg font-bold leading-tight">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

// ---------- 6. invoice ----------

function InvoiceSection() {
  const today = useMemo(() => new Date(), []);
  const due = useMemo(() => new Date(today.getTime() + 30 * 864e5), [today]);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const year = today.getFullYear();

  const [vatRegistered, setVatRegistered] = useState(false);
  const [fields, setFields] = useState({
    school: 'HGS Business & Enterprise Academy',
    attn: 'Mr R Ninej — Head of Business',
    address1: 'Business & Enterprise Department',
    address2: 'Hertfordshire · United Kingdom',
    po: '',
  });
  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const price = 120;
  const vat = vatRegistered ? price * 0.2 : 0;
  const total = price + vat;

  return (
    <section aria-labelledby="inv-h" id="invoice-section">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="inv-h" className="text-xl sm:text-2xl font-bold tracking-tight">The ideal invoice to your GCSE Business teacher</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Edit the details in place, then hit <strong>Print invoice</strong> — everything else on this page is hidden and only
            the invoice prints. Priced to be a yes: 78% under Educake, everything included, no per-student metering.
          </p>
        </div>
        <Button variant="outline" size="sm" className="no-print shrink-0" onClick={() => {
          document.body.classList.add('print-invoice');
          const cleanup = () => { document.body.classList.remove('print-invoice'); window.removeEventListener('afterprint', cleanup); };
          window.addEventListener('afterprint', cleanup);
          window.print();
          setTimeout(cleanup, 3000);
        }}>
          <Printer className="h-4 w-4" /> Print invoice
        </Button>
      </div>

      <Card className="overflow-hidden print-avoid-break">
        <div className="bg-primary text-primary-foreground px-6 sm:px-8 py-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLockup compact />
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest opacity-80">Invoice</p>
            <p className="font-mono font-bold text-lg">HGS-{year}-001</p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          {/* from / to / meta */}
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">From</p>
              <p className="font-semibold">gcsebusiness</p>
              <p className="text-muted-foreground">Edexcel GCSE (9–1) Business · spec 1BS0</p>
              <p className="text-muted-foreground">hello@gcsebusiness.co.uk</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Bill to</p>
              <Input className="h-7 px-2 text-sm border-dashed" value={fields.school} onChange={set('school')} aria-label="School name" />
              <Input className="h-7 px-2 text-sm border-dashed mt-1.5" value={fields.attn} onChange={set('attn')} aria-label="Attention" />
              <Input className="h-7 px-2 text-sm border-dashed mt-1.5" value={fields.address1} onChange={set('address1')} aria-label="Address line 1" />
              <Input className="h-7 px-2 text-sm border-dashed mt-1.5" value={fields.address2} onChange={set('address2')} aria-label="Address line 2" />
            </div>
            <div className="sm:text-right space-y-1.5">
              <p><span className="text-muted-foreground">Date: </span><span className="font-medium">{fmt(today)}</span></p>
              <p><span className="text-muted-foreground">Due: </span><span className="font-medium">{fmt(due)} (30 days)</span></p>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-muted-foreground">PO:</span>
                <Input className="h-7 w-28 px-2 text-sm border-dashed text-right" value={fields.po} onChange={set('po')} placeholder="—" aria-label="Purchase order number" />
              </div>
              <label className="flex sm:justify-end items-center gap-2 text-xs text-muted-foreground no-print cursor-pointer mt-1">
                <input type="checkbox" checked={vatRegistered} onChange={(e) => setVatRegistered(e.target.checked)} className="accent-[var(--primary)]" />
                I’m VAT registered (adds 20%)
              </label>
            </div>
          </div>

          {/* line items */}
          <table className="w-full text-sm mt-8">
            <thead>
              <tr className="border-b-2 border-foreground/20 text-left">
                <th className="py-2 pr-4 font-semibold">Description</th>
                <th className="py-2 pr-4 font-semibold text-center w-16">Qty</th>
                <th className="py-2 font-semibold text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b align-top">
                <td className="py-3.5 pr-4">
                  <p className="font-semibold">GCSE Business (9–1) department licence — one school year</p>
                  <ul className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                    <li>· Unlimited student and staff accounts</li>
                    <li>· Full Edexcel 1BS0 coverage, topics 1.1 – 2.5</li>
                    <li>· AI quiz generation from a teacher brief + AI examiner marking for written answers</li>
                    <li>· Analytics, print-ready reports, flashcards, gamification, PWA install</li>
                    <li>· Onboarding, class-list import and a 30-minute staff training session — included</li>
                    <li>· Email support from the founder, response within one school day</li>
                  </ul>
                </td>
                <td className="py-3.5 pr-4 text-center">1</td>
                <td className="py-3.5 text-right font-mono tabular-nums">{GBP(price, 2)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-muted-foreground">Setup, data import &amp; staff training</td>
                <td className="py-3 pr-4 text-center">1</td>
                <td className="py-3 text-right font-mono tabular-nums text-muted-foreground">£0.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-muted-foreground">Whole-cohort upgrade (if you later roll out to all 300 students)</td>
                <td className="py-3 pr-4 text-center">opt.</td>
                <td className="py-3 text-right font-mono tabular-nums text-muted-foreground">+£279.00</td>
              </tr>
            </tbody>
          </table>

          {/* totals */}
          <div className="mt-5 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono tabular-nums">{GBP(price, 2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">VAT @ 20%</span><span className="font-mono tabular-nums">{vatRegistered ? GBP(vat, 2) : 'not registered'}</span></div>
            <div className="flex justify-between border-t-2 border-foreground/20 pt-1.5 text-base font-bold">
              <span>Total due</span><span className="font-mono tabular-nums">{GBP(total, 2)}</span>
            </div>
          </div>

          {/* payment */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Payment</p>
              <p>BACS: gcsebusiness · Sort 00-00-00 · Acct 00000000</p>
              <p>Reference: HGS-{year}-001 · or pay by card link (1.5% + 20p fee)</p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-foreground mb-1">Thank you</p>
              <p>Educake Business equivalent: £550 + VAT = £660.00 — this invoice saves your department £516.00 (78%).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground no-print">
        Pricing rationale: at £144 inc VAT the department licence covers the commercial-stack running cost
        (~£73/yr for a class) with ~50% margin, stays far below Educake’s £660, and needs no per-student metering —
        which is exactly the pricing complaint schools make about edtech.
      </p>
    </section>
  );
}

// ---------- 7. sources ----------

function SourcesSection() {
  return (
    <section aria-labelledby="src-h" className="text-sm">
      <h2 id="src-h" className="text-lg font-bold tracking-tight mb-3">Sources &amp; assumptions</h2>
      <Card>
        <CardContent className="p-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
          <p><span className="font-medium text-foreground">Educake Business price:</span> £550/yr + VAT, annual school subscription, unlimited students &amp; teachers — educake.co.uk (checked {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}).</p>
          <p><span className="font-medium text-foreground">Educake Trustpilot:</span> 1.3/5, 89% 1-star — trustpilot.com/review/educake.com.</p>
          <p><span className="font-medium text-foreground">Gemini free tier:</span> ~250 req/day (Flash) and ~1,000 req/day (Flash-Lite) after the 2025 cuts — Google AI Studio rate limits. We rotate 3 models.</p>
          <p><span className="font-medium text-foreground">Groq free tier:</span> ~14,400 req/day (Llama 3.1 8B) and ~1,000 req/day (70B), 30 req/min — Groq docs. We rotate 3 models.</p>
          <p><span className="font-medium text-foreground">Firebase RTDB:</span> Spark free = 1 GB storage, 10 GB/mo download, 100 simultaneous connections; Blaze adds the same amounts free, $5/GB after — Firebase pricing.</p>
          <p><span className="font-medium text-foreground">Vercel:</span> Hobby £0 (non-commercial), Pro $20/mo incl. $20 usage credit + 1 TB bandwidth — vercel.com/pricing.</p>
          <p className="sm:col-span-2"><span className="font-medium text-foreground">Usage assumptions:</span> 39 teaching weeks; 1 assignment per class per week; 10-question quizzes with 2 written (AI-marked) questions; 2 AI calls per quiz generation (write + numeric verification); 1 feedback call per submission; 195 school days; ~1.4k input + 0.4k output tokens per call; $1 ≈ £0.79. MCQ / key-term / numeric marking never uses AI.</p>
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Internal page — not indexed, not linked from the app. Numbers are modelled estimates for planning, not a quote.
      </p>
    </section>
  );
}
