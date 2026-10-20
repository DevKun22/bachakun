import type { IncomingMessage, ServerResponse } from 'node:http';
import { dbConfig, readJson, reply, requireMemoryRole, safeOrigin, setup } from './_lib/security.js';

type Role = 'anh' | 'em';
const isRole = (value: unknown): value is Role => value === 'anh' || value === 'em';
const isPhotoKey = (value: unknown): value is string => typeof value === 'string' && (value === 'first' || /^entry:[1-9]\d*:[0-5]$/.test(value));
const fetchChecked = async (url: URL, headers: Record<string,string>, init: RequestInit = {}) => {
  const response = await fetch(url, { ...init, headers: {...headers,...(init.headers as Record<string,string> ?? {})}, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`DATABASE_${response.status}`);
  return response.json();
};
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method !== 'GET' && req.method !== 'POST') return reply(res, 405, {error:'Method not allowed'});
  const role = requireMemoryRole(req,res); if (!role) return;
  if (req.method === 'POST' && !safeOrigin(req)) return reply(res, 403, {error:'Origin không hợp lệ'});
  const db = dbConfig();
  if (!db) return reply(res, 503, {error:'Thiếu cấu hình Supabase server'});
  try {
    if (req.method === 'GET') {
      const likesUrl = new URL('/rest/v1/memory_photo_likes', db.url);
      likesUrl.searchParams.set('select', 'photo_key,liker_role'); likesUrl.searchParams.set('limit','1000');
      const stampUrl = new URL('/rest/v1/memory_love_stamps', db.url);
      stampUrl.searchParams.set('select','photo_key,stamped_at'); stampUrl.searchParams.set('limit','1000');
      const [likes,stamps] = await Promise.all([
        fetchChecked(likesUrl,db.headers), fetchChecked(stampUrl,db.headers)
      ]);
      return reply(res,200,{likes,stamps});
    }
    const input = await readJson(req,1024);
    const {photo_key,liker_role,liked} = input ?? {};
    if (!isPhotoKey(photo_key) || typeof liked !== 'boolean')
      return reply(res,400,{error:'Dữ liệu thả tim không hợp lệ'});
    const firstId = process.env.MEMORY_MESSAGE_ID;
    if (!firstId || !/^\d+$/.test(firstId)) return reply(res,503,{error:'Thiếu MEMORY_MESSAGE_ID'});
    const endpoint = new URL('/rest/v1/rpc/memory_set_love',db.url);
    const result = await fetchChecked(endpoint,db.headers,{method:'POST',body:JSON.stringify({p_photo_key:photo_key,p_role:role,p_liked:liked,p_first_id:Number(firstId)})});
    if (!result || !Array.isArray(result.roles)) throw new Error('INVALID_RPC_RESPONSE');
    return reply(res,200,{
      ok:true, photo_key, likes:result.roles.map((role:Role)=>({photo_key,liker_role:role})),
      stamp:result.stamped_at ? {photo_key,stamped_at:result.stamped_at} : null,
      justStamped:result.just_stamped === true,
    });
  } catch (error) {
    console.error('memory-likes failed:',error instanceof Error ? error.message : 'unknown');
    return reply(res,502,{error:'Chibi chưa cập nhật được tim, thử lại nha 🥺'});
  }
}
