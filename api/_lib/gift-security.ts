import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const COOKIE = 'bk_gift_session';
const TTL = 30 * 60;
const attempts = new Map<string, { count: number; until: number }>();
const secret = () => process.env.GIFT_SESSION_SECRET || '';
const equals = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');
export const giftConfigured = () => secret().length >= 32 && !!process.env.GIFT_PASSWORD_HASH;
export function verifyGiftPassword(password: string): boolean {
  const [kind, salt, hash] = (process.env.GIFT_PASSWORD_HASH || '').split('$');
  if (kind !== 'scrypt' || !salt || !hash || password.length < 12 || password.length > 256) return false;
  try { return equals(scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex'), hash); }
  catch { return false; }
}
export function hasGiftSession(req: IncomingMessage): boolean {
  if (secret().length < 32) return false;
  const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const [expiry, nonce, signature, ...rest] = token.split('.');
  if (rest.length || !expiry || !nonce || !signature || !/^\d+$/.test(expiry)) return false;
  if (Number(expiry) <= Date.now() / 1000) return false;
  return equals(signature, sign(`${expiry}.${nonce}`));
}
export function issueGiftSession(res: ServerResponse) {
  const expires = Math.floor(Date.now() / 1000) + TTL;
  const value = `${expires}.${randomBytes(24).toString('base64url')}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${value}.${sign(value)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${TTL}${process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? '; Secure' : ''}`);
}
export function clearGiftSession(res: ServerResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`);
}
export function giftThrottle(req: IncomingMessage): boolean {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const id = createHmac('sha256', secret() || 'local').update(ip).digest('hex');
  const now = Date.now();
  if (attempts.size > 2000) attempts.clear();
  const current = attempts.get(id);
  if (current && current.until > now && current.count >= 5) return true;
  attempts.set(id, { count: current && current.until > now ? current.count + 1 : 1, until: now + 15 * 60_000 });
  return false;
}
export function resetGiftThrottle(req: IncomingMessage) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  attempts.delete(createHmac('sha256', secret() || 'local').update(ip).digest('hex'));
}
