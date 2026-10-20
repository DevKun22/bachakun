import type { IncomingMessage,ServerResponse } from 'node:http';
import {dbConfig,readJson,reply,requireMemoryRole,safeOrigin,setup} from './_lib/security.js';
const TYPES=['archive_visit','photo_view','stamp_replay'] as const;
export default async function handler(req:IncomingMessage,res:ServerResponse){
 setup(res);
 if(req.method!=='POST') return reply(res,405,{error:'Method not allowed'});
 const role=requireMemoryRole(req,res); if(!role) return;
 if(!safeOrigin(req)) return reply(res,403,{error:'Origin không hợp lệ'});
 const db=dbConfig(); if(!db) return reply(res,503,{error:'Thiếu Supabase server env'});
 try{
  const data=await readJson(req,1024);
  const type=data?.event_type;
  const photo=data?.photo_key;
  if(!TYPES.includes(type) || typeof data?.event_id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.event_id) || (type==='archive_visit' ? photo != null : !(photo==='first'||typeof photo==='string'&&/^entry:[1-9]\d*:[0-5]$/.test(photo)))) return reply(res,400,{error:'Sự kiện không hợp lệ'});
  const response=await fetch(new URL('/rest/v1/memory_activity_events',db.url),{method:'POST',headers:{...db.headers,Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({event_id:data.event_id,actor_role:role,event_type:type,photo_key:type==='archive_visit'?null:photo}),signal:AbortSignal.timeout(8000)});
  if(!response.ok) throw Error(`DATABASE_${response.status}`);
  return reply(res,200,{ok:true});
 }catch{return reply(res,502,{error:'Chibi chưa ghi được lượt xem'});}
}
