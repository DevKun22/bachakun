# V6.6 — Mobile-first, role-bound session & activity log (TEST ONLY)

## Chạy thử an toàn
1. Giải nén riêng; **không** chép `.env` production hay service role key lên GitHub.
2. Trong Supabase **test_2010**, sau các migration V6.5, chạy `supabase/v6_6_roles_activity_test.sql` một lần. Không chạy trong database thật.
3. Các biến V6.5 giữ nguyên nhưng phải trỏ vào `test_2010`; upload ảnh dùng Cloudinary test.
4. `npm install`, `npm run lint`, `npm run build`, `npx vercel dev`.
5. Trong `displaySettings.ts`, test `mode: 'memories'`. Production để `auto` và `showMemoriesButtonInEnding: false`.

## Luồng
- MemoryLogin → MemoryRoleGate (chọn **một lần** Ăm Chã/Bà Chã) → MemoryArchive.
- Vai trò ở cookie **HttpOnly được ký gắn với Memory Session**. API `memory-likes`, `memory-entries`, `memory`, `memory-upload`, `memory-activity` phải có vai trò. Reload không chọn lại. Logout kết thúc phiên; lần sau chọn mới.
- `memory_entries.actor_role` ở bản ghi cũ = NULL. Không tự suy diễn người gửi cũ.
- Log: `archive_visit` (một event_id trong cùng tab cho mỗi lần vào), `photo_view` (khi mở/chuyển ảnh), `stamp_replay` (nhấn con dấu). Không lưu IP, mật khẩu, nội dung thư hay ảnh trong log. Bảng chỉ service role truy cập.
- Tim nhanh (optimistic) + RPC và dấu thương vĩnh viễn của V6.5 vẫn được giữ.

## Hạn chế cần khắc phục trước Production
- Dùng chung mật khẩu nên chọn vai trò **chỉ là tự khai báo**, không xác minh người thật.
- Rate limit xác thực vẫn in-memory, cần giới hạn tập trung; ảnh Cloudinary public URL chưa riêng tư.
- Activity API có giới hạn kích thước, same-origin, khóa idempotency và role từ cookie, nhưng **chưa có rate limit phân tán**, có thể bị spam bởi người đã đăng nhập. Không công khai dashboard trước khi hoàn thiện.
- SessionStorage bảo đảm một visit/tab khi reload; không đại diện số khách duy nhất.
- Chưa chạy full build ở môi trường phát triển này do npm dependencies không có trong cache. Bắt buộc chạy lint/build & kiểm thử API/UX trên Windows trước khi deploy.

## Bài test tối thiểu
- Đăng nhập sai/đúng; chọn vai trò 1 lần; reload; logout và đăng nhập lại.
- Thử POST tim với `liker_role` giả: server phải dùng vai trò cookie, không dùng giá trị client.
- Tạo kỷ niệm từ hai vai trò, xem `actor_role` đúng; bản ghi cũ không bị sửa.
- Bấm xem ảnh, chuyển ảnh, xem lại dấu, kiểm tra `memory_activity_events`.
- Test trên mobile 360px; mất mạng; không ảnh hưởng API quà 20/10.
