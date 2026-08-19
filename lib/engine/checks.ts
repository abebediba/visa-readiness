import type { Application, FactMap, Finding, RouteDefinition } from "../types";
import { ruleParam } from "../rules/seed";
import {
  documentFacts,
  factsFor,
  looseMatch,
  namesMatch,
  parseDate,
  parseDays,
  parseMoney,
  questionnaireValue,
  relDiff,
} from "./facts";

export type CheckContext = {
  app: Application;
  route: RouteDefinition;
  facts: FactMap;
};

type Check = (ctx: CheckContext) => Finding[];

const FAMILY_RELATIONSHIPS = new Set(["parent", "sibling", "spouse", "other_family"]);

// ---------------- Check catalog ----------------
// Deterministic comparisons over the fact map. Each check declares its
// category and severity; the scoring engine only aggregates.

const name_match: Check = ({ facts }) => {
  const values = factsFor(facts, "identity.full_name");
  if (values.length < 2) return [];
  const findings: Finding[] = [];
  const base = values[0];
  for (const other of values.slice(1)) {
    if (!namesMatch(base.value, other.value)) {
      findings.push({
        code: "NAME_MISMATCH",
        severity: "important",
        category: "consistency",
        title: "Your name is not written the same way everywhere",
        detail: `"${base.value}" (${base.sourceLabel}) vs "${other.value}" (${other.sourceLabel}). Reviewers match documents by name; unexplained differences cause doubt.`,
        recommendation:
          "Use your name exactly as printed in your passport on every form and ask document issuers to correct theirs, or prepare evidence explaining the difference (e.g. marriage certificate).",
        facts: ["identity.full_name"],
      });
      break;
    }
  }
  return findings;
};

const salary_triangulation: Check = ({ facts }) => {
  const q = parseMoney(questionnaireValue(facts, "employment.monthly_income"));
  const docVals = documentFacts(facts, "employment.monthly_income")
    .map((f) => ({ ...f, amount: parseMoney(f.value) }))
    .filter((f) => f.amount !== undefined) as { sourceLabel: string; amount: number }[];
  if (q === undefined || docVals.length === 0) return [];

  const disagreeing = docVals.filter((d) => relDiff(q, d.amount) > 0.15);
  if (disagreeing.length === 0) return [];

  const docsAgree =
    docVals.length >= 2 &&
    docVals.every((d) => relDiff(docVals[0].amount, d.amount) <= 0.1);

  return [
    {
      code: "INCOME_MISMATCH",
      severity: "important",
      category: "consistency",
      title: "Your declared income does not match your evidence",
      detail:
        `You declared ${q.toLocaleString()} per month, but ` +
        disagreeing.map((d) => `${d.sourceLabel} shows ${d.amount.toLocaleString()}`).join(" and ") +
        (docsAgree ? ". Your documents agree with each other — the questionnaire answer is the outlier." : "."),
      recommendation:
        "Declare the income your documents actually show. If your true income includes allowances or other sources, upload evidence for each part instead of a rounded total.",
      facts: ["employment.monthly_income"],
    },
  ];
};

const passport_validity: Check = ({ facts, route }) => {
  const expiry = parseDate(firstDoc(facts, "passport.expiry_date"));
  if (!expiry) return [];
  const start =
    parseDate(questionnaireValue(facts, "trip.arrival_date")) ??
    parseDate(questionnaireValue(facts, "study.start_date"));
  if (!start) return [];
  const durationDays =
    parseDays(questionnaireValue(facts, "trip.duration_days")) ??
    (parseDays(questionnaireValue(facts, "study.duration_months")) ?? 12) * 30;
  const tripEnd = new Date(start.getTime() + durationDays * 86400000);

  if (expiry <= tripEnd) {
    return [
      {
        code: "PASSPORT_EXPIRES",
        severity: "critical",
        category: "documentation",
        title: "Your passport expires before or during your planned stay",
        detail: `Passport expiry ${expiry.toISOString().slice(0, 10)} is not beyond your planned stay ending around ${tripEnd.toISOString().slice(0, 10)}.`,
        recommendation: "Renew your passport before applying. An expiring passport can invalidate the whole application.",
        facts: ["passport.expiry_date", "trip.arrival_date"],
      },
    ];
  }
  const minMonths = ruleParam(route.id, `${route.id}_PASSPORT_VALIDITY`, "min_validity_months_after_trip") ?? 6;
  const buffer = new Date(tripEnd);
  buffer.setMonth(buffer.getMonth() + minMonths);
  if (expiry < buffer) {
    return [
      {
        code: "PASSPORT_SHORT_VALIDITY",
        severity: "review",
        category: "documentation",
        title: `Passport validity is under ${minMonths} months beyond your stay`,
        detail: `Many authorities expect ${minMonths} months of validity after departure. Yours expires ${expiry.toISOString().slice(0, 10)}.`,
        recommendation: "Consider renewing your passport before applying to remove any doubt.",
        facts: ["passport.expiry_date"],
      },
    ];
  }
  return [];
};

const funds_vs_cost: Check = ({ facts, route }) => {
  const declared = parseMoney(questionnaireValue(facts, "finances.available_funds"));
  const bank = parseMoney(firstDoc(facts, "finances.available_funds"));
  const cost = parseMoney(questionnaireValue(facts, "finances.trip_cost"));
  const findings: Finding[] = [];

  if (declared !== undefined && bank !== undefined && relDiff(declared, bank) > 0.2) {
    findings.push({
      code: "FUNDS_MISMATCH",
      severity: "important",
      category: "consistency",
      title: "Declared funds do not match your bank statement",
      detail: `You declared ${declared.toLocaleString()} available, but the statement closing balance you entered is ${bank.toLocaleString()}.`,
      recommendation: "Declare what your statements actually show, or upload statements for the other accounts that make up the difference.",
      facts: ["finances.available_funds"],
    });
  }

  const funds = bank ?? declared;
  if (funds !== undefined && cost !== undefined && cost > 0) {
    const ratio = ruleParam(route.id, `${route.id}_FUNDS`, "funds_to_cost_ratio_min") ?? 1.2;
    if (funds < cost) {
      findings.push({
        code: "FUNDS_BELOW_COST",
        severity: "important",
        category: "financial",
        title: "Your available funds are below your estimated trip cost",
        detail: `Funds ${funds.toLocaleString()} vs estimated cost ${cost.toLocaleString()}.`,
        recommendation:
          "Show additional legitimate funds (other accounts, a documented sponsor) or reduce the planned cost. Do not borrow money temporarily to inflate a balance — reviewers look at how money arrived.",
        facts: ["finances.available_funds", "finances.trip_cost"],
      });
    } else if (funds < cost * ratio) {
      findings.push({
        code: "FUNDS_TIGHT",
        severity: "review",
        category: "financial",
        title: "Your funds only just cover the trip",
        detail: `Funds ${funds.toLocaleString()} against cost ${cost.toLocaleString()} leave little margin.`,
        recommendation: "If you have other accounts or income, include them. A comfortable margin reads better than an exact fit.",
        facts: ["finances.available_funds", "finances.trip_cost"],
      });
    }
  }
  return findings;
};

const large_deposit: Check = ({ app }) => {
  if (app.answers["finances.large_recent_deposit"] !== true) return [];
  const explained = String(app.answers["finances.deposit_source"] ?? "").trim().length >= 20;
  return [
    {
      code: explained ? "LARGE_DEPOSIT_EXPLAINED" : "LARGE_DEPOSIT_UNEXPLAINED",
      severity: explained ? "review" : "important",
      category: "financial",
      title: "A recent deposit represents a significant portion of your balance",
      detail: explained
        ? "You have described its source. Make sure the same explanation is supported by uploadable evidence."
        : "You have not yet explained where this money came from.",
      recommendation:
        "Provide legitimate evidence showing the source of these funds (sale agreement, gift letter with the giver's own statements, business income records). Unexplained lump sums are a common refusal reason.",
      facts: ["finances.large_recent_deposit", "finances.deposit_source"],
    },
  ];
};

const sponsor_capacity: Check = ({ app, facts }) => {
  const whoPays = app.answers["finances.who_pays"];
  if (whoPays !== "sponsor" && whoPays !== "mixed") return [];
  const findings: Finding[] = [];
  const sponsorName = String(app.answers["sponsor.name"] ?? "").trim();
  const hasEvidence = app.documents.some((d) => d.type === "sponsor_evidence");

  if (sponsorName && !hasEvidence) {
    findings.push({
      code: "SPONSOR_UNEVIDENCED",
      severity: "important",
      category: "financial",
      title: "Your sponsor is stated but not supported by evidence",
      detail: `You rely on ${sponsorName}, but no sponsor financial evidence is uploaded.`,
      recommendation:
        "Upload the sponsor's bank statements or income evidence, a signed letter of support, and proof of your relationship (e.g. birth certificates linking you).",
      facts: ["sponsor.name"],
    });
  }

  const commitment = parseMoney(questionnaireValue(facts, "sponsor.commitment"));
  const available = parseMoney(firstDoc(facts, "sponsor.available_funds"));
  if (commitment !== undefined && available !== undefined && available < commitment) {
    findings.push({
      code: "SPONSOR_CAPACITY_GAP",
      severity: "important",
      category: "financial",
      title: "Sponsor's evidence does not cover the committed amount",
      detail: `Committed ${commitment.toLocaleString()} vs ${available.toLocaleString()} visible in the sponsor's evidence.`,
      recommendation: "Ask the sponsor to evidence the full committed amount, or restate a commitment their documents actually support.",
      facts: ["sponsor.commitment", "sponsor.available_funds"],
    });
  }
  return findings;
};

const refusal_explanation: Check = ({ app }) => {
  if (app.answers["refusals.has_refusal"] !== true) return [];
  const changes = String(app.answers["refusals.changes_since"] ?? "").trim();
  const findings: Finding[] = [
    {
      code: "REFUSAL_DECLARED",
      severity: "improvement",
      category: "previous_refusals",
      title: "You declared a previous refusal — address it directly",
      detail: "A previous refusal is not fatal, but reapplying with an unchanged case usually repeats the outcome.",
      recommendation:
        "Identify the stated refusal reasons and show concretely what has changed: new evidence, changed circumstances, corrected inconsistencies. Never hide a refusal — embassies keep records.",
      facts: ["refusals.has_refusal"],
    },
  ];
  if (changes.length < 20) {
    findings.push({
      code: "REFUSAL_NO_CHANGES",
      severity: "important",
      category: "previous_refusals",
      title: "Nothing shows what has changed since your refusal",
      detail: "You declared a refusal but described no change in your situation.",
      recommendation: "Describe what is different now, and make sure the difference is visible in your uploaded evidence.",
      facts: ["refusals.changes_since"],
    });
  }
  return findings;
};

const employment_leave: Check = ({ app, facts }) => {
  if (app.answers["employment.status"] !== "employed") return [];
  const letter = app.documents.find((d) => d.type === "employment_letter");
  if (!letter) return [];
  const leave = questionnaireLike(facts, "employment.leave_approved");
  if (leave === "false") {
    return [
      {
        code: "NO_LEAVE_CONFIRMATION",
        severity: "review",
        category: "employment",
        title: "Your employment letter does not confirm approved leave",
        detail: "A letter that confirms approved leave and a return-to-work date is stronger evidence that your job is waiting for you.",
        recommendation: "Ask your employer for a letter that states your approved leave dates and expected return to work.",
        facts: ["employment.leave_approved"],
      },
    ];
  }
  return [];
};

const invitation_duration: Check = ({ facts }) => {
  const q = parseDays(questionnaireValue(facts, "trip.duration_days"));
  const inv = parseDays(firstDoc(facts, "trip.duration_days"));
  if (q === undefined || inv === undefined) return [];
  if (relDiff(q, inv) <= 0.2) return [];
  return [
    {
      code: "DURATION_MISMATCH",
      severity: "important",
      category: "consistency",
      title: "Your stated trip length differs from the invitation letter",
      detail: `Application says ${q} days; the invitation describes ${inv} days.`,
      recommendation: "Align them: state the real planned duration everywhere, or get an updated invitation that matches your plan.",
      facts: ["trip.duration_days"],
    },
  ];
};

const us_relatives_contradiction: Check = ({ app, facts }) => {
  if (app.answers["us.has_relatives"] !== false) return [];
  const rel = firstDoc(facts, "invitation.relationship");
  if (rel && FAMILY_RELATIONSHIPS.has(rel)) {
    return [
      {
        code: "RELATIVES_CONTRADICTION",
        severity: "critical",
        category: "consistency",
        title: "You declared no U.S. relatives, but your invitation is from family",
        detail: "The invitation letter describes the inviter as your family member while your answers say you have no immediate family in the United States.",
        recommendation:
          "Correct whichever statement is wrong before submitting anything. This exact contradiction — on a DS-160 versus an invitation letter — is treated as a serious credibility problem.",
        facts: ["us.has_relatives", "invitation.relationship"],
      },
    ];
  }
  return [];
};

const uk_duration_limit: Check = ({ facts, route }) => {
  const q = parseDays(questionnaireValue(facts, "trip.duration_days"));
  const max = ruleParam(route.id, "UK_VISITOR_MAX_STAY", "max_stay_days") ?? 180;
  if (q === undefined || q <= max) return [];
  return [
    {
      code: "STAY_EXCEEDS_LIMIT",
      severity: "critical",
      category: "purpose",
      title: `Your planned stay exceeds the ${max}-day visitor limit`,
      detail: `You plan ${q} days; a Standard Visitor may normally stay up to ${max} days.`,
      recommendation: "Shorten the planned visit or check whether a different route matches your real purpose.",
      facts: ["trip.duration_days"],
    },
  ];
};

const study_funding_gap: Check = ({ app, facts, route }) => {
  const tuition = parseMoney(questionnaireValue(facts, "study.tuition_year1"));
  if (tuition === undefined) return [];
  const scholarship = parseMoney(questionnaireValue(facts, "study.scholarship")) ?? 0;
  const paid = parseMoney(questionnaireValue(facts, "ca.tuition_paid")) ?? 0;
  const funds =
    parseMoney(firstDoc(facts, "finances.available_funds")) ??
    parseMoney(questionnaireValue(facts, "finances.available_funds")) ??
    0;
  const sponsor = parseMoney(firstDoc(facts, "sponsor.available_funds")) ?? parseMoney(questionnaireValue(facts, "sponsor.commitment")) ?? 0;

  let required = tuition - scholarship - paid;
  let livingNote = "";
  if (route.id === "CA_STUDY") {
    const currency = String(app.answers["identity.currency"] ?? "");
    const living = ruleParam("CA_STUDY", "CA_STUDY_LIVING_FUNDS", "living_funds_single_cad") ?? 0;
    if (currency === "CAD") {
      required += living;
      livingNote = ` (including CAD ${living.toLocaleString()} required living funds)`;
    } else {
      return [
        {
          code: "FUNDING_CURRENCY_NOTE",
          severity: "review",
          category: "financial",
          title: "Living-funds requirement could not be compared",
          detail: `IRCC's living-funds requirement is set in CAD (currently CAD ${living.toLocaleString()} for a single applicant, per the official source). Your amounts are in ${currency || "another currency"}; this preview does not convert currencies.`,
          recommendation: "Convert your figures to CAD and confirm you cover first-year tuition plus the current IRCC living-funds amount.",
          facts: ["identity.currency"],
        },
      ];
    }
  }
  if (route.id === "US_F1") {
    const i20Cost = parseMoney(firstDoc(facts, "i20.total_cost_year1"));
    if (i20Cost !== undefined) {
      required = i20Cost - scholarship - (parseMoney(firstDoc(facts, "i20.school_funding")) ?? 0);
      livingNote = " (based on the I-20 first-year estimate)";
    }
  }

  const demonstrated = funds + sponsor;
  if (required > 0 && demonstrated < required) {
    return [
      {
        code: "FUNDING_GAP",
        severity: "important",
        category: "financial",
        title: "Your demonstrated funding is below the first-year requirement",
        detail: `Required about ${required.toLocaleString()}${livingNote}; demonstrated ${demonstrated.toLocaleString()} (own funds + sponsor).`,
        recommendation:
          "Close the gap with legitimate funding you can evidence: additional accounts, a documented sponsor, scholarships, or an approved education loan. Verify the current official amounts before submitting.",
        facts: ["study.tuition_year1", "finances.available_funds", "sponsor.commitment"],
      },
    ];
  }
  return [];
};

const ca_living_funds: Check = () => []; // folded into study_funding_gap for CA_STUDY

const i20_consistency: Check = ({ facts }) => {
  const findings: Finding[] = [];
  const pairs: [string, string][] = [
    ["study.institution", "institution"],
    ["study.programme", "programme"],
  ];
  for (const [key, label] of pairs) {
    const q = questionnaireValue(facts, key);
    const docs = documentFacts(facts, key);
    if (!q) continue;
    for (const d of docs) {
      if (!looseMatch(q, d.value)) {
        findings.push({
          code: "SCHOOL_MISMATCH",
          severity: "important",
          category: "consistency",
          title: `The ${label} in your documents does not match your answers`,
          detail: `You wrote "${q}", but ${d.sourceLabel} shows "${d.value}".`,
          recommendation: "Make sure every document refers to the same admission. If you changed programmes, use only the current documents.",
          facts: [key],
        });
        break;
      }
    }
  }
  const qStart = parseDate(questionnaireValue(facts, "study.start_date"));
  for (const d of documentFacts(facts, "study.start_date")) {
    const ds = parseDate(d.value);
    if (qStart && ds && Math.abs(qStart.getTime() - ds.getTime()) > 14 * 86400000) {
      findings.push({
        code: "START_DATE_MISMATCH",
        severity: "review",
        category: "consistency",
        title: "Programme start dates differ between sources",
        detail: `Questionnaire: ${qStart.toISOString().slice(0, 10)}; ${d.sourceLabel}: ${ds.toISOString().slice(0, 10)}.`,
        recommendation: "Confirm the correct intake date with your institution and use it consistently.",
        facts: ["study.start_date"],
      });
      break;
    }
  }
  return findings;
};

const academic_logic: Check = ({ app }) => {
  const goal = String(app.answers["study.career_goal"] ?? "").trim();
  const prev = String(app.answers["study.previous_education"] ?? "").toLowerCase();
  const level = String(app.answers["study.level"] ?? "");
  const findings: Finding[] = [];
  if (goal.length > 0 && goal.length < 60) {
    findings.push({
      code: "CAREER_EXPLANATION_THIN",
      severity: "review",
      category: "academic",
      title: "Your study-purpose explanation is very brief",
      detail: "Officers look for a plausible link between your past education or work and this programme. A one-line answer rarely carries that.",
      recommendation:
        "Explain in a few sentences why this programme, why this institution, why this country, and what it enables in your career at home. A change of field is fine — explain it.",
      facts: ["study.career_goal"],
    });
  }
  const hadAdvanced = /\b(master|mba|msc|ma|phd|doctor)/.test(prev);
  if (hadAdvanced && level === "certificate") {
    findings.push({
      code: "LEVEL_REGRESSION",
      severity: "review",
      category: "academic",
      title: "Proposed study level is below your completed education",
      detail: "Moving from an advanced degree to a certificate-level programme is not automatically negative, but it invites the question of why.",
      recommendation: "Add a clear explanation of the specific skill or credential this programme adds that your existing education does not.",
      facts: ["study.level", "study.previous_education"],
    });
  }
  return findings;
};

// ---- helpers ----

function firstDoc(facts: FactMap, key: string): string | undefined {
  return documentFacts(facts, key)[0]?.value;
}

function questionnaireLike(facts: FactMap, key: string): string | undefined {
  return factsFor(facts, key)[0]?.value;
}

export const CHECKS: Record<string, Check> = {
  name_match,
  salary_triangulation,
  passport_validity,
  funds_vs_cost,
  large_deposit,
  sponsor_capacity,
  refusal_explanation,
  employment_leave,
  invitation_duration,
  us_relatives_contradiction,
  uk_duration_limit,
  study_funding_gap,
  ca_living_funds,
  i20_consistency,
  academic_logic,
};

export function runChecks(ctx: CheckContext): Finding[] {
  const findings: Finding[] = [];
  for (const id of ctx.route.checks) {
    const check = CHECKS[id];
    if (check) findings.push(...check(ctx));
  }
  return findings;
}
