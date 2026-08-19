import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getRoute } from "@/lib/routes/definitions";
import { rulesForRoute } from "@/lib/rules/seed";
import type { AskRequest } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";

const MODEL = process.env.ASK_MODEL || "claude-opus-5";

const AnswerSchema = z.object({
  out_of_scope: z
    .boolean()
    .describe("True if the question asks for an approval prediction, legal advice, or anything outside the applicant's own case and the cited rules"),
  answer: z
    .string()
    .describe("The answer, in plain language. Facts first, clearly separated from any recommendation. Empty if out_of_scope."),
  citations: z.array(
    z.object({
      source: z
        .string()
        .describe('Where each factual claim comes from: a fact key like \'document "Bank statements": finances.available_funds\', a finding title, or a rule id'),
      note: z.string().describe("What this source supports, in a few words"),
    })
  ),
});

const GROUNDING =
  "You answer a visa applicant's questions about THEIR OWN application, using ONLY the case facts, detected findings, " +
  "and official rules provided in the message. Hard rules: never predict or imply an approval chance — if asked, mark the question out of scope and " +
  "explain that the tool measures readiness, not outcomes; never invent requirements not present in the provided rules; " +
  "never advise misrepresentation, hiding refusals, or manufactured evidence; you are not a lawyer and this is not legal advice. " +
  "Cite a source for every factual claim. Clearly separate what IS (facts from their case) from what they COULD DO (recommendations). " +
  "If the provided data cannot answer the question, say so plainly rather than guessing.";

export function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "The AI assistant is not configured on this server." }, { status: 503 });
  }

  let body: AskRequest;
  try {
    body = (await request.json()) as AskRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const route = getRoute(body.routeId);
  const question = body.question?.trim();
  if (!route || !question || question.length > 600) {
    return NextResponse.json({ ok: false, error: "Provide a question (max 600 characters)." }, { status: 400 });
  }

  const facts = Object.entries(body.facts ?? {})
    .slice(0, 120)
    .map(([k, v]) => `- ${k} = ${String(v).slice(0, 300)}`)
    .join("\n");
  const findings = (body.findings ?? [])
    .slice(0, 25)
    .map((f) => `- [${f.severity}] ${f.title}: ${f.detail}`)
    .join("\n");
  const rules = rulesForRoute(route.id)
    .map(
      (r) =>
        `- rule ${r.rule_id}: ${r.requirement} (official source: ${r.official_source_url}, last verified ${r.last_verified_at})`
    )
    .join("\n");

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: GROUNDING,
      messages: [
        {
          role: "user",
          content:
            `Visa route: ${route.name}\n\n` +
            `Case facts (source: key = value):\n${facts || "(none yet)"}\n\n` +
            `Findings detected by the assessment engine:\n${findings || "(none)"}\n\n` +
            `Official rules for this route:\n${rules}\n\n` +
            `The applicant asks: ${question}`,
        },
      ],
      output_config: { format: zodOutputFormat(AnswerSchema), effort: "medium" },
    });
  } catch (error) {
    const message = error instanceof Anthropic.APIError ? `AI service error (${error.status}).` : "AI service is unreachable.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return NextResponse.json({ ok: false, error: "That question can't be answered here." }, { status: 422 });
  }

  const out = response.parsed_output;
  if (out.out_of_scope) {
    return NextResponse.json({
      ok: true,
      answer:
        "That's outside what this tool can honestly answer. The readiness score measures how complete, consistent and well-supported your application looks — it is not a prediction, and only the visa authority decides outcomes. Ask me about your documents, your findings, or the official requirements instead.",
      citations: [],
    });
  }
  return NextResponse.json({ ok: true, answer: out.answer, citations: out.citations.slice(0, 10) });
}
