"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { rulesForRoute } from "@/lib/rules/seed";
import { useApp } from "@/lib/store";
import { SEVERITY_LABEL } from "@/lib/types";
import { EmptyApplication, useHydrated } from "@/components/ui";

export default function ReportPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;
  const a = application.assessment;

  if (!a) {
    return (
      <div className="card space-y-3 p-6">
        <h1 className="text-xl font-semibold">No assessment yet</h1>
        <p className="text-muted">Run the assessment first — the report is generated from its results.</p>
        <Link href="/application/assessment" className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand">
          Go to assessment
        </Link>
      </div>
    );
  }

  const name = String(application.answers["identity.full_name"] ?? "Applicant");
  const rules = rulesForRoute(route.id);

  return (
    <div className="space-y-6">
      <div className="no-print flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print / save as PDF
        </button>
      </div>

      <article className="card space-y-6 p-6">
        <header className="space-y-1 border-b border-border pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Pre-Submission Readiness Report</h1>
          <p className="text-sm text-muted">
            {name} · {route.name} · assessed {new Date(a.ranAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-faint">Engine {a.engineVersion} · rules {a.rulesVersion}</p>
        </header>

        <section className="flex items-center justify-between rounded-[var(--radius-sm)] bg-surface-2 p-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-faint">Overall Visa Readiness</p>
            <p className="font-medium">{a.band}</p>
          </div>
          <p className="tabular text-4xl font-semibold">{a.overall}/100</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Assessment by area</h2>
          <table className="w-full text-sm">
            <tbody>
              {a.categories.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2">{c.label}</td>
                  <td className="tabular py-2 text-right font-medium">
                    {c.score === null ? "Not enough information" : `${c.score}/100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Document checklist</h2>
          <ul className="space-y-1 text-sm">
            {route.documents
              .filter(
                (d) =>
                  d.requirement !== "conditional" ||
                  (d.condition && application.answers[d.condition.questionId] === d.condition.equals)
              )
              .map((d) => {
                const have = application.documents.some((x) => x.type === d.type);
                return (
                  <li key={d.type} className="flex items-center justify-between gap-2">
                    <span>{d.label}</span>
                    <span className={have ? "text-pos" : d.requirement === "recommended" ? "text-muted" : "text-neg"}>
                      {have ? "Provided" : d.requirement === "recommended" ? "Not provided (optional)" : "Missing"}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Issues and recommendations ({a.findings.length})</h2>
          {a.findings.length === 0 ? (
            <p className="text-sm text-muted">No issues detected in the material provided.</p>
          ) : (
            a.findings.map((f, i) => (
              <div key={`${f.code}-${i}`} className="space-y-1 border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium">
                  [{SEVERITY_LABEL[f.severity]}] {f.title}
                </p>
                <p className="text-sm text-muted">{f.detail}</p>
                <p className="text-sm">→ {f.recommendation}</p>
              </div>
            ))
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Official requirements referenced</h2>
          <ul className="space-y-2 text-sm">
            {rules.map((r) => (
              <li key={r.rule_id}>
                <p className="font-medium">{r.requirement}</p>
                <p className="text-muted">
                  Source:{" "}
                  <a href={r.official_source_url} className="break-all underline" target="_blank" rel="noreferrer">
                    {r.official_source_url}
                  </a>{" "}
                  · last verified {r.last_verified_at}. Confirm the current requirement on the official page before submitting.
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="rounded-[var(--radius-sm)] bg-surface-2 p-4 text-xs text-muted">
          This report is an informational self-assessment generated from information provided by the
          applicant. It is not legal or immigration advice, it is not affiliated with any government,
          and it does not predict or guarantee any visa decision, which rests solely with the deciding
          authority. Requirements change — verify all requirements against official sources before
          submission.
        </footer>
      </article>
    </div>
  );
}
