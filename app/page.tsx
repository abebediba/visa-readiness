import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, FileSearch, ScanSearch, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes/definitions";
import { RoutesBrowser } from "@/components/routes-browser";
import { HeroGlobe } from "@/components/globe";

const TINTS: Record<string, { chip: string; icon: string; edge: string }> = {
  brand: { chip: "bg-brand-soft", icon: "text-brand", edge: "group-hover:border-t-brand" },
  teal: { chip: "bg-teal-soft", icon: "text-teal", edge: "group-hover:border-t-teal" },
  amber: { chip: "bg-amber-soft", icon: "text-amber", edge: "group-hover:border-t-amber" },
  violet: { chip: "bg-violet-soft", icon: "text-violet", edge: "group-hover:border-t-violet" },
};

const FEATURES = [
  {
    tint: "brand",
    icon: ScanSearch,
    title: "Cross-checks everything",
    body: "Your declared income against your employment letter against your bank statements. Your trip dates against your invitation. Contradictions surface before an officer finds them.",
  },
  {
    tint: "teal",
    icon: FileSearch,
    title: "Built on official requirements",
    body: "Every requirement links to its official government source, with the date it was last verified. Nothing is invented.",
  },
  {
    tint: "amber",
    icon: CheckCircle2,
    title: "A score you can interrogate",
    body: "Every sub-score explains itself: what evidence counted, what weakness cost points, and what would improve it.",
  },
  {
    tint: "violet",
    icon: ShieldCheck,
    title: "Honest by design",
    body: "No approval predictions, no nationality penalties, and never advice to fake, borrow, or hide anything.",
  },
];

export default function LandingPage() {
  return (
    <div data-wide className="space-y-24 pb-8 sm:space-y-32">
      {/* ---------- Hero ---------- */}
      <section className="relative pt-6 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,480px)] lg:gap-10">
          <div className="reveal relative z-10 max-w-xl">
            <h1 className="text-[2rem] font-semibold leading-[1.1] sm:text-[2.6rem] lg:text-[3rem] lg:leading-[1.06]">
              Know how strong your visa application is before you submit it.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted sm:text-lg">
              Answer a guided questionnaire, list your documents, and get a transparent readiness
              score with the exact inconsistencies and gaps a reviewer would notice — and what to do
              about each one.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href="/start"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-medium text-on-brand shadow-[0_1px_2px_rgb(15_92_140/0.28),0_10px_24px_-12px_rgb(15_92_140/0.65)] transition-colors hover:bg-brand-deep sm:w-auto"
              >
                Check my readiness
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-6 py-3.5 text-[15px] font-medium transition-colors hover:border-border-strong"
              >
                See a worked example
              </Link>
            </div>
            <p className="mt-7 text-[17px] leading-relaxed text-muted">
              Runs entirely on your device — nothing you enter leaves it.
            </p>
          </div>

          <div className="reveal reveal-2 relative -my-6 lg:my-0">
            <HeroGlobe />
          </div>
        </div>
      </section>

      {/* ---------- What it does ---------- */}
      <section className="space-y-8">
        <div className="max-w-lg">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            What it does
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Not a checklist. A review.</h2>
          <p className="mt-3 text-muted">
            The same things an experienced reviewer looks for, applied to your own documents.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={clsx(
                "card group border-t-[3px] border-t-transparent p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)]",
                TINTS[feature.tint].edge
              )}
            >
              <span
                className={clsx(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl",
                  TINTS[feature.tint].chip
                )}
              >
                <feature.icon className={clsx("h-5 w-5", TINTS[feature.tint].icon)} aria-hidden />
              </span>
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Supported routes ---------- */}
      <section className="space-y-8">
        <div className="max-w-lg">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Coverage
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Supported visa routes</h2>
          <p className="mt-3 text-muted">
            Five routes at launch. New countries are added as configuration, not rewrites.
          </p>
        </div>

        <div className="max-w-2xl">
          <RoutesBrowser />
        </div>
      </section>

    </div>
  );
}
