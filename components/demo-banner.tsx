"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { useApp } from "@/lib/store";

/** Makes it unmistakable that the numbers on screen belong to a sample case. */
export function DemoBanner() {
  const isDemo = useApp((s) => s.application?.isDemo);
  const resetApplication = useApp((s) => s.resetApplication);
  if (!isDemo) return null;

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-lg)] border border-amber/30 bg-amber-soft px-4 py-3 text-sm">
      <FlaskConical className="h-4 w-4 shrink-0 text-amber" aria-hidden />
      <p className="flex-1 text-amber">
        <strong>Worked example.</strong> A synthetic applicant with deliberate problems in her
        paperwork — not a real person, and not your application.
      </p>
      <Link
        href="/start"
        onClick={() => resetApplication()}
        className="whitespace-nowrap rounded-full bg-amber px-3.5 py-1.5 text-xs font-medium text-white"
      >
        Start my own
      </Link>
    </div>
  );
}
