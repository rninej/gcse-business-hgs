'use client';

// Landing + authentication. Teachers register; students receive accounts from their teacher.
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BrandLockup } from './Brand';
import { CheckCircle2 } from 'lucide-react';

export function AuthView() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[var(--secondary)] via-background to-background">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLockup />
          <span className="text-xs text-muted-foreground hidden sm:block">Edexcel GCSE (9–1) Business · spec 1BS0</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        {/* Hero */}
        <section className="order-2 lg:order-1">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
            GCSE Business,
            <br />
            <span className="text-primary">made simple.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            Homework and quizzes with instant, accurate marking — case studies, diagrams and
            calculations, all aligned to the Edexcel spec.
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {[
              'Whole-class quiz setting in under a minute — timed or untimed',
              'Objective marking that is always consistent: every question type marked deterministically',
              'Smart class analytics: scores, topic gaps and question-level analysis',
              'Practice quizzes for students, with auto feedback after every attempt',
            ].map((f) => (
              <li key={f} className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-9 grid grid-cols-3 gap-4 max-w-md">
            {[
              ['10', 'spec topics covered'],
              ['5', 'question styles'],
              ['2', 'exam themes'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border bg-card p-4">
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl font-bold text-primary">{n}</dd>
                <dd className="text-xs text-muted-foreground mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Auth card */}
        <section className="order-1 lg:order-2 w-full max-w-md mx-auto">
          <AuthCard />
        </section>
      </main>

      <footer className="mt-auto border-t bg-background/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} HGSBusiness</span>
          <span>Students: your teacher creates your account and hands out your login.</span>
        </div>
      </footer>
    </div>
  );
}

function AuthCard() {
  const { toast } = useToast();
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
      if (kind === 'teacher') {
        const me = await api.post<{ role: 'teacher' | 'student'; name: string }>('/api/auth/login', {
          role: 'teacher',
          identifier: tId,
          password: tPw,
        });
        toast({ title: `Welcome back, ${me.name}` });
        window.location.reload(); // let the boot flow pick up the cookie session
      } else if (kind === 'student') {
        await api.post('/api/auth/login', { role: 'student', identifier: sId, password: sPw });
        toast({ title: 'Welcome back!' });
        window.location.reload();
      } else {
        await api.post('/api/auth/register', { name: rName, email: rEmail, password: rPw });
        toast({ title: 'Account created', description: 'Set up your first class next.' });
        window.location.reload();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="shadow-xl shadow-black/5 border">
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
              <Input id="t-pw" type="password" autoComplete="current-password" value={tPw} onChange={(e) => setTPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit('teacher')} placeholder="••••••••" />
            </div>
            <Button className="w-full" disabled={busy || !tId || !tPw} onClick={() => submit('teacher')}>
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
              <Input id="s-pw" type="password" value={sPw} onChange={(e) => setSPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit('student')} placeholder="•••••••" />
            </div>
            <Button className="w-full" disabled={busy || !sId || !sPw} onClick={() => submit('student')}>
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
              <Input id="r-pw" type="password" value={rPw} onChange={(e) => setRPw(e.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" disabled={busy || !rName || !rEmail || rPw.length < 6} onClick={() => submit('register')}>
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
