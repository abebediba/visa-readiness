import Link from "next/link";
import { CheckCircle2, FileSearch, ScanSearch, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes/definitions";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Free preview</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Know how strong your visa application is — before you submit it.
        </h1>
        <p className="mx-auto max-w-lg text-muted">
          Answer a guided questionnaire, list your documents, and get a transparent Visa Readiness
          Score with the exact inconsistencies and gaps a reviewer would notice — plus what to do
          about each one.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/start" className="rounded-full bg-brand px-6 py-3 font-medium text-on-brand">
            Check my readiness
          </Link>
        </div>
        <p className="text-xs text-faint">
          Runs entirely on your device in this preview — nothing you enter leaves your phone.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          {
            icon: ScanSearch,
            title: "Cross-checks everything",
            body: "Your declared income vs your employment letter vs your bank statements. Your trip dates vs your invitation. Contradictions surface before an officer finds them.",
          },
          {
            icon: FileSearch,
            title: "Built on official requirements",
            body: "Every requirement links to its official government source, with the date it was last verified. Nothing is invented.",
          },
          {
            icon: CheckCircle2,
            title: "A score you can interrogate",
            body: "Every sub-score explains itself: what evidence counted, what weakness cost points, and what would improve it.",
          },
          {
            icon: ShieldCheck,
            title: "Honest by design",
            body: "No approval predictions, no nationality penalties, and never advice to fake, borrow, or hide anything.",
          },
        ].map((f) => (
          <div key={f.title} className="card space-y-2 p-5">
            <f.icon className="h-5 w-5 text-brand" aria-hidden />
            <h2 className="font-medium">{f.title}</h2>
            <p className="text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Supported visa routes</h2>
        <ul className="card divide-y divide-border">
          {ROUTES.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted">{r.tagline}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">More countries and routes are added as configuration — the platform is built for it.</p>
      </section>
    </div>
  );
}
