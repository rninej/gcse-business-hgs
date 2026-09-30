// Password helpers: scrypt hashing for verification, AES-GCM reversible storage
// (so teachers can always see/reset student logins), and memorable password
// generation in the form wordwordnumber, e.g. "braveotter23".
import { createCipheriv, createDecipheriv, randomInt, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ---------- reversible storage (teacher-visible passwords) ---------- */

const ENC_KEY = scryptSync(process.env.SESSION_SECRET || 'hgs-business-dev-secret-change-me', 'hgs-pw-enc', 32);

/** Encrypt a password so the teacher can view it later. Format: iv.tag.ct (base64url) */
export function encryptPassword(password: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const ct = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64url'), tag.toString('base64url'), ct.toString('base64url')].join('.');
}

/** Decrypt a teacher-visible password. Returns null for legacy rows without one. */
export function decryptPassword(enc: string | undefined | null): string | null {
  if (!enc) return null;
  try {
    const [ivB, tagB, ctB] = enc.split('.');
    if (!ivB || !tagB || !ctB) return null;
    const decipher = createDecipheriv('aes-256-gcm', ENC_KEY, Buffer.from(ivB, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB, 'base64url'));
    const pt = Buffer.concat([decipher.update(Buffer.from(ctB, 'base64url')), decipher.final()]);
    return pt.toString('utf8');
  } catch {
    return null;
  }
}

/* ---------- memorable password generation ---------- */

// School-safe, British English, easy to spell and read aloud.
const ADJECTIVES = [
  'brave', 'calm', 'clever', 'eager', 'fancy', 'gentle', 'happy', 'jolly',
  'kind', 'lively', 'merry', 'neat', 'polite', 'proud', 'quiet', 'rapid',
  'silly', 'smart', 'sunny', 'tidy', 'witty', 'bright', 'cheerful', 'cosy',
  'dizzy', 'eager', 'fresh', 'giant', 'humble', 'ideal', 'jolly', 'keen',
  'lucky', 'mellow', 'noble', 'plucky', 'royal', 'sharp', 'smooth', 'snappy',
  'sparkly', 'steady', 'super', 'sweet', 'trusted', 'warm', 'wise', 'zesty',
];

const NOUNS = [
  'otter', 'badger', 'falcon', 'puffin', 'dolphin', 'beaver', 'corgi', 'ferret',
  'hedgehog', 'kingfisher', 'lapwing', 'mole', 'newt', 'owl', 'panda', 'quail',
  'robin', 'seal', 'stoat', 'vole', 'weasel', 'heron', 'kitten', 'lamb',
  'mole', 'pony', 'puppy', 'rabbit', 'shrew', 'squirrel', 'starling', 'stoat',
  'swift', 'tiger', 'vixen', 'whale', 'wren', 'fox', 'hare', 'deer',
  'bee', 'moth', 'crab', 'ray', 'cod', 'owl', 'elk', 'ram',
];

function pick<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

/** Memorable password like "braveotter23" — easy to hand out and type, no symbols. */
export function memorablePassword(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${String(randomInt(10, 99))}`;
}

export function randomPassword(_len = 7): string {
  return memorablePassword();
}

export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');
}
