import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getRoute } from "@/lib/routes/definitions";
import { MAX_UPLOAD_BYTES, type ExtractRequest } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";

const MODEL = process.env.EXTRACTION_MODEL || "claude-opus-5";

const ResultSchema = z.object({
  detected_type: z
    .string()
    .describe("What kind of document this actually is, in a few words"),
  readable: z.boolean().describe("Whether the document is legible enough to extract from"),
  quality_issues: z
    .array(z.string())
    .describe("Neutral quality observations: blur, cropping, missing pages, glare. Empty if none."),
  fields: z.array(
    z.object({
      id: z.string().describe("One of the requested field ids, exactly as given"),
      value: z
        .string()
        .describe("The value exactly as printed in the document. Dates as YYYY-MM-DD. Amounts as plain numbers without currency symbols. Empty string if not present."),
      confidence: z.number().describe("0 to 1: how certain the reading is"),
    })
  ),
});

export function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "AI extraction is not configured on this server." }, { status: 503 });
  }

  let body: ExtractRequest;
  try {
    body = (await request.json()) as ExtractRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const route = getRoute(body.routeId);
  const def = route?.documents.find((d) => d.type === body.docType);
  if (!route || !def || !def.factFields?.length) {
    return NextResponse.json({ ok: false, error: "Unknown document type." }, { status: 400 });
  }
  if (!body.data || body.data.length * 0.75 > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "File is missing or too large (max 8MB)." }, { status: 400 });
  }

  const fieldList = def.factFields
    .map((f) => {
      const options = f.options ? ` Allowed values: ${f.options.map((o) => `"${o.value}" (${o.label})`).join(", ")}.` : "";
      const bool = f.type === "boolean" ? ' Answer "true" or "false".' : "";
      return `- id "${f.id}": ${f.label}.${options}${bool}`;
    })
    .join("\n");

  const media =
    body.mediaType === "application/pdf"
      ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: body.data } }
      : { type: "image" as const, source: { type: "base64" as const, media_type: body.mediaType, data: body.data } };

  const client = new Anthropic();
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system:
        "You extract fields from a visa applicant's own document so the applicant can review and confirm them. " +
        "Read only what is actually printed; never guess or fill plausible values — use an empty string with low confidence when a field is not visible. " +
        "Describe quality problems neutrally (blur, cropping, missing pages); never speculate about fraud or authenticity. " +
        "You are not an immigration officer and you make no judgement about the application.",
      messages: [
        {
          role: "user",
          content: [
            media,
            {
              type: "text",
              text:
                `The applicant declared this document as: "${def.label}".\n` +
                `Identify what the document actually is, note any quality issues, and extract these fields:\n${fieldList}\n` +
                "Return every requested field id exactly once.",
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ResultSchema), effort: "low" },
    });
  } catch (error) {
    const message = error instanceof Anthropic.APIError ? `AI service error (${error.status}).` : "AI service is unreachable.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return NextResponse.json(
      { ok: false, error: "The document could not be processed automatically. Please enter the details manually." },
      { status: 422 }
    );
  }

  const out = response.parsed_output;
  const requested = new Set(def.factFields.map((f) => f.id));
  return NextResponse.json({
    ok: true,
    detectedType: out.detected_type,
    typeMatchesDeclared: looseTypeMatch(out.detected_type, def.label),
    quality: { readable: out.readable, issues: out.quality_issues },
    fields: out.fields
      .filter((f) => requested.has(f.id) && f.value !== "")
      .map((f) => ({ id: f.id, value: f.value, confidence: Math.max(0, Math.min(1, f.confidence)) })),
  });
}

function looseTypeMatch(detected: string, declaredLabel: string): boolean {
  const tokens = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((t) => t.length > 3));
  const a = tokens(detected);
  const b = tokens(declaredLabel);
  return [...a].some((t) => b.has(t)) || [...b].some((t) => a.has(t));
}
