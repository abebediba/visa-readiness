import type { DocumentTypeDef, FactField, Section } from "../types";

// ---------- Shared questionnaire sections ----------
// Question ids double as fact keys; document fact fields that describe the same
// real-world value use the SAME key so the consistency engine can compare them.

export const identitySection: Section = {
  id: "identity",
  title: "About you",
  questions: [
    { id: "identity.full_name", label: "Full name (exactly as in your passport)", type: "text", required: true },
    { id: "identity.date_of_birth", label: "Date of birth", type: "date", required: true },
    { id: "identity.nationality", label: "Nationality", type: "text", required: true },
    { id: "identity.residence_country", label: "Country where you currently live", type: "text", required: true },
    {
      id: "identity.marital_status",
      label: "Marital status",
      type: "select",
      required: true,
      options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "divorced", label: "Divorced" },
        { value: "widowed", label: "Widowed" },
      ],
    },
    {
      id: "identity.currency",
      label: "Currency you will use for amounts in this application",
      type: "select",
      required: true,
      help: "Use one currency for every amount you enter so they can be compared.",
      options: [
        { value: "GHS", label: "Ghanaian cedi (GHS)" },
        { value: "NGN", label: "Nigerian naira (NGN)" },
        { value: "KES", label: "Kenyan shilling (KES)" },
        { value: "ZAR", label: "South African rand (ZAR)" },
        { value: "XOF", label: "West African CFA franc (XOF)" },
        { value: "USD", label: "US dollar (USD)" },
        { value: "CAD", label: "Canadian dollar (CAD)" },
        { value: "GBP", label: "British pound (GBP)" },
        { value: "OTHER", label: "Other" },
      ],
    },
  ],
};

export const employmentSection: Section = {
  id: "employment",
  title: "Work and income",
  questions: [
    {
      id: "employment.status",
      label: "What is your current situation?",
      type: "select",
      required: true,
      options: [
        { value: "employed", label: "Employed" },
        { value: "self_employed", label: "Self-employed / business owner" },
        { value: "student", label: "Student" },
        { value: "unemployed", label: "Not currently working" },
        { value: "retired", label: "Retired" },
      ],
    },
    { id: "employment.employer", label: "Employer or business name", type: "text", showIf: { questionId: "employment.status", equals: "employed" } },
    { id: "employment.position", label: "Your position / job title", type: "text", showIf: { questionId: "employment.status", equals: "employed" } },
    { id: "employment.monthly_income", label: "Your monthly income (before tax)", type: "money", required: true, help: "Be accurate. This will be compared with your employment letter and bank statements." },
    { id: "employment.business_name", label: "Business name", type: "text", showIf: { questionId: "employment.status", equals: "self_employed" } },
    { id: "employment.years_current", label: "Years in your current job or business", type: "number" },
  ],
};

export const financesSection: Section = {
  id: "finances",
  title: "Money for this trip",
  questions: [
    { id: "finances.available_funds", label: "Total funds available to you for this application", type: "money", required: true, help: "Across the accounts you will show. This is compared with your bank statements." },
    { id: "finances.trip_cost", label: "Estimated total cost of the trip", type: "money", required: true },
    {
      id: "finances.who_pays",
      label: "Who is paying for this trip?",
      type: "select",
      required: true,
      options: [
        { value: "self", label: "I am paying myself" },
        { value: "sponsor", label: "A sponsor is paying (family, host, employer, other)" },
        { value: "mixed", label: "Shared between me and a sponsor" },
      ],
    },
    { id: "finances.large_recent_deposit", label: "Has any single recent deposit added a large part of your current balance?", type: "boolean", required: true, help: "Answer honestly — reviewers look at how money arrived, not only the balance. If yes, you will be asked to show its legitimate source." },
    { id: "finances.deposit_source", label: "What is the source of that deposit?", type: "textarea", showIf: { questionId: "finances.large_recent_deposit", equals: true } },
  ],
};

export const sponsorSection: Section = {
  id: "sponsor",
  title: "Your sponsor",
  intro: "Only complete this if someone else is paying part or all of your costs.",
  questions: [
    { id: "sponsor.name", label: "Sponsor's full name", type: "text" },
    { id: "sponsor.relationship", label: "Your relationship to the sponsor", type: "select", options: [
      { value: "parent", label: "Parent" },
      { value: "sibling", label: "Brother / sister" },
      { value: "spouse", label: "Spouse" },
      { value: "other_family", label: "Other family member" },
      { value: "friend", label: "Friend" },
      { value: "employer", label: "Employer" },
      { value: "institution", label: "Institution / organisation" },
    ] },
    { id: "sponsor.occupation", label: "Sponsor's occupation", type: "text" },
    { id: "sponsor.commitment", label: "Amount the sponsor has committed", type: "money" },
  ],
};

export const travelHistorySection: Section = {
  id: "travel_history",
  title: "Travel history",
  questions: [
    { id: "travel_history.has_travelled", label: "Have you travelled outside your country before?", type: "boolean", required: true },
    { id: "travel_history.countries", label: "Countries visited in the last 10 years", type: "textarea", showIf: { questionId: "travel_history.has_travelled", equals: true } },
    { id: "travel_history.returned_on_time", label: "Did you always leave before your permitted stay ended?", type: "boolean", showIf: { questionId: "travel_history.has_travelled", equals: true } },
  ],
};

export const refusalsSection: Section = {
  id: "refusals",
  title: "Previous visa decisions",
  questions: [
    { id: "refusals.has_refusal", label: "Have you ever been refused a visa by any country?", type: "boolean", required: true, help: "Embassies keep records. Declaring a refusal is far better than it being discovered." },
    { id: "refusals.details", label: "Which country, when, and the reason given", type: "textarea", showIf: { questionId: "refusals.has_refusal", equals: true } },
    { id: "refusals.changes_since", label: "What has changed in your situation since that refusal?", type: "textarea", showIf: { questionId: "refusals.has_refusal", equals: true } },
  ],
};

export const homeTiesSection: Section = {
  id: "home_ties",
  title: "Your ties at home",
  intro: "Reviewers look for reasons you will return: family, work, property, ongoing commitments.",
  questions: [
    { id: "home_ties.dependants", label: "Number of dependants who rely on you at home", type: "number" },
    { id: "home_ties.family_home", label: "Do your immediate family (spouse, children, parents) mostly live in your home country?", type: "boolean" },
    { id: "home_ties.property", label: "Do you own property, land or a business at home?", type: "boolean" },
    { id: "home_ties.return_reason", label: "In your own words: what brings you back after this trip?", type: "textarea", required: true },
  ],
};

export function tripSection(destination: string): Section {
  return {
    id: "trip",
    title: "Your trip",
    questions: [
      {
        id: "trip.purpose",
        label: `Main purpose of your visit to ${destination}`,
        type: "select",
        required: true,
        options: [
          { value: "tourism", label: "Tourism / holiday" },
          { value: "family_visit", label: "Visiting family or friends" },
          { value: "business", label: "Business meetings / conference" },
          { value: "medical", label: "Medical treatment" },
          { value: "event", label: "Event (wedding, graduation, ceremony)" },
          { value: "other", label: "Other" },
        ],
      },
      { id: "trip.purpose_detail", label: "Describe your plans in one or two sentences", type: "textarea", required: true },
      { id: "trip.arrival_date", label: "Planned arrival date", type: "date", required: true },
      { id: "trip.duration_days", label: "How many days will you stay?", type: "number", required: true },
      { id: "trip.destination_city", label: "City / area you will stay in", type: "text" },
      {
        id: "trip.accommodation",
        label: "Where will you stay?",
        type: "select",
        required: true,
        options: [
          { value: "host", label: "With a host (family or friend)" },
          { value: "hotel", label: "Hotel / paid accommodation" },
          { value: "other", label: "Other" },
        ],
      },
    ],
  };
}

export const studySection: Section = {
  id: "study",
  title: "Your studies",
  questions: [
    { id: "study.institution", label: "Institution that admitted you", type: "text", required: true },
    { id: "study.programme", label: "Programme name", type: "text", required: true },
    {
      id: "study.level",
      label: "Level of study",
      type: "select",
      required: true,
      options: [
        { value: "certificate", label: "Certificate / diploma" },
        { value: "bachelor", label: "Bachelor's degree" },
        { value: "master", label: "Master's degree" },
        { value: "phd", label: "PhD / doctorate" },
        { value: "other", label: "Other" },
      ],
    },
    { id: "study.start_date", label: "Programme start date", type: "date", required: true },
    { id: "study.duration_months", label: "Programme length (months)", type: "number", required: true },
    { id: "study.tuition_year1", label: "First-year tuition", type: "money", required: true },
    { id: "study.scholarship", label: "Scholarship or funding awarded (first year)", type: "money" },
    { id: "study.previous_education", label: "Your highest completed education and field", type: "text", required: true },
    { id: "study.career_goal", label: "How does this programme fit your career plan?", type: "textarea", required: true, help: "Changing fields is fine — what matters is that you can explain the change." },
  ],
};

// ---------- Shared document fact fields ----------

export const passportFacts: FactField[] = [
  { id: "identity.full_name", label: "Name as printed in the passport", type: "text" },
  { id: "identity.date_of_birth", label: "Date of birth in the passport", type: "date" },
  { id: "passport.number", label: "Passport number (last 4 characters only)", type: "text", help: "Only the last 4 characters — full numbers are not stored in this preview." },
  { id: "passport.expiry_date", label: "Passport expiry date", type: "date" },
];

export const bankStatementFacts: FactField[] = [
  { id: "bank.account_holder", label: "Account holder name on the statement", type: "text" },
  { id: "bank.period_months", label: "How many months does the statement cover?", type: "number" },
  { id: "finances.available_funds", label: "Closing balance", type: "money" },
  { id: "employment.monthly_income", label: "Typical monthly salary credit (if any)", type: "money" },
];

export const employmentLetterFacts: FactField[] = [
  { id: "identity.full_name", label: "Employee name in the letter", type: "text" },
  { id: "employment.employer", label: "Employer named in the letter", type: "text" },
  { id: "employment.position", label: "Position stated", type: "text" },
  { id: "employment.monthly_income", label: "Salary stated (monthly)", type: "money" },
  { id: "employment.leave_approved", label: "Does the letter confirm approved leave and a return date?", type: "boolean" },
];

export const invitationFacts: FactField[] = [
  { id: "invitation.inviter", label: "Who is inviting you?", type: "text" },
  {
    id: "invitation.relationship",
    label: "Relationship stated in the letter",
    type: "select",
    options: [
      { value: "parent", label: "Parent" },
      { value: "sibling", label: "Brother / sister" },
      { value: "spouse", label: "Spouse" },
      { value: "other_family", label: "Other family member" },
      { value: "friend", label: "Friend" },
      { value: "business", label: "Business contact" },
      { value: "institution", label: "Institution / organisation" },
    ],
  },
  { id: "trip.duration_days", label: "Length of visit stated in the letter (days)", type: "number" },
  { id: "invitation.covers_costs", label: "Does the inviter commit to covering costs?", type: "boolean" },
];

export const sponsorEvidenceFacts: FactField[] = [
  { id: "sponsor.name", label: "Sponsor name on the evidence", type: "text" },
  { id: "sponsor.available_funds", label: "Funds shown in the sponsor's evidence", type: "money" },
];

export const admissionFacts: FactField[] = [
  { id: "identity.full_name", label: "Student name on the letter", type: "text" },
  { id: "study.institution", label: "Institution on the letter", type: "text" },
  { id: "study.programme", label: "Programme on the letter", type: "text" },
  { id: "study.start_date", label: "Start date on the letter", type: "date" },
  { id: "study.tuition_year1", label: "First-year tuition stated (if shown)", type: "money" },
];

// ---------- Shared document defs ----------

export const passportDoc: DocumentTypeDef = {
  type: "passport",
  label: "Passport (photo page)",
  requirement: "required",
  categories: ["documentation"],
  factFields: passportFacts,
};

export function bankStatementDoc(categories: string[]): DocumentTypeDef {
  return {
    type: "bank_statement",
    label: "Bank statements (recent months)",
    requirement: "required",
    categories,
    factFields: bankStatementFacts,
    help: "A complete recent period from the account(s) you rely on — no missing pages.",
  };
}

export function employmentLetterDoc(categories: string[]): DocumentTypeDef {
  return {
    type: "employment_letter",
    label: "Employment letter",
    requirement: "conditional",
    condition: { questionId: "employment.status", equals: "employed" },
    categories,
    factFields: employmentLetterFacts,
    help: "On letterhead: your role, salary, start date, approved leave and return date.",
  };
}

export const payslipsDoc = (categories: string[]): DocumentTypeDef => ({
  type: "payslips",
  label: "Recent payslips",
  requirement: "recommended",
  categories,
});

export function invitationDoc(categories: string[]): DocumentTypeDef {
  return {
    type: "invitation_letter",
    label: "Invitation letter",
    requirement: "conditional",
    condition: { questionId: "trip.accommodation", equals: "host" },
    categories,
    factFields: invitationFacts,
  };
}

export function sponsorEvidenceDoc(categories: string[]): DocumentTypeDef {
  return {
    type: "sponsor_evidence",
    label: "Sponsor's financial evidence",
    requirement: "conditional",
    condition: { questionId: "finances.who_pays", equals: "sponsor" },
    categories,
    factFields: sponsorEvidenceFacts,
    help: "Sponsor bank statements or income evidence, plus proof of your relationship.",
  };
}

export const refusalLetterDoc: DocumentTypeDef = {
  type: "refusal_letter",
  label: "Previous refusal letter(s)",
  requirement: "conditional",
  condition: { questionId: "refusals.has_refusal", equals: true },
  categories: ["previous_refusals"],
  help: "Uploading the refusal letter lets the assessment check whether the stated reasons are now addressed.",
};

export const itineraryDoc = (categories: string[]): DocumentTypeDef => ({
  type: "itinerary",
  label: "Travel itinerary / flight reservation",
  requirement: "recommended",
  categories,
  help: "A reservation is enough — do not buy non-refundable tickets before a decision.",
});

export const accommodationDoc = (categories: string[]): DocumentTypeDef => ({
  type: "accommodation",
  label: "Accommodation evidence",
  requirement: "conditional",
  condition: { questionId: "trip.accommodation", equals: "hotel" },
  categories,
});
