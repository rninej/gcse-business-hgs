'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Submits the licence enquiry on the page. School devices routinely block
 * mailto: handlers, so the form is the reliable route; the email link stays
 * beside it for anyone who prefers their own mail client.
 */
export function EnquiryForm({ contactEmail }: { contactEmail: string }) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, school, email, role, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not send that. Please try again.');
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium">Enquiry received.</p>
        <p className="mt-1 text-muted-foreground">
          It is logged against {email} and answered from{' '}
          <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{' '}
          — usually within one working day. Nothing was charged and no card was asked for.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border p-4">
      <p className="text-sm font-medium">Send the request from this page</p>
      <p className="mt-1 text-xs text-muted-foreground">
        No school mail client needed — this goes straight to the person who replies.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="enq-name">Your name</Label>
          <Input id="enq-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ms Okafor" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-school">School</Label>
          <Input id="enq-school" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Oakfield High School" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-email">Email to reply to</Label>
          <Input id="enq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.uk" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-role">Role (optional)</Label>
          <Input id="enq-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Head of Business" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Label htmlFor="enq-message">Anything to add (optional)</Label>
        <textarea
          id="enq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="PO number, supplier form needed, number of classes next term…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || name.trim().length < 2 || school.trim().length < 2 || !email.includes('@')}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          {busy ? 'Sending…' : 'Send the licence request'}
        </Button>
        <a className="text-sm underline underline-offset-2" href={`mailto:${contactEmail}`}>
          or email {contactEmail}
        </a>
      </div>
    </form>
  );
}
