import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Disclaimer — Visa Readiness" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="19 August 2026">
      <p>
        Please read this before relying on anything the tool tells you. It also appears on every
        generated report.
      </p>

      <h2>Informational self-assessment only</h2>
      <p>
        Visa Readiness provides an informational review of the material <em>you</em> provide. It is
        not legal advice, not immigration advice, and not a substitute for a licensed immigration
        lawyer or authorized representative. Complex situations — previous removals, criminal
        records, refugee or protection matters, inadmissibility questions — need professional
        advice, not a readiness score.
      </p>

      <h2>No prediction of outcomes</h2>
      <p>
        The Visa Readiness Score measures how complete, consistent and well-supported your
        application material appears. It is <strong>not</strong> a probability of approval.
        Visa officers weigh factors no tool can see, and they alone decide. A strong score can be
        refused; a weak score can be approved.
      </p>

      <h2>No government affiliation</h2>
      <p>
        The service is independent. It is not connected to, endorsed by, or acting for any
        government, embassy, consulate, or visa-processing body, and it never submits or transmits
        anything to them.
      </p>

      <h2>Requirements change</h2>
      <p>
        Immigration rules, fees and financial thresholds change, sometimes with little notice.
        Every requirement in this tool links to its official source together with the date we last
        verified it — always confirm against the official page before you submit.
      </p>

      <h2>Honesty</h2>
      <p>
        The tool will never advise you to misstate facts, manufacture evidence, borrow funds to
        inflate balances, or conceal previous refusals — and no output of this tool should ever be
        read as such advice. Misrepresentation in a visa application can carry long bans. Our whole
        premise is the opposite: present your genuine circumstances as clearly and completely as
        possible.
      </p>
    </LegalPage>
  );
}
