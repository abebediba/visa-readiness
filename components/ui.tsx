"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Severity } from "@/lib/types";
import { SEVERITY_LABEL } from "@/lib/types";

/** Avoids hydration mismatch with persisted client state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        severity === "critical" && "bg-neg-soft text-neg",
        severity === "important" && "bg-warn-soft text-warn",
        severity === "review" && "bg-info-soft text-info",
        severity === "improvement" && "bg-surface-2 text-muted"
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function ScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return <div className="h-2 w-full rounded-full bg-surface-2" aria-label="Not enough information" />;
  }
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={clsx(
          "h-full rounded-full transition-all",
          score >= 80 ? "bg-pos" : score >= 65 ? "bg-brand" : score >= 50 ? "bg-warn" : "bg-neg"
        )}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function EmptyApplication() {
  return (
    <div className="card space-y-4 p-8 text-center">
      <h1 className="text-xl font-semibold">No application yet</h1>
      <p className="text-muted">Pick your destination and visa route to begin. It takes about 15 minutes.</p>
      <Link href="/start" className="inline-block rounded-full bg-brand px-6 py-3 font-medium text-on-brand">
        Start my application
      </Link>
    </div>
  );
}
