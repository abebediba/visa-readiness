"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, MessageCircleQuestion, Sparkles } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { generateQuestions } from "@/lib/interview/questions";
import type { InterviewFeedback, AiError } from "@/lib/ai/contract";
import { EmptyApplication, useHydrated } from "@/components/ui";

export default function InterviewPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/interview")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  const route = application ? getRoute(application.routeId) : undefined;
  const questions = useMemo(
    () => (application && route ? generateQuestions(application, route, application.assessment) : []),
    [application, route]
  );

  if (!hydrated) return null;
  if (!application || !route) return <EmptyApplication />;

  if (!route.interview) {
    return (
      <div className="card space-y-3 p-6">
        <h1 className="text-xl font-semibold">Interview practice</h1>
        <p className="text-muted">
          {route.countryName} does not normally interview {route.shortName.toLowerCase()} applicants —
          decisions are made on your documents, so put the effort into the assessment and its
          recommendations instead.
        </p>
        <Link href="/application" className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand">
          Back to my application
        </Link>
      </div>
    );
  }

  const q = questions[index];
  const answer = answers[q.id] ?? "";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Interview practice</h1>
        <p className="text-sm text-muted">
          Questions generated from <strong>your actual application</strong> — including the issues the
          assessment detected. Practice answers stay on this page and are not saved.
        </p>
        <div className="flex gap-1 pt-1">
          {questions.map((question, i) => (
            <button
              key={question.id}
              aria-label={`Question ${i + 1}`}
              onClick={() => setIndex(i)}
              className={clsx(
                "h-1.5 flex-1 rounded-full",
                i === index ? "bg-brand" : (answers[questions[i].id] ?? "").length > 0 ? "bg-pos" : "bg-surface-2"
              )}
            />
          ))}
        </div>
      </header>

      <div className="card space-y-4 p-5">
        <div className="flex items-start gap-3">
          <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="text-lg font-medium">{q.question}</p>
            <p className="mt-1 text-xs text-faint">Based on: {q.basedOn}</p>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
          placeholder="Say your answer out loud, then type it the way you said it…"
          className="min-h-28 w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2.5 text-[15px] outline-none focus:border-brand"
        />

        {!revealed[q.id] ? (
          <button
            onClick={() => setRevealed((s) => ({ ...s, [q.id]: true }))}
            disabled={answer.trim().length === 0}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Show what a reviewer listens for
          </button>
        ) : (
          <div className="rounded-[var(--radius-sm)] bg-brand-soft px-4 py-3 text-sm text-brand">{q.focus}</div>
        )}

        {aiEnabled && revealed[q.id] && (
          <FeedbackPanel question={q.question} answer={answer} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </button>
        <p className="tabular text-sm text-muted">
          {index + 1}/{questions.length}
        </p>
        {index < questions.length - 1 ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="flex items-center gap-1 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand"
          >
            Next <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <Link href="/application" className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand">
            Done
          </Link>
        )}
      </div>

      <p className="text-xs text-faint">
        Practice is about presenting your real circumstances clearly — never about scripting or
        inventing answers. If a question exposes a genuine gap in your case, fix the case, not the answer.
      </p>
    </div>
  );
}

function FeedbackPanel({ question, answer }: { question: string; answer: string }) {
  const application = useApp((s) => s.application);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const facts: Record<string, string> = {};
      for (const [k, v] of Object.entries(application?.answers ?? {})) facts[k] = String(v);
      for (const doc of application?.documents ?? []) {
        for (const [k, v] of Object.entries(doc.facts)) facts[`${doc.type}.${k}`] = v;
      }
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, facts }),
      });
      const result = (await res.json()) as InterviewFeedback | AiError;
      if (!result.ok) setError(result.error);
      else setFeedback(result);
    } catch {
      setError("Feedback is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  if (feedback) {
    return (
      <div className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3 text-sm">
        <p className="font-medium">
          {feedback.consistentWithCase ? "Consistent with your case" : "Possible inconsistency with your case"}
          {" · "}
          {feedback.clarity === "clear" ? "clear" : feedback.clarity === "adequate" ? "adequately clear" : "unclear"}
          {feedback.overExplained ? " · over-explained" : ""}
        </p>
        {feedback.strengths.length > 0 && (
          <ul className="space-y-1 text-pos">
            {feedback.strengths.map((s, i) => (
              <li key={i}>+ {s}</li>
            ))}
          </ul>
        )}
        {feedback.improvements.length > 0 && (
          <ul className="space-y-1 text-muted">
            {feedback.improvements.map((s, i) => (
              <li key={i}>→ {s}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => void getFeedback()}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        {loading ? "Reviewing your answer…" : "Get AI feedback on this answer"}
      </button>
      <p className="mt-1 text-xs text-faint">
        Optional. Sends this answer and your case details to the AI service for feedback only.
      </p>
      {error && <p className="mt-1 text-xs text-neg">{error}</p>}
    </div>
  );
}
