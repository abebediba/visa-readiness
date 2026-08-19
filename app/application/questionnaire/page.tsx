"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import type { Question } from "@/lib/types";
import { EmptyApplication, useHydrated } from "@/components/ui";

export default function QuestionnairePage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const application = useApp((s) => s.application);
  const setAnswer = useApp((s) => s.setAnswer);
  const [sectionIndex, setSectionIndex] = useState(0);

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;

  const section = route.sections[sectionIndex];
  const visible = (q: Question) =>
    !q.showIf || application.answers[q.showIf.questionId] === q.showIf.equals;
  const questions = section.questions.filter(visible);
  const last = sectionIndex === route.sections.length - 1;

  const sectionDone = (idx: number) => {
    const qs = route.sections[idx].questions.filter((q) => visible(q) && q.required);
    return qs.length > 0 && qs.every((q) => {
      const v = application.answers[q.id];
      return v !== undefined && v !== "";
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">
          {route.shortName} · saved automatically on this device
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{section.title}</h1>
        {section.intro && <p className="text-muted">{section.intro}</p>}
        <div className="flex gap-1 pt-1">
          {route.sections.map((s, i) => (
            <button
              key={s.id}
              aria-label={s.title}
              onClick={() => setSectionIndex(i)}
              className={clsx(
                "h-1.5 flex-1 rounded-full",
                i === sectionIndex ? "bg-brand" : sectionDone(i) ? "bg-pos" : "bg-surface-2"
              )}
            />
          ))}
        </div>
      </header>

      <div className="space-y-5">
        {questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={application.answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
          disabled={sectionIndex === 0}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          Back
        </button>
        {last ? (
          <button
            onClick={() => router.push("/application/documents")}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-on-brand"
          >
            Continue to documents
          </button>
        ) : (
          <button
            onClick={() => setSectionIndex((i) => i + 1)}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-on-brand"
          >
            Next
          </button>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        <Link href="/application" className="underline">Back to my application</Link>
      </p>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const base =
    "w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2.5 text-[15px] outline-none focus:border-brand";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {question.label}
        {question.required && <span className="text-neg"> *</span>}
      </label>
      {question.type === "select" ? (
        <select className={base} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {question.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : question.type === "boolean" ? (
        <div className="flex gap-2">
          {[
            { v: true, label: "Yes" },
            { v: false, label: "No" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => onChange(o.v)}
              className={clsx(
                "flex-1 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm font-medium",
                value === o.v ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface-1"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : question.type === "textarea" ? (
        <textarea
          className={clsx(base, "min-h-24")}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={base}
          type={question.type === "date" ? "date" : question.type === "text" ? "text" : "number"}
          inputMode={question.type === "money" || question.type === "number" ? "decimal" : undefined}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {question.help && <p className="text-sm text-muted">{question.help}</p>}
    </div>
  );
}
