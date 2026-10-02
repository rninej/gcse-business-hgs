'use client';

// Self-service password change for students and teachers. Students' new
// passwords are re-encrypted so the teacher can still see the login.

import { useEffect, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export function PasswordDialog({ variant = 'outline' }: { variant?: 'outline' | 'ghost' | 'sidebar' }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setError(null);
    }
  }, [open]);

  async function save() {
    setError(null);
    if (next !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/password', { currentPassword: current, newPassword: next });
      toast({ title: 'Password updated', description: 'Use your new password next time you sign in.' });
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const canSave = current.trim() && next.length >= 6 && next === confirm && !busy;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'ghost' ? (
          <Button variant="ghost" size="icon" aria-label="Change password">
            <KeyRound className="h-5 w-5" />
          </Button>
        ) : variant === 'sidebar' ? (
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]/70 transition-colors"
          >
            <KeyRound className="h-[17px] w-[17px]" aria-hidden />
            <span>Change password</span>
          </button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            <KeyRound className="h-4 w-4" /> Change password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change your password</DialogTitle>
          <DialogDescription>
            Pick something at least 6 characters long that you will remember.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pw-current">Current password</Label>
            <PasswordInput
              id="pw-current"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-next">New password</Label>
            <PasswordInput
              id="pw-next"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-confirm">Repeat new password</Label>
            <PasswordInput
              id="pw-confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) void save();
              }}
            />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!canSave}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy ? 'Saving…' : 'Save new password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
