"use client";

import Link from "next/link";
import { ClipboardList, FileText, Gauge, MessageCircleQuestion, MessagesSquare, Upload } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { EmptyApplication, ScoreBar, useHydrated } from "@/components/ui";
import { Timeline } from "@/components/timeline";
import { RouteBadge } from "@/components/flag";
import type { CountryCode } from "@/components/flag";

export default function ApplicationDashboard() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;

  const a = application.assessment;
  const requiredQs = route.sections.flatMap((s) =>
    s.questions.filter(
      (q) => q.required && (!q.showIf || application.answers[q.showIf.questionId] === q.showIf.equals)
    )
  );
  const answered = requiredQs.filter((q) => {
    const v = application.answers[q.id];
    return v !== undefined && v !== "";
  }).length;

  const applicableDocs = route.documents.filter(
    (d) =>
      d.requirement !== "conditional" ||
      (d.condition && application.answers[d.condition.questionId] === d.condition.equals)
  );
  const uploadedTypes = new Set(application.documents.map((d) => d.type));
  const docsDone = applicableDocs.filter((d) => uploadedTypes.has(d.type)).length;

  const critical = a?.findings.filter((f) => f.severity === "critical").length ?? 0;
  const important = a?.findings.filter((f) => f.severity === "important").length ?? 0;

  const nextAction = !answered
    ? { href: "/application/questionnaire", label: "Start the questionnaire" }
    : answered < requiredQs.length
      ? { href: "/application/questionnaire", label: `Finish the questionnaire (${answered}/${requiredQs.length})` }
      : docsDone < applicableDocs.length
        ? { href: "/application/documents", label: `Add documents (${docsDone}/${applicableDocs.length})` }
        : !a
          ? { href: "/application/assessment", label: "Run your first assessment" }
          : critical + important > 0
            ? { href: "/application/assessment", label: `Fix ${critical + important} issue${critical + important > 1 ? "s" : ""} and re-run` }
            : { href: "/application/report", label: "View your pre-submission report" };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <RouteBadge
          country={route.country as CountryCode}
          countryName={route.countryName}
          routeName={route.name.split("—")[1]?.trim() ?? route.shortName}
        />
        <p className="text-sm text-muted">
          Started {new Date(application.createdAt).toLocaleDateString()} · saved on this device
        </p>
      </header>

      <Link href={nextAction.href} className="card block border-brand/40 bg-brand-soft p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">Next recommended action</p>
        <p className="mt-1 font-medium text-brand">{nextAction.label} →</p>
      </Link>

      <section className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium">Overall readiness</p>
          <p className="tabular text-2xl font-semibold">{a ? a.overall : "—"}</p>
        </div>
        <ScoreBar score={a?.overall ?? null} />
        {a ? (
          <p className="text-sm text-muted">
            {a.band} · last run {new Date(a.ranAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-sm text-muted">Not assessed yet.</p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-sm text-muted">Questionnaire</p>
          <p className="tabular text-xl font-semibold">{answered}/{requiredQs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Documents</p>
          <p className="tabular text-xl font-semibold">{docsDone}/{applicableDocs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Critical issues</p>
          <p className={`tabular text-xl font-semibold ${critical > 0 ? "text-neg" : ""}`}>{a ? critical : "—"}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Important issues</p>
          <p className={`tabular text-xl font-semibold ${important > 0 ? "text-warn" : ""}`}>{a ? important : "—"}</p>
        </div>
      </section>

      <Timeline app={application} />

      <nav className="card divide-y divide-border">
        {[
          { href: "/application/questionnaire", icon: ClipboardList, label: "Questionnaire" },
          { href: "/application/documents", icon: Upload, label: "Documents" },
          { href: "/application/assessment", icon: Gauge, label: "Assessment & issues" },
          ...(route.interview
            ? [{ href: "/application/interview", icon: MessageCircleQuestion, label: "Interview practice" }]
            : []),
          { href: "/application/ask", icon: MessagesSquare, label: "Ask about my application" },
          { href: "/application/report", icon: FileText, label: "Pre-submission report" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 hover:bg-surface-2/60">
            <item.icon className="h-5 w-5 text-brand" aria-hidden />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
