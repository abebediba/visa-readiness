import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { InterviewFeedbackRequest } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";

const MODEL = process.env.INTERVIEW_MODEL || "claude-opus-5";

const FeedbackSchema = z.object({
  consistent_with_case: z
    .boolean()
    .describe("Whether the answer agrees with the applicant's own documented facts"),
  clarity: z.enum(["clear", "adequate", "unclear"]),
  over_explained: z.boolean().describe("True if the answer volunteers unnecessary detail or rambles"),
  strengths: z.array(z.string()).describe("1-3 specific things that worked, quoted from the answer where possible"),
  improvements: z
    .array(z.string())
    .describe("1-3 specific, honest improvements. Never suggest changing facts — only presenting real facts more clearly."),
});

const GUARDRAILS =
  "You give practice-interview feedback to a visa applicant, comparing their answer against their OWN documented case facts. " +
  "Hard rules: you are not an immigration officer and never role-play one in feedback; you never predict or imply an approval chance; " +
  "you never coach the applicant to lie, omit declared facts, hide refusals, or invent details — if the answer contradicts their documented facts, " +
  "say so and tell them to resolve the discrepancy truthfully (fix the record or the answer, whichever is wrong). " +
  "Evaluate only: consistency with the facts provided, clarity, relevance, and over-explaining. " +
  "Use plain, encouraging language: 'strong', 'requires review', 'possible inconsistency', 'based on the information provided'.";

export function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "AI feedback is not configured on this server." }, { status: 503 });
  }

  let body: InterviewFeedbackRequest;
  try {
    body = (await request.json()) as InterviewFeedbackRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (!body.question || !body.answer?.trim() || body.answer.length > 4000) {
    return NextResponse.json({ ok: false, error: "Provide an answer (max 4000 characters)." }, { status: 400 });
  }

  const facts = Object.entries(body.facts ?? {})
    .slice(0, 80)
    .map(([k, v]) => `${k}: ${String(v).slice(0, 300)}`)
    .join("\n");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: GUARDRAILS,
      messages: [
        {
          role: "user",
          content:
            `The applicant's documented case facts:\n${facts || "(none provided)"}\n\n` +
            `Practice question: ${body.question}\n\n` +
            `The applicant's spoken answer:\n${body.answer}`,
        },
      ],
      output_config: { format: zodOutputFormat(FeedbackSchema), effort: "medium" },
    });
  } catch (error) {
    const message = error instanceof Anthropic.APIError ? `AI service error (${error.status}).` : "AI service is unreachable.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return NextResponse.json({ ok: false, error: "Feedback is not available for this answer." }, { status: 422 });
  }

  const out = response.parsed_output;
  return NextResponse.json({
    ok: true,
    consistentWithCase: out.consistent_with_case,
    clarity: out.clarity,
    overExplained: out.over_explained,
    strengths: out.strengths.slice(0, 3),
    improvements: out.improvements.slice(0, 3),
  });
}
