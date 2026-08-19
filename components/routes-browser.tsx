"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ROUTES } from "@/lib/routes/definitions";
import { Flag, type CountryCode } from "@/components/flag";

const PAGE_SIZE = 4;

const COUNTRIES = [...new Map(ROUTES.map((r) => [r.country, r.countryName])).entries()].map(
  ([code, name]) => ({ code: code as CountryCode, name })
);

export function RoutesBrowser() {
  const [country, setCountry] = useState<"all" | CountryCode>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROUTES.filter((r) => {
      if (country !== "all" && r.country !== country) return false;
      if (!q) return true;
      return `${r.name} ${r.shortName} ${r.tagline} ${r.countryName}`.toLowerCase().includes(q);
    });
  }, [country, query]);

  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = matches.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const reset = (fn: () => void) => {
    fn();
    setPage(0);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar: quick country chips on wide screens, a select on narrow ones,
          plus free-text search over route names and descriptions. */}
      <div className="space-y-3">
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          <Chip active={country === "all"} onClick={() => reset(() => setCountry("all"))}>
            All routes
          </Chip>
          {COUNTRIES.map((c) => (
            <Chip
              key={c.code}
              active={country === c.code}
              onClick={() => reset(() => setCountry(c.code))}
            >
              <Flag country={c.code} className="h-3.5 w-5" />
              {c.name}
            </Chip>
          ))}
        </div>

        <div className="flex gap-3">
        <label className="flex-1 sm:hidden">
          <span className="sr-only">Filter by country</span>
          <select
            value={country}
            onChange={(e) => reset(() => setCountry(e.target.value as "all" | CountryCode))}
            className="w-full rounded-full border border-border bg-surface-1 px-4 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="all">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="relative flex-1 sm:ml-auto sm:max-w-xs sm:flex-none">
          <span className="sr-only">Search visa routes</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => reset(() => setQuery(e.target.value))}
            placeholder="Search routes"
            className="w-full rounded-full border border-border bg-surface-1 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-faint focus:border-brand"
          />
        </label>
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium">No routes match that search.</p>
          <p className="mt-1 text-sm text-muted">
            Five routes are supported today. More countries are added as configuration.
          </p>
          <button
            onClick={() => reset(() => {
              setCountry("all");
              setQuery("");
            })}
            className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="card divide-y divide-border overflow-hidden">
          {visible.map((route) => (
            <li key={route.id}>
              <Link
                href="/start"
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/60"
              >
                <Flag country={route.country as CountryCode} className="h-6 w-9" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs uppercase tracking-[0.07em] text-faint">
                    {route.countryName}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {route.name.split("—")[1]?.trim() ?? route.shortName}
                    </span>
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        route.kind === "study"
                          ? "bg-violet-soft text-violet"
                          : "bg-teal-soft text-teal"
                      )}
                    >
                      {route.kind === "study" ? "Study" : "Visitor"}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{route.tagline}</span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-brand"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {matches.length === 0
            ? "No routes"
            : `Showing ${current * PAGE_SIZE + 1}–${current * PAGE_SIZE + visible.length} of ${matches.length}`}
        </p>
        {pages > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <PageButton
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </PageButton>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-current={i === current ? "page" : undefined}
                className={clsx(
                  "h-8 min-w-8 rounded-full px-2 text-sm font-medium transition-colors",
                  i === current
                    ? "bg-brand text-on-brand"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                )}
              >
                {i + 1}
              </button>
            ))}
            <PageButton
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={current === pages - 1}
              label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </PageButton>
          </nav>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-on-brand"
          : "border-border bg-surface-1 text-muted hover:border-border-strong hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
