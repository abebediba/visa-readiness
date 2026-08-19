import assert from "node:assert/strict";
import { test } from "node:test";
import type { Application, RouteId } from "../lib/types";
import { getRoute } from "../lib/routes/definitions";
import { runAssessment } from "../lib/engine/assess";
import { generateQuestions } from "../lib/interview/questions";

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

test("questions are grounded in the applicant's actual case", () => {
  const app = makeApp("US_F1", {
    "study.institution": "Purdue University",
    "study.programme": "MSc Cybersecurity",
    "finances.who_pays": "sponsor",
    "sponsor.name": "Kwame Mensah",
    "refusals.has_refusal": true,
  });
  const route = getRoute("US_F1")!;
  const questions = generateQuestions(app, route);

  assert.ok(questions.some((q) => q.question.includes("Purdue University")), "uses the real school");
  assert.ok(questions.some((q) => q.question.includes("Kwame Mensah")), "uses the real sponsor");
  assert.ok(questions.some((q) => q.id === "refusal"), "probes the declared refusal");
});

test("detected findings become interview probes", () => {
  const app = makeApp("US_B1B2", {
    "employment.monthly_income": "15000",
    "employment.status": "employed",
    "finances.large_recent_deposit": true,
  });
  app.documents.push({
    id: "d1",
    type: "employment_letter",
    fileName: "letter.pdf",
    size: 100,
    addedAt: "2026-08-01T00:00:00.000Z",
    facts: { "employment.monthly_income": "12500" },
    factsConfirmed: true,
  });
  const route = getRoute("US_B1B2")!;
  const assessment = runAssessment(app, route);
  const questions = generateQuestions(app, route, assessment);

  assert.ok(
    questions.some((q) => q.id === "finding_income_mismatch"),
    "income mismatch produces a probe"
  );
  assert.ok(
    questions.some((q) => q.id === "finding_large_deposit_unexplained"),
    "unexplained deposit produces a probe"
  );
});

test("question generation is deterministic", () => {
  const app = makeApp("US_B1B2", { "trip.duration_days": "14", "finances.who_pays": "self" });
  const route = getRoute("US_B1B2")!;
  assert.deepEqual(generateQuestions(app, route), generateQuestions(app, route));
});

test("guidance never coaches deception", () => {
  const app = makeApp("US_B1B2", {
    "refusals.has_refusal": true,
    "us.has_relatives": true,
    "finances.large_recent_deposit": true,
  });
  const route = getRoute("US_B1B2")!;
  const assessment = runAssessment(app, route);
  const questions = generateQuestions(app, route, assessment);
  const text = questions.map((q) => `${q.question} ${q.focus}`).join(" ").toLowerCase();
  for (const banned of ["pretend", "make up", "borrow money", "don't mention", "do not mention", "conceal"]) {
    assert.ok(!text.includes(banned), `guidance must not say "${banned}"`);
  }
  assert.ok(text.includes("never minimize or hide"), "explicitly warns against hiding refusals");
});
