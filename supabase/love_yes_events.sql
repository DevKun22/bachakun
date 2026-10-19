-- Run once in Supabase SQL Editor to record "Yêu ơi là yêu" confirmations.
create table if not exists public.love_yes_events (
  id bigint generated always as identity primary key,
  event_name text not null default 'love_yes' check (event_name = 'love_yes'),
  created_at timestamptz not null default now()
);

alter table public.love_yes_events enable row level security;
revoke all on table public.love_yes_events from anon, authenticated;
grant insert (event_name) on table public.love_yes_events to anon;

drop policy if exists "visitor can confirm love" on public.love_yes_events;
create policy "visitor can confirm love"
on public.love_yes_events
for insert to anon
with check (event_name = 'love_yes');

-- Read entries in Table Editor or SQL Editor as the project owner.
-- select * from public.love_yes_events order by created_at desc;
