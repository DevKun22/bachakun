-- CHỈ CHẠY TRÊN SUPABASE test_2010. Backup trước khi migrate.
BEGIN;
ALTER TABLE public.memory_entries ADD COLUMN IF NOT EXISTS actor_role text;
ALTER TABLE public.memory_entries DROP CONSTRAINT IF EXISTS memory_entries_actor_role_check;
ALTER TABLE public.memory_entries ADD CONSTRAINT memory_entries_actor_role_check CHECK (actor_role IN ('anh','em') OR actor_role IS NULL);
-- Bản ghi cũ giữ NULL: không tự nhận là của Bà Chã hay Ăm Chã.
CREATE TABLE IF NOT EXISTS public.memory_activity_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event_id uuid NOT NULL UNIQUE,
 actor_role text NOT NULL CHECK (actor_role IN ('anh','em')),
 event_type text NOT NULL CHECK (event_type IN ('archive_visit','photo_view','stamp_replay')),
 photo_key text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT activity_photo_key_check CHECK ((event_type='archive_visit' AND photo_key IS NULL) OR (event_type IN ('photo_view','stamp_replay') AND photo_key IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS memory_activity_events_role_type_created_idx ON public.memory_activity_events(actor_role,event_type,created_at DESC);
ALTER TABLE public.memory_activity_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.memory_activity_events FROM PUBLIC,anon,authenticated;
COMMIT;
