"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes/definitions";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/components/ui";

export default function StartPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const application = useApp((s) => s.application);
  const startApplication = useApp((s) => s.startApplication);
  const resetApplication = useApp((s) => s.resetApplication);

  const begin = (routeId: (typeof ROUTES)[number]["id"]) => {
    startApplication(routeId);
    router.push("/application/questionnaire");
  };

  const grouped = new Map<string, typeof ROUTES>();
  for (const r of ROUTES) {
    grouped.set(r.countryName, [...(grouped.get(r.countryName) ?? []), r]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Where are you applying?</h1>
        <p className="text-muted">Choose your destination and visa route.</p>
      </header>

      {hydrated && application && (
        <div className="card space-y-2 border-warn/40 p-4 text-sm">
          <p>
            You already have a <strong>{ROUTES.find((r) => r.id === application.routeId)?.shortName}</strong>{" "}
            application in progress. Starting a new one will replace it on this device.
          </p>
          <button onClick={() => resetApplication()} className="text-neg underline">
            Delete the current application
          </button>
        </div>
      )}

      {[...grouped.entries()].map(([country, routes]) => (
        <section key={country} className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-faint">{country}</h2>
          <div className="space-y-2">
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => begin(r.id)}
                className="card flex w-full items-center justify-between gap-3 p-4 text-left hover:border-brand"
              >
                <span>
                  <span className="block font-medium">{r.shortName}</span>
                  <span className="block text-sm text-muted">{r.tagline}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
