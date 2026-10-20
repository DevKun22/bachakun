-- CHỈ CHẠY TRONG PROJECT TEST test_2010 SAU KHI DEPLOY API V6.
-- Bỏ chính sách và quyền ghi ẩn danh cho album; ghi qua server API đã đăng nhập.
BEGIN;
DROP POLICY IF EXISTS "allow visitors to add memories" ON public.memory_entries;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.memory_entries FROM anon, authenticated;
REVOKE USAGE ON SEQUENCE public.memory_entries_id_seq FROM anon, authenticated;
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;
COMMIT;
-- Không thay đổi love_messages / love_events vì luồng quà cũ vẫn dùng chúng.
