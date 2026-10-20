# V6.8 — Bắn Tim Ảnh và hiệu năng

- Tái sử dụng `shootPhotoHearts()` cho cả Thư và Góc kỷ niệm, chung thông số confetti; ở góc kỷ niệm thêm overlay trái tim bay không chặn nút.
- Khi bấm tim: phản hồi lạc quan tức thì như V6.7; giữ RPC xác nhận và rollback khi thất bại. Hiệu ứng mạnh hơn chỉ khi server báo `justStamped`.
- Tối ưu upload: hai ảnh song song mỗi đợt; album và likes vẫn tải đồng thời như V6.7. Ảnh hiển thị có `loading=lazy` ở vị trí đã gắn.
- Giữ nguyên các route xác thực/phiên và SQL V6.6; không cần migration mới.
- Sửa câu mở đầu theo yêu cầu.

## Test
`npm install && npm run lint && npm run build && npx vercel dev`
Bật chế độ `memories` trên test_2010, kiểm tra Bắn Tim Ảnh, thả tim, đóng dấu, tải 2–6 ảnh, khóa phiên, kiểm tra mobile và reduced-motion.
Chưa chạy kiểm thử tích hợp có backend/Supabase trong môi trường tạo gói.
