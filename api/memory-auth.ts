import type { IncomingMessage, ServerResponse } from 'node:http';
import { clearSession, clearMemoryRole, isAuthenticated, readJson, reply, resetThrottle, safeOrigin, setSession, setup, throttle, verifyPassword } from './_lib/security.js';
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method === 'GET') return reply(res, 200, { authenticated: isAuthenticated(req) });
  if (!['POST', 'DELETE'].includes(req.method || '')) return reply(res, 405, { error: 'Method not allowed' });
  if (!safeOrigin(req)) return reply(res, 403, { error: 'Origin không hợp lệ' });
  if (req.method === 'DELETE') { clearSession(res); /* Both cookies expire in same response */ res.setHeader('Set-Cookie', [`bk_memory_session=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`, `bk_memory_role_v66=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`]); return reply(res, 200, { authenticated: false }); }
  if (!process.env.MEMORY_PASSWORD_HASH || (process.env.MEMORY_SESSION_SECRET || '').length < 32) return reply(res, 503, { error: 'Server chưa cấu hình khóa Góc kỷ niệm' });
  if (throttle(req)) return reply(res, 429, { error: 'Đã thử nhiều lần. Em đợi 15 phút nha.' });
  try {
    const body = await readJson(req, 1024);
    if (typeof body?.password !== 'string' || !verifyPassword(body.password)) return reply(res, 401, { error: 'Mật khẩu chưa đúng nha Em.' });
    resetThrottle(req);
    setSession(res);
    return reply(res, 200, { authenticated: true });
  } catch { return reply(res, 400, { error: 'Yêu cầu không hợp lệ' }); }
}
