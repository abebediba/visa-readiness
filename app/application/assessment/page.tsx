"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { SEVERITY_LABEL, SEVERITY_PENALTY } from "@/lib/types";
import type { AssessmentResult, CategoryScore, Finding, Severity } from "@/lib/types";
import { SEVERITY_CAP } from "@/lib/engine/assess";
import { projectScore, type Projection } from "@/lib/engine/project";
import { EmptyApplication, useHydrated } from "@/components/ui";
import { DemoBanner } from "@/components/demo-banner";
import { CATEGORY_META, DEFAULT_CATEGORY_META, qualityLabel } from "@/lib/ui/assessment-meta";

/** Solid severity fills. Each carries white text. */
const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--color-neg)",
  important: "var(--color-fill-orange)",
  review: "var(--color-info)",
  improvement: "var(--color-muted)",
};

/** ScoreBar's thresholds, so a bar means the same thing everywhere. */
function barColor(score: number): string {
  if (score >= 80) return "var(--color-pos)";
  if (score >= 65) return "var(--color-brand)";
  if (score >= 50) return "var(--color-warn)";
  return "var(--color-neg)";
}

type Grouping = "severity" | "area";

export default function AssessmentPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const runAssessmentNow = useApp((s) => s.runAssessmentNow);

  // What-if state, local to this screen and deliberately never persisted:
  // marking a finding fixed is the user's assertion about what they will do,
  // not evidence, and must not survive a reload as though the engine saw it.
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [grouping, setGrouping] = useState<Grouping>("severity");

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;
  const a = application.assessment;

  const toggleFixed = (code: string) =>
    setFixed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const rerun = () => {
    setFixed(new Set());
    setOpenCats(new Set());
    runAssessmentNow();
  };

  return (
    <div data-wide className="mx-auto flex max-w-[880px] flex-col gap-12 pt-2">
      <DemoBanner />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-muted">
            {application.isDemo ? "Sample application · Ama Serwaa Boateng" : route.countryName}
          </span>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.03em]">
            Readiness assessment
          </h1>
          <span className="text-[15px] text-muted">{route.name}</span>
        </div>
        <button
          onClick={rerun}
          className="rounded-md border-[1.5px] border-text bg-surface-1 px-[18px] py-2.5 text-sm font-semibold transition-colors hover:bg-text hover:text-on-brand"
        >
          {a ? "Re-run assessment" : "Run assessment"}
        </button>
      </header>

      {!a ? (
        <p className="rounded-[10px] border border-border bg-surface-1 p-6 text-muted">
          Run the assessment once you have answered the questionnaire and entered your documents&apos;
          key details. You can re-run it as often as you like — it is deterministic: same inputs,
          same score.
        </p>
      ) : (
        <>
          <ScorePanel result={a} fixed={fixed} />

          <IssuesSection
            result={a}
            fixed={fixed}
            grouping={grouping}
            onGrouping={setGrouping}
            onToggle={toggleFixed}
          />

          <BreakdownSection
            result={a}
            fixed={fixed}
            openCats={openCats}
            onToggle={(id) =>
              setOpenCats((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Link
              href="/application/documents"
              className="rounded-md border-[1.5px] border-text px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-text hover:text-on-brand"
            >
              Fix documents
            </Link>
            <Link
              href="/application/report"
              className="rounded-md bg-brand px-5 py-3 text-[15px] font-semibold text-on-brand transition-colors hover:bg-brand-deep"
            >
              View pre-submission report
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ score */

function ScorePanel({ result, fixed }: { result: AssessmentResult; fixed: Set<string> }) {
  const p = projectScore(result, fixed);
  const projecting = fixed.size > 0 && p.overall !== result.overall;

  const missingRequired = result.missingDocuments.filter(
    (d) => d.requirement !== "recommended"
  ).length;
  const riskNote = p.criticalCount
    ? `${p.criticalCount} critical, ${p.importantCount} important`
    : p.importantCount
      ? `${p.importantCount} important`
      : "None open";
  const consistency = p.scores.consistency ?? result.metrics.consistencyPct;
  const docs = result.metrics.documents;

  const metrics = [
    {
      label: "Required answers",
      value: `${result.metrics.sections.done}/${result.metrics.sections.total}`,
      note: `${result.metrics.sections.pct}% complete`,
    },
    { label: "Data consistency", value: `${consistency}%`, note: qualityLabel(consistency) },
    {
      label: "Supporting evidence",
      value: `${docs.done}/${docs.total}`,
      note: missingRequired === 0 ? "All required documents" : `${missingRequired} missing`,
    },
    {
      label: "Risk indicators",
      value: p.risk === "low" ? "Low" : p.risk === "medium" ? "Medium" : "High",
      note: riskNote,
    },
  ];

  return (
    <section className="overflow-hidden rounded-xl bg-fill-navy text-white">
      <div className="grid gap-8 p-9 pb-8 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-on-navy-muted">
            {projecting ? "Projected readiness" : "Overall readiness"}
          </span>
          <p className="flex items-baseline gap-1.5">
            <span className="tabular text-[96px] font-bold leading-[0.9] tracking-[-0.05em]">
              {p.overall}
            </span>
            <span className="text-2xl font-semibold text-on-navy-muted">/100</span>
          </p>
          <span className="self-start rounded bg-white px-3 py-1.5 text-sm font-bold text-fill-navy">
            {p.band}
          </span>
          {projecting && (
            <span className="text-sm text-on-navy-muted">
              Current score {result.overall}. Projection assumes the issues you marked are fixed.
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3.5">
          <p className="text-lg font-medium leading-[1.45]">{capNote(p, result, fixed)}</p>
          <p className="text-sm leading-relaxed text-on-navy-muted">
            Readiness measures how complete, consistent and well-supported your application looks.
            It is not a probability of approval.
          </p>
        </div>
      </div>

      <div className="grid bg-fill-navy-deep [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1 border-r border-t border-fill-navy-line px-6 py-5"
          >
            <span className="text-[13px] text-on-navy-muted">{m.label}</span>
            <span className="tabular text-[26px] font-bold tracking-[-0.02em]">{m.value}</span>
            <span className="text-[13px] text-on-navy-muted">{m.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Explains the gap between the area average and the headline score. */
function capNote(p: Projection, result: AssessmentResult, fixed: Set<string>): string {
  if (p.cap < 100 && p.weighted > p.cap) {
    const n = p.criticalCount || p.importantCount;
    const word = p.criticalCount ? "critical" : "important";
    const subject = n === 1 ? `One ${word} issue` : `${n} ${word} issues`;
    return `Your areas average ${p.weighted}. ${subject} ${n === 1 ? "caps" : "cap"} the headline score at ${p.cap} until fixed.`;
  }
  if (result.findings.some((f) => !fixed.has(f.code))) {
    return `Your areas average ${p.weighted}. Open issues still cost points in the areas they affect.`;
  }
  return "No open issues. The score reflects how complete your answers and documents are.";
}

/* ----------------------------------------------------------------- issues */

function IssuesSection({
  result, fixed, grouping, onGrouping, onToggle,
}: {
  result: AssessmentResult;
  fixed: Set<string>;
  grouping: Grouping;
  onGrouping: (g: Grouping) => void;
  onToggle: (code: string) => void;
}) {
  const current = projectScore(result, fixed);
  const openCount = result.findings.filter((f) => !fixed.has(f.code)).length;
  const catLabel = (id: string) => result.categories.find((c) => c.id === id)?.label ?? id;
  const order: Severity[] = ["critical", "important", "review", "improvement"];

  if (result.findings.length === 0) {
    return (
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold tracking-[-0.02em]">Fix these before you submit</h2>
        <p className="rounded-[10px] border border-border bg-surface-1 p-6 text-muted">
          No issues detected in what you have provided so far.
        </p>
      </section>
    );
  }

  const groups =
    grouping === "area"
      ? [...new Set(result.findings.map((f) => f.category))].map((id) => ({
          key: id,
          heading: catLabel(id),
          items: result.findings
            .filter((f) => f.category === id)
            .sort((x, y) => order.indexOf(x.severity) - order.indexOf(y.severity)),
        }))
      : order
          .map((sev) => ({
            key: sev,
            heading: SEVERITY_LABEL[sev],
            items: result.findings.filter((f) => f.severity === sev),
          }))
          .filter((g) => g.items.length > 0);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-2xl font-bold tracking-[-0.02em]">Fix these before you submit</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">
            {openCount} of {result.findings.length} open · mark issues fixed to see the effect on
            your score
          </span>
          <label>
            <span className="sr-only">Group issues</span>
            <select
              value={grouping}
              onChange={(e) => onGrouping(e.target.value as Grouping)}
              className="rounded-md border border-border bg-surface-1 px-2 py-1 text-sm text-muted outline-none focus:border-brand"
            >
              <option value="severity">By severity</option>
              <option value="area">By area</option>
            </select>
          </label>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.key} className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 border-b-2 border-text pb-2">
            <span className="text-sm font-bold uppercase tracking-[0.06em]">{g.heading}</span>
            <span className="tabular text-sm text-muted">{g.items.length}</span>
          </div>
          {g.items.map((f) => (
            <IssueCard
              key={f.code}
              finding={f}
              area={catLabel(f.category)}
              isFixed={fixed.has(f.code)}
              currentOverall={current.overall}
              projectedIfFixed={projectScore(result, new Set([...fixed, f.code])).overall}
              onToggle={() => onToggle(f.code)}
            />
          ))}
        </div>
      ))}
    </section>
  );
}

function IssueCard({
  finding, area, isFixed, currentOverall, projectedIfFixed, onToggle,
}: {
  finding: Finding;
  area: string;
  isFixed: boolean;
  currentOverall: number;
  projectedIfFixed: number;
  onToggle: () => void;
}) {
  const color = SEVERITY_COLOR[finding.severity];
  const points = SEVERITY_PENALTY[finding.severity];
  const capsAt =
    finding.severity === "critical"
      ? SEVERITY_CAP.critical
      : finding.severity === "important"
        ? SEVERITY_CAP.important
        : null;

  const gain = projectedIfFixed - currentOverall;
  const impact = isFixed
    ? "Counted as fixed in the projection above"
    : gain > 0
      ? `Fixing this alone: score ${currentOverall} → ${projectedIfFixed}`
      : "Fixing this alone won't lift the headline yet";

  return (
    <article
      className={clsx(
        "flex flex-col gap-3.5 rounded-[10px] border border-border bg-surface-1 p-6 transition-opacity",
        isFixed && "opacity-55"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className="rounded-[3px] px-2 py-1 text-xs font-bold uppercase tracking-[0.06em] text-white"
          style={{ background: color }}
        >
          {SEVERITY_LABEL[finding.severity]}
        </span>
        <span className="text-[13px] text-muted">{area}</span>
        <span className="tabular ml-auto text-sm font-bold" style={{ color }}>
          −{points} pts{capsAt ? ` · caps score at ${capsAt}` : ""}
        </span>
      </div>

      <h3
        className={clsx(
          "text-[19px] font-bold leading-[1.3] tracking-[-0.015em]",
          isFixed && "line-through"
        )}
      >
        {finding.title}
      </h3>
      <p className="text-[15px] leading-[1.55] text-muted">{finding.detail}</p>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-border pt-3.5">
        <span className="pt-px text-sm font-bold">What to do</span>
        <p className="text-[15px] leading-[1.55]">{finding.recommendation}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggle}
          aria-pressed={isFixed}
          className={clsx(
            "rounded-md border-[1.5px] border-text px-3.5 py-2 text-sm font-semibold transition-colors",
            isFixed ? "bg-text text-on-brand" : "bg-surface-1 hover:bg-text hover:text-on-brand"
          )}
        >
          {isFixed ? "Marked fixed · undo" : "Mark as fixed"}
        </button>
        <span className="text-[13px] text-muted">{impact}</span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- breakdown */

function BreakdownSection({
  result, fixed, openCats, onToggle,
}: {
  result: AssessmentResult;
  fixed: Set<string>;
  openCats: Set<string>;
  onToggle: (id: string) => void;
}) {
  const p = projectScore(result, fixed);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-[-0.02em]">How the score is built</h2>
        <p className="text-[15px] text-muted">
          Each area is scored on what you provided, minus points for issues. Open an area to see
          what counted.
        </p>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-surface-1">
        {result.categories.map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            score={p.scores[c.id] ?? null}
            fixed={fixed}
            isOpen={openCats.has(c.id)}
            onToggle={() => onToggle(c.id)}
          />
        ))}
      </div>

      <p className="text-[13px] text-faint">
        Engine {result.engineVersion}. The assessment is deterministic: the same answers and
        documents always give the same score.
      </p>
    </section>
  );
}

function CategoryRow({
  category, score, fixed, isOpen, onToggle,
}: {
  category: CategoryScore;
  score: number | null;
  fixed: Set<string>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[category.id] ?? DEFAULT_CATEGORY_META;

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="grid w-full grid-cols-[minmax(0,1fr)_44px_14px] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_minmax(60px,180px)_44px_14px]"
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{category.label}</span>
          <span className="text-[13px] text-muted">
            {meta.description} · {Math.round(category.weight * 100)}% of score
          </span>
        </span>
        <span className="hidden h-2 overflow-hidden rounded-sm bg-surface-sunken sm:block">
          {score !== null && (
            <span
              className="block h-full transition-all"
              style={{ width: `${score}%`, background: barColor(score) }}
            />
          )}
        </span>
        <span
          className={clsx(
            "tabular text-right text-lg font-bold",
            score !== null && score < 50 ? "text-neg" : "text-text"
          )}
        >
          {score === null ? "—" : score}
        </span>
        <span className="text-center text-lg text-faint">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2.5 px-5 pb-5 pt-1 text-sm">
          <p className="text-muted">
            <strong className="text-text">Evidence considered:</strong> {category.coverageDetail}
            {category.score === null && " — not enough information to score this area yet."}
          </p>
          {category.penalties.length > 0 ? (
            category.penalties.map((pen) => {
              const done = fixed.has(pen.code);
              return (
                <div
                  key={pen.code}
                  className={clsx(
                    "grid grid-cols-[48px_minmax(0,1fr)] gap-2",
                    done ? "text-faint line-through" : "text-neg"
                  )}
                >
                  <span className="tabular font-bold">−{pen.points}</span>
                  <span>{pen.title}</span>
                </div>
              );
            })
          ) : (
            <p className="text-muted">No issues reduced this area.</p>
          )}
        </div>
      )}
    </div>
  );
}
