-- Chạy 1 lần trong Supabase SQL Editor.
-- Cho phép người xem gửi lời nhắn, KHÔNG cho đọc/sửa/xóa lời nhắn qua trình duyệt.
create table if not exists public.love_messages (
  id bigint generated always as identity primary key,
  sender_name text not null check (char_length(sender_name) between 1 and 60),
  message text not null check (char_length(message) between 1 and 2000),
  mood text not null check (char_length(mood) between 1 and 100),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.love_messages enable row level security;
revoke all on table public.love_messages from anon, authenticated;
grant insert (sender_name, message, mood) on table public.love_messages to anon;

drop policy if exists "any visitor can send message" on public.love_messages;
create policy "any visitor can send message"
on public.love_messages
for insert to anon
with check (true);

-- Safe for existing installations: add photo URL column and permission.
alter table public.love_messages add column if not exists image_url text;
grant insert (sender_name, message, mood, image_url) on table public.love_messages to anon;
