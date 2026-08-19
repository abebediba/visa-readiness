import type {
  Application,
  AssessmentResult,
  CategoryScore,
  DocumentTypeDef,
  Finding,
  Question,
  RouteDefinition,
} from "../types";
import { SEVERITY_PENALTY, bandFor } from "../types";
import { RULES_VERSION } from "../rules/seed";
import { buildFactMap } from "./facts";
import { runChecks } from "./checks";

export const ENGINE_VERSION = "0.1.0";

/**
 * Deterministic assessment. No model in the loop: same answers + documents +
 * rules version + engine version always produce the identical score, and every
 * point of every sub-score traces to coverage or to a named finding.
 */
export function runAssessment(app: Application, route: RouteDefinition): AssessmentResult {
  const facts = buildFactMap(app, route);
  const findings = runChecks({ app, route, facts });

  // ---- applicability ----
  const answerMatches = (cond: { questionId: string; equals: string | boolean }) =>
    app.answers[cond.questionId] === cond.equals;

  const applicableDocs = route.documents.filter(
    (d) => d.requirement !== "conditional" || (d.condition && answerMatches(d.condition))
  );
  const uploadedTypes = new Set(app.documents.map((d) => d.type));

  const missingDocuments = applicableDocs
    .filter((d) => !uploadedTypes.has(d.type))
    .map((d) => ({ type: d.type, label: d.label, requirement: d.requirement }));

  // Missing required documents become findings on their first category
  for (const d of applicableDocs) {
    if (uploadedTypes.has(d.type)) continue;
    const required = d.requirement === "required" || d.requirement === "conditional";
    findings.push({
      code: `MISSING_${d.type.toUpperCase()}`,
      severity: required ? "important" : "improvement",
      category: d.categories[0] ?? "documentation",
      title: `${d.label} is missing`,
      detail: required
        ? `${d.label} applies to your case and has not been uploaded.`
        : `${d.label} is not mandatory, but it would strengthen this area.`,
      recommendation: d.help ? `Upload it. ${d.help}` : `Upload your ${d.label.toLowerCase()}.`,
    });
  }

  // Unconfirmed document facts weaken confidence in consistency
  for (const doc of app.documents) {
    const def = route.documents.find((d) => d.type === doc.type);
    if (def?.factFields?.length && !doc.factsConfirmed) {
      findings.push({
        code: `UNREVIEWED_${doc.type.toUpperCase()}`,
        severity: "review",
        category: "consistency",
        title: `Key details from "${def.label}" are not entered yet`,
        detail: "The assessment compares values across your documents; without this document's key fields it cannot check them.",
        recommendation: `Open ${def.label} in your documents list and enter its key fields so they can be cross-checked.`,
      });
    }
  }

  // ---- questionnaire coverage ----
  const visible = (q: Question) => !q.showIf || app.answers[q.showIf.questionId] === q.showIf.equals;
  const answered = (q: Question) => {
    const v = app.answers[q.id];
    return v !== undefined && v !== "";
  };

  const sectionCoverage = new Map<string, { done: number; total: number }>();
  for (const section of route.sections) {
    const qs = section.questions.filter((q) => visible(q) && q.required);
    const done = qs.filter(answered).length;
    sectionCoverage.set(section.id, { done, total: qs.length });
  }

  const allRequired = route.sections.flatMap((s) => s.questions.filter((q) => visible(q) && q.required));
  const answeredRequired = allRequired.filter(answered).length;

  // ---- per-category scores ----
  const docsFor = (catId: string): DocumentTypeDef[] =>
    applicableDocs.filter((d) => d.categories.includes(catId));

  const categories: CategoryScore[] = route.categories.map((cat) => {
    let done = 0;
    let total = 0;
    const parts: string[] = [];

    for (const sectionId of cat.sections ?? []) {
      const cov = sectionCoverage.get(sectionId);
      if (cov && cov.total > 0) {
        done += cov.done;
        total += cov.total;
      }
    }
    if (total > 0) parts.push(`${done}/${total} required answers`);

    const catDocs = docsFor(cat.id);
    const requiredDocs = catDocs.filter((d) => d.requirement !== "recommended");
    const uploadedDocs = requiredDocs.filter((d) => uploadedTypes.has(d.type));
    if (requiredDocs.length > 0) {
      done += uploadedDocs.length * 2; // documents weigh double vs single answers
      total += requiredDocs.length * 2;
      parts.push(`${uploadedDocs.length}/${requiredDocs.length} required documents`);
    }

    const coverage = total > 0 ? done / total : 1;
    const catFindings = findings.filter((f) => f.category === cat.id);
    const penalties = catFindings.map((f) => ({
      code: f.code,
      title: f.title,
      severity: f.severity,
      points: SEVERITY_PENALTY[f.severity],
    }));
    const penaltyTotal = penalties.reduce((s, p) => s + p.points, 0);

    // Not enough information to score at all
    if (total > 0 && coverage < 0.3) {
      return {
        id: cat.id,
        label: cat.label,
        score: null,
        weight: cat.weight,
        coverage,
        coverageDetail: parts.join(" · ") || "no inputs yet",
        penalties,
      };
    }

    const base = total > 0 ? 40 + Math.round(60 * coverage) : 90;
    const score = Math.max(0, Math.min(100, base - penaltyTotal));
    return {
      id: cat.id,
      label: cat.label,
      score,
      weight: cat.weight,
      coverage,
      coverageDetail: parts.join(" · ") || "consistency of everything you provided",
      penalties,
    };
  });

  const scored = categories.filter((c) => c.score !== null);
  const weightSum = scored.reduce((s, c) => s + c.weight, 0);
  const overall =
    weightSum > 0
      ? Math.round(scored.reduce((s, c) => s + (c.score as number) * c.weight, 0) / weightSum)
      : 0;

  return {
    engineVersion: ENGINE_VERSION,
    rulesVersion: RULES_VERSION,
    ranAt: new Date().toISOString(),
    overall,
    band: bandFor(overall),
    categories,
    findings: sortFindings(findings),
    missingDocuments,
    answeredRequired,
    totalRequired: allRequired.length,
  };
}

const ORDER: Record<string, number> = { critical: 0, important: 1, review: 2, improvement: 3 };

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}
