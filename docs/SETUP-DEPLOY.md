# Deploying to Vercel

The app is a Next.js server application. Its three AI endpoints (`/api/extract`,
`/api/interview`, `/api/ask`) need a Node runtime, so it must be deployed as a
server app — not as a static export. Vercel does this by default; nothing in the
repo needs changing.

## 1. Connect the repository (one-time — only you can do this)

**This is the one step that is currently blocking the Vercel deployment.**
Creating the project from here fails with:

> To link a GitHub repository, you need to install the GitHub integration first.

The Vercel team is **Inspired** (`team_4ifOeBhVe37OvDKF5QtWaUif`). Installing the
Vercel app on your personal GitHub account is not enough on its own — the
installation has to grant access to this specific repository, and the Vercel
team has to be connected to that GitHub account.

1. Go to https://github.com/settings/installations → **Vercel** → **Configure**.
2. Under *Repository access*, either choose **All repositories**, or **Only
   select repositories** and add `abebediba/visa-readiness`. Save.
3. In Vercel, switch to the **Inspired** team, then **Add New → Project →
   Import** `abebediba/visa-readiness`.
   - Framework preset: **Next.js** (detected automatically)
   - Root directory: **`.`** (the repo root — this is a standalone repo)
   - Build command / output: leave as detected
4. Tell me when that is done and I can finish the setup (env vars, domain)
   through the Vercel API without you clicking through the rest.

If step 2 does not list the repository at all, the Vercel app is installed on a
different GitHub account than the one that owns it.

### Alternative: deploy without the GitHub link

If you would rather not connect GitHub, create a Vercel access token at
https://vercel.com/account/tokens and add it to this project's environment as
`VERCEL_TOKEN`. That lets the deployment be driven from the command line
instead. You lose automatic deploys on push, which is the main reason to prefer
the GitHub link.

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

Add the domain under **Project → Settings → Domains**. What you do next depends
on where it is registered.

**Registered with Vercel** — DNS is configured automatically. Nothing to do.

**Registered elsewhere** (Namecheap, GoDaddy, Hostinger, Google Domains…) —
either delegate the whole domain or add two records. Delegating is simpler and
lets Vercel manage everything:

- *Nameserver delegation*: at the registrar, replace the nameservers with the
  ones Vercel shows you (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).

- *Records only*, if the domain is also serving email and you would rather not
  move DNS:

  | Type | Name | Value |
  |---|---|---|
  | `A` | `@` | `76.76.21.21` |
  | `CNAME` | `www` | `cname.vercel-dns.com` |

  Vercel shows the exact values for your project — use those if they differ from
  the table, which is the current default and can change.

Then set the apex (`example.com`) as the primary domain so `www` redirects to
it, and update `NEXT_PUBLIC_SITE_URL` to match — it drives the canonical URL and
the social cards, and a stale value there means every shared link previews the
wrong host.

DNS changes take anywhere from a few minutes to a few hours to propagate. TLS
certificates are issued and renewed automatically once the records resolve.

Note: moving nameservers to Vercel moves **all** DNS for that domain, including
`MX` records. If email for the domain is already live, re-create the mail
records in Vercel's DNS first, or use the records-only option above.

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
