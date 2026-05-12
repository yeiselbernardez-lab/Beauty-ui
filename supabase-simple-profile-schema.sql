-- Simple user profile table for Supabase
-- Paste into Supabase SQL Editor and run.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- If profiles table already exists from previous versions, make sure required columns are present.
alter table public.profiles
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists created_at timestamptz default timezone('utc', now());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'display_name'
  ) then
    execute $q$
      update public.profiles
      set name = coalesce(name, display_name, 'Unknown User')
      where name is null
    $q$;
  else
    update public.profiles
    set name = coalesce(name, 'Unknown User')
    where name is null;
  end if;
end $$;

update public.profiles
set email = coalesce(email, concat('user-', substring(id::text from 1 for 8), '@example.com'))
where email is null;

update public.profiles
set created_at = coalesce(created_at, timezone('utc', now()))
where created_at is null;

alter table public.profiles alter column name set not null;
alter table public.profiles alter column email set not null;
alter table public.profiles alter column created_at set not null;

drop index if exists profiles_email_unique_idx;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable"
on public.profiles
for select
using (true);

drop policy if exists "Profiles are insertable" on public.profiles;
create policy "Profiles are insertable"
on public.profiles
for insert
with check (true);
