export type RouteId = "US_B1B2" | "US_F1" | "CA_TRV" | "CA_STUDY" | "UK_VISITOR";

export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "date"
  | "select"
  | "boolean";

export type Question = {
  /** Doubles as the fact key, e.g. "employment.monthly_income" */
  id: string;
  label: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
  /** Only show when another answer matches */
  showIf?: { questionId: string; equals: string | boolean };
};

export type Section = {
  id: string;
  title: string;
  intro?: string;
  questions: Question[];
};

/** A field the user keys in from a document — the manual "extraction review" step. */
export type FactField = {
  id: string;
  label: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  help?: string;
};

export type Requirement = "required" | "recommended" | "conditional";

export type DocumentTypeDef = {
  type: string;
  label: string;
  requirement: Requirement;
  /** Only applies when this questionnaire answer matches */
  condition?: { questionId: string; equals: string | boolean };
  /** Assessment categories this document is evidence for */
  categories: string[];
  factFields?: FactField[];
  help?: string;
};

export type CategoryDef = {
  id: string;
  label: string;
  weight: number;
  /** Questionnaire sections whose completion counts toward this category's coverage */
  sections?: string[];
};

export type RouteDefinition = {
  id: RouteId;
  country: string;
  countryName: string;
  name: string;
  shortName: string;
  tagline: string;
  /** Broad category, used for grouping and colour-coding in the UI */
  kind: "visitor" | "study";
  sections: Section[];
  documents: DocumentTypeDef[];
  categories: CategoryDef[];
  /** Consistency/financial check ids from the check catalog */
  checks: string[];
  interview: boolean;
};

// ---- Rules engine ----

export type Rule = {
  country: string;
  visa_route: RouteId;
  rule_id: string;
  category: string;
  requirement: string;
  requirement_type: "document" | "financial" | "eligibility" | "process";
  mandatory: boolean;
  description: string;
  accepted_evidence: string[];
  /** Thresholds, amounts, durations — never hard-coded in engine logic */
  parameters?: Record<string, number | string>;
  effective_from: string;
  effective_to?: string;
  official_source_url: string;
  last_verified_at: string;
  status: "active" | "superseded" | "draft";
};

// ---- Facts & assessment ----

export type FactSource = "questionnaire" | "document";

export type Fact = {
  key: string;
  value: string;
  source: FactSource;
  /** Document type + label when source is a document */
  sourceLabel: string;
};

/** All values known for one semantic key, across sources */
export type FactMap = Map<string, Fact[]>;

export type Severity = "critical" | "important" | "review" | "improvement";

export type Finding = {
  code: string;
  severity: Severity;
  category: string;
  title: string;
  detail: string;
  recommendation: string;
  /** Fact keys involved, for the explainability view */
  facts?: string[];
};

export type CategoryScore = {
  id: string;
  label: string;
  score: number | null; // null = not enough information
  weight: number;
  coverage: number; // 0..1
  coverageDetail: string;
  penalties: { code: string; title: string; severity: Severity; points: number }[];
};

export type RiskLevel = "low" | "medium" | "high";

/** The four headline figures shown beside the score. All derived, none cosmetic. */
export type AssessmentMetrics = {
  sections: { done: number; total: number; pct: number };
  /** How well the values agree across questionnaire and documents */
  consistencyPct: number;
  /** Applicable required documents actually provided */
  evidencePct: number;
  risk: RiskLevel;
};

export type AssessmentResult = {
  engineVersion: string;
  rulesVersion: string;
  ranAt: string;
  overall: number;
  band: string;
  categories: CategoryScore[];
  findings: Finding[];
  missingDocuments: { type: string; label: string; requirement: Requirement }[];
  answeredRequired: number;
  totalRequired: number;
  metrics: AssessmentMetrics;
};

// ---- Application state ----

export type UploadedDoc = {
  id: string;
  type: string;
  fileName: string;
  size: number;
  addedAt: string;
  /** User-entered fields from the document (manual extraction review) */
  facts: Record<string, string>;
  factsConfirmed: boolean;
};

export type Application = {
  id: string;
  routeId: RouteId;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, string | boolean>;
  documents: UploadedDoc[];
  assessment?: AssessmentResult;
  history: { ranAt: string; overall: number }[];
  submittedAt?: string;
  outcome?: Outcome;
  /** Sample application loaded from the worked example, not the user's own */
  isDemo?: boolean;
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  important: "Important",
  review: "Review",
  improvement: "Improvement",
};

export const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 25,
  important: 12,
  review: 6,
  improvement: 2,
};

export function bandFor(score: number): string {
  if (score >= 90) return "Very Strong Readiness";
  if (score >= 80) return "Strong Readiness";
  if (score >= 65) return "Moderate Readiness";
  if (score >= 50) return "Significant Weaknesses";
  return "Not Submission Ready";
}

// ---- Outcome tracking (voluntary, after the real decision) ----

export type OutcomeDecision =
  | "approved"
  | "refused"
  | "administrative_processing"
  | "withdrawn"
  | "other";

export type Outcome = {
  decision: OutcomeDecision;
  decisionDate: string;
  refusalReason?: string;
  /** Overall readiness at the time the user marked the application submitted */
  scoreAtSubmission?: number;
  recordedAt: string;
};

export const OUTCOME_LABEL: Record<OutcomeDecision, string> = {
  approved: "Approved",
  refused: "Refused",
  administrative_processing: "Administrative processing",
  withdrawn: "Withdrawn",
  other: "Other",
};
