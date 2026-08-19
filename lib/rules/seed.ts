import type { Rule } from "../types";

/**
 * Versioned visa rules seed. In production this lives in the database and is
 * managed through the admin portal with a full audit trail; the engine reads
 * parameters (thresholds, durations) from here — never from code constants.
 *
 * Every rule cites an official source and records when it was last verified.
 * Rules older than RULES_STALE_DAYS render a "verify against the official
 * source" caveat wherever they are shown.
 */
export const RULES_VERSION = "2026-02-seed-1";
export const RULES_STALE_DAYS = 90;

export const RULES: Rule[] = [
  // ---- United States B1/B2 ----
  {
    country: "US",
    visa_route: "US_B1B2",
    rule_id: "US_B1B2_TEMPORARY_INTENT",
    category: "home_ties",
    requirement: "Demonstrate a residence abroad and intent to depart the U.S. after a temporary stay",
    requirement_type: "eligibility",
    mandatory: true,
    description:
      "B1/B2 applicants are presumed intending immigrants under INA 214(b) until they show ties (work, family, property, ongoing commitments) that support a temporary visit.",
    accepted_evidence: ["employment_letter", "business evidence", "family circumstances", "property evidence"],
    effective_from: "2020-01-01",
    official_source_url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },
  {
    country: "US",
    visa_route: "US_B1B2",
    rule_id: "US_B1B2_DS160",
    category: "consistency",
    requirement: "Complete Form DS-160 accurately; answers must match supporting evidence",
    requirement_type: "process",
    mandatory: true,
    description:
      "The DS-160 is the application of record. Contradictions between DS-160 answers and documents (income, relatives, travel history, refusals) are treated seriously at interview.",
    accepted_evidence: ["ds160_evidence"],
    effective_from: "2020-01-01",
    official_source_url: "https://ceac.state.gov/genniv/",
    last_verified_at: "2026-02-01",
    status: "active",
  },
  {
    country: "US",
    visa_route: "US_B1B2",
    rule_id: "US_B1B2_FUNDS",
    category: "financial",
    requirement: "Show sufficient funds to cover the trip without unauthorized work",
    requirement_type: "financial",
    mandatory: true,
    description:
      "There is no fixed dollar threshold; evidence should plausibly cover travel, stay and return relative to the applicant's declared trip cost.",
    accepted_evidence: ["bank_statement", "payslips", "sponsor_evidence"],
    parameters: { funds_to_cost_ratio_min: 1.2 },
    effective_from: "2020-01-01",
    official_source_url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },

  // ---- United States F-1 ----
  {
    country: "US",
    visa_route: "US_F1",
    rule_id: "US_F1_I20",
    category: "school",
    requirement: "Hold a Form I-20 from a SEVP-certified school and pay the SEVIS I-901 fee",
    requirement_type: "document",
    mandatory: true,
    description: "The I-20 is issued by the school after admission and proof of funding; the SEVIS I-901 fee must be paid before the interview.",
    accepted_evidence: ["i20", "sevis_receipt"],
    effective_from: "2020-01-01",
    official_source_url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },
  {
    country: "US",
    visa_route: "US_F1",
    rule_id: "US_F1_FUNDING_YEAR1",
    category: "funding",
    requirement: "Demonstrate funds covering at least the first year of study shown on the I-20",
    requirement_type: "financial",
    mandatory: true,
    description:
      "Available funds (personal + sponsor + scholarship) should meet or exceed the I-20 first-year estimated cost, with a credible plan for later years.",
    accepted_evidence: ["bank_statement", "sponsor_evidence", "scholarship letter"],
    parameters: { coverage_years_min: 1 },
    effective_from: "2020-01-01",
    official_source_url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },

  // ---- Canada TRV ----
  {
    country: "CA",
    visa_route: "CA_TRV",
    rule_id: "CA_TRV_TEMP_STAY",
    category: "home_ties",
    requirement: "Satisfy the officer you will leave Canada at the end of your stay",
    requirement_type: "eligibility",
    mandatory: true,
    description: "IRCC assesses ties to the home country, purpose of visit, finances and travel history under IRPR 179(b).",
    accepted_evidence: ["employment_letter", "family circumstances", "property evidence"],
    effective_from: "2020-01-01",
    official_source_url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/about-visitor-visa.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },

  // ---- Canada Study Permit ----
  {
    country: "CA",
    visa_route: "CA_STUDY",
    rule_id: "CA_STUDY_LOA",
    category: "admission",
    requirement: "Letter of Acceptance from a Designated Learning Institution (DLI)",
    requirement_type: "document",
    mandatory: true,
    description: "A study permit requires acceptance by a DLI; most post-secondary applicants also need a Provincial/Territorial Attestation Letter (PAL/TAL), and Québec studies need a CAQ.",
    accepted_evidence: ["loa", "pal", "caq"],
    effective_from: "2024-01-22",
    official_source_url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },
  {
    country: "CA",
    visa_route: "CA_STUDY",
    rule_id: "CA_STUDY_LIVING_FUNDS",
    category: "financial",
    requirement: "Show first-year tuition plus the required living funds",
    requirement_type: "financial",
    mandatory: true,
    description:
      "IRCC requires proof of first-year tuition plus a set amount of living funds for the applicant (more with family members). The amount is updated by IRCC — always confirm the current figure on the official page before submitting.",
    accepted_evidence: ["bank_statement", "sponsor_evidence", "tuition_receipt", "scholarship letter"],
    parameters: { living_funds_single_cad: 20635, currency: "CAD" },
    effective_from: "2024-01-01",
    official_source_url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html",
    last_verified_at: "2026-02-01",
    status: "active",
  },

  // ---- UK Standard Visitor ----
  {
    country: "GB",
    visa_route: "UK_VISITOR",
    rule_id: "UK_VISITOR_GENUINE",
    category: "purpose",
    requirement: "Be a genuine visitor who will leave at the end of the visit and not live in the UK through frequent visits",
    requirement_type: "eligibility",
    mandatory: true,
    description: "Appendix V requires a genuine intention to visit, sufficient funds without working, and that the visit costs are covered by the applicant or a third party with a genuine relationship.",
    accepted_evidence: ["bank_statement", "employment_letter", "invitation_letter", "sponsor_evidence"],
    effective_from: "2020-12-01",
    official_source_url: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-v-visitor",
    last_verified_at: "2026-02-01",
    status: "active",
  },
  {
    country: "GB",
    visa_route: "UK_VISITOR",
    rule_id: "UK_VISITOR_MAX_STAY",
    category: "purpose",
    requirement: "Standard visits are limited to 6 months",
    requirement_type: "eligibility",
    mandatory: true,
    description: "A Standard Visitor may normally stay up to 6 months per visit.",
    accepted_evidence: [],
    parameters: { max_stay_days: 180 },
    effective_from: "2020-12-01",
    official_source_url: "https://www.gov.uk/standard-visitor",
    last_verified_at: "2026-02-01",
    status: "active",
  },

  // ---- Cross-route: passport validity guidance ----
  ...(["US_B1B2", "US_F1", "CA_TRV", "CA_STUDY", "UK_VISITOR"] as const).map(
    (route): Rule => ({
      country: route.startsWith("US") ? "US" : route.startsWith("CA") ? "CA" : "GB",
      visa_route: route,
      rule_id: `${route}_PASSPORT_VALIDITY`,
      category: "documentation",
      requirement: "Passport valid for the whole intended stay (six months beyond is safest)",
      requirement_type: "document",
      mandatory: true,
      description:
        "Your passport must be valid for your entire stay; many countries expect six months' validity beyond your planned departure. Renew early if it is close to expiry.",
      accepted_evidence: ["passport"],
      parameters: { min_validity_months_after_trip: 6 },
      effective_from: "2020-01-01",
      official_source_url:
        route.startsWith("US")
          ? "https://travel.state.gov/content/travel/en/us-visas.html"
          : route.startsWith("CA")
            ? "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html"
            : "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa",
      last_verified_at: "2026-02-01",
      status: "active",
    })
  ),
];

export function rulesForRoute(routeId: string): Rule[] {
  return RULES.filter((r) => r.visa_route === routeId && r.status === "active");
}

export function ruleParam(routeId: string, ruleId: string, param: string): number | undefined {
  const rule = RULES.find((r) => r.visa_route === routeId && r.rule_id === ruleId);
  const v = rule?.parameters?.[param];
  return typeof v === "number" ? v : undefined;
}

export function isStale(rule: Rule, now: Date): boolean {
  const verified = new Date(rule.last_verified_at).getTime();
  return now.getTime() - verified > RULES_STALE_DAYS * 24 * 3600 * 1000;
}
