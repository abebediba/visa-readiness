import {
  Banknote, BookOpen, Briefcase, Building2, FileText, FileWarning, GraduationCap,
  Home, Landmark, Plane, ScanSearch, ShieldCheck, Users, Wallet, type LucideIcon,
} from "lucide-react";

export type Tint = "brand" | "teal" | "amber" | "violet" | "rose" | "info";

export const TINT: Record<Tint, { tile: string; icon: string; bar: string }> = {
  brand: { tile: "bg-brand-soft", icon: "text-brand", bar: "bg-brand" },
  teal: { tile: "bg-teal-soft", icon: "text-teal", bar: "bg-teal" },
  amber: { tile: "bg-amber-soft", icon: "text-amber", bar: "bg-amber" },
  violet: { tile: "bg-violet-soft", icon: "text-violet", bar: "bg-violet" },
  rose: { tile: "bg-rose-soft", icon: "text-rose", bar: "bg-rose" },
  info: { tile: "bg-info-soft", icon: "text-info", bar: "bg-info" },
};

/**
 * Presentation for each assessment category, keyed by the category id shared
 * across routes — so a new route inherits all of this without extra work.
 */
export const CATEGORY_META: Record<string, { description: string; icon: LucideIcon; tint: Tint }> = {
  purpose: { description: "Clarity and supporting documents", icon: Briefcase, tint: "brand" },
  financial: { description: "Sufficiency and stability of funds", icon: Banknote, tint: "teal" },
  funding: { description: "Where the money comes from", icon: Wallet, tint: "teal" },
  employment: { description: "Work history and stability", icon: Building2, tint: "info" },
  home_ties: { description: "Commitments and return intentions", icon: Home, tint: "amber" },
  travel_history: { description: "Previous travel and compliance", icon: Plane, tint: "info" },
  consistency: { description: "Answers and documents agree", icon: ScanSearch, tint: "rose" },
  documentation: { description: "Validity and completeness", icon: ShieldCheck, tint: "violet" },
  previous_refusals: { description: "Past decisions and changes since", icon: FileWarning, tint: "rose" },
  school: { description: "Admission and enrolment", icon: GraduationCap, tint: "violet" },
  admission: { description: "Acceptance and attestation", icon: GraduationCap, tint: "violet" },
  academic: { description: "Progression and programme", icon: BookOpen, tint: "brand" },
};

export const DEFAULT_CATEGORY_META = {
  description: "Evidence and consistency in this area",
  icon: FileText,
  tint: "brand" as Tint,
};

const FINDING_ICON_BY_CODE: Record<string, LucideIcon> = {
  RELATIVES_CONTRADICTION: Users,
  INCOME_MISMATCH: FileText,
  FUNDS_MISMATCH: Landmark,
  LARGE_DEPOSIT_UNEXPLAINED: Landmark,
  LARGE_DEPOSIT_EXPLAINED: Landmark,
  SPONSOR_UNEVIDENCED: Users,
  SPONSOR_CAPACITY_GAP: Users,
  DURATION_MISMATCH: Plane,
  STAY_EXCEEDS_LIMIT: Plane,
  FUNDING_GAP: Wallet,
  NAME_MISMATCH: FileText,
};

export function findingIcon(code: string, category: string): LucideIcon {
  return FINDING_ICON_BY_CODE[code] ?? CATEGORY_META[category]?.icon ?? DEFAULT_CATEGORY_META.icon;
}

/** Short quality word for a percentage, used on the metric pills. */
export function qualityLabel(pct: number): string {
  if (pct >= 90) return "Strong";
  if (pct >= 65) return "Good";
  if (pct >= 40) return "Needs work";
  return "Weak";
}
