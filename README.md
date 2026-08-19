# Visa Readiness

**visareadiness.com**

> **Know how strong your visa application is before you submit it.**

A free tool that assesses how **complete, consistent and well-supported** a visa
application looks before submission — starting with applicants from Africa. This is the
working Phase 1–3 preview of the platform specified in
[`docs/PROMPT.md`](docs/PROMPT.md) (the full build brief) and
[`docs/REVIEW.md`](docs/REVIEW.md) (the design rationale).

## Run it

```bash
npm install
npm run dev        # http://localhost:3010
npm test           # deterministic engine tests (11 fixtures)
npm run build      # production build
```

## What works today

- **Five visa routes as pure configuration** (`lib/routes/definitions.ts`):
  US B1/B2, US F-1, Canada Visitor (TRV), Canada Study Permit, UK Standard Visitor.
  Questionnaires, document checklists, assessment categories and weights are all data —
  adding a route means adding a definition, not code.
- **Guided questionnaire** with conditional questions, autosave, resume-anywhere.
- **Document checklist with "extraction review"**: for each document you enter its key
  fields exactly as printed (in the full product an AI extracts them and you confirm) —
  this feeds the consistency engine.
- **Cross-document consistency engine** (`lib/engine/checks.ts`): name matching across
  documents, salary triangulation (questionnaire vs employment letter vs bank credits),
  invitation-vs-application trip duration, the "no US relatives vs sibling invitation"
  contradiction, passport validity, sponsor capacity, funding gaps, and more.
- **Versioned rules engine** (`lib/rules/seed.ts`): every requirement carries an
  official government source URL, effective dates and a last-verified date; thresholds
  (e.g. IRCC living funds, UK 180-day limit) are rule parameters, never code constants.
- **Deterministic Visa Readiness Score** (`lib/engine/assess.ts`): no model in the
  scoring loop — coverage plus severity-weighted findings, category weights from the
  route definition, same inputs ⇒ byte-identical score (tested). Every sub-score
  explains itself: what evidence counted and which finding cost which points.
- **Findings & recommendations** with a fixed severity taxonomy
  (critical / important / review / improvement) and honest, non-coaching language.
- **Dashboard** with next-recommended-action, **printable pre-submission report** with
  full disclaimer and cited official sources.
- **Legal layer**: privacy policy, terms of service, disclaimer, and a working
  data-rights page (export everything as JSON, delete everything) — aligned with
  GDPR / Nigeria NDPA / Ghana DPA / Kenya DPA / POPIA expectations.
- **AI document extraction (optional, opt-in per document)**: set `ANTHROPIC_API_KEY`
  (see `.env.example`) and a "Read details with AI" button appears on each document —
  Claude vision reads the fields with per-field confidence, low-confidence values are
  flagged for verification, quality issues and document-type mismatches are surfaced
  neutrally, and the user confirms everything before it counts. Without a key, manual
  entry works exactly as before.
- **Interview simulator (US routes)**: questions generated deterministically from the
  applicant's *actual case* — their school, sponsor, declared refusals, and the
  assessment's detected inconsistencies become the probes an officer would ask. Each
  answer gets "what a reviewer listens for" guidance, plus optional AI feedback on
  consistency and clarity when a key is configured. Never coaches scripted or untrue
  answers.
- **Ask about my application**: instant answers computed on-device from the assessment
  (missing documents, contradictions, weakest areas, what to fix first) plus — when a
  key is configured — free-form questions answered *only* from the applicant's own case
  and the cited official rules, with a source list under every answer. Approval-chance
  questions are deliberately out of scope and say so.
- **Timeline & outcome tracking**: dashboard milestones derived from real state, a
  mark-as-submitted action that captures the readiness score at submission, and
  voluntary decision recording.
- **Optional accounts & cross-device sync**: configure Supabase (see
  [`docs/SETUP-CLOUD.md`](docs/SETUP-CLOUD.md)) and users can sign in with a one-time
  email code to save their application to their own row-level-secured record and
  continue on another device. Answers and confirmed details sync; document files never
  do. Includes a permanent "Delete my cloud copy" control. Without the env vars, the
  app stays fully on-device and shows no account UI.

## Privacy stance of this preview

By default everything runs client-side: answers and document details live only in the
browser's localStorage; selected files are read for name/size only and never leave the
device. There is no account and no tracking. The two AI features are the only exception,
and both are strictly opt-in per use: a document is sent for reading, or a practice
answer for feedback, only when the user taps that button — nothing is stored server-side
either way. The privacy policy describes this in user-facing language.

## What is intentionally not built yet (see docs/PROMPT.md phases)

- Server-side document storage (files currently stay on-device by design).
- Admin portal (Phase 5), voice interview answers and localization (Phase 6).

## Non-negotiables encoded in the product

No approval probabilities, no nationality-based penalties, no fraud coaching (the
engine's recommendations explicitly warn against borrowed funds and misstatements),
requirements only from cited official sources, and user-controlled deletion. Before any
public launch, name the registered operating entity in the privacy policy and terms
(the contact addresses already point at visareadiness.com).
