/**
 * Presentation for each assessment category, keyed by the category id shared
 * across routes - so a new route inherits all of this without extra work.
 */
export const CATEGORY_META: Record<string, { description: string }> = {
  purpose: { description: "Clarity and supporting documents" },
  financial: { description: "Sufficiency and stability of funds" },
  funding: { description: "Where the money comes from" },
  employment: { description: "Work history and stability" },
  home_ties: { description: "Commitments and return intentions" },
  travel_history: { description: "Previous travel and compliance" },
  consistency: { description: "Answers and documents agree" },
  documentation: { description: "Validity and completeness" },
  previous_refusals: { description: "Past decisions and changes since" },
  school: { description: "Admission and enrolment" },
  admission: { description: "Acceptance and attestation" },
  academic: { description: "Progression and programme" },
};

export const DEFAULT_CATEGORY_META = {
  description: "Evidence and consistency in this area",
};

/** Short quality word for a percentage, used beside the headline metrics. */
export function qualityLabel(pct: number): string {
  if (pct >= 90) return "Strong";
  if (pct >= 65) return "Good";
  if (pct >= 40) return "Needs work";
  return "Weak";
}
