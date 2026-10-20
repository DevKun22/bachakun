# Bắp ❤️ Bà Chã — cấu hình màn lưu niệm

## Bật/tắt giao diện
Sửa `src/data/displaySettings.ts` rồi deploy lại Vercel.
- `mode: 'auto'`: từ **00:00 ngày 21/10/2026 giờ Việt Nam** mở màn kỷ niệm; trước đó là món quà.
- `mode: 'gift'`: luôn hiện trải nghiệm quà (dùng để thử nghiệm).
- `mode: 'memories'`: luôn hiện màn kỷ niệm, không cần đợi hết 20/10.
- `memories.showLoveClock`, `showMessage`, `showPhoto`, `showPromise`, `showChibiNote`: bật/tắt từng phần.
- Text tùy chỉnh ngay trong `memories`.

## Cấu hình Supabase để hiện lời nhắn cũ
Trong Supabase Table Editor > `love_messages`, tìm **id đúng của lời nhắn Em đã gửi**.
Trên **Vercel > Project > Settings > Environment Variables**, thêm:
- `SUPABASE_URL`: Project URL, **không** có `/rest/v1`.
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key từ Supabase (KHÔNG bắt đầu `VITE_`, không đưa vào git).
- `MEMORY_MESSAGE_ID`: id dạng số của lời nhắn được phép xuất hiện công khai trên website.

Giữ 4 biến `VITE_` Supabase/Cloudinary đang chạy ở frontend. Sau khi thêm env server, **Redeploy**. Thử `https://your-domain.vercel.app/api/memory` xem trả `memory` (không hiện tất cả tin nhắn).

**Quyền riêng tư:** Bản ghi được chọn sẽ xuất hiện trên website cho mọi người có URL. Chỉ bật `showMessage`/`showPhoto` nếu Em đồng ý công khai nội dung và ảnh. Không cấp SELECT cho anon; API server dùng khóa riêng và chỉ trả một dòng đã chọn. Nếu muốn link thật sự riêng tư, cần thêm xác thực phía server.

## Chạy
- `npm install`
- `npm run lint`
- `npm run build`
- `npm run dev`

Ở localhost, Vite không tự chạy endpoint Vercel `/api/memory`; sử dụng `vercel dev` với env đã cấu hình hoặc xem thử giao diện bằng `mode: 'memories'` (API báo chưa cấu hình).

Bản ZIP cố ý không chứa `.env.local`, `.git` hay `dist` của bản upload.
