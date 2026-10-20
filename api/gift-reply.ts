import type { IncomingMessage, ServerResponse } from 'node:http';
import { hasGiftSession } from './_lib/gift-security.js';
import { dbConfig, readJson, reply, safeOrigin, setup } from './_lib/security.js';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed' });
  if (!hasGiftSession(req)) return reply(res, 401, { error: 'Cần xác nhận quyền gửi thư' });
  if (!safeOrigin(req)) return reply(res, 403, { error: 'Origin không hợp lệ' });
  const db = dbConfig();
  if (!db) return reply(res, 503, { error: 'Chưa cấu hình Supabase server env' });
  try {
    const body = await readJson(req, 8_192);
    const senderName = typeof body?.sender_name === 'string' ? body.sender_name.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const mood = typeof body?.mood === 'string' ? body.mood.trim() : '';
    const image = body?.image_url;
    if (senderName.length < 1 || senderName.length > 60 || message.length < 1 || message.length > 2000 ||
      mood.length < 1 || mood.length > 100 || !uuidPattern.test(body?.submission_id || '') ||
      !uuidPattern.test(body?.session_id || '') ||
      (image !== null && (typeof image !== 'string' || image.length > 1000 ||
      !/^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\//.test(image)))) {
      return reply(res, 400, { error: 'Nội dung lời nhắn không hợp lệ' });
    }
    const url = new URL('/rest/v1/love_messages', db.url);
    const response = await fetch(url, {
      method: 'POST', headers: { ...db.headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ sender_name: senderName, message, mood, image_url: image, submission_id: body.submission_id, session_id: body.session_id }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 409) return reply(res, 200, { ok: true, duplicate: true });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    return reply(res, 201, { ok: true });
  } catch { return reply(res, 502, { error: 'Chưa gửi được lời nhắn, Em thử lại nha.' }); }
}
