// The character builder — a fully custom 2D avatar composed from layered
// options (gender presentation, body size, skin tone, hair style + colour,
// eye style, outfit style + colour, backdrop tint) plus point-locked
// accessories. This file is the SERVER-SAFE source of truth: option lists,
// the compact config shape and the validation maths. The SVG art that turns
// a config into a picture lives in components/characters.tsx.
//
// An avatar string looks like  build:{"g":"f","sz":"a","sk":2,"h":4,"hc":1,"e":0,"c":3,"cc":0,"bg":1,"ac":["cap"]}
// — a couple hundred bytes, stored in the same avatars/{uid} record as every
// other avatar kind.

export interface AvatarBuild {
  /** gender presentation: f = lashes, m = brows, x = neither */
  g: 'f' | 'm' | 'x';
  /** body size: p = petite, a = average, t = tall */
  sz: 'p' | 'a' | 't';
  /** skin tone index into SKINS */
  sk: number;
  /** hair style index into HAIRS */
  h: number;
  /** hair colour index into HAIR_COLORS */
  hc: number;
  /** eye style index into EYES */
  e: number;
  /** outfit style index into CLOTHES */
  c: number;
  /** outfit colour index into CLOTHES_COLORS */
  cc: number;
  /** backdrop tint index into BGS */
  bg: number;
  /** equipped accessory ids (point-unlocked, max MAX_ACCESSORIES) */
  ac: string[];
}

/* ---------------- option lists ---------------- */

export const GENDERS = [
  { id: 'f' as const, name: 'Girl' },
  { id: 'm' as const, name: 'Boy' },
  { id: 'x' as const, name: 'Either' },
];

export const SIZES = [
  { id: 'p' as const, name: 'Petite' },
  { id: 'a' as const, name: 'Average' },
  { id: 't' as const, name: 'Tall' },
];

export const SKINS = [
  { id: 'porcelain', name: 'Porcelain', skin: '#ffe3cd', shade: '#f2c9a6' },
  { id: 'sand', name: 'Sand', skin: '#f6cd9f', shade: '#e6b384' },
  { id: 'honey', name: 'Honey', skin: '#e7b088', shade: '#d49c72' },
  { id: 'almond', name: 'Almond', skin: '#c98a5e', shade: '#b0764d' },
  { id: 'chestnut', name: 'Chestnut', skin: '#a0714a', shade: '#8a5f3d' },
  { id: 'cocoa', name: 'Cocoa', skin: '#7a4a2b', shade: '#683f24' },
  { id: 'espresso', name: 'Espresso', skin: '#5f3a22', shade: '#4e2f1b' },
];

export const HAIRS = [
  { id: 'buzz', name: 'Buzz cut' },
  { id: 'short', name: 'Short' },
  { id: 'sidepart', name: 'Side part' },
  { id: 'fringe', name: 'Fringe' },
  { id: 'curly', name: 'Curly' },
  { id: 'afro', name: 'Afro' },
  { id: 'buns', name: 'Double buns' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'long', name: 'Long' },
  { id: 'bob', name: 'Bob' },
  { id: 'spiky', name: 'Spiky' },
  { id: 'twin', name: 'Twin tails' },
];

export const HAIR_COLORS = [
  { id: 'black', name: 'Black', hex: '#2d2118' },
  { id: 'darkbrown', name: 'Dark brown', hex: '#5b3a24' },
  { id: 'brown', name: 'Brown', hex: '#8a5a44' },
  { id: 'auburn', name: 'Auburn', hex: '#a0522d' },
  { id: 'ginger', name: 'Ginger', hex: '#d97706' },
  { id: 'blonde', name: 'Blonde', hex: '#e5b769' },
  { id: 'platinum', name: 'Platinum', hex: '#efe3c8' },
  { id: 'silver', name: 'Silver', hex: '#a8a29e' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6' },
  { id: 'pink', name: 'Pink', hex: '#f472b6' },
];

export const EYES = [
  { id: 'dot', name: 'Dot' },
  { id: 'big', name: 'Big' },
  { id: 'round', name: 'Round' },
  { id: 'sleepy', name: 'Sleepy' },
  { id: 'wink', name: 'Wink' },
  { id: 'happy', name: 'Happy' },
  { id: 'star', name: 'Stars' },
  { id: 'heart', name: 'Hearts' },
];

export const CLOTHES = [
  { id: 'tee', name: 'T-shirt' },
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'shirt', name: 'Shirt' },
  { id: 'jumper', name: 'Jumper' },
  { id: 'dress', name: 'Dress' },
  { id: 'blazer', name: 'Blazer' },
  { id: 'sporty', name: 'Sporty' },
  { id: 'tank', name: 'Tank top' },
];

export const CLOTHES_COLORS = [
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
  { id: 'orange', name: 'Orange', hex: '#ea580c' },
  { id: 'forest', name: 'Forest', hex: '#065f46' },
  { id: 'cream', name: 'Cream', hex: '#f8fafc' },
  { id: 'stone', name: 'Stone', hex: '#e7e5e4' },
  { id: 'charcoal', name: 'Charcoal', hex: '#44403c' },
];

export const BGS = [
  { id: 'mint', name: 'Mint', hex: '#d1fae5' },
  { id: 'cream', name: 'Cream', hex: '#fef3c7' },
  { id: 'blush', name: 'Blush', hex: '#ffe4e6' },
  { id: 'aqua', name: 'Aqua', hex: '#ccfbf1' },
  { id: 'peach', name: 'Peach', hex: '#ffedd5' },
  { id: 'pearl', name: 'Pearl', hex: '#f5f5f4' },
  { id: 'butter', name: 'Butter', hex: '#fef9c3' },
  { id: 'lime', name: 'Lime', hex: '#ecfccb' },
];

/** Accessories unlock with CUMULATIVE quiz points — the ladder is the point:
 * the more points earned, the cooler the accessory that can be worn. */
export interface AccessoryDef {
  id: string;
  name: string;
  /** cumulative points needed (teachers bypass the check) */
  cost: number;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: 'headband', name: 'Headband', cost: 100 },
  { id: 'cap', name: 'Baseball cap', cost: 250 },
  { id: 'glasses', name: 'Round glasses', cost: 400 },
  { id: 'flower', name: 'Flower clip', cost: 600 },
  { id: 'beanie', name: 'Beanie', cost: 800 },
  { id: 'shades', name: 'Sunglasses', cost: 1200 },
  { id: 'headphones', name: 'Headphones', cost: 2000 },
  { id: 'crown', name: 'Crown', cost: 3000 },
  { id: 'halo', name: 'Halo', cost: 4000 },
  { id: 'aura', name: 'Sparkle aura', cost: 5000 },
  { id: 'wizard', name: 'Wizard hat', cost: 7500 },
  { id: 'royal', name: 'Royal crown', cost: 10000 },
];

/** How many accessories can be worn at once. */
export const MAX_ACCESSORIES = 2;

/** A fresh, friendly default build. */
export function defaultBuild(): AvatarBuild {
  return { g: 'x', sz: 'a', sk: 1, h: 1, hc: 0, e: 0, c: 0, cc: 0, bg: 0, ac: [] };
}

/** Total cumulative points needed to wear every equipped accessory. */
export function accessoriesCost(ac: string[]): number {
  return ac.reduce((sum, id) => sum + (ACCESSORIES.find((a) => a.id === id)?.cost ?? 0), 0);
}

/** Is an accessory id valid and affordable? `points` null = no check
 *  (teachers — they have no points economy). */
export function accessoryUnlocked(id: string, points: number | null): boolean {
  const def = ACCESSORIES.find((a) => a.id === id);
  if (!def) return false;
  if (points === null) return true;
  return points >= def.cost;
}

/** Parse the `build:` payload of an avatar string. Returns null when it is
 *  not a build avatar or the JSON is malformed (callers fall back to
 *  initials rather than crash on legacy/hand-edited values). */
export function parseBuild(avatar: string): AvatarBuild | null {
  if (!avatar.startsWith('build:')) return null;
  try {
    const raw = JSON.parse(avatar.slice(6)) as Partial<AvatarBuild>;
    const b = defaultsFor(raw);
    if (!validBuild(b)) return null;
    return b;
  } catch {
    return null;
  }
}

function defaultsFor(raw: Partial<AvatarBuild>): AvatarBuild {
  return {
    g: raw.g ?? 'x',
    sz: raw.sz ?? 'a',
    sk: typeof raw.sk === 'number' ? raw.sk : 1,
    h: typeof raw.h === 'number' ? raw.h : 1,
    hc: typeof raw.hc === 'number' ? raw.hc : 0,
    e: typeof raw.e === 'number' ? raw.e : 0,
    c: typeof raw.c === 'number' ? raw.c : 0,
    cc: typeof raw.cc === 'number' ? raw.cc : 0,
    bg: typeof raw.bg === 'number' ? raw.bg : 0,
    ac: Array.isArray(raw.ac) ? raw.ac.filter((x): x is string => typeof x === 'string') : [],
  };
}

/** Structural validity — every index in range, ids known, list length OK. */
function validBuild(b: AvatarBuild): boolean {
  return (
    (b.g === 'f' || b.g === 'm' || b.g === 'x') &&
    (b.sz === 'p' || b.sz === 'a' || b.sz === 't') &&
    b.sk >= 0 && b.sk < SKINS.length &&
    b.h >= 0 && b.h < HAIRS.length &&
    b.hc >= 0 && b.hc < HAIR_COLORS.length &&
    b.e >= 0 && b.e < EYES.length &&
    b.c >= 0 && b.c < CLOTHES.length &&
    b.cc >= 0 && b.cc < CLOTHES_COLORS.length &&
    b.bg >= 0 && b.bg < BGS.length &&
    b.ac.length <= MAX_ACCESSORIES &&
    new Set(b.ac).size === b.ac.length &&
    b.ac.every((id) => ACCESSORIES.some((a) => a.id === id))
  );
}

/** Serialise a build to its avatar string. */
export function buildAvatarString(b: AvatarBuild): string {
  return `build:${JSON.stringify(b)}`;
}

/** Full server-side check of a candidate `build:` avatar value against a
 *  student's cumulative points (null for teachers → everything unlocked).
 *  Returns a normalised build on success, an error message otherwise. */
export function validateBuildAvatar(
  value: string,
  points: number | null
): { ok: true; build: AvatarBuild } | { ok: false; error: string } {
  const b = parseBuild(value);
  if (!b) return { ok: false, error: 'That custom character could not be read — try building it again.' };
  const locked = b.ac.filter((id) => !accessoryUnlocked(id, points));
  if (locked.length > 0) {
    const names = locked
      .map((id) => ACCESSORIES.find((a) => a.id === id)?.name ?? id)
      .join(', ');
    return {
      ok: false,
      error: `The ${names} accessory needs more points — earn more from quizzes first.`,
    };
  }
  return { ok: true, build: b };
}
