-- Run once in Supabase SQL Editor; existing love_yes_events and love_messages stay unchanged.
create table if not exists public.love_moments (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('letter_unlocked','letter_opened')),
  created_at timestamptz not null default now()
);
alter table public.love_moments enable row level security;
revoke all on public.love_moments from anon, authenticated;
grant usage on schema public to anon;
grant insert (event_name) on public.love_moments to anon;
drop policy if exists "visitor can save moments" on public.love_moments;
create policy "visitor can save moments" on public.love_moments
for insert to anon with check (event_name in ('letter_unlocked','letter_opened'));
-- Read rows from Supabase Table Editor only; no public SELECT grant.
