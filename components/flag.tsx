import clsx from "clsx";

/**
 * Inline SVG flags rather than emoji: flag emoji do not render on Windows
 * (Chrome/Edge show "US"/"CA"/"GB" letter pairs), which would break the
 * country cue for a large share of desktop visitors. Three simplified,
 * public-domain national designs, legible down to 16px.
 */
export type CountryCode =
  | "US" | "CA" | "GB" | "GH" | "NG" | "KE" | "SG" | "CH"
  | "SN" | "EG" | "ET" | "ZA" | "AE" | "IN" | "CN" | "JP" | "AU" | "BR";

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

function Ghana() {
  return (
    <>
      <rect width="24" height="16" fill="#fcd116" />
      <rect width="24" height="5.34" fill="#ce1126" />
      <rect y="10.66" width="24" height="5.34" fill="#006b3f" />
      <path d="M12 5.6 12.95 8.05 15.5 8.05 13.45 9.6 14.25 12.05 12 10.55 9.75 12.05 10.55 9.6 8.5 8.05 11.05 8.05 Z" fill="#000" />
    </>
  );
}

function Nigeria() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#008751" />
      <rect x="16" width="8" height="16" fill="#008751" />
    </>
  );
}

function Kenya() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="4.6" fill="#000" />
      <rect y="5.6" width="24" height="4.8" fill="#bb0000" />
      <rect y="11.4" width="24" height="4.6" fill="#006600" />
      <ellipse cx="12" cy="8" rx="2.5" ry="4.4" fill="#bb0000" stroke="#fff" strokeWidth="0.7" />
      <ellipse cx="12" cy="8" rx="0.8" ry="2.6" fill="#fff" />
    </>
  );
}

function Singapore() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="8" fill="#ed2939" />
      <path d="M8.4 4A2.9 2.9 0 1 0 8.4 9.6 3.4 3.4 0 1 1 8.4 4Z" fill="#fff" />
      {[
        [10.9, 3.6],
        [12.9, 4.5],
        [12.2, 6.6],
        [9.6, 6.6],
        [8.9, 4.5],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.5" fill="#fff" />
      ))}
    </>
  );
}

function Switzerland() {
  return (
    <>
      <rect width="24" height="16" fill="#d52b1e" />
      <rect x="10.6" y="3.6" width="2.8" height="8.8" fill="#fff" />
      <rect x="7.6" y="6.6" width="8.8" height="2.8" fill="#fff" />
    </>
  );
}

function Senegal() {
  return (
    <>
      <rect width="24" height="16" fill="#fdef42" />
      <rect width="8" height="16" fill="#00853f" />
      <rect x="16" width="8" height="16" fill="#e31b23" />
      <path d="M12 5.2 12.9 7.6 15.4 7.6 13.4 9.1 14.1 11.5 12 10.1 9.9 11.5 10.6 9.1 8.6 7.6 11.1 7.6 Z" fill="#00853f" />
    </>
  );
}

function Egypt() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.34" fill="#ce1126" />
      <rect y="10.66" width="24" height="5.34" fill="#000" />
      <circle cx="12" cy="8" r="1.6" fill="#c09300" />
    </>
  );
}

function Ethiopia() {
  return (
    <>
      <rect width="24" height="16" fill="#fcdd09" />
      <rect width="24" height="5.34" fill="#078930" />
      <rect y="10.66" width="24" height="5.34" fill="#da121a" />
      <circle cx="12" cy="8" r="3.5" fill="#0f47af" />
      <path d="M12 5.4 12.8 7.4 14.9 7.4 13.2 8.7 13.8 10.7 12 9.5 10.2 10.7 10.8 8.7 9.1 7.4 11.2 7.4 Z" fill="#fcdd09" />
    </>
  );
}

function SouthAfrica() {
  return (
    <>
      <rect width="24" height="8" fill="#e03c31" />
      <rect y="8" width="24" height="8" fill="#001489" />
      <path d="M0 0 11 8 0 16 Z" fill="#fff" />
      <path d="M24 1.6 12.4 8 24 14.4 Z" fill="#fff" opacity="0" />
      <path d="M0 1.8 9 8 0 14.2 Z" fill="#000" />
      <path d="M0 0 H3.2 L14.4 8 3.2 16 H0 L11.9 8 Z" fill="#ffb81c" opacity="0" />
      <path d="M24 5.2 H9.6 L4.4 1.4 V3.1 L7.6 5.2 H24 Z" fill="#fff" opacity="0" />
      <path d="M2.6 0 H6.4 L14.6 6 H24 V10 H14.6 L6.4 16 H2.6 L11.6 8 Z" fill="#fff" />
      <path d="M4.4 0.9 H6.9 L14.9 6.8 H24 V9.2 H14.9 L6.9 15.1 H4.4 L12.9 8 Z" fill="#007749" />
    </>
  );
}

function Uae() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.34" fill="#00732f" />
      <rect y="10.66" width="24" height="5.34" fill="#000" />
      <rect width="6" height="16" fill="#ff0000" />
    </>
  );
}

function India() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.34" fill="#ff9933" />
      <rect y="10.66" width="24" height="5.34" fill="#138808" />
      <circle cx="12" cy="8" r="2.2" fill="none" stroke="#000080" strokeWidth="0.55" />
      <circle cx="12" cy="8" r="0.45" fill="#000080" />
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1={12 - 2.1 * Math.cos((a * Math.PI) / 180)}
          y1={8 - 2.1 * Math.sin((a * Math.PI) / 180)}
          x2={12 + 2.1 * Math.cos((a * Math.PI) / 180)}
          y2={8 + 2.1 * Math.sin((a * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="0.35"
        />
      ))}
    </>
  );
}

function China() {
  return (
    <>
      <rect width="24" height="16" fill="#de2910" />
      <path d="M4.6 2.2 5.5 4.6 8 4.6 6 6.1 6.7 8.6 4.6 7.1 2.5 8.6 3.2 6.1 1.2 4.6 3.7 4.6 Z" fill="#ffde00" />
      {[
        [9.4, 2.1],
        [11.2, 4],
        [11.2, 6.6],
        [9.4, 8.4],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.75" fill="#ffde00" />
      ))}
    </>
  );
}

function Japan() {
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="4.4" fill="#bc002d" />
    </>
  );
}

function Australia({ id }: { id: string }) {
  return (
    <>
      <clipPath id={id}>
        <rect width="12" height="8" />
      </clipPath>
      <rect width="24" height="16" fill="#00247d" />
      <g clipPath={`url(#${id})`}>
        <path d="M0 0 12 8 M12 0 0 8" stroke="#fff" strokeWidth="1.7" />
        <path d="M0 0 12 8 M12 0 0 8" stroke="#c8102e" strokeWidth="0.8" />
        <path d="M6 0V8 M0 4H12" stroke="#fff" strokeWidth="2.6" />
        <path d="M6 0V8 M0 4H12" stroke="#c8102e" strokeWidth="1.5" />
      </g>
      <circle cx="6" cy="12" r="1.5" fill="#fff" />
      {[
        [17, 3.2, 0.7],
        [20.4, 6, 0.7],
        [17.6, 9.4, 0.7],
        [21.2, 11.4, 0.55],
        [18.9, 6.4, 0.42],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" />
      ))}
    </>
  );
}

function Brazil() {
  return (
    <>
      <rect width="24" height="16" fill="#009739" />
      <path d="M12 1.8 22 8 12 14.2 2 8 Z" fill="#fedd00" />
      <circle cx="12" cy="8" r="3.3" fill="#012169" />
      <path d="M8.9 6.9C10.8 6.2 13.4 6.5 15.1 7.6" stroke="#fff" strokeWidth="0.85" fill="none" />
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
      {country === "GH" && <Ghana />}
      {country === "NG" && <Nigeria />}
      {country === "KE" && <Kenya />}
      {country === "SG" && <Singapore />}
      {country === "CH" && <Switzerland />}
      {country === "SN" && <Senegal />}
      {country === "EG" && <Egypt />}
      {country === "ET" && <Ethiopia />}
      {country === "ZA" && <SouthAfrica />}
      {country === "AE" && <Uae />}
      {country === "IN" && <India />}
      {country === "CN" && <China />}
      {country === "JP" && <Japan />}
      {country === "AU" && <Australia id={`au-clip-${country}`} />}
      {country === "BR" && <Brazil />}
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
