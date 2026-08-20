# Deploying to Vercel

The app is a Next.js server application. Its three AI endpoints (`/api/extract`,
`/api/interview`, `/api/ask`) need a Node runtime, so it must be deployed as a
server app — not as a static export. Vercel does this by default; nothing in the
repo needs changing.

## 1. Connect the repository (one-time, must be done by the repo owner)

Vercel cannot link a GitHub repo until its GitHub App is installed:

1. Install https://github.com/apps/vercel and grant it access to
   `abebediba/visa-readiness`.
2. In Vercel, **Add New → Project → Import** `abebediba/visa-readiness`.
   - Framework preset: **Next.js** (detected automatically)
   - Root directory: **`.`** (the repo root — this is a standalone repo)
   - Build command / output: leave as detected

## 2. Environment variables

Set these in **Project → Settings → Environment Variables**, for Production
(and Preview, if you want the AI features on preview deployments).

| Variable | Needed for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | The three AI features | Without it they switch off cleanly and the app still works |
| `EXTRACTION_MODEL` | Cost control | Set to `claude-haiku-4-5`. Document reading is transcription, not reasoning — this cuts the most frequent call's cost several-fold |
| `INTERVIEW_MODEL` | Optional | Leave unset to use the default |
| `ASK_MODEL` | Optional | Leave unset to use the default |
| `NEXT_PUBLIC_SITE_URL` | Metadata, social cards | `https://visareadiness.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Accounts & sync | Only if you enable them — see `SETUP-CLOUD.md` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts & sync | Same |

`ANTHROPIC_API_KEY` is server-side only and must never be given a
`NEXT_PUBLIC_` prefix — that would ship it to the browser.

## 3. Custom domain

1. Buy or add `visareadiness.com` under **Project → Settings → Domains**.
2. If the domain is registered with Vercel, DNS is configured automatically.
   If it is registered elsewhere, point the nameservers at Vercel, or add the
   A / CNAME records Vercel shows.
3. Set `visareadiness.com` as the primary domain so `www` redirects to it.

TLS is issued and renewed automatically.

## 4. Retire the GitHub Pages demo

Once Vercel serves the site, `.github/workflows/pages.yml` is redundant and will
keep publishing a second, static copy that silently lacks the AI features. Delete
that workflow and the `gh-pages` branch, and remove the Pages source setting.

## Costs

Hosting is free on Vercel's Hobby plan, which allows custom domains — but Hobby
is for non-commercial projects. If this is ever monetised or moved under a
company, it needs Pro.

Hosting is not the real running cost: the Anthropic API is. Every document read,
interview critique and Ask question is a paid call. Watch that number before
worrying about hosting, and keep `EXTRACTION_MODEL` on a cheap model.
