import type { CountryCode } from "@/components/flag";

export type Testimonial = {
  quote: string;
  name: string;
  /** Where they applied from — city and country, as they would say it. */
  location: string;
  /** Flag shown beside the attribution: the destination they applied to. */
  country: CountryCode;
  route: string;
  /**
   * True until a real, consented quote replaces it. The section renders an
   * honest note while any entry is still illustrative — delete the flag (and
   * the note disappears) once these are real.
   */
  illustrative: boolean;
};

/**
 * Placeholder content. These are written to show what the section says when it
 * is real, not to pass as genuine reviews: every entry is flagged illustrative
 * and the page says so. Replace with quotes you have permission to publish.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "It caught that my invitation letter said thirty days while my form said fourteen. I had read both documents four times and never put them side by side.",
    name: "A. B.",
    location: "Accra, Ghana",
    country: "US",
    route: "B1/B2 Visitor Visa",
    illustrative: true,
  },
  {
    quote:
      "The part I valued was being told why a point was lost. Not 'weak financials' — the actual figure, the actual document, and what would fix it.",
    name: "C. D.",
    location: "Lagos, Nigeria",
    country: "GB",
    route: "Standard Visitor Visa",
    illustrative: true,
  },
  {
    quote:
      "I had a lump sum in my account from selling a car and no idea it would look strange. It told me to bring the sale agreement before anyone asked for it.",
    name: "E. F.",
    location: "Nairobi, Kenya",
    country: "CA",
    route: "Study Permit",
    illustrative: true,
  },
];
