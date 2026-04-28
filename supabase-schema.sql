-- Beauty App Supabase schema
-- Run this entire script in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text unique,
  age_group text,
  skin_type text,
  goals text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ritual_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rituals (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.ritual_categories(id) on delete cascade,
  name text not null,
  description text,
  time_of_day text check (time_of_day in ('morning', 'evening', 'anytime')) default 'anytime',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists rituals_unique_name_per_category
  on public.rituals(category_id, name);

create table if not exists public.user_rituals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  ritual_id uuid not null references public.rituals(id) on delete cascade,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed')),
  notes text,
  selected_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  unique(profile_id, ritual_id)
);

create table if not exists public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reflection_date date not null default current_date,
  mood_score int check (mood_score between 1 and 10),
  confidence_score int check (confidence_score between 1 and 10),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(profile_id, reflection_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.ritual_categories enable row level security;
alter table public.rituals enable row level security;
alter table public.user_rituals enable row level security;
alter table public.daily_reflections enable row level security;

-- Demo-friendly public policies for client-side anon key usage.
-- For production, tie data to auth.uid() and restrict per-user.
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
on public.profiles for select
using (true);

drop policy if exists "Public write profiles" on public.profiles;
create policy "Public write profiles"
on public.profiles for all
using (true)
with check (true);

drop policy if exists "Public read categories" on public.ritual_categories;
create policy "Public read categories"
on public.ritual_categories for select
using (true);

drop policy if exists "Public write categories" on public.ritual_categories;
create policy "Public write categories"
on public.ritual_categories for all
using (true)
with check (true);

drop policy if exists "Public read rituals" on public.rituals;
create policy "Public read rituals"
on public.rituals for select
using (true);

drop policy if exists "Public write rituals" on public.rituals;
create policy "Public write rituals"
on public.rituals for all
using (true)
with check (true);

drop policy if exists "Public read user rituals" on public.user_rituals;
create policy "Public read user rituals"
on public.user_rituals for select
using (true);

drop policy if exists "Public write user rituals" on public.user_rituals;
create policy "Public write user rituals"
on public.user_rituals for all
using (true)
with check (true);

drop policy if exists "Public read reflections" on public.daily_reflections;
create policy "Public read reflections"
on public.daily_reflections for select
using (true);

drop policy if exists "Public write reflections" on public.daily_reflections;
create policy "Public write reflections"
on public.daily_reflections for all
using (true)
with check (true);

-- Seed categories
insert into public.ritual_categories (name, description, sort_order)
values
  ('Skin Care', 'Daily skin rituals for glow and barrier health.', 1),
  ('Makeup', 'Beauty application and removal rituals.', 2),
  ('Hair Care', 'Scalp and strand routines for healthy hair.', 3),
  ('Nail Care', 'Fingernail and cuticle care rituals.', 4),
  ('Hygiene', 'Body hygiene and freshness routines.', 5),
  ('Wellness', 'Mind-body routines to boost confidence and balance.', 6)
on conflict (name) do update
set description = excluded.description,
    sort_order = excluded.sort_order;

-- Seed profile
insert into public.profiles (display_name, email, age_group, skin_type, goals)
values ('Mia Thomson', 'mia@example.com', '25-34', 'Combination', 'Glow, confidence, and routine consistency')
on conflict (email) do update
set display_name = excluded.display_name,
    age_group = excluded.age_group,
    skin_type = excluded.skin_type,
    goals = excluded.goals;

-- Seed rituals (15 per category)
with cat as (
  select id, name from public.ritual_categories
),
seed(name, category_name, description, time_of_day) as (
  values
    ('Double cleanse at night', 'Skin Care', 'Remove makeup and SPF thoroughly.', 'evening'),
    ('Gentle morning cleanse', 'Skin Care', 'Refresh skin without stripping.', 'morning'),
    ('Hydrating toner layering', 'Skin Care', 'Replenish moisture with lightweight layers.', 'morning'),
    ('Vitamin C serum', 'Skin Care', 'Support brightness and antioxidant defense.', 'morning'),
    ('Niacinamide treatment', 'Skin Care', 'Balance tone and reduce redness.', 'anytime'),
    ('Ceramide moisturizer', 'Skin Care', 'Strengthen skin barrier daily.', 'anytime'),
    ('SPF 50 protection', 'Skin Care', 'Daily sun protection step.', 'morning'),
    ('Weekly enzyme exfoliation', 'Skin Care', 'Gently renew skin texture.', 'evening'),
    ('Cooling eye patches', 'Skin Care', 'Reduce puffiness and refresh eye area.', 'morning'),
    ('Face massage routine', 'Skin Care', 'Improve circulation and product absorption.', 'evening'),
    ('Overnight sleeping mask', 'Skin Care', 'Lock hydration overnight.', 'evening'),
    ('Lip scrub and balm', 'Skin Care', 'Keep lips soft and smooth.', 'anytime'),
    ('Spot treatment routine', 'Skin Care', 'Target breakouts safely.', 'evening'),
    ('Neck and chest extension', 'Skin Care', 'Extend facial care below jawline.', 'morning'),
    ('Weekly sheet mask', 'Skin Care', 'Boost hydration and glow.', 'evening'),

    ('Hydrating primer prep', 'Makeup', 'Prep skin for smooth makeup wear.', 'morning'),
    ('Color-correct base', 'Makeup', 'Neutralize uneven tone before foundation.', 'morning'),
    ('Skin tint blend', 'Makeup', 'Apply breathable base coverage.', 'morning'),
    ('Concealer spot correction', 'Makeup', 'Target under-eyes and blemishes.', 'morning'),
    ('Cream blush layering', 'Makeup', 'Build natural flush and depth.', 'morning'),
    ('Soft contour', 'Makeup', 'Define facial features subtly.', 'morning'),
    ('Highlighter placement', 'Makeup', 'Create polished luminosity.', 'morning'),
    ('Brow shape and set', 'Makeup', 'Frame the face naturally.', 'morning'),
    ('Neutral eyeshadow blend', 'Makeup', 'Create soft eye dimension.', 'morning'),
    ('Tightline eyeliner', 'Makeup', 'Enhance lash line discreetly.', 'morning'),
    ('Lengthening mascara', 'Makeup', 'Define and open the eyes.', 'morning'),
    ('Lip liner and gloss', 'Makeup', 'Long-lasting lip shape and shine.', 'morning'),
    ('Setting mist lock', 'Makeup', 'Seal makeup for longer wear.', 'morning'),
    ('Midday touch-up', 'Makeup', 'Refresh base and lip color.', 'anytime'),
    ('Gentle makeup removal', 'Makeup', 'Remove products without irritation.', 'evening'),

    ('Scalp oil pre-wash', 'Hair Care', 'Nourish scalp before cleansing.', 'evening'),
    ('Sulfate-free cleanse', 'Hair Care', 'Clean hair while preserving moisture.', 'morning'),
    ('Deep conditioner', 'Hair Care', 'Restore softness and strength weekly.', 'evening'),
    ('Protein mask', 'Hair Care', 'Support damaged strands.', 'evening'),
    ('Leave-in conditioner', 'Hair Care', 'Hydrate and detangle lengths.', 'morning'),
    ('Heat protectant', 'Hair Care', 'Shield strands during styling.', 'morning'),
    ('Microfiber dry routine', 'Hair Care', 'Reduce friction and frizz.', 'morning'),
    ('Low-heat blowout', 'Hair Care', 'Style with less thermal stress.', 'morning'),
    ('Clarifying wash', 'Hair Care', 'Remove buildup weekly.', 'evening'),
    ('Silk pillowcase habit', 'Hair Care', 'Prevent overnight breakage.', 'evening'),
    ('Overnight braid', 'Hair Care', 'Protect style and reduce tangling.', 'evening'),
    ('Frizz serum finish', 'Hair Care', 'Seal ends and add shine.', 'morning'),
    ('Edge care routine', 'Hair Care', 'Support hairline health.', 'morning'),
    ('Split-end trim schedule', 'Hair Care', 'Maintain healthy growth.', 'anytime'),
    ('Scalp tonic hydration', 'Hair Care', 'Refresh and rebalance scalp.', 'anytime'),

    ('Nail cleansing', 'Nail Care', 'Keep nails clean and fresh.', 'anytime'),
    ('Weekly shaping', 'Nail Care', 'File and shape nails safely.', 'anytime'),
    ('Cuticle softening soak', 'Nail Care', 'Prep cuticles before care.', 'evening'),
    ('Cuticle oil massage', 'Nail Care', 'Hydrate cuticles daily.', 'evening'),
    ('Strengthening base coat', 'Nail Care', 'Protect nails before polish.', 'anytime'),
    ('Breathable polish', 'Nail Care', 'Apply polish that supports nail health.', 'anytime'),
    ('Top coat seal', 'Nail Care', 'Extend manicure life.', 'anytime'),
    ('Nail bed cream', 'Nail Care', 'Nourish nail matrix and bed.', 'evening'),
    ('Natural buff shine', 'Nail Care', 'Smooth nail surface gently.', 'anytime'),
    ('Hand SPF routine', 'Nail Care', 'Protect hands from UV aging.', 'morning'),
    ('Night hand mask', 'Nail Care', 'Repair dry hands overnight.', 'evening'),
    ('Biotin meal support', 'Nail Care', 'Support nail strength via nutrition.', 'anytime'),
    ('Acetone-free removal', 'Nail Care', 'Reduce dehydration from polish removal.', 'evening'),
    ('Tool sanitizing habit', 'Nail Care', 'Prevent contamination and infections.', 'anytime'),
    ('Hangnail prevention', 'Nail Care', 'Prevent and treat cuticle tears.', 'anytime'),

    ('Morning body cleanse', 'Hygiene', 'Start the day fresh and clean.', 'morning'),
    ('Evening refresh shower', 'Hygiene', 'Cleanse after daily activities.', 'evening'),
    ('Body exfoliation', 'Hygiene', 'Remove dead skin gently.', 'evening'),
    ('Body moisturizing', 'Hygiene', 'Seal hydration after shower.', 'anytime'),
    ('Underarm care', 'Hygiene', 'Control odor and irritation.', 'morning'),
    ('Two-minute brushing', 'Hygiene', 'Maintain oral health with proper brushing.', 'morning'),
    ('Floss and tongue clean', 'Hygiene', 'Complete oral hygiene routine.', 'evening'),
    ('Hand wash + hydrate', 'Hygiene', 'Protect and moisturize hands.', 'anytime'),
    ('Fresh towel cycle', 'Hygiene', 'Replace used towels regularly.', 'anytime'),
    ('Workout hygiene reset', 'Hygiene', 'Cleanse after exercise.', 'anytime'),
    ('Intimate care cleanse', 'Hygiene', 'Practice gentle intimate hygiene.', 'anytime'),
    ('Foot wash routine', 'Hygiene', 'Prevent odor and dryness.', 'evening'),
    ('Fresh clothing rotation', 'Hygiene', 'Use clean daily essentials.', 'morning'),
    ('Bedding hygiene schedule', 'Hygiene', 'Change sheets consistently.', 'anytime'),
    ('Night oral care complete', 'Hygiene', 'End day with full oral routine.', 'evening'),

    ('Morning breathwork', 'Wellness', 'Center and energize your morning.', 'morning'),
    ('Gratitude journaling', 'Wellness', 'Reinforce positive mindset.', 'morning'),
    ('Wake-up stretching', 'Wellness', 'Increase mobility and circulation.', 'morning'),
    ('Hydration tracking', 'Wellness', 'Maintain steady water intake.', 'anytime'),
    ('Balanced breakfast', 'Wellness', 'Fuel the body and mind.', 'morning'),
    ('Midday movement break', 'Wellness', 'Boost energy and posture.', 'anytime'),
    ('Posture reset', 'Wellness', 'Relieve neck and back tension.', 'anytime'),
    ('Sunlight walk', 'Wellness', 'Support mood and circadian rhythm.', 'morning'),
    ('Digital detox break', 'Wellness', 'Reduce stress from screen time.', 'anytime'),
    ('Evening herbal tea', 'Wellness', 'Create a calming transition to night.', 'evening'),
    ('Guided meditation', 'Wellness', 'Lower stress and improve focus.', 'evening'),
    ('Foam rolling', 'Wellness', 'Release muscle tightness.', 'evening'),
    ('Sleep wind-down', 'Wellness', 'Improve sleep readiness.', 'evening'),
    ('Weekly reflection', 'Wellness', 'Review wins and adjust goals.', 'anytime'),
    ('Affirmation practice', 'Wellness', 'Build confidence and self-image.', 'morning')
)
insert into public.rituals (category_id, name, description, time_of_day)
select c.id, s.name, s.description, s.time_of_day
from seed s
join cat c on c.name = s.category_name
on conflict (category_id, name) do update
set description = excluded.description,
    time_of_day = excluded.time_of_day;

