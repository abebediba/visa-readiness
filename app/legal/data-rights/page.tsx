"use client";

import { useState } from "react";
import { LegalPage } from "@/components/legal";
import { useApp } from "@/lib/store";

export default function DataRightsPage() {
  const application = useApp((s) => s.application);
  const resetApplication = useApp((s) => s.resetApplication);
  const [deleted, setDeleted] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(application ?? {}, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visa-readiness-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LegalPage title="Your data rights" updated="19 August 2026">
      <p>
        You control everything you enter here. In this preview your data lives only in your own
        browser, so these controls act instantly and completely — there is no server copy to chase.
        The full service will offer the same controls for server-stored data: export, per-document
        deletion, application deletion, and full account deletion, each acting on files, database
        records and derived data alike.
      </p>

      <h2>Download my data</h2>
      <p>
        Export everything currently stored — your answers, document list and latest assessment — as
        a single JSON file you can keep.
      </p>
      <button
        onClick={exportData}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand"
      >
        Download my data (JSON)
      </button>

      <h2>Delete all my stored data</h2>
      <p>
        Permanently removes your application, answers, document entries and assessment history from
        this device. This cannot be undone.
      </p>
      {deleted ? (
        <p className="rounded-[var(--radius-sm)] bg-accent-soft px-4 py-3 text-sm text-accent">
          Everything has been deleted from this device.
        </p>
      ) : (
        <button
          onClick={() => {
            resetApplication();
            setDeleted(true);
          }}
          className="rounded-full border border-neg px-5 py-2.5 text-sm font-medium text-neg"
        >
          Delete everything
        </button>
      )}

      <h2>Questions or complaints</h2>
      <p>
        Write to <strong>privacy@[operator-domain]</strong>. You may also complain to your national
        data protection authority — for example the Data Protection Commission (Ghana), the Nigeria
        Data Protection Commission, the Office of the Data Protection Commissioner (Kenya), or the
        Information Regulator (South Africa).
      </p>
    </LegalPage>
  );
}
