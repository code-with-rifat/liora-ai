import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { cookies } from 'next/headers';

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = 'liora_session';
const ADMIN_COOKIE = 'liora_admin';
const MAX_AGE = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'liora-dev-secret';
}

function sign(payload: string) {
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function unsign(token: string | undefined | null): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  const a = Buffer.from(hash, 'hex');
  if (a.length !== derived.length) return false;
  return timingSafeEqual(a, derived);
}

export function encodeUserSession(user: SessionUser) {
  return sign(Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url'));
}

export function decodeUserSession(token: string | undefined | null): SessionUser | null {
  const payload = unsign(token);
  if (!payload) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser & { exp?: number };
    if (data.exp && data.exp < Date.now()) return null;
    if (!data.id || !data.email) return null;
    return { id: data.id, email: data.email, name: data.name || data.email, picture: data.picture };
  } catch {
    return null;
  }
}

export function encodeAdminSession() {
  return sign(Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + MAX_AGE * 1000 })).toString('base64url'));
}

export function isAdminToken(token: string | undefined | null) {
  const payload = unsign(token);
  if (!payload) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: string; exp?: number };
    if (data.exp && data.exp < Date.now()) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  };
}

export async function setUserCookie(user: SessionUser) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeUserSession(user), cookieOpts());
}

export async function clearUserCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encodeAdminSession(), cookieOpts());
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  return decodeUserSession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const jar = await cookies();
  return isAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
