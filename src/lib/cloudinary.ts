/** Upload signed by an authenticated Vercel API. The API secret never reaches browser. */
export async function uploadPhoto(file: File, purpose: 'memory' | 'gift' = 'memory'): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error('Chỉ chọn JPG, PNG, WebP và không quá 5 MB mỗi ảnh nha.');
  }
  const signatureRes = await fetch(purpose === 'gift' ? '/api/gift-upload' : '/api/memory-upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: '{}',
  });
  if (!signatureRes.ok) throw new Error(signatureRes.status === 401 ? (purpose === 'gift' ? 'Em cần xác nhận quyền gửi thư trước.' : 'Em cần mở khóa Góc kỷ niệm trước.') : 'Chưa thể chuẩn bị tải ảnh.');
  const { cloudName, apiKey, folder, timestamp, signature } = await signatureRes.json() as {cloudName:string;apiKey:string;folder:string;timestamp:number;signature:string};
  const data = new FormData();
  data.append('file', file);
  data.append('api_key', apiKey);
  data.append('timestamp', String(timestamp));
  data.append('folder', folder);
  data.append('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body: data });
  if (!response.ok) throw new Error('Cloudinary chưa nhận được ảnh. Em thử lại nha.');
  const payload = await response.json() as {secure_url?:string;resource_type?:string};
  if (!payload.secure_url?.startsWith(`https://res.cloudinary.com/${cloudName}/`) || payload.resource_type !== 'image') throw new Error('Đường dẫn ảnh không hợp lệ.');
  return payload.secure_url;
}
