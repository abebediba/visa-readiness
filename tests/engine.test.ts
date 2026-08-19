import assert from "node:assert/strict";
import { test } from "node:test";
import type { Application, RouteId, UploadedDoc } from "../lib/types";
import { getRoute } from "../lib/routes/definitions";
import { runAssessment } from "../lib/engine/assess";

let seq = 0;
function doc(type: string, facts: Record<string, string>): UploadedDoc {
  seq += 1;
  return {
    id: `doc_${seq}`,
    type,
    fileName: `${type}.pdf`,
    size: 1000,
    addedAt: "2026-08-01T00:00:00.000Z",
    facts,
    factsConfirmed: true,
  };
}

function makeApp(
  routeId: RouteId,
  answers: Application["answers"],
  documents: UploadedDoc[] = []
): Application {
  return {
    id: "app_test",
    routeId,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    answers,
    documents,
    history: [],
  };
}

function assess(app: Application) {
  const route = getRoute(app.routeId);
  assert.ok(route, "route exists");
  return runAssessment(app, route!);
}

test("critical contradiction: declared no US relatives but invitation is from a sibling", () => {
  const app = makeApp(
    "US_B1B2",
    { "us.has_relatives": false, "trip.accommodation": "host" },
    [doc("invitation_letter", { "invitation.relationship": "sibling", "trip.duration_days": "30" })]
  );
  const result = assess(app);
  const finding = result.findings.find((f) => f.code === "RELATIVES_CONTRADICTION");
  assert.ok(finding, "contradiction detected");
  assert.equal(finding!.severity, "critical");
});

test("salary triangulation: questionnaire outlier vs agreeing documents", () => {
  const app = makeApp(
    "US_B1B2",
    { "employment.monthly_income": "15000", "employment.status": "employed" },
    [
      doc("employment_letter", { "employment.monthly_income": "12500" }),
      doc("bank_statement", { "employment.monthly_income": "12500" }),
    ]
  );
  const result = assess(app);
  const finding = result.findings.find((f) => f.code === "INCOME_MISMATCH");
  assert.ok(finding, "income mismatch detected");
  assert.equal(finding!.severity, "important");
  assert.match(finding!.detail, /outlier/);
});

test("no income finding when questionnaire matches documents", () => {
  const app = makeApp(
    "US_B1B2",
    { "employment.monthly_income": "12500" },
    [doc("employment_letter", { "employment.monthly_income": "12500" })]
  );
  const result = assess(app);
  assert.equal(result.findings.find((f) => f.code === "INCOME_MISMATCH"), undefined);
});

test("trip duration 14 days vs invitation 30 days is an important inconsistency", () => {
  const app = makeApp(
    "CA_TRV",
    { "trip.duration_days": "14", "trip.accommodation": "host" },
    [doc("invitation_letter", { "trip.duration_days": "30" })]
  );
  const result = assess(app);
  const finding = result.findings.find((f) => f.code === "DURATION_MISMATCH");
  assert.ok(finding, "duration mismatch detected");
  assert.equal(finding!.severity, "important");
});

test("UK stay beyond 180 days is critical (threshold read from the rules engine)", () => {
  const app = makeApp("UK_VISITOR", { "trip.duration_days": "200" });
  const result = assess(app);
  const finding = result.findings.find((f) => f.code === "STAY_EXCEEDS_LIMIT");
  assert.ok(finding, "limit breach detected");
  assert.equal(finding!.severity, "critical");
});

test("Canada study funding gap uses IRCC living-funds parameter when amounts are in CAD", () => {
  const app = makeApp(
    "CA_STUDY",
    {
      "identity.currency": "CAD",
      "study.tuition_year1": "18000",
      "finances.available_funds": "10000",
    },
    [doc("bank_statement", { "finances.available_funds": "10000" })]
  );
  const result = assess(app);
  const finding = result.findings.find((f) => f.code === "FUNDING_GAP");
  assert.ok(finding, "funding gap detected");
  assert.match(finding!.detail, /living funds/);
});

test("unexplained large deposit is important; explained becomes review", () => {
  const base = { "finances.large_recent_deposit": true } as Application["answers"];
  const unexplained = assess(makeApp("UK_VISITOR", base));
  assert.ok(unexplained.findings.find((f) => f.code === "LARGE_DEPOSIT_UNEXPLAINED"));

  const explained = assess(
    makeApp("UK_VISITOR", {
      ...base,
      "finances.deposit_source": "Proceeds from selling my car, sale agreement available.",
    })
  );
  const finding = explained.findings.find((f) => f.code === "LARGE_DEPOSIT_EXPLAINED");
  assert.ok(finding);
  assert.equal(finding!.severity, "review");
});

test("sponsor stated but unevidenced is flagged", () => {
  const app = makeApp("US_B1B2", {
    "finances.who_pays": "sponsor",
    "sponsor.name": "Kwame Mensah",
  });
  const result = assess(app);
  assert.ok(result.findings.find((f) => f.code === "SPONSOR_UNEVIDENCED"));
});

test("determinism: identical inputs produce identical results (excluding timestamp)", () => {
  const app = makeApp(
    "US_B1B2",
    {
      "identity.full_name": "Ama Serwaa Boateng",
      "employment.monthly_income": "8000",
      "finances.available_funds": "60000",
      "finances.trip_cost": "30000",
      "trip.duration_days": "14",
    },
    [doc("bank_statement", { "finances.available_funds": "60000" })]
  );
  const strip = (r: ReturnType<typeof assess>) => ({ ...r, ranAt: "fixed" });
  const a = strip(assess(app));
  const b = strip(assess(app));
  assert.deepEqual(a, b);
});

test("every route assesses an empty application without crashing and scores 0-100", () => {
  for (const routeId of ["US_B1B2", "US_F1", "CA_TRV", "CA_STUDY", "UK_VISITOR"] as RouteId[]) {
    const result = assess(makeApp(routeId, {}));
    assert.ok(result.overall >= 0 && result.overall <= 100, `${routeId} overall in range`);
    assert.ok(result.missingDocuments.length > 0, `${routeId} reports missing documents`);
  }
});

test("category weights are explainable: overall is the weighted mean of scored categories", () => {
  const result = assess(makeApp("UK_VISITOR", { "trip.duration_days": "10" }));
  const scored = result.categories.filter((c) => c.score !== null);
  const weightSum = scored.reduce((s, c) => s + c.weight, 0);
  const expected = Math.round(scored.reduce((s, c) => s + (c.score as number) * c.weight, 0) / weightSum);
  assert.equal(result.overall, expected);
});
