# Profile Username Integration Test (Supabase)

Use this quick guide to test that your Supabase integration is working by updating username from the app UI.

## 1) Run SQL migration in Supabase

1. Open Supabase dashboard for your project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Open this file in your repo: `supabase-profile-username-migration.sql`.
5. Copy/paste all SQL and click **Run**.

This migration:
- adds `profiles.username` if it does not exist
- enforces a simple username format check
- adds a unique index for username
- ensures a demo profile row exists with id:
  - `11111111-1111-1111-1111-111111111111`

## 2) Start app locally

```bash
npm install
npm run dev
```

Make sure `.env.local` has your Supabase credentials.

## 3) Test username update flow

1. Open app and go to **Profile** tab.
2. In **Profile Settings**, edit the username field.
3. Click **Save Username**.
4. Confirm success toast: _"Username updated and saved in Supabase."_
5. Refresh page and confirm username is still updated.

## 4) Verify directly in Supabase

Run this in SQL Editor:

```sql
select id, display_name, username, updated_at
from public.profiles
where id = '11111111-1111-1111-1111-111111111111';
```

You should see the updated `username`.

