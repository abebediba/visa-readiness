# Review of the original Visa Readiness Platform prompt

The original brief is genuinely good: strong ethics (readiness not probability, no
fraud coaching, no nationality penalties), the right core insight (structured
pipeline, not "send PDFs to an LLM and ask for a percentage"), and a clear phase
plan. The rewrite in `PROMPT.md` keeps all of that. What follows is what held it
back, and how the rewrite fixes each gap.

## 1. It repeated itself instead of demanding a reusable system

Sections 8, 10, 14, 15, and 19 of the original each hand-write the same structure
(questionnaire list, document list, assessment categories) for five visa routes.
A builder following it literally would produce five parallel hard-coded workflows —
directly undermining the stated goal of "add countries later without rewriting the
core architecture."

**Fix:** the rewrite defines a **Visa Route Definition schema** once (§5.1) and
expresses all five routes as data against it (§5.2), with genuinely route-specific
logic isolated into named plug-ins (§5.3). Adding route #6 is now defined as:
config + rules data + optional plug-in, no core changes. This is the single biggest
structural improvement.

## 2. Scoring was underspecified — the door was open to LLM-vibes scores

The original said "don't just ask an LLM for a percentage" but never said how the
score *is* computed, whether re-runs are comparable, or what makes the
"Improve My Score" delta honest. An LLM asked to "assess" categories would produce
different numbers on identical input.

**Fix:** §3.4 makes determinism a hard requirement — LLMs extract facts and write
prose; **scoring is arithmetic** over confirmed facts, rule evaluations, and
versioned weights. Every assessment stores `rules_version` / `weights_version` /
`engine_version`, which is what makes explainability (§10.4) and score diffs
(§11.2) real rather than post-hoc rationalization. There's also a CI determinism
test: same fixture twice ⇒ byte-identical score.

## 3. No specification of how AI is actually used

The original never said which LLM calls exist, what models, what output format, how
extraction errors surface, or what any of it costs — fatal for a **free** tool.

**Fix:** §15 adds a closed call inventory (six calls, model tier each, and an
explicit "the LLM never..." list), strict JSON-schema outputs with bounded retries,
prompt/model versioning, content-hash extraction caching, and a per-assessment cost
budget with instrumentation from day one.

## 4. No testing or evaluation strategy at all

Nothing in the original verified that extraction, consistency detection, or the
guardrails actually work — for a product whose entire value is accuracy.

**Fix:** §15.6 requires a golden-document eval harness in CI (synthetic fixtures per
doc type, accuracy gates: ≥98% on identity fields), the consistency examples become
executable test fixtures, and §15.7 adds red-team evals ("how do I fake bank
statements", "what % chance do I have") that must produce refusals — run in CI like
any other test. Every phase in §19 now has acceptance criteria ("done when...")
instead of just a feature list.

## 5. Internal contradictions and taxonomy confusion

- The severity scale `Critical / Important / Review / Improvement / Complete` mixed
  finding severities with a checklist status ("Complete"). Fixed in §7.3: four
  severities, with `complete/pending/missing` as separate checklist statuses.
- "Never silently overwrite contradictory information" had no mechanism. Fixed: the
  `ExtractedFact` model (§4) is append-only with `superseded_by`, provenance, and
  confidence — contradictions become Consistency findings the user resolves.
- The consistency examples were labeled inconsistently ("IMPORTANT INCONSISTENCY"
  vs "CRITICAL CONTRADICTION" with no criteria). They're now mapped onto the fixed
  taxonomy and double as test fixtures (§7.2).

## 6. Compliance and legal exposure were thin

"Include a disclaimer" appeared once, in the report section. A tool handling
passports and bank statements for African applicants, giving quasi-immigration
guidance, needs more.

**Fix:** §1.2 elevates seven non-negotiables to product identity (including
not-legal-advice and no-training-without-consent); §16 adds data minimization,
GDPR-grade posture checked against NDPR/NDPA (Nigeria), Ghana DPA, Kenya DPA, and
POPIA, self-serve export/delete with real deletion, and retention defaults.
Rules must carry official sources with staleness alarms (§8) so stale thresholds
can't quietly mislead users.

## 7. "Mobile-first Africa" was a wish list, not requirements

"Low-bandwidth uploads" and "simple forms" aren't testable.

**Fix:** §17 sets measurable budgets — interactive <5s on 3G on a mid-range Android,
client-side compression to ~500KB/page before upload, resumable uploads, ~B1
reading level, cross-device save-and-continue — enforceable in CI and review.

## 8. Prompt mechanics: the builder had no working agreement

The original was a spec dump with one closing sentence about inspecting the
existing project. It never told the agent how to handle ambiguity, when to ask,
what "done" means, or what to do about the many unstated decisions (stack, OCR
approach, hosting), which invites silent guessing.

**Fix:** §0 gives a working agreement (phase discipline, inspect-before-build,
ambiguity policy, tests-with-every-feature, synthetic fixtures only), §3.1
prescribes a default stack, §20 states what is out of scope, and §21 lists the
remaining open questions **with defaults** so the builder proceeds explicitly
instead of guessing invisibly.

## What was deliberately kept

The 15-step user journey, the pipeline shape, the Applicant Digital Twin, all five
launch routes with their questionnaires/documents/categories, the DS-160 / I-20 /
academic-logic / Canada funding / sponsor / refusal-analyzer capabilities, the
score presentation and bands, the guardrail language, the phase ordering, and the
product positioning lines — all preserved, just deduplicated and made buildable.
