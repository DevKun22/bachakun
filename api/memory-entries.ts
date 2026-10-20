import type { IncomingMessage, ServerResponse } from 'node:http';
import { dbConfig, readJson, reply, requireMemoryRole, safeOrigin, setup } from './_lib/security.js';

type Entry = { id: number; message: string | null; image_urls: string[]; created_at: string };
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (!['GET', 'POST'].includes(req.method || '')) return reply(res, 405, { error: 'Method not allowed' });
  const actorRole = requireMemoryRole(req,res); if (!actorRole) return;
  if (req.method === 'POST' && !safeOrigin(req)) return reply(res, 403, { error: 'Origin không hợp lệ' });
  const db = dbConfig();
  if (!db) return reply(res, 503, { error: 'Chưa cấu hình Supabase server env' });
  const { url, headers } = db;
  if (req.method === 'POST') {
    try {
      const body = await readJson(req, 8192);
      const message = typeof body?.message === 'string' ? body.message.trim() : '';
      const images = body?.image_urls;
      const uuid = body?.submission_id;
      if (message.length > 500 || !Array.isArray(images) || images.length > 6 ||
          images.some((x: unknown) => typeof x !== 'string' || x.length > 1000 || !/^https:\/\/res\.cloudinary\.com\//.test(x)) ||
          (message.length === 0 && images.length === 0) ||
          typeof uuid !== 'string' || !/^[a-f0-9-]{36}$/i.test(uuid)) return reply(res, 400, { error: 'Nội dung hoặc ảnh không hợp lệ' });
      const endpoint = new URL('/rest/v1/memory_entries', url);
      const response = await fetch(endpoint, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ message: message || null, image_urls: images, submission_id: uuid, actor_role: actorRole }), signal: AbortSignal.timeout(8000) });
      if (response.status === 409) return reply(res, 409, { error: 'Kỷ niệm đã được gửi trước đó' });
      if (!response.ok) throw new Error(`Supabase ${response.status}`);
      return reply(res, 201, { ok: true });
    } catch (error) { return reply(res, error instanceof SyntaxError ? 400 : 502, { error: 'Chưa lưu được kỷ niệm' }); }
  }
  try {
    const endpoint = new URL('/rest/v1/memory_entries', url);
    endpoint.searchParams.set('select', 'id,message,image_urls,created_at,actor_role');
    endpoint.searchParams.set('order', 'created_at.desc');
    endpoint.searchParams.set('limit', '48');
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    const entries = await response.json() as Entry[];
    res.statusCode = 200;
    res.end(JSON.stringify({ entries }));
  } catch {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Chưa thể mở album kỷ niệm' }));
  }
}
