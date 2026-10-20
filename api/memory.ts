import type { IncomingMessage, ServerResponse } from 'node:http';
import { dbConfig, reply, requireMemoryRole, setup } from './_lib/security.js';

/** Chỉ trả về MỘT lời nhắn đã chọn ở Vercel env; không cho client duyệt toàn bộ DB. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method !== 'GET') return reply(res, 405, { error: 'Method not allowed' });
  if (!requireMemoryRole(req, res)) return;
  const db = dbConfig();
  const url = db?.url;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const id = process.env.MEMORY_MESSAGE_ID;
  if (!url || !key || !id || !/^\d+$/.test(id)) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Chưa cấu hình MEMORY_MESSAGE_ID / Supabase server env' }));
    return;
  }
  try {
    const apiUrl = new URL('/rest/v1/love_messages', url);
    apiUrl.searchParams.set('select', 'message,image_url,created_at');
    apiUrl.searchParams.set('id', `eq.${id}`);
    apiUrl.searchParams.set('limit', '1');
    const response = await fetch(apiUrl, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    const list = await response.json() as Array<{ message: string; image_url: string | null; created_at: string }>;
    res.statusCode = 200;
    res.end(JSON.stringify({ memory: list[0] ?? null }));
  } catch {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Không lấy được kỷ niệm' }));
  }
}
