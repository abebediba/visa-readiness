# Enabling accounts & cross-device sync

The app runs fully on-device by default. To enable optional accounts and sync:

1. **Create a Supabase project** (free tier is fine) at https://supabase.com.
2. **Run the schema**: open the SQL editor and paste the contents of
   [`db/schema.sql`](../db/schema.sql). This creates the `applications` table with
   owner-only row-level security.
3. **Enable email OTP sign-in**: Authentication → Providers → Email. The app uses
   one-time codes (no passwords). In Authentication → Email Templates, make sure the
   OTP template includes the `{{ .Token }}` code.
4. **Set the env vars** (Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

5. Redeploy. An "Account" link appears in the header; everything else is unchanged.

## What syncs — and what never does

- Syncs: the application record (answers, confirmed document details, assessment
  results, timeline/outcome) as one JSON row owned by the signed-in user.
- Never syncs: document **files**. They stay on the user's device.
- The account page includes "Delete my cloud copy", which permanently removes the row.

## Security model

- Row-level security on `public.applications`: `owner = auth.uid()` for every
  operation, enforced at the database — the anon key alone can read nothing.
- Sign-in is email OTP: no passwords stored or phished.
- The AI features (`ANTHROPIC_API_KEY`) are independent of this — either, both, or
  neither can be enabled.
