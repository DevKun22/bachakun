# V6.2 – Chibi tương tác & tim ảnh riêng theo vai trò (TEST)

## Các thay đổi
- Chibi mách lẻo, đổi lời thoại khi xem ảnh, chọn ảnh, bắt đầu viết thư, gửi thành công/thất bại và thả/bỏ tim. Có công tắc ẩn/hiện lời thoại.
- Chọn vai trò `Anh Bắp` hoặc `Bà Chã` trên Góc kỷ niệm (lưu lựa chọn trong localStorage). Mỗi vai trò chỉ có **một tim/ảnh**, có thể bỏ tim.
- Ảnh đầu tiên dùng key `first`; ảnh album dùng `entry:<id>:<index>`, không dựa vào thứ tự sắp xếp album.
- GET/POST `/api/memory-likes` bắt buộc Memory Session; POST kiểm tra Origin, tính hợp lệ của ảnh và ghi bằng Supabase service role. Không cấp quyền trực tiếp cho anon.
- Không lưu lượt xem, lượt mở Chibi hay nội dung hội thoại Chibi vào database.

## Quan trọng về danh tính
Hai bạn vẫn dùng **chung một mật khẩu**. Nút chọn `Anh Bắp` / `Bà Chã` là **vai trò tự chọn**, không xác minh người nào đang dùng; vì vậy một người có mật khẩu có thể chọn vai trò khác. Tính năng này đảm bảo tối đa một lượt tim cho **mỗi vai trò / ảnh**, chứ không phải xác minh độc lập hai người.

## Cách thử an toàn
1. Giải nén vào **thư mục mới**. Đặt toàn bộ ENV Development hướng về `test_2010`; không copy ENV Production sang.
2. Chỉ trong **Supabase test_2010**, chạy `supabase/v6_2_likes_test.sql`. Chú ý chọn đúng Supabase project trước khi chạy.
3. `npm install`, `npm run lint`, `npm run build`, `npx vercel dev`.
4. Bật `mode: 'memories'` trong `src/data/displaySettings.ts` để thử giao diện ngay.
5. Đăng nhập bằng mật khẩu chung V6. Chọn `Anh Bắp`, thả tim một ảnh, đổi sang `Bà Chã` để thả tim thứ hai. Kiểm tra số tim, bỏ tim, tải lại trang và mở cùng ảnh ở modal.
6. Truy cập `/api/memory-likes` trong cửa sổ ẩn danh chưa đăng nhập: phải nhận 401.
7. Kiểm tra bảng `memory_photo_likes` trong `test_2010` có tối đa hai bản ghi cho mỗi ảnh (một `anh`, một `em`).

## Hạn chế trước khi lên Production
- **Chưa xác thực danh tính từng người** do mật khẩu dùng chung; muốn chặn người khác chọn vai trò thay, cần mã PIN/đăng nhập riêng từng người.
- Rate limit đăng nhập V6 trước đó chỉ in-memory, không đủ để chống brute force trên nhiều server instance.
- Ảnh Cloudinary vẫn là URL public; yêu cầu bảo mật ảnh cần asset riêng tư và cơ chế cấp quyền xem.
- Không triển khai lên Production hoặc dùng ảnh cá nhân nhạy cảm trước khi kiểm thử các giới hạn trên.
