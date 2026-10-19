-- Chạy một lần trong Supabase SQL Editor (không xóa các bảng/dữ liệu cũ).
create table if not exists public.love_events (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  event_name text not null check (event_name in ('love_yes_clicked','letter_unlocked','letter_opened','reply_sent')),
  created_at timestamptz not null default now(),
  unique(session_id, event_name)
);
alter table public.love_events enable row level security;
revoke all on public.love_events from anon, authenticated;
grant insert (session_id, event_name) on public.love_events to anon;
drop policy if exists "allow insert events" on public.love_events;
create policy "allow insert events" on public.love_events for insert to anon with check (true);

alter table public.love_messages add column if not exists submission_id uuid;
alter table public.love_messages add column if not exists session_id uuid;
create unique index if not exists love_messages_submission_id_key on public.love_messages (submission_id);
grant insert (sender_name, message, mood, image_url, submission_id, session_id) on public.love_messages to anon;
-- Giữ RLS insert-only từ schema.sql trước đó; không cấp SELECT công khai.
