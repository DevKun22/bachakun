# V6.5 – Dấu thương lưu vĩnh viễn (test_2010)

1. Chỉ trên Supabase project **test_2010**, chạy `supabase/v6_5_stamp_rpc_test.sql` trong SQL Editor. Đây là migration; sao lưu trước, KHÔNG chạy trên Production.
2. Dùng biến Development V6.4 đang trỏ tới `test_2010`, giữ nguyên mật khẩu và Cloudinary server secrets. Không commit `.env*`.
3. `npm install`, `npm run lint`, `npm run build`, `npx vercel dev`.
4. Mở `mode: 'memories'`. Anh Bắp thả tim một ảnh rồi Bà Chã thả tim ảnh đó. Server tạo dấu thương một lần, lưu `stamped_at` theo UTC; giao diện hiển thị giờ Việt Nam.
5. Con dấu nhỏ ở khu vực tim của ảnh; nhấn con dấu xem lại hiệu ứng (không có request ghi). Sau dấu thương không được bỏ tim.
6. Kiểm thử đồng thời 2 request, làm mới trang, logout, lỗi mạng, các ảnh mới và ảnh đầu tiên.

**Giới hạn chưa giải quyết**: vai trò `anh`/`em` vẫn là lựa chọn trên frontend vì mật khẩu dùng chung; cloud URLs có thể công khai; rate limit login serverless chưa tập trung; GET likes giới hạn 1000 bản ghi nên cần phân trang nếu album lớn. Tham số `p_first_id` của RPC lấy từ server env, không lấy từ trình duyệt. RPC chỉ cấp EXECUTE cho service_role.
