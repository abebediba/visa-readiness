"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import type { CategoryScore } from "@/lib/types";
import { EmptyApplication, ScoreBar, SeverityBadge, useHydrated } from "@/components/ui";
import { Flag, type CountryCode } from "@/components/flag";

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
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visa Readiness</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <Flag country={route.country as CountryCode} className="h-3.5 w-5" />
            {route.name}
          </p>
        </div>
        <button
          onClick={() => runAssessmentNow()}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          {a ? "Re-run assessment" : "Run assessment"}
        </button>
      </header>

      {!a ? (
        <div className="card p-6 text-muted">
          <p>
            Run the assessment once you have answered the questionnaire and entered your documents'
            key details. You can re-run it as often as you like — it is deterministic: same inputs,
            same score.
          </p>
        </div>
      ) : (
        <>
          <section className="card space-y-3 p-6 text-center">
            <p className="text-sm uppercase tracking-widest text-faint">Overall readiness</p>
            <p className="text-5xl font-semibold tabular">{a.overall}<span className="text-2xl text-faint">/100</span></p>
            <p className="font-medium">{a.band}</p>
            {previous && (
              <p className="text-sm text-muted">
                Previous run: {previous.overall} →{" "}
                <span className={a.overall >= previous.overall ? "text-pos" : "text-neg"}>
                  {a.overall >= previous.overall ? "+" : ""}
                  {a.overall - previous.overall}
                </span>
              </p>
            )}
            <p className="text-xs text-faint">
              Readiness measures completeness, consistency and support — it is not a probability of
              approval. Engine {a.engineVersion} · rules {a.rulesVersion} ·{" "}
              {a.answeredRequired}/{a.totalRequired} required answers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Why this score?</h2>
            <p className="text-sm text-muted">Tap any area to see exactly what counted and what cost points.</p>
            <div className="space-y-2">
              {a.categories.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">
              Issues found <span className="text-faint">({a.findings.length})</span>
            </h2>
            {a.findings.length === 0 ? (
              <p className="card p-4 text-sm text-muted">No issues detected in what you have provided so far.</p>
            ) : (
              <div className="space-y-2">
                {a.findings.map((f, i) => (
                  <div key={`${f.code}-${i}`} className="card space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{f.title}</p>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    <p className="text-sm text-muted">{f.detail}</p>
                    <p className="rounded-[var(--radius-sm)] bg-brand-soft px-3 py-2 text-sm text-brand">
                      {f.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap justify-between gap-3">
            <Link href="/application/documents" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
              Fix documents
            </Link>
            <Link href="/application/report" className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand">
              View pre-submission report
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryScore }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{category.label}</p>
          <div className="flex items-center gap-2">
            <span className="tabular text-sm font-semibold">
              {category.score === null ? "—" : category.score}
            </span>
            <ChevronDown className={clsx("h-4 w-4 text-faint transition-transform", open && "rotate-180")} aria-hidden />
          </div>
        </div>
        <div className="mt-2">
          <ScoreBar score={category.score} />
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          <p className="text-muted">
            <strong className="text-text">Evidence considered:</strong> {category.coverageDetail}
            {category.score === null && " — not enough information to score this area yet."}
          </p>
          {category.penalties.length > 0 ? (
            <ul className="space-y-1">
              {category.penalties.map((p, i) => (
                <li key={`${p.code}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="text-muted">{p.title}</span>
                  <span className="tabular shrink-0 text-neg">−{p.points}</span>
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
