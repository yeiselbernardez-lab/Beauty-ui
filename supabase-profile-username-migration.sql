-- Supabase migration: add username support on profiles
-- Run in Supabase SQL Editor (safe to run multiple times).

alter table public.profiles
  add column if not exists username text;

-- Enforce uniqueness if usernames are present.
create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

-- Keep existing rows test-friendly by deriving a username from display_name.
update public.profiles
set username = lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '_', 'g'))
where username is null
  and display_name is not null;
