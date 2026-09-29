// HMAC-signed cookie sessions for teacher & student accounts
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { Role, SessionInfo } from './types';

const SECRET = process.env.SESSION_SECRET || 'hgs-business-dev-secret-change-me';
export const COOKIE = 'hgs_sess';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface Payload extends SessionInfo {
  exp: number;
}

function b64u(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function makeToken(info: SessionInfo): string {
  const payload: Payload = { ...info, exp: Date.now() + MAX_AGE * 1000 };
  const body = b64u(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function readToken(token: string | undefined): SessionInfo | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Payload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return {
      uid: payload.uid,
      role: payload.role,
      name: payload.name,
      sub: payload.sub,
      classId: payload.classId,
      className: payload.className,
    };
  } catch {
    return null;
  }
}

export async function currentSession(): Promise<SessionInfo | null> {
  const jar = await cookies();
  return readToken(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(info: SessionInfo): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(info), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function requireRole(role: Role): Promise<SessionInfo | null> {
  const s = await currentSession();
  if (!s || s.role !== role) return null;
  return s;
}
