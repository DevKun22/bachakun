# Bắp & Bà Chã V5 – Hộp kỷ niệm 🌷

Dựa nguyên bản V4: Chibi, thư, quà, confetti, upload lời nhắn 20/10, API `/api/memory` vẫn giữ. Bổ sung album kỷ niệm (tối đa 6 ảnh/lần), xem ảnh lớn, giao diện scrapbook và chuyển cảnh cánh hoa.

## Chạy local

1. `npm install`
2. Trong Supabase **test_2010**, chạy SQL tại `supabase/memory_entries_test.sql` (sau khi đã tạo hai bảng V4). Không chạy trên project thật khi chưa kiểm thử.
3. Tạo `.env.local` theo `.env.example` dùng **toàn bộ** Supabase Test. Tạo Cloudinary unsigned preset dành riêng cho test.
4. Trên Vercel Project, đặt biến Development `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MEMORY_MESSAGE_ID` trỏ đến TEST. Production vẫn giữ giá trị thật. Không commit `.env*`.
5. `npx vercel dev` rồi mở `http://localhost:3000`. `npm run dev` chỉ chạy frontend, không chạy hai API serverless.
6. `npm run build` và `npm run lint` để kiểm tra.

## Quy tắc thời gian

`src/data/displaySettings.ts` giữ `mode: 'auto'`: trước 00:00 ngày 21/10/2026 (giờ VN) hiện quà, kể từ thời điểm đó **chỉ hiện góc kỷ niệm**. `gift` và `memories` dùng để test. Cuối EndingScreen có nút mở góc kỷ niệm với chuyển cảnh cánh hoa, dùng được trước mốc chuyển tự động.

## Routing

Bỏ `vercel.json` cũ vì rewrite tất cả request ngoài `/api/` về `index.html` khiến `npx vercel dev` trả HTML cho request module của Vite và báo `vite:import-analysis`. Không tái tạo rewrite bắt tất cả. Nếu sau này thêm React Router, hãy cấu hình riêng cho production mà không chặn Vite assets trong dev.

## Bảo mật

Lời nhắn/ảnh V4 không bị ghi đè; các lần gửi mới vào bảng `memory_entries`. RLS chỉ cấp INSERT cho anon; GET thông qua API server key. **Lưu ý**: `/api/memory` và `/api/memory-entries` hiện chưa xác thực người xem; ai biết đường dẫn site đều có thể xem nội dung, người lạ cũng có thể gửi vào bảng nếu có publishable key. Cần auth/rate limiting và giới hạn quyền xem phù hợp trước khi sử dụng cho ảnh riêng tư. Ảnh upload unsigned thường có URL công khai. Chỉ dùng ảnh test trong quá trình thử. Kích thước trang API giới hạn 48 kỷ niệm mới nhất.
