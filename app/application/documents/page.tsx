"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, ChevronDown, FileUp, Trash2 } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import type { DocumentTypeDef, FactField, UploadedDoc } from "@/lib/types";
import { EmptyApplication, useHydrated } from "@/components/ui";

export default function DocumentsPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);

  if (!hydrated) return null;
  if (!application) return <EmptyApplication />;
  const route = getRoute(application.routeId);
  if (!route) return <EmptyApplication />;

  const applicable = route.documents.filter(
    (d) =>
      d.requirement !== "conditional" ||
      (d.condition && application.answers[d.condition.questionId] === d.condition.equals)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your documents</h1>
        <p className="text-muted">
          Add each document, then enter its key details so they can be cross-checked against your
          answers. In this preview, files never leave your device — only the details you type are used.
        </p>
      </header>

      <div className="space-y-3">
        {applicable.map((def) => (
          <DocumentCard key={def.type} def={def} docs={application.documents.filter((d) => d.type === def.type)} />
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          href="/application/assessment"
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-on-brand"
        >
          Continue to assessment
        </Link>
      </div>
    </div>
  );
}

function DocumentCard({ def, docs }: { def: DocumentTypeDef; docs: UploadedDoc[] }) {
  const addDocument = useApp((s) => s.addDocument);
  const removeDocument = useApp((s) => s.removeDocument);
  const uploaded = docs.length > 0;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {def.label}{" "}
            <span
              className={clsx(
                "ml-1 rounded-full px-2 py-0.5 text-xs",
                def.requirement === "recommended" ? "bg-surface-2 text-muted" : "bg-brand-soft text-brand"
              )}
            >
              {def.requirement === "recommended" ? "Recommended" : "Required"}
            </span>
          </p>
          {def.help && <p className="mt-1 text-sm text-muted">{def.help}</p>}
        </div>
        {uploaded && <CheckCircle2 className="h-5 w-5 shrink-0 text-pos" aria-hidden />}
      </div>

      {docs.map((doc) => (
        <UploadedDocRow key={doc.id} doc={doc} def={def} onRemove={() => removeDocument(doc.id)} />
      ))}

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-brand">
        <FileUp className="h-4 w-4" aria-hidden />
        {uploaded ? "Add another file" : "Add this document"}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.heic"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addDocument({ type: def.type, fileName: f.name, size: f.size });
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function UploadedDocRow({
  doc,
  def,
  onRemove,
}: {
  doc: UploadedDoc;
  def: DocumentTypeDef;
  onRemove: () => void;
}) {
  const setDocumentFacts = useApp((s) => s.setDocumentFacts);
  const [open, setOpen] = useState(!doc.factsConfirmed && !!def.factFields?.length);
  const [draft, setDraft] = useState<Record<string, string>>(doc.facts);
  const fields = def.factFields ?? [];

  return (
    <div className="mt-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate">{doc.fileName}</span>
        <div className="flex items-center gap-3">
          {fields.length > 0 && (
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-brand">
              {doc.factsConfirmed ? "Details entered" : "Enter key details"}
              <ChevronDown className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
            </button>
          )}
          <button onClick={onRemove} aria-label="Remove document" className="text-faint hover:text-neg">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {open && fields.length > 0 && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <p className="text-xs text-muted">
            In the full product these fields are AI-extracted and you only confirm them. Enter them
            exactly as the document shows — the point is to catch differences.
          </p>
          {fields.map((f) => (
            <FactInput key={f.id} field={f} value={draft[f.id] ?? ""} onChange={(v) => setDraft((d) => ({ ...d, [f.id]: v }))} />
          ))}
          <button
            onClick={() => {
              const cleaned = Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== ""));
              setDocumentFacts(doc.id, cleaned, true);
              setOpen(false);
            }}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-on-brand"
          >
            Confirm these details
          </button>
        </div>
      )}
    </div>
  );
}

function FactInput({
  field,
  value,
  onChange,
}: {
  field: FactField;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    "w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand";
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted">{field.label}</label>
      {field.type === "select" ? (
        <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : (
        <input
          className={base}
          type={field.type === "date" ? "date" : "text"}
          inputMode={field.type === "money" || field.type === "number" ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <p className="text-xs text-faint">{field.help}</p>}
    </div>
  );
}
