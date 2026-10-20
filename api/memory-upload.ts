import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { readJson, reply, requireMemoryRole, safeOrigin, setup } from './_lib/security.js';
/** Authorized signed Cloudinary upload params; no unsigned public preset needed. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setup(res);
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed' });
  if (!requireMemoryRole(req, res)) return;
  if (!safeOrigin(req)) return reply(res, 403, { error: 'Origin không hợp lệ' });
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return reply(res, 503, { error: 'Thiếu Cloudinary server env' });
  try {
    await readJson(req, 256);
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'bap-kunn-test/memories';
    const params = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash('sha1').update(params + secret).digest('hex');
    return reply(res, 200, { cloudName, apiKey, folder, timestamp, signature });
  } catch { return reply(res, 400, { error: 'Yêu cầu không hợp lệ' }); }
}
