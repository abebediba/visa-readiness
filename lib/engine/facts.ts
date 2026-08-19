import type { Application, Fact, FactMap, RouteDefinition } from "../types";

/**
 * Builds the fact map: every semantic key with ALL values asserted for it,
 * across the questionnaire and every uploaded document. Contradictions are
 * kept side by side (never overwritten) so the consistency engine can compare.
 */
export function buildFactMap(app: Application, route: RouteDefinition): FactMap {
  const map: FactMap = new Map();
  const push = (fact: Fact) => {
    if (fact.value === "" || fact.value === undefined) return;
    const list = map.get(fact.key) ?? [];
    list.push(fact);
    map.set(fact.key, list);
  };

  for (const [key, value] of Object.entries(app.answers)) {
    push({ key, value: String(value), source: "questionnaire", sourceLabel: "Questionnaire" });
  }

  for (const doc of app.documents) {
    const def = route.documents.find((d) => d.type === doc.type);
    const label = def?.label ?? doc.type;
    for (const [key, value] of Object.entries(doc.facts)) {
      push({ key, value, source: "document", sourceLabel: label });
    }
  }
  return map;
}

export function factsFor(map: FactMap, key: string): Fact[] {
  return map.get(key) ?? [];
}

export function firstValue(map: FactMap, key: string): string | undefined {
  return map.get(key)?.[0]?.value;
}

export function questionnaireValue(map: FactMap, key: string): string | undefined {
  return map.get(key)?.find((f) => f.source === "questionnaire")?.value;
}

export function documentFacts(map: FactMap, key: string): Fact[] {
  return (map.get(key) ?? []).filter((f) => f.source === "document");
}

// ---- Normalizers (deterministic; in production an LLM may assist with
// normalization, but comparison and severity stay in code) ----

export function parseMoney(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function parseDays(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseDate(v: string | undefined): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function nameTokens(v: string): Set<string> {
  return new Set(
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

/** Names match when equal as token sets, or one is a subset of the other
 * sharing at least two tokens (middle-name omissions, order swaps). */
export function namesMatch(a: string, b: string): boolean {
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  if (ta.size === 0 || tb.size === 0) return true;
  const shared = [...ta].filter((t) => tb.has(t)).length;
  if (shared === ta.size && shared === tb.size) return true;
  return shared >= 2 && (shared === ta.size || shared === tb.size);
}

/** Loose match for institution/programme strings. */
export function looseMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (!na || !nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  const shared = [...ta].filter((t) => tb.has(t)).length;
  return shared / Math.max(ta.size, tb.size) >= 0.5;
}

/** Relative difference between two amounts, 0..1+ */
export function relDiff(a: number, b: number): number {
  const base = Math.max(Math.abs(a), Math.abs(b));
  if (base === 0) return 0;
  return Math.abs(a - b) / base;
}
