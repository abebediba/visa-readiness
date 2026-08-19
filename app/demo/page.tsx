"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildDemoApplication } from "@/lib/demo";
import { getRoute } from "@/lib/routes/definitions";
import { runAssessment } from "@/lib/engine/assess";
import { useApp } from "@/lib/store";

/** Loads the worked example, assesses it, and drops the user on the results. */
export default function DemoPage() {
  const router = useRouter();
  const loadApplication = useApp((s) => s.loadApplication);

  useEffect(() => {
    const app = buildDemoApplication();
    const route = getRoute(app.routeId);
    if (route) {
      const assessment = runAssessment(app, route);
      loadApplication({
        ...app,
        assessment,
        history: [{ ranAt: assessment.ranAt, overall: assessment.overall }],
      });
    }
    router.replace("/application/assessment");
  }, [loadApplication, router]);

  return <p className="py-16 text-center text-muted">Loading the worked example…</p>;
}
