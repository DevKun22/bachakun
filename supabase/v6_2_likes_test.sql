-- CHỈ CHẠY TRÊN SUPABASE PROJECT test_2010. KHÔNG CHẠY PRODUCTION.
CREATE TABLE IF NOT EXISTS public.memory_photo_likes (
  photo_key TEXT NOT NULL,
  liker_role TEXT NOT NULL CHECK (liker_role IN ('anh','em')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT memory_photo_likes_pkey PRIMARY KEY (photo_key, liker_role),
  CONSTRAINT memory_photo_likes_key_check CHECK (photo_key = 'first' OR photo_key ~ '^entry:[1-9][0-9]*:[0-5]$')
);
ALTER TABLE public.memory_photo_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.memory_photo_likes FROM anon, authenticated;
-- V6.2 API sử dụng service_role phía server, không cấp client quyền đọc/ghi.
