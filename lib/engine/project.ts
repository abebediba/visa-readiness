import type { AssessmentResult, RiskLevel, Severity } from "../types";
import { SEVERITY_PENALTY, bandFor } from "../types";
import { SEVERITY_CAP } from "./assess";

export type Projection = {
  overall: number;
  weighted: number;
  cap: number;
  band: string;
  /** Category id → score with the fixed findings removed. */
  scores: Record<string, number | null>;
  criticalCount: number;
  importantCount: number;
  risk: RiskLevel;
};

/**
 * Re-scores an assessment as if the given findings were resolved — the
 * "mark as fixed" what-if on the assessment page.
 *
 * This is a projection, never a result: it is pure, takes no new evidence, and
 * nothing it returns is stored. Fixing a finding here means the user asserts
 * they will fix it, not that the engine has seen it fixed. Re-running the real
 * assessment is the only thing that changes a score.
 *
 * It mirrors `runAssessment`'s arithmetic exactly — subtract the open findings'
 * penalties from each category's pre-penalty base, take the weighted mean over
 * the scored categories, then apply the severity cap — so a projection that
 * says 79 is what a genuine re-run would produce, given the same fixes.
 */
export function projectScore(result: AssessmentResult, fixed: Set<string>): Projection {
  const open = result.findings.filter((f) => !fixed.has(f.code));

  const scores: Record<string, number | null> = {};
  for (const cat of result.categories) {
    if (cat.base === null || cat.score === null) {
      scores[cat.id] = null;
      continue;
    }
    const penalty = open
      .filter((f) => f.category === cat.id)
      .reduce((sum, f) => sum + SEVERITY_PENALTY[f.severity], 0);
    scores[cat.id] = Math.max(0, Math.min(100, cat.base - penalty));
  }

  const scored = result.categories.filter((c) => scores[c.id] !== null);
  const weightSum = scored.reduce((s, c) => s + c.weight, 0);
  const weighted = weightSum
    ? Math.round(scored.reduce((s, c) => s + (scores[c.id] as number) * c.weight, 0) / weightSum)
    : 0;

  const has = (sev: Severity) => open.some((f) => f.severity === sev);
  const cap = has("critical") ? SEVERITY_CAP.critical : has("important") ? SEVERITY_CAP.important : 100;
  const overall = Math.min(weighted, cap);

  const criticalCount = open.filter((f) => f.severity === "critical").length;
  const importantCount = open.filter((f) => f.severity === "important").length;

  return {
    overall,
    weighted,
    cap,
    band: bandFor(overall),
    scores,
    criticalCount,
    importantCount,
    risk: criticalCount > 0 || importantCount >= 3 ? "high" : importantCount > 0 ? "medium" : "low",
  };
}
