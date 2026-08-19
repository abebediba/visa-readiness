import clsx from "clsx";

/**
 * Inline SVG flags rather than emoji: flag emoji do not render on Windows
 * (Chrome/Edge show "US"/"CA"/"GB" letter pairs), which would break the
 * country cue for a large share of desktop visitors. Three simplified,
 * public-domain national designs, legible down to 16px.
 */
export type CountryCode = "US" | "CA" | "GB";

const STAR_ROWS = [0, 1, 2, 3, 4];
const STAR_COLS = [0, 1, 2, 3, 4, 5];

function UnitedStates() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * (16 / 13)} width="24" height={16 / 13} fill="#b22234" />
      ))}
      <rect width="9.7" height={(16 / 13) * 7} fill="#3c3b6e" />
      {STAR_ROWS.map((r) =>
        STAR_COLS.map((c) => (
          <circle key={`${r}-${c}`} cx={0.95 + c * 1.56} cy={0.9 + r * 1.72} r="0.34" fill="#fff" />
        ))
      )}
    </>
  );
}

function Canada() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="6" height="16" fill="#d52b1e" />
      <rect x="18" width="6" height="16" fill="#d52b1e" />
      <path
        d="M12 3.4 13.0 5.4 14.9 5.0 14.4 7.0 16.3 7.4 14.6 8.8 15.0 9.8 12.9 9.5 12.75 12.4 11.25 12.4 11.1 9.5 9.0 9.8 9.4 8.8 7.7 7.4 9.6 7.0 9.1 5.0 11.0 5.4 Z"
        fill="#d52b1e"
      />
    </>
  );
}

function UnitedKingdom({ id }: { id: string }) {
  return (
    <>
      <clipPath id={id}>
        <rect width="24" height="16" rx="0" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="24" height="16" fill="#012169" />
        <path d="M0 0 24 16 M24 0 0 16" stroke="#fff" strokeWidth="3.4" />
        <path d="M0 0 24 16 M24 0 0 16" stroke="#c8102e" strokeWidth="1.5" />
        <path d="M12 0V16 M0 8H24" stroke="#fff" strokeWidth="5.2" />
        <path d="M12 0V16 M0 8H24" stroke="#c8102e" strokeWidth="3" />
      </g>
    </>
  );
}

export function Flag({
  country,
  className,
}: {
  country: CountryCode;
  className?: string;
}) {
  const clipId = `uk-clip-${country}`;
  return (
    <svg
      viewBox="0 0 24 16"
      role="img"
      aria-hidden
      className={clsx(
        "shrink-0 rounded-[3px] ring-1 ring-inset ring-black/10",
        className ?? "h-4 w-6"
      )}
    >
      {country === "US" && <UnitedStates />}
      {country === "CA" && <Canada />}
      {country === "GB" && <UnitedKingdom id={clipId} />}
    </svg>
  );
}

/**
 * The persistent "where am I applying" cue used across the product flow:
 * flag + country on one line, visa route beneath it.
 */
export function RouteBadge({
  country,
  countryName,
  routeName,
  size = "md",
}: {
  country: CountryCode;
  countryName: string;
  routeName: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Flag country={country} className={size === "sm" ? "h-4 w-6" : "h-6 w-9"} />
      <div className="leading-tight">
        <p className={clsx("text-muted", size === "sm" ? "text-xs" : "text-sm")}>{countryName}</p>
        <p className={clsx("font-medium", size === "sm" ? "text-sm" : "text-base")}>{routeName}</p>
      </div>
    </div>
  );
}
