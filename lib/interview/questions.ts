import type { Application, AssessmentResult, RouteDefinition } from "../types";

export type InterviewQuestion = {
  id: string;
  question: string;
  /** What a reviewer actually listens for — shown as a hint after answering */
  focus: string;
  /** Provenance: which part of the applicant's case produced this question */
  basedOn: string;
};

/**
 * Deterministic, case-grounded question generation (docs/PROMPT.md §12):
 * questions come from the applicant's actual answers, sponsor, funding,
 * refusal history, and the assessment's detected findings — not a generic
 * question bank. Same case ⇒ same questions.
 */
export function generateQuestions(
  app: Application,
  route: RouteDefinition,
  assessment?: AssessmentResult
): InterviewQuestion[] {
  const a = app.answers;
  const str = (k: string) => String(a[k] ?? "").trim();
  const questions: InterviewQuestion[] = [];
  const isStudent = route.id === "US_F1";

  // Opener — purpose, in the applicant's own terms
  if (isStudent) {
    const school = str("study.institution") || "your school";
    const programme = str("study.programme") || "your programme";
    questions.push({
      id: "purpose",
      question: `Why do you want to study ${programme} at ${school}?`,
      focus:
        "A concrete, personal reason beats a rehearsed speech. Reviewers listen for whether your choice of programme and school makes sense for you specifically.",
      basedOn: "Your programme and school answers",
    });
    questions.push({
      id: "why_not_home",
      question: "Why study this in the United States instead of in your home country?",
      focus: "Name something specific this programme offers that your realistic local options do not.",
      basedOn: "Standard F-1 line of questioning",
    });
  } else {
    const detail = str("trip.purpose_detail");
    questions.push({
      id: "purpose",
      question: "What is the purpose of your trip?",
      focus: detail
        ? "Keep it to one or two sentences that match what you wrote in your application. Do not add new plans you never documented."
        : "You have not described your plans in the questionnaire yet — a vague answer here is exactly what weakens real interviews.",
      basedOn: "Your stated travel purpose",
    });
    const duration = str("trip.duration_days");
    if (duration) {
      questions.push({
        id: "duration",
        question: `How long will you stay, and what brings you back after ${duration} days?`,
        focus: "The number must match your application and any invitation letter. Then give one solid reason you return — work, family, commitments.",
        basedOn: "Your travel dates and home-ties answers",
      });
    }
  }

  // Funding
  const whoPays = str("finances.who_pays");
  if (whoPays === "sponsor" || whoPays === "mixed") {
    const sponsor = str("sponsor.name") || "your sponsor";
    const rel = str("sponsor.relationship");
    questions.push({
      id: "sponsor",
      question: `Who is paying for this ${isStudent ? "education" : "trip"}, and what does ${sponsor} do?`,
      focus: `Know your sponsor's occupation and roughly what they earn${rel ? ` and be consistent that they are your ${rel.replace("_", " ")}` : ""}. "A relative abroad is paying" with no detail reads as unprepared.`,
      basedOn: "Your sponsor answers",
    });
  } else {
    questions.push({
      id: "funding",
      question: `How will you pay for this ${isStudent ? "programme" : "trip"}?`,
      focus: "Your answer must line up with your bank statements and declared funds. Name the actual source: salary, business income, savings.",
      basedOn: "Your funding answers",
    });
  }

  // Employment / economic ties
  const employment = str("employment.status");
  if (employment === "employed" || employment === "self_employed") {
    questions.push({
      id: "work",
      question:
        employment === "employed"
          ? `What is your role at ${str("employment.employer") || "your employer"}, and what happens to your job while you are away?`
          : `Tell me about your business. Who runs it while you are away?`,
      focus: "Reviewers listen for a real, ongoing commitment that is waiting for you — approved leave, a return date, someone minding the business.",
      basedOn: "Your employment answers",
    });
  }

  // Home ties
  const returnReason = str("home_ties.return_reason");
  questions.push({
    id: "ties",
    question: "What ties you to your home country?",
    focus: returnReason
      ? "Say what you wrote in your application, naturally: family, work, property, commitments. Consistency matters more than quantity."
      : "You have not answered the home-ties question yet — prepare a genuine answer, because this is the heart of a visitor or student interview.",
    basedOn: "Your home-ties answers",
  });

  // US relatives
  if (a["us.has_relatives"] === true) {
    questions.push({
      id: "us_relatives",
      question: "Who do you know in the United States?",
      focus: "Answer exactly as declared on your DS-160. Understating relationships is one of the fastest ways to lose credibility.",
      basedOn: "You declared relatives in the United States",
    });
  }

  // Previous refusals
  if (a["refusals.has_refusal"] === true) {
    questions.push({
      id: "refusal",
      question: "You have been refused a visa before. What has changed since then?",
      focus: "Never minimize or hide it — the officer already knows. Name the stated reason and the specific, evidenced change since.",
      basedOn: "Your declared previous refusal",
    });
  }

  // Student career logic
  if (isStudent) {
    questions.push({
      id: "career",
      question: "What will you do after you finish this programme?",
      focus: "Connect the programme to a concrete plan at home. If you changed fields, explain the change plainly — a genuine reason is fine, an evasive one is not.",
      basedOn: "Your career-goal answers",
    });
  }

  // Findings-driven probes — the questions an officer would actually ask THIS case
  const probes: Record<string, { question: string; focus: string }> = {
    INCOME_MISMATCH: {
      question: "Walk me through your monthly income.",
      focus: "Your declared income and your documents currently disagree. Resolve that before any interview — then answer with the number your evidence shows.",
    },
    FUNDS_MISMATCH: {
      question: "How much money do you have available for this trip, and where is it?",
      focus: "Your declared funds and bank statement differ. Know your real balance and which accounts you are showing.",
    },
    DURATION_MISMATCH: {
      question: "Exactly how long do you plan to stay?",
      focus: "Your application and invitation letter state different durations. Fix the documents; then give the one true answer.",
    },
    RELATIVES_CONTRADICTION: {
      question: "Do you have family in the United States?",
      focus: "Your answers and your invitation letter currently contradict each other on this. Correct whichever is wrong before submitting anything.",
    },
    LARGE_DEPOSIT_UNEXPLAINED: {
      question: "I see a recent large deposit in your account. Where did it come from?",
      focus: "Have the true source and its evidence ready. An honest, documented answer is fine; an evasive one is disqualifying.",
    },
    FUNDING_GAP: {
      question: "Your first year costs more than the funds you have shown. How will you cover the rest?",
      focus: "Name a legitimate, evidenced source for the remainder — additional accounts, a documented sponsor, a scholarship, or an approved loan.",
    },
    SPONSOR_UNEVIDENCED: {
      question: "What proof do you have that your sponsor can and will support you?",
      focus: "Right now the answer is 'none uploaded'. Get the sponsor's statements and letter before the interview.",
    },
  };

  const seen = new Set<string>();
  for (const finding of assessment?.findings ?? []) {
    const probe = probes[finding.code];
    if (!probe || seen.has(finding.code)) continue;
    seen.add(finding.code);
    questions.push({
      id: `finding_${finding.code.toLowerCase()}`,
      question: probe.question,
      focus: probe.focus,
      basedOn: `Detected issue: ${finding.title}`,
    });
  }

  return questions;
}
