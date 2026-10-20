# V6.3 – Chibi & Tim bùng nở (Test)

Nâng cấp từ V6.2, giữ nguyên API và database. Bấm thả tim: cập nhật ngay, hiệu ứng tim bật nảy / tim bay, Chibi mách lẻo; khi API thất bại: hoàn tác. Khi server xác nhận có đủ 2 vai trò thích cùng ảnh: hiện màn hai tim gặp nhau (không lặp lại ở lần tải trang). Khi xử lý một lượt tim, tạm khóa nút để chống double submit và tránh đổi vai trò giữa request.

## Test
1. Chạy bản này ở thư mục mới: `npm install`, `npm run lint`, `npm run build`, `npx vercel dev`.
2. Dùng Supabase `test_2010` và env Development, không dùng dữ liệu Production.
3. `mode: 'memories'` để mở góc nhỏ.
4. Chọn vai trò Em, nhấn tim: đổi màu ngay. Chọn Anh, nhấn tim cùng ảnh: hiện hiệu ứng đặc biệt sau khi server xác nhận. Bỏ tim và thử ngắt mạng: UI phải hoàn tác và Chibi báo nhẹ.
5. Dùng thiết bị có Reduce Motion để đảm bảo animation được hạn chế.

Không thay SQL, API, secret. Hai vai trò chỉ là lựa chọn hiển thị, không xác minh danh tính người dùng. Cloudinary URL công khai vẫn cần xử lý trước Production. Không đưa `.env` vào Git.
