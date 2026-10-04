'use client';

// Self-service profile picture: upload a photo (the browser centre-crops
// and shrinks it to a tiny 128px square before anything is sent), pick an
// emoji, or pick a 2D character from the cast — eight of the twelve unlock
// through achievement badges, so the coolest avatars are earned. The avatar
// then appears on the class leaderboard, the teacher's profile view of you
// and around the app.

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Loader2, Lock, Upload } from 'lucide-react';
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
import { Avatar, initialsOf } from '@/components/shared';
import { CharAvatar, CHARACTER_LIST } from '@/components/characters';
import { characterById } from '@/lib/characters';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

const EMOJI_PRESETS = ['🦊', '🐼', '🦉', '🐧', '🦁', '🐸', '🦄', '🚀'];

interface BadgeState {
  id: string;
  title: string;
  unlocked: boolean;
}

/** Shrink any picture the browser can display to a 128×128 JPEG data URL
 * (square centre-crop) — a few KB, safe to store and quick to load. */
async function fileToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not a picture — try a JPG, PNG or WebP.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('That picture is huge — please pick one under 20 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('The browser could not read that picture — try a JPG or PNG.'));
      im.src = url;
    });
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process that picture — try another one.');
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
    const out = canvas.toDataURL('image/jpeg', 0.82);
    if (out.length > 150_000) throw new Error('That picture will not shrink enough — try a simpler one.');
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProfileDialog({ trigger }: { trigger: 'row' | 'icon' }) {
  const session = useApp((s) => s.session);
  const myAvatar = useApp((s) => s.myAvatar);
  const setMyAvatar = useApp((s) => s.setMyAvatar);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  /** the staged choice — null = keep initials; saved on Save */
  const [next, setNext] = useState<string | null | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** badge unlock states for the character locks (students; loaded on open) */
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string> | null>(null);

  const isTeacher = session?.role === 'teacher';

  // students' real badge states decide which characters are pickable;
  // teachers get the whole cast (they have no badges to earn)
  useEffect(() => {
    if (!open) {
      setNext(undefined);
      setError(null);
      setUnlockedBadges(null);
      return;
    }
    if (isTeacher) {
      setUnlockedBadges(new Set(CHARACTER_LIST.map((c) => c.badge).filter((b): b is string => b !== null)));
      return;
    }
    api
      .get<{ badges: BadgeState[] }>('/api/student/overview')
      .then((d) => setUnlockedBadges(new Set(d.badges.filter((b) => b.unlocked).map((b) => b.id))))
      .catch(() => setUnlockedBadges(new Set())); // offline → free cast only
  }, [open, isTeacher]);

  const name = session?.name ?? '?';
  const staged = next === undefined ? myAvatar : next;
  const dirty = next !== undefined && next !== myAvatar;
  const stagedChar = staged?.startsWith('char:') ? characterById(staged.slice(5)) : null;

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      setNext(await fileToAvatar(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function save() {
    if (next === undefined) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.patch<{ avatar: string | null }>('/api/me', { avatar: next });
      setMyAvatar(res.avatar);
      window.dispatchEvent(new CustomEvent('hgs:avatar', { detail: res.avatar }));
      toast({
        title: res.avatar ? 'Avatar updated' : 'Avatar removed',
        description: res.avatar
          ? 'Look out for it next to your name on the leaderboard.'
          : 'You are back to your initials.',
      });
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === 'row' ? (
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left transition-colors hover:bg-[var(--sidebar-accent)]/70 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Edit your profile picture"
            title="Change your profile picture"
          >
            <span className="relative shrink-0">
              <Avatar name={name} src={myAvatar} size="md" className="ring-white/70" />
              <span className="absolute -right-1 -bottom-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
                <Camera className="h-2.5 w-2.5" aria-hidden />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium truncate">{name}</span>
              <span className="block text-xs text-muted-foreground truncate">
                {isTeacher ? 'Teacher' : `${session?.className ?? 'Class'} · Student`}
              </span>
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Edit your profile picture"
            title="Change your profile picture"
          >
            <Avatar name={name} src={myAvatar} size="sm" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scroll-slim">
        <DialogHeader>
          <DialogTitle>Your profile picture</DialogTitle>
          <DialogDescription>
            Upload a photo, pick an emoji, or choose a character — eight of the twelve unlock with badges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* live preview */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="relative">
              {staged?.startsWith('char:') ? (
                <span className="relative inline-flex h-20 w-20 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                  <CharAvatar id={staged.slice(5)} />
                </span>
              ) : (
                <Avatar name={name} src={staged} size="xl" className="shadow-md ring-2 ring-white" />
              )}
              {processing ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              {stagedChar
                ? `${stagedChar.name} — ${stagedChar.blurb}`
                : staged
                  ? 'Looking good.'
                  : `Currently your initials — ${initialsOf(name)}`}
            </div>
          </div>

          {/* characters */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
              <span>Pick a character</span>
              {unlockedBadges === null ? (
                <span className="flex items-center gap-1 text-muted-foreground/70">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> checking badges…
                </span>
              ) : (
                <span className="text-muted-foreground/70">
                  {CHARACTER_LIST.filter((c) => c.badge === null || unlockedBadges.has(c.badge)).length} of{' '}
                  {CHARACTER_LIST.length} unlocked
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Character avatars">
              {CHARACTER_LIST.map((c) => {
                const pickable = c.badge === null || (unlockedBadges?.has(c.badge) ?? false);
                const selected = staged === `char:${c.id}`;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!pickable}
                    onClick={() => setNext(`char:${c.id}`)}
                    title={
                      pickable
                        ? `${c.name} — ${c.blurb}`
                        : `Locked — earn the ${characterById(c.id) && c.badge ? badgeName(c.badge) : ''} badge to unlock ${c.name}`
                    }
                    className={cn(
                      'group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all',
                      selected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : pickable
                          ? 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60 active:scale-95'
                          : 'border-border/60 bg-muted/40 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn(
                        'relative inline-flex h-12 w-12 overflow-hidden rounded-full',
                        !pickable && 'opacity-40 saturate-50'
                      )}
                    >
                      <CharAvatar id={c.id} />
                      {!pickable ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/85 shadow-sm">
                            <Lock className="h-3 w-3 text-muted-foreground" aria-hidden />
                          </span>
                        </span>
                      ) : null}
                    </span>
                    <span className={cn('text-[11px] font-medium leading-none', !pickable && 'text-muted-foreground/70')}>
                      {c.name}
                    </span>
                    {selected ? (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 px-1">
              Locked characters unlock by earning badges — see the achievements grid on your homepage.
            </p>
          </div>

          {/* upload */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Upload a picture"
            onChange={(e) => void pickFile(e.target.files?.[0])}
          />
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={processing}>
            <Upload className="h-4 w-4" aria-hidden /> Upload a picture
          </Button>
          <p className="text-[11px] text-muted-foreground -mt-2 px-1">
            It is cropped to a square and shrunk on your device before it is saved.
          </p>

          {/* emoji picks */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">…or pick an emoji</div>
            <div className="grid grid-cols-8 gap-1.5" role="radiogroup" aria-label="Emoji avatars">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={staged === `emoji:${e}`}
                  onClick={() => setNext(`emoji:${e}`)}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-lg border text-lg transition-all hover:scale-110 active:scale-95',
                    staged === `emoji:${e}`
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-card hover:bg-secondary'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* back to initials */}
          <button
            type="button"
            onClick={() => setNext(null)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              staged === null ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary'
            )}
            aria-pressed={staged === null}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
              {initialsOf(name)}
            </span>
            Just use my initials
            {staged === null ? <Check className="ml-auto h-4 w-4" aria-hidden /> : null}
          </button>

          {error ? <p className="text-sm text-[var(--danger)]" role="alert">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!dirty || busy || processing}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy ? 'Saving…' : 'Save avatar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Badge titles for lock tooltips — kept in one place so a badge rename only
 *  touches this map (falls back to the raw id). */
const BADGE_TITLES: Record<string, string> = {
  'first-quiz': 'Off the mark',
  'streak-3': 'Hat-trick',
  'high-avg': 'Consistent',
  perfect: 'Flawless',
  'twenty-quizzes': 'Quiz machine',
  'points-5k': 'Point legend',
  'all-topics': 'All-rounder',
  'night-owl': 'Night owl',
};

function badgeName(id: string): string {
  return BADGE_TITLES[id] ?? id;
}
