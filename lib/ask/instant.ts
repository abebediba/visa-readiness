import type { Application, AssessmentResult, RouteDefinition } from "../types";

export type InstantAnswer = {
  id: string;
  question: string;
  answer: string;
  items: string[];
};

/**
 * The most common "Ask My Application" questions answered deterministically
 * from the latest assessment — no AI involved, works offline, and every line
 * traces to a finding or checklist entry the user can already inspect.
 */
export function instantAnswers(
  app: Application,
  route: RouteDefinition,
  assessment: AssessmentResult | undefined
): InstantAnswer[] {
  if (!assessment) return [];
  const answers: InstantAnswer[] = [];

  const missing = assessment.missingDocuments;
  answers.push({
    id: "missing_docs",
    question: "What documents am I missing?",
    answer:
      missing.length === 0
        ? "Nothing on the checklist is missing — every applicable document has been added."
        : `${missing.length} applicable document${missing.length > 1 ? "s are" : " is"} not added yet:`,
    items: missing.map(
      (d) => `${d.label}${d.requirement === "recommended" ? " (recommended, not mandatory)" : " (required)"}`
    ),
  });

  const contradictions = assessment.findings.filter(
    (f) => f.severity === "critical" || (f.severity === "important" && f.category === "consistency")
  );
  answers.push({
    id: "contradictions",
    question: "Where have I contradicted myself?",
    answer:
      contradictions.length === 0
        ? "No contradictions were detected between your answers and the document details you entered."
        : `${contradictions.length} contradiction${contradictions.length > 1 ? "s" : ""} detected:`,
    items: contradictions.map((f) => `${f.title} — ${f.detail}`),
  });

  const scored = assessment.categories.filter((c) => c.score !== null);
  const weakest = [...scored].sort((a, b) => (a.score as number) - (b.score as number)).slice(0, 3);
  const unscored = assessment.categories.filter((c) => c.score === null);
  answers.push({
    id: "attention",
    question: "What parts of my application need the most attention?",
    answer: "Ranked by current sub-score:",
    items: [
      ...weakest.map((c) => `${c.label}: ${c.score}/100 (${c.coverageDetail})`),
      ...unscored.map((c) => `${c.label}: not enough information yet`),
    ],
  });

  const actions = assessment.findings
    .filter((f) => f.severity === "critical" || f.severity === "important")
    .slice(0, 6);
  answers.push({
    id: "next_actions",
    question: "What should I fix first?",
    answer:
      actions.length === 0
        ? "No critical or important issues are open — review the smaller improvements on the assessment page."
        : "In order of severity:",
    items: actions.map((f) => f.recommendation),
  });

  return answers;
}

/** Compact, provenance-tagged view of the case for the grounded AI assistant. */
export function caseFacts(app: Application, route: RouteDefinition): Record<string, string> {
  const facts: Record<string, string> = {};
  for (const [k, v] of Object.entries(app.answers)) {
    facts[`questionnaire: ${k}`] = String(v);
  }
  for (const doc of app.documents) {
    const label = route.documents.find((d) => d.type === doc.type)?.label ?? doc.type;
    for (const [k, v] of Object.entries(doc.facts)) {
      facts[`document "${label}": ${k}`] = v;
    }
  }
  return facts;
}
