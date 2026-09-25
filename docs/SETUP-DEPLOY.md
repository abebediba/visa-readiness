# Deploying to Vercel

The app is a Next.js server application. Its three AI endpoints (`/api/extract`,
`/api/interview`, `/api/ask`) need a Node runtime, so it must be deployed as a
server app — not as a static export. Vercel does this by default; nothing in the
repo needs changing.

## 1. Project status, and what is left to do by hand

The Vercel project **exists**:

| | |
|---|---|
| Team | **Inspired** (`team_4ifOeBhVe37OvDKF5QtWaUif`) |
| Project | **visa-readiness** (`prj_uMWC7Zfkl1AcUnzSH58IbKOnclEY`) |
| Git link | `abebediba/visa-readiness`, production branch `main` |
| Deployments | live, auto-deploying on push |
| Domains | `www.visareadiness.com` (primary), apex 308-redirects to it |
| Environment variables | **none set** |

The live DNS, registered at Hostinger and verified from outside:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `216.198.79.1` |
| `CNAME` | `www` | `df755aae6ef48b7f.vercel-dns-017.com` |

DNS stayed at Hostinger rather than delegating nameservers to Vercel, so `MX`
records for mail on this domain are added there too.

The project was created through the API, but every write to it after creation is
refused — linking the repository, setting environment variables and creating a
deployment all come back `403 You don't have permission to create a Production
Deployment for this project` or `404 Project not found`. The API connection can
read the project and not change it, so the remaining steps have to be done in
the dashboard by someone with Member or Owner rights on the team.

Open the project at **vercel.com → Inspired → visa-readiness**, then:

1. **Settings → Git → Connect Git Repository** → `abebediba/visa-readiness`.
   Production branch: `main`.
2. **Settings → Environment Variables** — see the table in section 2 below.
3. **Settings → Deployment Protection** — Vercel Authentication is currently on
   for *all deployments except custom domains*. That is a sensible default, but
   until the custom domain is attached it means the `*.vercel.app` URL asks
   every visitor to log in to Vercel. If you want to share the deployment before
   the domain is live, turn it off here.
4. **Deployments → Redeploy**, or just push to `main` once step 1 is done.

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

### Pointing a Hostinger domain at Vercel

Buy the domain only — a hosting plan is not needed, since Vercel serves the
site. Then, in Vercel: **Project → Settings → Domains → Add**, enter the domain,
and Vercel will show the records it wants. Then either:

**Keep DNS at Hostinger (recommended if the domain also carries mail).**
hPanel → **Domains → [domain] → DNS / Nameservers → DNS records**.

| Type | Name | Points to | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | default |
| `CNAME` | `www` | `cname.vercel-dns.com` | default |

**Delete Hostinger's existing `@` and `www` records first.** A fresh Hostinger
domain ships with parking records, and leaving them in place means two `A`
records for the apex: requests round-robin between Vercel and the parking page,
and the TLS certificate fails to issue intermittently. Edit or remove, do not
just add alongside.

**Or hand DNS to Vercel.** In hPanel → **Domains → [domain] → DNS /
Nameservers**, choose *Change nameservers* and enter the two Vercel shows
(`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). Simpler, and Vercel then manages
every record — but it moves `MX` too, so any mail on that domain stops until the
mail records are recreated in Vercel's DNS.

Use the values Vercel prints for your project if they differ from the table
above; those are the current defaults and Vercel does change them.

Propagation is usually minutes, up to a few hours. Vercel issues the TLS
certificate by itself once the records resolve.

Afterwards, set `NEXT_PUBLIC_SITE_URL` to the new origin and redeploy — it
drives the canonical URL and the link previews, and a stale value means every
shared link previews the wrong host.

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
