# V6.4 — Tim nhanh hơn & dấu thương chạm để đóng

- Giữ **optimistic UI**: đổi màu và tim bay ngay khi chạm.
- Sau POST `/api/memory-likes`, API trả `likes` chỉ của ảnh vừa thao tác; frontend không gửi thêm GET toàn bộ danh sách.
- Dấu **Hai đứa cùng thương** giữ trên màn hình cho đến khi bấm **Cất dấu thương**, chạm nền, hoặc Escape/Enter. Không tự tắt.
- Khi POST không được xác nhận (bao gồm lỗi mạng hoặc lỗi lấy dữ liệu xác nhận), giao diện hoàn tác và Chibi báo lỗi.
- Không thay đổi schema Supabase hay ENV. Chỉ kiểm thử trên `test_2010`.

## Kiểm tra
```
npm install
npm run lint
npm run build
npx vercel dev
```

Kiểm tra DevTools Network: mỗi lần thả tim chỉ có **một request `/api/memory-likes` POST** ở browser; server vẫn dùng Supabase để kiểm tra ảnh, ghi và đọc lại tim của ảnh đó. Điều này giảm một lượt HTTP browser, không đảm bảo loại bỏ hoàn toàn độ trễ Supabase. Không triển khai Production trước khi kiểm thử đầy đủ.
