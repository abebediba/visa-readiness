import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, FileSearch, Mail, Quote, ScanSearch, ShieldCheck } from "lucide-react";
import { RoutesBrowser } from "@/components/routes-browser";
import { HeroGlobe } from "@/components/globe";
import { Flag } from "@/components/flag";
import { TESTIMONIALS } from "@/lib/testimonials";
import { CONTACT_EMAIL } from "@/lib/contact";

/** Solid panels. Each fill carries white type at 5.7:1 or better. */
const FILLS: Record<string, { panel: string; icon: string }> = {
  navy: { panel: "bg-fill-navy", icon: "text-fill-navy" },
  teal: { panel: "bg-fill-teal", icon: "text-fill-teal" },
  orange: { panel: "bg-fill-orange", icon: "text-fill-orange" },
  purple: { panel: "bg-fill-purple", icon: "text-fill-purple" },
};

const FEATURES = [
  {
    fill: "navy",
    icon: ScanSearch,
    title: "Cross-checks everything",
    body: "Your declared income against your employment letter against your bank statements. Your trip dates against your invitation. Contradictions surface before an officer finds them.",
  },
  {
    fill: "teal",
    icon: FileSearch,
    title: "Built on official requirements",
    body: "Every requirement links to its official government source, with the date it was last verified. Nothing is invented.",
  },
  {
    fill: "orange",
    icon: CheckCircle2,
    title: "A score you can interrogate",
    body: "Every sub-score explains itself: what evidence counted, what weakness cost points, and what would improve it.",
  },
  {
    fill: "purple",
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
            <article
              key={feature.title}
              className={clsx(
                "rounded-[var(--radius-lg)] p-7 transition-transform duration-300 hover:-translate-y-0.5 sm:p-8",
                FILLS[feature.fill].panel
              )}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_2px_8px_rgb(0_0_0/0.10)]">
                <feature.icon className={clsx("h-[22px] w-[22px]", FILLS[feature.fill].icon)} aria-hidden />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{feature.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/90">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Supported routes ---------- */}
      <section>
        <div className="card overflow-hidden p-6 sm:p-9">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Coverage
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Supported visa routes</h2>
          <p className="mt-3 max-w-lg text-muted">
            Choose from five visitor and study routes across three destinations. New countries are
            added as configuration, not rewrites.
          </p>
          <div className="mt-7">
            <RoutesBrowser />
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="space-y-8">
        <div className="max-w-lg">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            <span className="h-1.5 w-1.5 rounded-full bg-rose" />
            In their words
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">What people notice first</h2>
          <p className="mt-3 text-muted">
            Almost always the same thing: a contradiction sitting in plain sight across two
            documents they had each read several times.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name + t.route}
              className="card flex flex-col p-6 transition-shadow duration-300 hover:shadow-[var(--shadow-card)]"
            >
              <Quote className="h-6 w-6 shrink-0 text-border-strong" aria-hidden />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-text">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-muted">
                  {t.name.replace(/[^A-Z]/g, "").slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {t.name} <span className="font-normal text-muted">· {t.location}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs leading-snug text-muted">
                    <Flag country={t.country} className="h-3 w-[18px] shrink-0" />
                    {t.route}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {TESTIMONIALS.some((t) => t.illustrative) && (
          <p className="border-l-2 border-border-strong pl-4 text-[15px] leading-relaxed text-muted">
            <strong className="font-medium text-text">Illustrative examples, not real reviews.</strong>{" "}
            The product has not launched, so there is nobody to quote yet. Real, consented quotes
            will replace these.
          </p>
        )}
      </section>

      {/* ---------- Contact ---------- */}
      <section>
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-14">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                Contact us
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">Something wrong? Tell us.</h2>
              <p className="mt-3 max-w-lg text-muted">
                A requirement that has changed, a check that misread your case, a route you want
                covered — those reports are how the rules stay current. We read every one.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group mt-7 inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-[15px] font-medium text-on-brand transition-colors hover:bg-brand-deep"
              >
                <Mail className="h-[18px] w-[18px]" aria-hidden />
                {CONTACT_EMAIL}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>

            <div className="rounded-[var(--radius-lg)] bg-surface-2 p-6">
              <p className="text-sm font-medium">Please do not email your documents</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Email is not a safe place for a passport or a bank statement, and we do not want
                copies of yours. Everything you enter stays on your own device — describe the
                problem instead, and leave the files where they are.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                For privacy requests and data deletion, write to{" "}
                <a href="mailto:privacy@visareadiness.com" className="text-brand underline underline-offset-2">
                  privacy@visareadiness.com
                </a>{" "}
                or use{" "}
                <Link href="/legal/data-rights" className="text-brand underline underline-offset-2">
                  your data rights
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
