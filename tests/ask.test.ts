import assert from "node:assert/strict";
import { test } from "node:test";
import type { Application, RouteId } from "../lib/types";
import { getRoute } from "../lib/routes/definitions";
import { runAssessment } from "../lib/engine/assess";
import { caseFacts, instantAnswers } from "../lib/ask/instant";

function makeApp(routeId: RouteId, answers: Application["answers"]): Application {
  return {
    id: "app_test",
    routeId,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    answers,
    documents: [],
    history: [],
  };
}

test("instant answers cover the core questions from the assessment", () => {
  const app = makeApp("UK_VISITOR", {
    "trip.duration_days": "200",
    "finances.large_recent_deposit": true,
  });
  const route = getRoute("UK_VISITOR")!;
  const assessment = runAssessment(app, route);
  const answers = instantAnswers(app, route, assessment);

  const byId = Object.fromEntries(answers.map((a) => [a.id, a]));
  assert.ok(byId.missing_docs.items.length > 0, "lists missing documents");
  assert.ok(
    byId.contradictions.items.some((i) => i.includes("180")),
    "surfaces the stay-limit contradiction"
  );
  assert.ok(byId.next_actions.items.length > 0, "recommends fixes in severity order");
});

test("instant answers are empty without an assessment", () => {
  const app = makeApp("UK_VISITOR", {});
  const route = getRoute("UK_VISITOR")!;
  assert.deepEqual(instantAnswers(app, route, undefined), []);
});

test("case facts carry provenance labels for questionnaire and documents", () => {
  const app = makeApp("US_B1B2", { "employment.monthly_income": "8000" });
  app.documents.push({
    id: "d1",
    type: "bank_statement",
    fileName: "stmt.pdf",
    size: 100,
    addedAt: "2026-08-01T00:00:00.000Z",
    facts: { "finances.available_funds": "60000" },
    factsConfirmed: true,
  });
  const route = getRoute("US_B1B2")!;
  const facts = caseFacts(app, route);
  assert.equal(facts["questionnaire: employment.monthly_income"], "8000");
  assert.equal(facts['document "Bank statements (recent months)": finances.available_funds'], "60000");
});
