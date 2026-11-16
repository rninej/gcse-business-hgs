'use client';

// /debug — the lock-out escape hatch. There is no self-service password reset,
// so a teacher who forgets theirs has nobody to ask unless the owner can set a
// temporary one. Small on purpose: email, new password, done.

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TeacherAdminSection() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch('/api/owner/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: pw }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; name?: string; email?: string };
      if (!res.ok) throw new Error(data.error || 'Could not set that password.');
      setMsg(`Password set for ${data.name ?? data.email}. Send it to them; they can change it from the app menu.`);
      setPw('');
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="teacher-admin-h" id="teacher-admin-section">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <h2 id="teacher-admin-h" className="text-lg font-semibold leading-tight">
            Teacher lock-out
          </h2>
          <p className="text-xs text-muted-foreground">
            There is no &ldquo;forgot password&rdquo; email, so a locked-out teacher needs a temporary
            password set here.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="admin-teacher-email">Teacher email</Label>
              <Input
                id="admin-teacher-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.uk"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-teacher-pw">Temporary password</Label>
              <Input
                id="admin-teacher-pw"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="at least 6 characters"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={busy || email.trim().length < 5 || pw.length < 6}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Set password
            </Button>
          </form>
          {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
          {err ? <p className="mt-3 text-sm text-[var(--warn)]">{err}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}
