# Bắp & Bà Chã V6 — góc kỷ niệm có khóa

## Thay đổi
- Mật khẩu chung **được kiểm tra ở server**, lưu `scrypt` hash trong ENV, không đặt mật khẩu vào React.
- Cookie phiên **HttpOnly, SameSite=Strict, Path=/api**, 7 ngày. Chữ ký HMAC-SHA256. Nút khóa để đăng xuất.
- `GET /api/memory`, `GET/POST /api/memory-entries`, `POST /api/memory-upload` yêu cầu phiên đăng nhập hợp lệ.
- Gửi lời nhắn mới qua server API dùng service role; thu hồi quyền INSERT của `anon` cho `memory_entries`.
- Upload album dùng chữ ký Cloudinary từ API đã đăng nhập thay vì preset unsigned.
- Nút mở Góc kỷ niệm ở EndingScreen: `DISPLAY_SETTINGS.showMemoriesButtonInEnding` (true test, false production).
- Tự chuyển sau `2026-10-21T00:00:00+07:00`, giữ UI/V4 Chibi, confetti, scrapbook.
- Không có `vercel.json` rewrite lỗi, thay `MailHeart` bằng `Mail`.

## Thiết lập lần đầu — TEST ONLY
1. Giải nén vào thư mục riêng, chạy `npm install`.
2. Trong Supabase **test_2010** (KHÔNG production), xác nhận `memory_entries` đã tồn tại, rồi chạy `supabase/v6_lockdown_test.sql`. Khi đó gửi từ V5 cũ qua anon sẽ không còn được, chỉ V6 API hoạt động.
3. Chạy `node scripts/hash-password.mjs` trong terminal riêng tư; **đừng gửi kết quả hash hoặc session secret cho ai**. Script in mật khẩu khi nhập, nên đóng terminal/shell history nếu dùng máy dùng chung. Mật khẩu chung tối thiểu 12 ký tự, khác mật khẩu mở thư cũ.
4. Điền các ENV trong `.env.local` theo `.env.example`, dùng **Supabase test_2010** cho cả client và server. Mọi biến `CLOUDINARY_*` server lấy từ dashboard Cloudinary (API key/secret), không có tiền tố `VITE_`.
5. Với `npx vercel dev`: đồng bộ **Development** ENV vào `.env.vercel.local` hoặc để `.env.local`; chỉ một bộ giá trị test. Chú ý Vercel env có thể được ưu tiên hơn file local. Tuyệt đối không đặt service role vào biến `VITE_`.
6. Đặt `DISPLAY_SETTINGS.mode = 'memories'` để test trực tiếp, `showMemoriesButtonInEnding: true` để test chuyển cảnh; đổi lại `mode='auto'`, `showMemoriesButtonInEnding: false` khi production.
7. Chạy `npm run lint && npm run build` và `npx vercel dev`.

## Checklist bảo mật
- Chưa mở khóa: `/api/memory`, `/api/memory-entries`, POST `/api/memory-upload` trả **401**, browser không thấy lời nhắn/album.
- Nhập mật khẩu sai: **401**; nhiều lần thất bại trên cùng 1 instance: **429**.
- Mật khẩu đúng: cookie HttpOnly; xem album và gửi ảnh/lời nhắn thử nghiệm thành công.
- Nhấn `Khóa góc nhỏ`: API trở lại **401**.
- Kiểm tra Supabase anon POST trực tiếp `memory_entries` trả không cho phép sau khi chạy SQL lockdown.
- Đảm bảo ENV URL client/server đều thuộc test_2010 và Cloudinary thử nghiệm.

## Giới hạn quan trọng (chưa gọi là bảo mật tuyệt đối)
- Giới hạn lần nhập sai đang dùng bộ nhớ từng Vercel instance, **chưa chống brute force phân tán**. Trước production cần rate limit tập trung (Upstash/Vercel Firewall hoặc database transaction).
- Vì cả hai dùng **một mật khẩu chung**, không thể phân quyền hay thu hồi riêng từng người. Thay secret sẽ vô hiệu mọi phiên cũ, thay password hash một mình **không** tự hủy cookie đã cấp.
- Ảnh Cloudinary đã upload dùng URL công khai: ai đã có URL vẫn xem được dù API đã khóa. Để ảnh thật riêng tư cần Cloudinary `authenticated` delivery và signed URLs hoặc storage private tương đương. Không đăng ảnh nhạy cảm trong bản này.
- Upload cũ của **luồng quà 20/10** vẫn dùng unsigned preset và bảng `love_messages`/`love_events` còn quyền anon INSERT. Cần khóa riêng sau khi ngừng luồng quà chính thức, không tự động thay đổi để tránh phá chức năng cũ.
- REST `image_urls` đang xác thực domain Cloudinary chung; giới hạn vào đúng cloud name hoặc asset IDs khi phát hành chính thức.
- Vercel URL chính vẫn có thể được truy cập, nhưng nội dung album qua API được kiểm tra bằng cookie; CSS/JS công khai.
- Nếu service role key từng lộ trong ảnh chụp, hãy rotate trong Supabase rồi cập nhật Vercel Production/Preview/Development.

## Hướng kiến trúc V7
ENV giữ bí mật, Dashboard admin riêng biệt cho chỉnh `displaySettings`, không dùng chung quyền của password memory. API config public chỉ trả thông tin hiển thị, API admin phải có xác thực admin riêng.
