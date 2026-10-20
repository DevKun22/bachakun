-- CHỈ CHẠY TRONG SUPABASE PROJECT test_2010. Backup nếu cần.
-- Chạy SAU khi kiểm thử thành công API /api/gift-reply trên môi trường Test.
BEGIN;
DROP POLICY IF EXISTS "any visitor can send message" ON public.love_messages;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.love_messages FROM anon, authenticated;
REVOKE USAGE ON SEQUENCE public.love_messages_id_seq FROM anon, authenticated;
ALTER TABLE public.love_messages ENABLE ROW LEVEL SECURITY;
COMMIT;
-- love_events vẫn ghi anon; cần bảo vệ riêng nếu muốn tránh event giả/spam.
