# Visa Readiness

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

## Privacy stance of this preview

Everything runs client-side: answers and document details live only in the browser's
localStorage; selected files are read for name/size only and never leave the device.
There is no server, no account, no tracking. That makes the preview safe to try with
real information — though the legal pages already describe the full architecture so the
policies don't need rewriting at launch.

## What is intentionally not built yet (see docs/PROMPT.md phases)

- Accounts, server storage, RLS (Phase 1 server-side) — the current store is a thin
  layer that maps 1:1 onto the planned database schema.
- AI document extraction (Phase 2) — replaced by the manual "enter key details" step,
  which exercises the same fact-provenance model.
- Interview simulator, "Ask My Application" (Phase 4), admin portal & outcome
  tracking (Phase 5).

## Non-negotiables encoded in the product

No approval probabilities, no nationality-based penalties, no fraud coaching (the
engine's recommendations explicitly warn against borrowed funds and misstatements),
requirements only from cited official sources, and user-controlled deletion. Before any
public launch, replace the `[operator-domain]` contact placeholders in the legal pages
with the real operating entity.
