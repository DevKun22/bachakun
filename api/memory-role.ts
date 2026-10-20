import type { IncomingMessage, ServerResponse } from 'node:http';
import {isAuthenticated,selectedMemoryRole,setMemoryRole,readJson,reply,safeOrigin,setup} from './_lib/security.js';
export default async function handler(req: IncomingMessage,res: ServerResponse) {
 setup(res);
 if(req.method !== 'GET' && req.method !== 'POST') return reply(res,405,{error:'Method not allowed'});
 if(!isAuthenticated(req)) return reply(res,401,{error:'Cần mở khóa Góc nhỏ trước nha.'});
 if(req.method === 'GET') return reply(res,200,{role:selectedMemoryRole(req)});
 if(!safeOrigin(req)) return reply(res,403,{error:'Origin không hợp lệ'});
 const existing = selectedMemoryRole(req);
 if(existing) return reply(res,409,{error:'Vai trò đã được chọn trong phiên này',role:existing});
 try {
  const data=await readJson(req,256);
  if(data?.role !== 'anh' && data?.role !== 'em') return reply(res,400,{error:'Vai trò không hợp lệ'});
  setMemoryRole(req,res,data.role);
  return reply(res,200,{role:data.role});
 }catch { return reply(res,400,{error:'Yêu cầu không hợp lệ'}); }
}
