"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, MessagesSquare, Send, Sparkles } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { caseFacts, instantAnswers } from "@/lib/ask/instant";
import type { AskResponse, AiError } from "@/lib/ai/contract";
import { EmptyApplication, useHydrated } from "@/components/ui";

const SUGGESTIONS = [
  "Do my bank statements support my declared income?",
  "Does my sponsor evidence support the amount claimed?",
  "Is my study plan consistent with my academic history?",
  "What questions may arise from my application?",
];

export default function AskPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/ask")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  const route = application ? getRoute(application.routeId) : undefined;
  const instant = useMemo(
    () => (application && route ? instantAnswers(application, route, application.assessment) : []),
    [application, route]
  );

  if (!hydrated) return null;
  if (!application || !route) return <EmptyApplication />;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ask about my application</h1>
        <p className="text-muted">
          Answers come only from your own case — your answers, your documents' details, the detected
          findings, and the official rules. Facts are cited; nothing here predicts a decision.
        </p>
      </header>

      {!application.assessment ? (
        <div className="card space-y-3 p-6">
          <p className="text-muted">Run the assessment first — the answers here are built from its results.</p>
          <Link
            href="/application/assessment"
            className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand"
          >
            Go to assessment
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-faint">Instant answers</h2>
            {instant.map((item) => (
              <InstantCard key={item.id} question={item.question} answer={item.answer} items={item.items} />
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-faint">Ask anything about your case</h2>
            {aiEnabled ? (
              <AskBox />
            ) : (
              <p className="card p-4 text-sm text-muted">
                Free-form questions need the AI assistant, which is not configured on this server. The
                instant answers above cover the most important questions and always work.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function InstantCard({ question, answer, items }: { question: string; answer: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="font-medium">{question}</span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-sm">
          <p className="text-muted">{answer}</p>
          {items.length > 0 && (
            <ul className="space-y-1">
              {items.map((it, i) => (
                <li key={i} className="rounded-[var(--radius-sm)] bg-surface-2/60 px-3 py-2">
                  {it}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AskBox() {
  const application = useApp((s) => s.application);
  const route = application ? getRoute(application.routeId) : undefined;
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);

  const ask = async (q: string) => {
    if (!application || !route || !q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: route.id,
          question: q,
          facts: caseFacts(application, route),
          findings: (application.assessment?.findings ?? []).map((f) => ({
            severity: f.severity,
            title: f.title,
            detail: f.detail,
          })),
        }),
      });
      const data = (await res.json()) as AskResponse | AiError;
      if (!data.ok) setError(data.error);
      else setResult(data);
    } catch {
      setError("The assistant is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-text"
          >
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={600}
          placeholder="Ask about your documents, findings, or requirements…"
          className="w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2.5 text-[15px] outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading || question.trim().length === 0}
          aria-label="Ask"
          className="rounded-[var(--radius-sm)] bg-brand px-4 text-on-brand disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <p className="text-xs text-faint">
        Sends your question and case details to the AI service for this answer only.{" "}
        <Link href="/legal/privacy" className="underline">Privacy</Link>
      </p>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="h-4 w-4 animate-pulse" aria-hidden /> Reading your case…
        </p>
      )}
      {error && <p className="text-sm text-neg">{error}</p>}
      {result && (
        <div className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3 text-sm">
          <div className="flex items-start gap-2">
            <MessagesSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
            <p className="whitespace-pre-wrap">{result.answer}</p>
          </div>
          {result.citations.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-faint">Sources</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted">
                {result.citations.map((c, i) => (
                  <li key={i}>
                    {c.source} — {c.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
