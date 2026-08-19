// Shared client/server types for the optional AI features. The AI never
// scores, never invents requirements, and every extracted value goes through
// human confirmation before it is used (docs/PROMPT.md §15).

export type ExtractRequest = {
  routeId: string;
  docType: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";
  /** base64, no data: prefix */
  data: string;
};

export type ExtractedField = {
  id: string;
  value: string;
  confidence: number; // 0..1
};

export type ExtractResponse = {
  ok: true;
  detectedType: string;
  typeMatchesDeclared: boolean;
  quality: { readable: boolean; issues: string[] };
  fields: ExtractedField[];
};

export type AiError = { ok: false; error: string };

export type InterviewFeedbackRequest = {
  question: string;
  answer: string;
  /** Relevant confirmed facts from the applicant's own case, key → value */
  facts: Record<string, string>;
};

export type InterviewFeedback = {
  ok: true;
  consistentWithCase: boolean;
  clarity: "clear" | "adequate" | "unclear";
  overExplained: boolean;
  strengths: string[];
  improvements: string[];
};

/** Fields below this are visually flagged for extra attention in review. */
export const CONFIDENCE_REVIEW_THRESHOLD = 0.85;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type AskRequest = {
  routeId: string;
  question: string;
  /** Provenance-tagged case facts, e.g. 'document "Bank statements": finances.available_funds' */
  facts: Record<string, string>;
  findings: { severity: string; title: string; detail: string }[];
};

export type AskResponse = {
  ok: true;
  answer: string;
  citations: { source: string; note: string }[];
};
