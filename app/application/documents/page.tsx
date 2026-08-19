"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, ChevronDown, FileUp, Sparkles, Trash2 } from "lucide-react";
import { getRoute } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { stashFile, takeFile, dropFile } from "@/lib/file-stash";
import {
  CONFIDENCE_REVIEW_THRESHOLD,
  MAX_UPLOAD_BYTES,
  type ExtractResponse,
  type AiError,
} from "@/lib/ai/contract";
import type { DocumentTypeDef, FactField, UploadedDoc } from "@/lib/types";
import { EmptyApplication, useHydrated } from "@/components/ui";

function useAiEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    fetch("/api/extract")
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);
  return enabled;
}

const EXTRACT_TYPES: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "application/pdf": "application/pdf",
};

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export default function DocumentsPage() {
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const aiEnabled = useAiEnabled();

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
          answers.{" "}
          {aiEnabled
            ? "You can have the AI read a document's details for you — it only happens when you tap the button, and you review everything before it counts."
            : "In this preview, files never leave your device — only the details you type are used."}
        </p>
      </header>

      <div className="space-y-3">
        {applicable.map((def) => (
          <DocumentCard
            key={def.type}
            def={def}
            routeId={application.routeId}
            aiEnabled={aiEnabled}
            docs={application.documents.filter((d) => d.type === def.type)}
          />
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

function DocumentCard({
  def,
  docs,
  routeId,
  aiEnabled,
}: {
  def: DocumentTypeDef;
  docs: UploadedDoc[];
  routeId: string;
  aiEnabled: boolean;
}) {
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
        <UploadedDocRow
          key={doc.id}
          doc={doc}
          def={def}
          routeId={routeId}
          aiEnabled={aiEnabled}
          onRemove={() => {
            dropFile(doc.id);
            removeDocument(doc.id);
          }}
        />
      ))}

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-brand">
        <FileUp className="h-4 w-4" aria-hidden />
        {uploaded ? "Add another file" : "Add this document"}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const id = addDocument({ type: def.type, fileName: f.name, size: f.size });
              if (id) stashFile(id, f);
            }
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
  routeId,
  aiEnabled,
  onRemove,
}: {
  doc: UploadedDoc;
  def: DocumentTypeDef;
  routeId: string;
  aiEnabled: boolean;
  onRemove: () => void;
}) {
  const setDocumentFacts = useApp((s) => s.setDocumentFacts);
  const [open, setOpen] = useState(!doc.factsConfirmed && !!def.factFields?.length);
  const [draft, setDraft] = useState<Record<string, string>>(doc.facts);
  const [confidences, setConfidences] = useState<Record<string, number>>({});
  const [extracting, setExtracting] = useState(false);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const repickRef = useRef<HTMLInputElement>(null);
  const fields = def.factFields ?? [];

  const runExtraction = async (file: File) => {
    const mediaType = EXTRACT_TYPES[file.type];
    if (!mediaType) {
      setAiNotes(["This file type can't be read automatically — enter the details manually."]);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setAiNotes(["File is larger than 8MB — enter the details manually or use a smaller photo."]);
      return;
    }
    setExtracting(true);
    setAiNotes([]);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          docType: doc.type,
          mediaType,
          data: await fileToBase64(file),
        }),
      });
      const result = (await res.json()) as ExtractResponse | AiError;
      if (!result.ok) {
        setAiNotes([result.error]);
        return;
      }
      const values: Record<string, string> = {};
      const conf: Record<string, number> = {};
      for (const f of result.fields) {
        values[f.id] = f.value;
        conf[f.id] = f.confidence;
      }
      setDraft((d) => ({ ...values, ...pickNonEmpty(d) }));
      setConfidences(conf);
      const notes: string[] = [];
      if (!result.typeMatchesDeclared) {
        notes.push(
          `This looks like "${result.detectedType}" rather than "${def.label}" — double-check you added the right file.`
        );
      }
      if (!result.quality.readable) notes.push("Parts of this document were hard to read.");
      notes.push(...result.quality.issues);
      notes.push("Check every value against the document before confirming — especially the highlighted ones.");
      setAiNotes(notes);
      setOpen(true);
    } catch {
      setAiNotes(["Extraction failed — enter the details manually."]);
    } finally {
      setExtracting(false);
    }
  };

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

      {aiEnabled && fields.length > 0 && !doc.factsConfirmed && (
        <div className="mt-2">
          <button
            disabled={extracting}
            onClick={() => {
              const file = takeFile(doc.id);
              if (file) void runExtraction(file);
              else repickRef.current?.click();
            }}
            className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {extracting ? "Reading document…" : "Read details with AI"}
          </button>
          <p className="mt-1 text-xs text-faint">
            Optional. Sends this one document to the AI service to read the fields for you — nothing
            is stored there, and you confirm every value.{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy
            </Link>
          </p>
          <input
            ref={repickRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                stashFile(doc.id, f);
                void runExtraction(f);
              }
              e.target.value = "";
            }}
          />
        </div>
      )}

      {aiNotes.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-[var(--radius-sm)] bg-info-soft px-3 py-2 text-xs text-info">
          {aiNotes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}

      {open && fields.length > 0 && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <p className="text-xs text-muted">
            Enter the values exactly as the document shows — the point is to catch differences.
          </p>
          {fields.map((f) => (
            <FactInput
              key={f.id}
              field={f}
              value={draft[f.id] ?? ""}
              lowConfidence={confidences[f.id] !== undefined && confidences[f.id] < CONFIDENCE_REVIEW_THRESHOLD}
              onChange={(v) => setDraft((d) => ({ ...d, [f.id]: v }))}
            />
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

function pickNonEmpty(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== ""));
}

function FactInput({
  field,
  value,
  onChange,
  lowConfidence,
}: {
  field: FactField;
  value: string;
  onChange: (v: string) => void;
  lowConfidence?: boolean;
}) {
  const base = clsx(
    "w-full rounded-[var(--radius-sm)] border bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand",
    lowConfidence ? "border-warn" : "border-border"
  );
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted">
        {field.label}
        {lowConfidence && <span className="ml-1 text-warn">— uncertain reading, please verify</span>}
      </label>
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
