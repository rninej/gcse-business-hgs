'use client';

// Self-service profile picture: upload a photo (the browser centre-crops
// and shrinks it to a tiny 128px square before anything is sent), pick an
// emoji, pick a 2D character from the cast (eight of the twelve unlock
// through achievement badges), or BUILD a fully custom character — gender,
// size, skin tone, hair, eyes and outfit are free to combine, while the
// accessories ladder unlocks with cumulative quiz points: the more points
// earned, the cooler the flair. The avatar then appears on the class
// leaderboard, the teacher's profile view and around the app.

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Dices,
  Droplet,
  Eye,
  Hand,
  ImagePlus,
  Loader2,
  Lock,
  Palette,
  Plus,
  RotateCcw,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  User,
  Wallpaper,
  X,
} from 'lucide-react';
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
import { CharAvatar, BuildAvatar, CHARACTER_LIST } from '@/components/characters';
import { characterById } from '@/lib/characters';
import {
  type AvatarBuild,
  ACCESSORIES,
  BGS,
  CLOTHES,
  CLOTHES_COLORS,
  EYES,
  GENDERS,
  HAIRS,
  HAIR_COLORS,
  MAX_ACCESSORIES,
  SIZES,
  SKINS,
  accessoryUnlocked,
  buildAvatarString,
  defaultBuild,
  defaultHairIndex,
  parseBuild,
} from '@/lib/avatarBuilder';
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

/* ---------------- the builder ---------------- */

type Cat = 'gender' | 'size' | 'skin' | 'hair' | 'haircolor' | 'eyes' | 'clothes' | 'clothescolor' | 'backdrop' | 'extras';

const CATS: { id: Cat; label: string; icon: typeof User }[] = [
  { id: 'gender', label: 'Gender', icon: User },
  { id: 'size', label: 'Size', icon: Ruler },
  { id: 'skin', label: 'Skin', icon: Hand },
  { id: 'hair', label: 'Hair', icon: Scissors },
  { id: 'haircolor', label: 'Hair colour', icon: Palette },
  { id: 'eyes', label: 'Eyes', icon: Eye },
  { id: 'clothes', label: 'Outfit', icon: Shirt },
  { id: 'clothescolor', label: 'Outfit colour', icon: Droplet },
  { id: 'backdrop', label: 'Backdrop', icon: Wallpaper },
  { id: 'extras', label: 'Extras', icon: Sparkles },
];

const rand = (n: number) => Math.floor(Math.random() * n);

function randomBuild(points: number | null): AvatarBuild {
  const affordable = ACCESSORIES.filter((a) => accessoryUnlocked(a.id, points));
  const ac: string[] = [];
  if (affordable.length > 0 && Math.random() < 0.7) ac.push(affordable[rand(affordable.length)].id);
  if (affordable.length > 1 && Math.random() < 0.4) {
    const second = affordable[rand(affordable.length)].id;
    if (!ac.includes(second)) ac.push(second);
  }
  return {
    g: GENDERS[rand(GENDERS.length)].id,
    sz: SIZES[rand(SIZES.length)].id,
    sk: rand(SKINS.length),
    h: rand(HAIRS.length),
    hc: rand(HAIR_COLORS.length),
    e: rand(EYES.length),
    c: rand(CLOTHES.length),
    cc: rand(CLOTHES_COLORS.length),
    bg: rand(BGS.length),
    ac,
  };
}

/** one circular option tile — a live mini render of the build with that
 *  single option applied, so every choice previews exactly how it looks */
function OptionTile({
  build,
  label,
  selected,
  onClick,
  sub,
  disabled,
}: {
  build: AvatarBuild;
  label: string;
  selected: boolean;
  onClick: () => void;
  sub?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      title={label + (sub ? ` — ${sub}` : '')}
      className={cn(
        'group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all',
        selected
          ? 'border-primary bg-primary/10 shadow-sm'
          : disabled
            ? 'border-border/60 bg-muted/40 cursor-not-allowed'
            : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60 active:scale-95'
      )}
    >
      <span className={cn('relative inline-flex h-12 w-12 overflow-hidden rounded-full', disabled && 'opacity-40 saturate-50')}>
        <BuildAvatar build={build} />
      </span>
      <span className={cn('text-[11px] font-medium leading-none text-center', disabled && 'text-muted-foreground/70')}>
        {label}
      </span>
      {sub ? <span className="text-[10px] text-muted-foreground leading-none -mt-0.5">{sub}</span> : null}
      {selected ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

/** a colour swatch tile (hair / outfit / backdrop colours) */
function SwatchTile({
  hex,
  label,
  selected,
  onClick,
}: {
  hex: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
        selected
          ? 'border-primary shadow-sm scale-105'
          : 'border-border hover:border-primary/40 hover:scale-105 active:scale-95'
      )}
    >
      <span className="h-8 w-8 rounded-full ring-1 ring-black/10" style={{ background: hex }} />
      {selected ? (
        <Check className="absolute h-3.5 w-3.5 text-white drop-shadow" aria-hidden />
      ) : null}
    </button>
  );
}

/** the accessory ladder — point-locked flair, equip up to two */
function AccessoryTile({
  id,
  name,
  cost,
  equipped,
  unlocked,
  points,
  preview,
  onToggle,
}: {
  id: string;
  name: string;
  cost: number;
  equipped: boolean;
  unlocked: boolean;
  points: number | null;
  preview: AvatarBuild;
  onToggle: () => void;
}) {
  const pct = points === null || cost === 0 ? 100 : Math.min(100, Math.round((points / cost) * 100));
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onToggle}
      aria-pressed={equipped}
      title={
        unlocked
          ? `${name}${equipped ? ' — tap to take off' : ' — tap to wear'}`
          : `${name} unlocks at ${cost.toLocaleString('en-GB')} cumulative points`
      }
      className={cn(
        'relative flex flex-col items-center gap-1 rounded-xl border p-2 text-left transition-all',
        equipped
          ? 'border-primary bg-primary/10 shadow-sm'
          : unlocked
            ? 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60 active:scale-95'
            : 'border-border/60 bg-muted/40 cursor-not-allowed'
      )}
    >
      <span className={cn('relative inline-flex h-12 w-12 overflow-hidden rounded-full', !unlocked && 'opacity-40 saturate-50')}>
        <BuildAvatar build={preview} />
        {!unlocked ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/85 shadow-sm">
              <Lock className="h-3 w-3 text-muted-foreground" aria-hidden />
            </span>
          </span>
        ) : null}
        {equipped ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Check className="h-3 w-3" aria-hidden />
          </span>
        ) : null}
      </span>
      <span className={cn('text-[11px] font-medium leading-none text-center', !unlocked && 'text-muted-foreground/70')}>
        {name}
      </span>
      {unlocked ? (
        <span className="text-[10px] leading-none text-muted-foreground">{cost.toLocaleString('en-GB')} pts</span>
      ) : points !== null ? (
        <span className="w-full px-0.5">
          <span className="block h-1 w-full overflow-hidden rounded-full bg-secondary">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </span>
          <span className="mt-0.5 block text-[9px] tabular-nums text-muted-foreground">
            {points.toLocaleString('en-GB')}/{cost.toLocaleString('en-GB')}
          </span>
        </span>
      ) : (
        <span className="text-[10px] leading-none text-muted-foreground">{cost.toLocaleString('en-GB')} pts</span>
      )}
      {equipped ? (
        <span className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5" aria-hidden>
          <X className="h-2.5 w-2.5 text-muted-foreground" />
        </span>
      ) : null}
      <span className="sr-only">{id}</span>
    </button>
  );
}

export function ProfileDialog({ trigger }: { trigger: 'row' | 'icon' }) {
  const session = useApp((s) => s.session);
  const myAvatar = useApp((s) => s.myAvatar);
  const setMyAvatar = useApp((s) => s.setMyAvatar);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  /** the staged choice — null = keep initials; saved on Save */
  const [next, setNext] = useState<string | null | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** badge unlock states for the character locks (students; loaded on open) */
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string> | null>(null);
  /** cumulative quiz points (students; null for teachers → all flair free) */
  const [points, setPoints] = useState<number | null>(null);

  // builder state
  const [building, setBuilding] = useState(false);
  const [draft, setDraft] = useState<AvatarBuild>(defaultBuild);
  const [cat, setCat] = useState<Cat>('gender');

  const isTeacher = session?.role === 'teacher';

  // students' real badge states decide which characters are pickable, and
  // their cumulative points gate the builder's accessory ladder; teachers
  // get the whole cast and every accessory (they have no points economy)
  useEffect(() => {
    if (!open) {
      setNext(undefined);
      setError(null);
      setUnlockedBadges(null);
      setPoints(null);
      setBuilding(false);
      return;
    }
    if (isTeacher) {
      setUnlockedBadges(new Set(CHARACTER_LIST.map((c) => c.badge).filter((b): b is string => b !== null)));
      setPoints(null);
      return;
    }
    api
      .get<{ badges: BadgeState[]; stats: { points: number } }>('/api/student/overview')
      .then((d) => {
        setUnlockedBadges(new Set(d.badges.filter((b) => b.unlocked).map((b) => b.id)));
        setPoints(d.stats.points);
      })
      .catch(() => {
        setUnlockedBadges(new Set()); // offline → free cast only
        setPoints(0);
      });
  }, [open, isTeacher]);

  const name = session?.name ?? '?';
  const staged = next === undefined ? myAvatar : next;
  const dirty = next !== undefined && next !== myAvatar;
  const stagedChar = staged?.startsWith('char:') ? characterById(staged.slice(5)) : null;

  /** patch one field of the working build (immutably) */
  function patch(p: Partial<AvatarBuild>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  /** equip / unequip an accessory within the two-slot limit */
  function toggleAccessory(id: string) {
    setDraft((d) => {
      if (d.ac.includes(id)) return { ...d, ac: d.ac.filter((x) => x !== id) };
      if (!accessoryUnlocked(id, points)) {
        const cost = ACCESSORIES.find((a) => a.id === id)?.cost ?? 0;
        toast({
          title: 'Still locked',
          description: `That needs ${cost.toLocaleString('en-GB')} cumulative points — you have ${(points ?? 0).toLocaleString('en-GB')}.`,
        });
        return d;
      }
      if (d.ac.length >= MAX_ACCESSORIES) {
        toast({
          title: 'Two accessories max',
          description: 'Take one off first — a character can wear two pieces of flair at once.',
        });
        return d;
      }
      return { ...d, ac: [...d.ac, id] };
    });
  }

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
      if (cameraRef.current) cameraRef.current.value = '';
    }
  }

  async function save(override?: string | null) {
    const value = override !== undefined ? override : next;
    if (value === undefined) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.patch<{ avatar: string | null }>('/api/me', { avatar: value });
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

  /* helper: the draft with one option swapped, for mini previews */
  const withOpt = (p: Partial<AvatarBuild>) => ({ ...draft, ...p });

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

      <DialogContent
        className={cn(
          'max-h-[90vh] overflow-y-auto scroll-slim transition-all',
          building ? 'sm:max-w-lg' : 'sm:max-w-md'
        )}
      >
        {building ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2"
                  onClick={() => setBuilding(false)}
                >
                  ← Back
                </Button>
              </div>
              <DialogTitle>Character builder</DialogTitle>
              <DialogDescription>
                Mix and match the options — accessories unlock with cumulative quiz points.
              </DialogDescription>
            </DialogHeader>

            {/* live preview + points + equipped flair */}
            <div className="flex items-center gap-4 rounded-xl border bg-secondary/40 p-3">
              <span className="relative inline-flex h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                <BuildAvatar build={draft} />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {draft.ac.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No accessories worn</span>
                  ) : (
                    draft.ac.map((id) => {
                      const a = ACCESSORIES.find((x) => x.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          <Sparkles className="h-3 w-3" aria-hidden />
                          {a?.name ?? id}
                          <button
                            type="button"
                            onClick={() => toggleAccessory(id)}
                            aria-label={`Take off ${a?.name ?? id}`}
                            className="ml-0.5 rounded-full hover:bg-primary/15"
                          >
                            <X className="h-3 w-3" aria-hidden />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {points === null ? (
                    'Teacher account — every accessory is unlocked.'
                  ) : (
                    <>
                      <span className="font-semibold text-foreground tabular-nums">
                        {points.toLocaleString('en-GB')}
                      </span>{' '}
                      cumulative points — earn more from quizzes for cooler flair.
                    </>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setDraft(randomBuild(points))}
                  >
                    <Dices className="h-3.5 w-3.5" aria-hidden /> Surprise me
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setDraft(defaultBuild())}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* category chips */}
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Character options">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    cat === c.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
                  )}
                >
                  <c.icon className="h-3.5 w-3.5" aria-hidden />
                  {c.label}
                </button>
              ))}
            </div>

            {/* option grids */}
            <div className="min-h-[150px]">
              {cat === 'gender' ? (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender presentation">
                  {GENDERS.map((g) => (
                    <OptionTile
                      key={g.id}
                      build={withOpt({ g: g.id, h: defaultHairIndex(g.id, draft.h) })}
                      label={g.name}
                      selected={draft.g === g.id}
                      onClick={() =>
                        patch({ g: g.id, h: defaultHairIndex(g.id, draft.h) })
                      }
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'size' ? (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Body size">
                  {SIZES.map((s) => (
                    <OptionTile
                      key={s.id}
                      build={withOpt({ sz: s.id })}
                      label={s.name}
                      selected={draft.sz === s.id}
                      onClick={() => patch({ sz: s.id })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'skin' ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Skin tone">
                  {SKINS.map((s, i) => (
                    <OptionTile
                      key={s.id}
                      build={withOpt({ sk: i })}
                      label={s.name}
                      selected={draft.sk === i}
                      onClick={() => patch({ sk: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'hair' ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Hair style">
                  {HAIRS.map((h, i) => (
                    <OptionTile
                      key={h.id}
                      build={withOpt({ h: i })}
                      label={h.name}
                      selected={draft.h === i}
                      onClick={() => patch({ h: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'haircolor' ? (
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Hair colour">
                  {HAIR_COLORS.map((c, i) => (
                    <SwatchTile
                      key={c.id}
                      hex={c.hex}
                      label={c.name}
                      selected={draft.hc === i}
                      onClick={() => patch({ hc: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'eyes' ? (
                <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Eye style">
                  {EYES.map((e, i) => (
                    <OptionTile
                      key={e.id}
                      build={withOpt({ e: i })}
                      label={e.name}
                      selected={draft.e === i}
                      onClick={() => patch({ e: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'clothes' ? (
                <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Outfit">
                  {CLOTHES.map((c, i) => (
                    <OptionTile
                      key={c.id}
                      build={withOpt({ c: i })}
                      label={c.name}
                      selected={draft.c === i}
                      onClick={() => patch({ c: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'clothescolor' ? (
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Outfit colour">
                  {CLOTHES_COLORS.map((c, i) => (
                    <SwatchTile
                      key={c.id}
                      hex={c.hex}
                      label={c.name}
                      selected={draft.cc === i}
                      onClick={() => patch({ cc: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'backdrop' ? (
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Backdrop colour">
                  {BGS.map((b, i) => (
                    <SwatchTile
                      key={b.id}
                      hex={b.hex}
                      label={b.name}
                      selected={draft.bg === i}
                      onClick={() => patch({ bg: i })}
                    />
                  ))}
                </div>
              ) : null}

              {cat === 'extras' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Accessories">
                  {ACCESSORIES.map((a) => (
                    <AccessoryTile
                      key={a.id}
                      id={a.id}
                      name={a.name}
                      cost={a.cost}
                      equipped={draft.ac.includes(a.id)}
                      unlocked={accessoryUnlocked(a.id, points)}
                      points={points}
                      preview={
                        draft.ac.includes(a.id)
                          ? withOpt({ ac: draft.ac.filter((x) => x !== a.id) })
                          : withOpt({ ac: [...draft.ac, a.id].slice(-MAX_ACCESSORIES) })
                      }
                      onToggle={() => toggleAccessory(a.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-[var(--danger)]" role="alert">{error}</p> : null}

            <DialogFooter>
              <Button variant="ghost" onClick={() => setBuilding(false)}>Cancel</Button>
              <Button onClick={() => void save(buildAvatarString(draft))} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                {busy ? 'Saving…' : 'Save character'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Your profile picture</DialogTitle>
              <DialogDescription>
                Build your own character, pick one from the cast, upload a photo or choose an emoji.
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
                  ) : staged?.startsWith('build:') && parseBuild(staged) ? (
                    <span className="relative inline-flex h-20 w-20 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                      <BuildAvatar build={parseBuild(staged)!} />
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
                    : staged?.startsWith('build:')
                      ? 'Your own custom character.'
                      : staged
                        ? 'Looking good.'
                        : `Currently your initials — ${initialsOf(name)}`}
                </div>
              </div>

              {/* characters + the builder entry tile */}
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

                {/* build-your-own entry */}
                <button
                  type="button"
                  onClick={() => {
                    const existing = myAvatar?.startsWith('build:') ? parseBuild(myAvatar) : null;
                    setDraft(existing ?? defaultBuild());
                    setCat('gender');
                    setBuilding(true);
                    setError(null);
                  }}
                  className={cn(
                    'mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-all hover:border-primary/50 hover:bg-secondary/50 active:scale-[0.99]',
                    staged?.startsWith('build:') && 'border-primary/60 bg-primary/5'
                  )}
                >
                  <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-primary/25 bg-primary/5">
                    {staged?.startsWith('build:') && parseBuild(staged) ? (
                      <BuildAvatar build={parseBuild(staged)!} />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <Plus className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Build your own character
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Gender, size, skin, hair, eyes, outfit — plus accessories that unlock with points.
                    </span>
                  </span>
                </button>
              </div>

              {/* upload + camera */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload a picture"
                onChange={(e) => void pickFile(e.target.files?.[0])}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                aria-label="Take a photo"
                onChange={(e) => void pickFile(e.target.files?.[0])}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={processing}>
                  <ImagePlus className="h-4 w-4" aria-hidden /> Upload a picture
                </Button>
                <Button variant="outline" onClick={() => cameraRef.current?.click()} disabled={processing}>
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="h-4 w-4" aria-hidden />
                  )}
                  Take a photo
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2 px-1">
                Pick one from your device or snap a new one — it is cropped to a square and shrunk before it is saved.
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
          </>
        )}
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
