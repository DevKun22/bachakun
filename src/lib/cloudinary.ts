/** Uploads a selected photo to Cloudinary using an unsigned upload preset. */
export async function uploadPhoto(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error('Bắp chưa cấu hình Cloudinary.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Chỉ chọn ảnh JPG, PNG hoặc WebP nha.');
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('Ảnh phải nhỏ hơn 5 MB nha.');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: 'POST', body: form,
  });
  if (!response.ok) throw new Error('Không tải được ảnh lên Cloudinary. em thử lại nha!');
  const data: { secure_url?: string; resource_type?: string } = await response.json();
  if (!data.secure_url?.startsWith('https://res.cloudinary.com/') || data.resource_type !== 'image') {
    throw new Error('Cloudinary trả về ảnh không hợp lệ.');
  }
  return data.secure_url;
}
