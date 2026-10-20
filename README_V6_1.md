# V6.1 — Tách Gift Session khỏi Memory Session (bản TEST)

## Những thay đổi
- Giữ nguyên toàn bộ luồng Intro → mở thư bằng ngày kỷ niệm → LoveLetter → Gift → Ending.
- Khi Em bấm **Gửi lời nhắn**, nếu chưa có Gift Session sẽ hiện hộp thoại mật khẩu gửi quà riêng; form và ảnh được giữ nguyên.
- `/api/gift-auth` kiểm tra `GIFT_PASSWORD_HASH` (scrypt), cấp cookie HttpOnly/SameSite=Strict sống 30 phút; độc lập hoàn toàn cookie Memory.
- `/api/gift-upload` ký ảnh vào folder `bap-kunn-test/gift`; `/api/gift-reply` ghi `love_messages` qua service role server.
- Không dùng API `/api/memory-upload` từ GiftAndReplySection nữa. Album, MemoryLogin, Chibi, confetti, EndingScreen và bật/tắt nút vẫn giữ nguyên.
- Không đưa secret vào frontend. Tài khoản test: `test_2010`.

## Cách chạy (trên Windows / PowerShell)
1. **Giải nén riêng**, không ghi đè bản V6. `npm install`.
2. Chạy `node scripts/hash-gift-password.mjs`. Tạo **mật khẩu gửi quà mới**, khác ngày kỷ niệm và nên khác mật khẩu Memory. Lấy `GIFT_PASSWORD_HASH` và `GIFT_SESSION_SECRET`, thêm vào **Vercel Development**, không vào biến `VITE_`.
3. Giữ các biến Supabase/Cloudinary hiện có của V6 thuộc môi trường **test_2010**; kiểm tra cặp `SUPABASE_URL` và `VITE_SUPABASE_URL` đều là cùng Supabase TEST.
4. Đồng bộ Development env về file local được nạp bởi Vercel Dev: `npx vercel env pull .env.vercel.local --environment=development`. **Không commit file này**. Chạy `npm run lint`, `npm run build`, `npx vercel dev`.
5. Trong `src/data/displaySettings.ts`, để `mode: 'gift'` khi test gift, hoặc `mode: 'memories'` để thử album. `showMemoriesButtonInEnding` có thể true cho TEST. Trả `mode: 'auto'` và nút false trước Production.
6. Test Intro → ngày kỷ niệm → mở thư → nhập lời nhắn và ảnh → nút gửi → hiện hộp thoại xác nhận → nhập mật khẩu gửi quà → lưu thành công. Kiểm tra bảng `love_messages` chỉ trong **test_2010**.
7. Sau khi luồng API đã chạy tốt, trong SQL Editor project **test_2010** chạy `supabase/v6_1_gift_lockdown_test.sql` để xóa quyền ghi trực tiếp anon vào `love_messages`. Test lại, kể cả thử gửi khi chưa xác thực phải trả 401.

## Test bảo mật cần làm
- Cửa sổ ẩn danh POST `/api/gift-reply` và `/api/gift-upload` khi chưa đăng nhập → 401.
- Có Memory Session nhưng không có Gift Session → Gift API vẫn 401.
- Gift Session không cho đọc `/api/memory` hoặc `/api/memory-entries`.
- Nhập sai mật khẩu gửi quà → 401, giới hạn thử → 429. Giới hạn này hiện **chỉ trong memory từng instance**, chưa chống brute force phân tán; cần Redis/Upstash/WAF trước Production.
- Ảnh Cloudinary là URL public; cần thiết kế bảo vệ ảnh thực sự trước khi công khai dữ liệu riêng tư.
- Mật khẩu ngày kỷ niệm vẫn chỉ là trải nghiệm UX, không dùng làm quyền API.
- `love_events` vẫn cho phép anon INSERT theo V6 cũ; nếu cần chống giả mạo thống kê, di chuyển event vào API server riêng.

## Lưu ý
- Nếu chưa cài dependencies, không thể build; không được suy luận là bản đã qua QA. Chạy `npm run lint` và `npm run build` trên máy bạn.
- Biến Development cho `GIFT_PASSWORD_HASH` / `GIFT_SESSION_SECRET` bắt buộc. Sau đổi env hãy khởi động lại `vercel dev`.
- Nếu API `/api/gift-auth` báo 503, kiểm tra các biến Gift phía server, không gửi giá trị secret cho người khác.
- `supabase/v6_1_gift_lockdown_test.sql` chỉ dùng trên TEST sau khi xác nhận write API; tuyệt đối không chạy trên database thật khi chưa chuyển luồng Production.

### Cập nhật trạng thái gửi (UX)
Nút gửi hiển thị trạng thái theo bước: kiểm tra Gift Session → yêu cầu xác nhận mật khẩu (nếu cần) → xác thực → tải ảnh (nếu chọn) → lưu lời nhắn → thành công. Vùng trạng thái dùng `role="status"` để hỗ trợ trình đọc màn hình. Khi lỗi, nội dung và ảnh đã chọn vẫn được giữ nguyên để thử lại.
