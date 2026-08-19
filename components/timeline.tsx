"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Circle } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Application, OutcomeDecision } from "@/lib/types";
import { OUTCOME_LABEL } from "@/lib/types";

export function Timeline({ app }: { app: Application }) {
  const noCriticalOpen =
    app.assessment !== undefined &&
    !app.assessment.findings.some((f) => f.severity === "critical" || f.severity === "important");

  const steps: { label: string; done: boolean; detail?: string }[] = [
    { label: "Started", done: true, detail: new Date(app.createdAt).toLocaleDateString() },
    { label: "Documents added", done: app.documents.length > 0 },
    { label: "Assessment completed", done: Boolean(app.assessment) },
    { label: "Critical & important issues resolved", done: noCriticalOpen },
    {
      label: "Submitted to the authorities",
      done: Boolean(app.submittedAt),
      detail: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : undefined,
    },
    {
      label: "Decision recorded",
      done: Boolean(app.outcome),
      detail: app.outcome ? OUTCOME_LABEL[app.outcome.decision] : undefined,
    },
  ];

  return (
    <section className="card p-5">
      <h2 className="font-medium">Timeline</h2>
      <ol className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-pos" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            )}
            <span className={clsx(!s.done && "text-muted")}>{s.label}</span>
            {s.detail && <span className="ml-auto text-xs text-faint">{s.detail}</span>}
          </li>
        ))}
      </ol>
      <OutcomeControls app={app} />
    </section>
  );
}

function OutcomeControls({ app }: { app: Application }) {
  const markSubmitted = useApp((s) => s.markSubmitted);
  const recordOutcome = useApp((s) => s.recordOutcome);
  const [recording, setRecording] = useState(false);
  const [decision, setDecision] = useState<OutcomeDecision | "">("");
  const [decisionDate, setDecisionDate] = useState("");
  const [reason, setReason] = useState("");

  if (app.outcome) {
    return (
      <p className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-sm text-muted">
        {OUTCOME_LABEL[app.outcome.decision]} on {app.outcome.decisionDate}
        {app.outcome.scoreAtSubmission !== undefined && ` · readiness at submission: ${app.outcome.scoreAtSubmission}/100`}
        {app.outcome.decision === "refused" &&
          " — you can start an improved application from the Start page; declare this refusal there."}
      </p>
    );
  }

  if (!app.assessment) return null;

  if (!app.submittedAt) {
    return (
      <div className="mt-3">
        <button
          onClick={() => markSubmitted()}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          I have submitted my application
        </button>
        <p className="mt-1 text-xs text-faint">
          Marks the milestone and captures your readiness score at submission — nothing is sent anywhere.
        </p>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="mt-3">
        <button
          onClick={() => setRecording(true)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          Record the decision
        </button>
        <p className="mt-1 text-xs text-faint">
          Optional and stays on this device. Recording real outcomes is what will one day make
          guidance better for everyone — with consent, and never as an approval predictor.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-3 space-y-3 border-t border-border pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!decision || !decisionDate) return;
        recordOutcome({
          decision,
          decisionDate,
          refusalReason: reason.trim() || undefined,
        });
      }}
    >
      <div className="space-y-1">
        <label className="block text-xs font-medium text-muted">Decision</label>
        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value as OutcomeDecision)}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">Select…</option>
          {Object.entries(OUTCOME_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-muted">Decision date</label>
        <input
          type="date"
          value={decisionDate}
          onChange={(e) => setDecisionDate(e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      {decision === "refused" && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted">Reason given (from the refusal letter)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-20 w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={!decision || !decisionDate}
        className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-40"
      >
        Save decision
      </button>
    </form>
  );
}
