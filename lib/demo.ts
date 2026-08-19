import type { Application } from "./types";

/**
 * A worked example: a plausible Ghanaian B1/B2 applicant whose paperwork
 * contains the kinds of problems this product exists to catch — a declared
 * salary her own documents contradict, a trip length that disagrees with her
 * invitation, an unexplained lump sum, and a "no relatives in the U.S." answer
 * sitting next to an invitation from her brother.
 *
 * Entirely synthetic. No real person, employer, or account.
 */
export function buildDemoApplication(): Application {
  const now = "2026-08-19T09:00:00.000Z";
  return {
    id: "app_demo",
    routeId: "US_B1B2",
    createdAt: now,
    updatedAt: now,
    isDemo: true,
    history: [],
    answers: {
      "identity.full_name": "Ama Serwaa Boateng",
      "identity.date_of_birth": "1994-03-12",
      "identity.nationality": "Ghanaian",
      "identity.residence_country": "Ghana",
      "identity.marital_status": "married",
      "identity.currency": "GHS",

      "trip.purpose": "family_visit",
      "trip.purpose_detail":
        "Visiting my brother in Maryland and attending his graduation ceremony.",
      "trip.arrival_date": "2026-11-04",
      "trip.duration_days": "14",
      "trip.destination_city": "Silver Spring, Maryland",
      "trip.accommodation": "host",

      "employment.status": "employed",
      "employment.employer": "Stanbic Bank Ghana",
      "employment.position": "Operations Officer",
      // Declared higher than every document she has uploaded.
      "employment.monthly_income": "15000",
      "employment.years_current": "5",

      "finances.available_funds": "62000",
      "finances.trip_cost": "30000",
      "finances.who_pays": "self",
      "finances.large_recent_deposit": true,

      // Contradicts the invitation letter, which names her brother.
      "us.has_relatives": false,
      "us.previous_travel": false,

      "travel_history.has_travelled": true,
      "travel_history.countries": "United Kingdom (2023), South Africa (2019), Togo (2018)",
      "travel_history.returned_on_time": true,

      "refusals.has_refusal": false,

      "home_ties.dependants": "2",
      "home_ties.family_home": true,
      "home_ties.property": true,
      "home_ties.return_reason":
        "My husband and two children are in Accra, I have five years at my bank with approved leave, and we are paying off a house in Adenta.",
    },
    documents: [
      {
        id: "demo_passport",
        type: "passport",
        fileName: "passport-photo-page.jpg",
        size: 412_000,
        addedAt: now,
        factsConfirmed: true,
        facts: {
          "identity.full_name": "Ama Serwaa Boateng",
          "identity.date_of_birth": "1994-03-12",
          "passport.number": "4471",
          "passport.expiry_date": "2029-06-30",
        },
      },
      {
        id: "demo_employment",
        type: "employment_letter",
        fileName: "employer-letter.pdf",
        size: 190_000,
        addedAt: now,
        factsConfirmed: true,
        facts: {
          "identity.full_name": "Ama Serwaa Boateng",
          "employment.employer": "Stanbic Bank Ghana",
          "employment.position": "Operations Officer",
          "employment.monthly_income": "12500",
          "employment.leave_approved": "true",
        },
      },
      {
        id: "demo_bank",
        type: "bank_statement",
        fileName: "bank-statement-6-months.pdf",
        size: 880_000,
        addedAt: now,
        factsConfirmed: true,
        facts: {
          "bank.account_holder": "Ama Serwaa Boateng",
          "bank.period_months": "6",
          "finances.available_funds": "62000",
          "employment.monthly_income": "12500",
        },
      },
      {
        id: "demo_invitation",
        type: "invitation_letter",
        fileName: "invitation-letter.pdf",
        size: 150_000,
        addedAt: now,
        factsConfirmed: true,
        facts: {
          "invitation.inviter": "Kwabena Boateng",
          "invitation.relationship": "sibling",
          "trip.duration_days": "30",
          "invitation.covers_costs": "false",
        },
      },
      {
        id: "demo_ds160",
        type: "ds160_evidence",
        fileName: "ds160-confirmation.png",
        size: 240_000,
        addedAt: now,
        factsConfirmed: true,
        facts: {},
      },
    ],
  };
}
