'use client';

// Landing + authentication. Teachers register; students receive accounts from their teacher.
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { BrandLockup } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { CheckCircle2, Check, Loader2 } from 'lucide-react';
import type { SessionInfo } from '@/lib/types';

export function AuthView() {
  return (
    // no bg here: the body provides it, which lets the site backdrop photo
    // (fixed, -z-20, mounted in HomeApp) show through behind the content
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/40 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2.5 flex items-center justify-between gap-3">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Edexcel GCSE (9–1) Business · spec 1BS0</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* mobile: sign in first — no scrolling needed; desktop: pitch left, card right */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 lg:py-16 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 lg:items-center">
        {/* What it looks like in the classroom — children rise in sequence */}
        <section className="order-2 lg:order-1 stagger">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            GCSE Business homework that marks itself.
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-lg">
            Set a quiz in under a minute. Students get case studies, calculations and
            instant marking — you get the marks.
          </p>

          <div className="mt-8 max-w-lg rounded-xl border border-white/60 bg-card/55 backdrop-blur-xl backdrop-saturate-150 card-lift shadow-[inset_0_1px_0_0_rgb(255_255_255/0.65),0_8px_32px_-8px_rgb(13_92_70/0.14)]">
            <div className="px-4 py-2.5 border-b border-white/40 rounded-t-xl bg-[var(--accent)]/30">
              <p className="text-xs font-semibold text-[var(--accent-foreground)] uppercase tracking-wide">
                Case study · Biscuiteers
              </p>
              <p className="text-[13px] leading-relaxed mt-1 text-muted-foreground">
                Biscuiteers was founded in 2007. It hand-ices premium biscuits and has grown its
                revenue to around £11 million a year…
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium leading-snug">
                Which of the following is an example of organic growth for Biscuiteers?
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ['Buying a smaller biscuit company', false],
                  ['Opening more of its own shops', true],
                  ['Merging with a rival bakery', false],
                  ['Taking over a packaging firm', false],
                ].map(([opt, right], i) => (
                  <li
                    key={i}
                    className={
                      right
                        ? 'flex items-center gap-2.5 rounded-md border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-[var(--success)] font-medium'
                        : 'flex items-center gap-2.5 rounded-md border px-3 py-2 text-muted-foreground'
                    }
                  >
                    <span className={'h-2 w-2 rounded-full ' + (right ? 'bg-[var(--success)]' : 'bg-muted-foreground/30')} aria-hidden />
                    {opt as string}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Marked instantly — with the correct answer and a short explanation every time.
              </p>
            </div>
          </div>

          <ul className="mt-7 space-y-2.5 text-sm max-w-lg">
            {[
              'Timed or untimed quizzes on any Edexcel topic, 1.1 to 2.5',
              'Deterministic marking — the same answer always gets the same result',
              'Class analytics: scores, topic gaps and question-level breakdowns',
            ].map((f) => (
              <li key={f} className="flex gap-2.5 items-start">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Auth card — first thing you see on a phone */}
        <section className="order-1 lg:order-2 w-full max-w-md mx-auto anim-rise">
          <AuthCard />
        </section>
      </main>

      <footer className="mt-auto border-t border-white/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} gcsebusiness</span>
          <span className="flex items-center gap-3">
            <span>Students: your teacher creates your account and hands out your login.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function AuthCard() {
  const { toast } = useToast();
  const start = useApp((s) => s.start);
  const [tab, setTab] = useState<'teacher' | 'student' | 'register'>('teacher');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tId, setTId] = useState('');
  const [tPw, setTPw] = useState('');
  const [sId, setSId] = useState('');
  const [sPw, setSPw] = useState('');
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPw, setRPw] = useState('');

  async function submit(kind: 'teacher' | 'student' | 'register') {
    setBusy(true);
    setError(null);
    try {
      let session: SessionInfo;
      if (kind === 'teacher') {
        const res = await api.post<{ session: SessionInfo }>('/api/auth/login', {
          role: 'teacher',
          identifier: tId,
          password: tPw,
        });
        session = res.session;
        toast({ title: `Welcome back, ${session.name}` });
      } else if (kind === 'student') {
        const res = await api.post<{ session: SessionInfo }>('/api/auth/login', {
          role: 'student',
          identifier: sId,
          password: sPw,
        });
        session = res.session;
        toast({ title: `Welcome back, ${session.name.split(' ')[0]}!` });
      } else {
        const res = await api.post<{ session: SessionInfo }>('/api/auth/register', {
          name: rName,
          email: rEmail,
          password: rPw,
        });
        session = res.session;
        toast({ title: 'Account created', description: 'Set up your first class next.' });
      }
      start(session); // straight in — no page reload
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="shadow-[inset_0_1px_0_0_rgb(255_255_255/0.65),0_16px_48px_-16px_rgb(13_92_70/0.22)]">
      <CardContent className="p-6 sm:p-8">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setError(null); }}>
          <TabsList className="grid grid-cols-3 w-full mb-5">
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="register">Create</TabsTrigger>
          </TabsList>

          <TabsContent value="teacher" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-email">Email</Label>
              <Input id="t-email" type="email" autoComplete="email" value={tId} onChange={(e) => setTId(e.target.value)} placeholder="you@school.uk" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-pw">Password</Label>
              <PasswordInput id="t-pw" autoComplete="current-password" value={tPw} onChange={(e) => setTPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit('teacher')} placeholder="••••••••" />
            </div>
            <Button className="w-full" disabled={busy || !tId || !tPw} onClick={() => submit('teacher')}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {busy ? 'Signing in…' : 'Sign in as teacher'}
            </Button>
          </TabsContent>

          <TabsContent value="student" className="space-y-4">
            <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              Log in with the username your teacher gave you (for example <span className="font-mono">amelia.watson</span>).
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-user">Username</Label>
              <Input id="s-user" autoCapitalize="none" value={sId} onChange={(e) => setSId(e.target.value)} placeholder="firstname.lastname" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-pw">Password</Label>
              <PasswordInput id="s-pw" autoComplete="current-password" value={sPw} onChange={(e) => setSPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit('student')} placeholder="e.g. braveotter23" />
            </div>
            <Button className="w-full" disabled={busy || !sId || !sPw} onClick={() => submit('student')}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {busy ? 'Signing in…' : 'Sign in as student'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="rounded-lg bg-[var(--accent)]/40 p-3 text-xs">
              Teachers only — students get accounts from their teacher.
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-name">Your name</Label>
              <Input id="r-name" value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Ms Okafor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-email">School email</Label>
              <Input id="r-email" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} placeholder="you@school.uk" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-pw">Password (6+ characters)</Label>
              <PasswordInput id="r-pw" autoComplete="new-password" value={rPw} onChange={(e) => setRPw(e.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" disabled={busy || !rName || !rEmail || rPw.length < 6} onClick={() => submit('register')}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {busy ? 'Creating…' : 'Create teacher account'}
            </Button>
          </TabsContent>
        </Tabs>

        {error ? (
          <p className="mt-4 text-sm text-[var(--danger)]" role="alert">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
