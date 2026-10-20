import type { IncomingMessage, ServerResponse } from 'node:http';
import { clearGiftSession, giftConfigured, giftThrottle, hasGiftSession, issueGiftSession, resetGiftThrottle, verifyGiftPassword } from './_lib/gift-security.js';
import { readJson, reply, safeOrigin, setup } from './_lib/security.js';
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method === 'GET') return reply(res, 200, { authenticated: hasGiftSession(req) });
  if (req.method !== 'POST' && req.method !== 'DELETE') return reply(res, 405, { error: 'Method not allowed' });
  if (!safeOrigin(req)) return reply(res, 403, { error: 'Origin không hợp lệ' });
  if (req.method === 'DELETE') { clearGiftSession(res); return reply(res, 200, { authenticated: false }); }
  if (!giftConfigured()) return reply(res, 503, { error: 'Chưa cấu hình khóa gửi thư' });
  if (giftThrottle(req)) return reply(res, 429, { error: 'Thử nhiều lần rồi, Em đợi 15 phút nhé.' });
  try {
    const body = await readJson(req, 1024);
    if (typeof body?.password !== 'string' || !verifyGiftPassword(body.password)) return reply(res, 401, { error: 'Mật khẩu gửi thư chưa đúng.' });
    resetGiftThrottle(req);
    issueGiftSession(res);
    return reply(res, 200, { authenticated: true });
  } catch { return reply(res, 400, { error: 'Yêu cầu không hợp lệ' }); }
}
