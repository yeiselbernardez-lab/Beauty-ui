# Glow Guide Beauty App (Supabase Edition)

This project is a responsive beauty/personal-care web app with 3 screens and a Supabase backend for ritual planning.

## What this version includes

- Supabase database schema for:
  - profiles
  - ritual categories
  - rituals
  - user-selected rituals (CRUD target used by the app)
- Supabase browser client setup
- CRUD functionality in the UI:
  - **Create**: save selected rituals to Supabase
  - **Read**: load saved rituals for a user
  - **Update**: toggle selected/unselected rituals, then save changes
  - **Delete**: clear all selected rituals and remove saved rows

## 1) Install and run

```bash
npm install
npm run dev
```

The app runs with Vite and uses `.env.local` for credentials.

## 2) Environment setup

Create/update `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pgdflipyqudrptnkplbt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

> Note: this project is built with Vite, so `vite.config.js` is configured to expose `NEXT_PUBLIC_*` variables to the browser.

## 3) Where to paste SQL in Supabase

1. Open your Supabase project dashboard.
2. In left sidebar, go to **SQL Editor**.
3. Click **New query**.
4. Open this repo file: `supabase-schema.sql`.
5. Copy all SQL from that file and paste into SQL Editor.
6. Click **Run**.

This creates tables, indexes, triggers, and RLS policies.

## 4) Demo user id for this frontend

For simplicity, this frontend uses a fixed demo user UUID:

`11111111-1111-1111-1111-111111111111`

The schema seeds this profile so CRUD works immediately.

## 5) File guide

- `supabase-schema.sql` → full schema + RLS + seeds
- `src/supabaseClient.js` → Supabase client singleton
- `src/main.js` → app UI logic + CRUD wiring
- `src/ritualCatalog.js` → ritual categories and options
- `.env.local` → Supabase URL/key config

