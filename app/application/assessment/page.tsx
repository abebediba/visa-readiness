"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ClipboardCheck, FolderCheck, Lightbulb,
  RefreshCcw, ScanSearch, ShieldAlert, TrendingUp,
} from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import type { AssessmentMetrics, CategoryScore, Finding, RiskLevel } from "@/lib/types";
import { EmptyApplication, useHydrated } from "@/components/ui";
import { Flag, type CountryCode } from "@/components/flag";
import { DemoBanner } from "@/components/demo-banner";
import {
  CATEGORY_META, DEFAULT_CATEGORY_META, TINT, findingIcon, qualityLabel, type Tint,
} from "@/lib/ui/assessment-meta";

const RISK_COPY: Record<RiskLevel, { label: string; pill: string; classes: string; tint: Tint }> = {
  low: { label: "Low", pill: "Looks clear", classes: "text-pos", tint: "teal" },
  medium: { label: "Medium", pill: "Review", classes: "text-amber", tint: "amber" },
  high: { label: "High", pill: "Needs action", classes: "text-neg", tint: "rose" },
};

export default function AssessmentPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const runAssessmentNow = useApp((s) => s.runAssessmentNow);

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;

  const a = application.assessment;
  const previous =
    application.history.length >= 2 ? application.history[application.history.length - 2] : undefined;

  return (
    <div className="space-y-8">
      <DemoBanner />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visa Readiness</h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
            <Flag country={route.country as CountryCode} className="h-3.5 w-5" />
            {route.name}
          </p>
        </div>
        <button
          onClick={() => runAssessmentNow()}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-deep"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          {a ? "Re-run assessment" : "Run assessment"}
        </button>
      </header>

      {!a ? (
        <div className="card p-6 text-muted">
          Run the assessment once you have answered the questionnaire and entered your documents&apos;
          key details. You can re-run it as often as you like — it is deterministic: same inputs, same
          score.
        </div>
      ) : (
        <>
          <ScorePanel
            overall={a.overall}
            band={a.band}
            metrics={a.metrics}
            engineVersion={a.engineVersion}
            rulesVersion={a.rulesVersion}
            answered={a.answeredRequired}
            total={a.totalRequired}
            previous={previous?.overall}
          />

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Why this score?</h2>
              <p className="text-sm text-muted">
                Tap any area to see exactly what counted and what cost points.
              </p>
            </div>
            <div className="space-y-2.5">
              {a.categories.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-soft">
                <AlertTriangle className="h-[18px] w-[18px] text-amber" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-semibold">
                  Issues found <span className="text-brand">({a.findings.length})</span>
                </h2>
                <p className="text-sm text-muted">
                  Review the issues below and take the recommended actions before submitting.
                </p>
              </div>
            </div>

            {a.findings.length === 0 ? (
              <div className="card flex items-center gap-3 p-5 text-sm">
                <CheckCircle2 className="h-5 w-5 text-pos" aria-hidden />
                <span className="text-muted">
                  No issues detected in what you have provided so far.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {a.findings.map((f, i) => (
                  <IssueCard key={`${f.code}-${i}`} finding={f} />
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap justify-between gap-3">
            <Link
              href="/application/documents"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-border-strong"
            >
              Fix documents
            </Link>
            <Link
              href="/application/report"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-deep"
            >
              View pre-submission report
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function ScorePanel({
  overall, band, metrics, engineVersion, rulesVersion, answered, total, previous,
}: {
  overall: number;
  band: string;
  metrics: AssessmentMetrics;
  engineVersion: string;
  rulesVersion: string;
  answered: number;
  total: number;
  previous?: number;
}) {
  const risk = RISK_COPY[metrics.risk];
  return (
    <section className="card overflow-hidden">
      {/* Headline score */}
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            Overall readiness
          </p>
          <p className="mt-1.5 font-semibold leading-none">
            <span className="text-[4rem] tracking-tight text-brand">{overall}</span>
            <span className="text-2xl text-faint">/100</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-medium">
              <ShieldAlert className="h-4 w-4 text-muted" aria-hidden />
              {band}
            </span>
            {previous !== undefined && (
              <span className="inline-flex items-center gap-1.5 text-sm">
                <TrendingUp className="h-4 w-4 text-muted" aria-hidden />
                <span className="text-muted">was {previous}</span>
                <span className={overall >= previous ? "font-medium text-pos" : "font-medium text-neg"}>
                  {overall >= previous ? "+" : ""}
                  {overall - previous}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0 sm:border-l sm:border-border sm:pl-8">
          <p className="text-sm leading-relaxed text-muted">
            Readiness measures how <strong className="font-medium text-text">complete</strong>,{" "}
            <strong className="font-medium text-text">consistent</strong> and{" "}
            <strong className="font-medium text-text">well-supported</strong> your application looks.
            It is not a probability of approval.
          </p>
          <p className="mt-2.5 text-xs text-faint">
            Engine {engineVersion} · rules {rulesVersion} · {answered}/{total} required answers
          </p>
        </div>
      </div>

      {/* Derived metrics */}
      <div className="border-t border-border bg-surface-1/60 px-5 py-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
          <Metric
            icon={ClipboardCheck}
            tint="brand"
            label="Sections completed"
            value={`${metrics.sections.done}/${metrics.sections.total}`}
            pill={`${metrics.sections.pct}%`}
          />
          <Metric
            icon={ScanSearch}
            tint="teal"
            label="Data consistency"
            value={`${metrics.consistencyPct}%`}
            pill={qualityLabel(metrics.consistencyPct)}
          />
          <Metric
            icon={FolderCheck}
            tint="amber"
            label="Supporting evidence"
            value={`${metrics.evidencePct}%`}
            pill={qualityLabel(metrics.evidencePct)}
          />
          <Metric
            icon={ShieldAlert}
            tint={risk.tint}
            label="Risk indicators"
            value={risk.label}
            pill={risk.pill}
            valueClass={risk.classes}
          />
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-brand">
          <Lightbulb className="h-4 w-4 shrink-0" aria-hidden />
          Every figure here is explained in the breakdown below
        </p>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon, tint, label, value, pill, valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: keyof typeof TINT;
  label: string;
  value: string;
  pill: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className={clsx("grid h-11 w-11 place-items-center rounded-xl", TINT[tint].tile)}>
        <Icon className={clsx("h-5 w-5", TINT[tint].icon)} />
      </span>
      <p className="mt-2.5 flex min-h-[2.6em] items-start text-xs leading-tight text-muted">
        {label}
      </p>
      <p className={clsx("tabular text-xl font-semibold", valueClass ?? "text-text")}>{value}</p>
      <p className="mt-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] leading-normal text-muted">
        {pill}
      </p>
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryScore }) {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[category.id] ?? DEFAULT_CATEGORY_META;
  const Icon = meta.icon;
  const tint = TINT[meta.tint];
  const pct = category.score ?? 0;

  return (
    <div className="card relative overflow-hidden">
      <span className={clsx("absolute inset-y-0 left-0 w-1", tint.bar)} aria-hidden />
      <button onClick={() => setOpen((o) => !o)} className="w-full px-5 py-4 pl-6 text-left">
        <div className="flex items-center gap-4">
          <span className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tint.tile)}>
            <Icon className={clsx("h-5 w-5", tint.icon)} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{category.label}</span>
            <span className="mt-0.5 block text-sm text-muted">{meta.description}</span>
          </span>
          <span className="hidden h-2 w-24 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:block lg:w-32">
            <span
              className={clsx("block h-full rounded-full transition-all", tint.bar)}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="shrink-0 text-right">
            <span className="tabular font-semibold">
              {category.score === null ? "—" : category.score}
            </span>
            <span className="text-sm text-faint">/100</span>
          </span>
          <ChevronDown
            className={clsx("h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </div>
        <span className="mt-3 block h-2 w-full overflow-hidden rounded-full bg-surface-2 sm:hidden">
          <span className={clsx("block h-full rounded-full", tint.bar)} style={{ width: `${pct}%` }} />
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-6 py-4 text-sm">
          <p className="text-muted">
            <strong className="text-text">Evidence considered:</strong> {category.coverageDetail}
            {category.score === null && " — not enough information to score this area yet."}
          </p>
          {category.penalties.length > 0 ? (
            <ul className="space-y-1">
              {category.penalties.map((p, i) => (
                <li key={`${p.code}-${i}`} className="flex items-center justify-between gap-3">
                  <span className="text-muted">{p.title}</span>
                  <span className="tabular shrink-0 font-medium text-neg">−{p.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No issues reduced this area.</p>
          )}
          <p className="text-xs text-faint">
            Weight in overall score: {Math.round(category.weight * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

const SEVERITY_STYLE = {
  critical: { edge: "bg-neg", tile: "bg-neg-soft", icon: "text-neg", pill: "bg-neg-soft text-neg", panel: "bg-neg-soft", heading: "text-neg" },
  important: { edge: "bg-amber", tile: "bg-amber-soft", icon: "text-amber", pill: "bg-amber-soft text-amber", panel: "bg-amber-soft", heading: "text-amber" },
  review: { edge: "bg-info", tile: "bg-info-soft", icon: "text-info", pill: "bg-info-soft text-info", panel: "bg-info-soft", heading: "text-info" },
  improvement: { edge: "bg-border-strong", tile: "bg-surface-2", icon: "text-muted", pill: "bg-surface-2 text-muted", panel: "bg-surface-2", heading: "text-muted" },
} as const;

const SEVERITY_LABEL = {
  critical: "Critical",
  important: "Important",
  review: "Review",
  improvement: "Improvement",
} as const;

function IssueCard({ finding }: { finding: Finding }) {
  const s = SEVERITY_STYLE[finding.severity];
  const Icon = findingIcon(finding.code, finding.category);

  return (
    <article className="card relative overflow-hidden">
      <span className={clsx("absolute inset-y-0 left-0 w-1.5", s.edge)} aria-hidden />
      <div className="flex gap-4 p-5 pl-6">
        <span className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-full", s.tile)}>
          <Icon className={clsx("h-5 w-5", s.icon)} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-2">
            <h3 className="font-semibold leading-snug">{finding.title}</h3>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                s.pill
              )}
            >
              <span className={clsx("h-1.5 w-1.5 rounded-full", s.edge)} />
              {SEVERITY_LABEL[finding.severity]}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted">{finding.detail}</p>
          <div className={clsx("flex gap-3 rounded-[var(--radius-sm)] p-3.5", s.panel)}>
            <Lightbulb className={clsx("mt-0.5 h-4 w-4 shrink-0", s.icon)} aria-hidden />
            <div>
              <p className={clsx("text-sm font-semibold", s.heading)}>Recommended action</p>
              <p className="mt-1 text-sm leading-relaxed text-text/85">{finding.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
