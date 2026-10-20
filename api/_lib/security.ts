import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Vercel supplies env in production. Local fallback must never override it.
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.vercel.local' });
  config({ path: '.env.local' });
}
const COOKIE = 'bk_memory_session';
const WEEK = 7 * 24 * 3600;
const attempts = new Map<string, { n: number; until: number }>();
const key = () => process.env.MEMORY_SESSION_SECRET || '';
const mac = (value: string) => createHmac('sha256', key()).update(value).digest('base64url');
const eq = (a: string, b: string) => {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
export function setup(res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}
export function reply(res: ServerResponse, status: number, value: unknown) {
  res.statusCode = status;
  res.end(JSON.stringify(value));
}
export function verifyPassword(password: string) {
  const stored = process.env.MEMORY_PASSWORD_HASH || '';
  const [kind, salt, hex] = stored.split('$');
  if (kind !== 'scrypt' || !salt || !hex || password.length > 256) return false;
  try { return eq(scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex'), hex); }
  catch { return false; }
}
export function isAuthenticated(req: IncomingMessage) {
  if (key().length < 32) return false;
  const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const [expiry, nonce, signature, ...extra] = token.split('.');
  if (extra.length || !expiry || !nonce || !signature || !/^\d+$/.test(expiry)) return false;
  if (Number(expiry) < Math.floor(Date.now() / 1000)) return false;
  return eq(signature, mac(`${expiry}.${nonce}`));
}
export function setSession(res: ServerResponse) {
  const expiry = Math.floor(Date.now() / 1000) + WEEK;
  const payload = `${expiry}.${randomBytes(24).toString('base64url')}`;
  const cookie = `${COOKIE}=${payload}.${mac(payload)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${WEEK}${process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);
}
export function clearSession(res: ServerResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`);
}
export function requireSession(req: IncomingMessage, res: ServerResponse) {
  if (isAuthenticated(req)) return true;
  reply(res, 401, { error: 'Cần mở khóa Góc kỷ niệm trước nha.' });
  return false;
}
export function safeOrigin(req: IncomingMessage) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try { return new URL(origin).host === req.headers.host && ['http:', 'https:'].includes(new URL(origin).protocol); }
  catch { return false; }
}
// In-memory throttle is supplemental only: serverless instances do not share state.
export function throttle(req: IncomingMessage) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const hashed = createHmac('sha256', key() || 'local-only').update(ip).digest('hex');
  const now = Date.now();
  if (attempts.size > 2000) attempts.clear();
  const entry = attempts.get(hashed);
  if (entry && entry.until > now && entry.n >= 5) return true;
  attempts.set(hashed, { n: entry?.until && entry.until > now ? entry.n + 1 : 1, until: now + 15 * 60_000 });
  return false;
}
export function resetThrottle(req: IncomingMessage) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  attempts.delete(createHmac('sha256', key() || 'local-only').update(ip).digest('hex'));
}
export async function readJson(req: IncomingMessage, limit = 16_384): Promise<any> {
  // Vercel Node runtime may pre-parse JSON and consume the request stream.
  const preParsed = (req as IncomingMessage & { body?: unknown }).body;
  if (preParsed !== undefined) {
    const value = typeof preParsed === 'string' ? JSON.parse(preParsed) : preParsed;
    if (Buffer.byteLength(JSON.stringify(value)) > limit) throw new Error('TOO_LARGE');
    return value;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw) > limit) throw new Error('TOO_LARGE');
  }
  return JSON.parse(raw);
}
export function dbConfig() {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret || !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)) return null;
  return { url, headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' } };
}

// Role is bound to the signed memory-session token; user cannot change it from the browser.
export type MemoryRole = 'anh' | 'em';
const ROLE_COOKIE = 'bk_memory_role_v66';
const sessionToken = (req: IncomingMessage) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || '';
export function selectedMemoryRole(req: IncomingMessage): MemoryRole | null {
  if (!isAuthenticated(req)) return null;
  const token = (req.headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${ROLE_COOKIE}=`))?.slice(ROLE_COOKIE.length+1);
  if (!token) return null;
  const [role, sig, ...rest] = token.split('.');
  if (rest.length || (role !== 'anh' && role !== 'em') || !sig) return null;
  return eq(sig, mac(`role:${sessionToken(req)}:${role}`)) ? role : null;
}
export function setMemoryRole(req: IncomingMessage, res: ServerResponse, role: MemoryRole) {
  const value = `${role}.${mac(`role:${sessionToken(req)}:${role}`)}`;
  res.setHeader('Set-Cookie', `${ROLE_COOKIE}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${WEEK}${process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? '; Secure' : ''}`);
}
export function clearMemoryRole(res: ServerResponse) {
  res.setHeader('Set-Cookie', `${ROLE_COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`);
}
export function requireMemoryRole(req: IncomingMessage, res: ServerResponse): MemoryRole | null {
  if (!requireSession(req, res)) return null;
  const role = selectedMemoryRole(req);
  if (!role) reply(res, 403, { error: 'Chibi chưa biết ai đang ghé, chọn vai trò trước nha.' });
  return role;
}
