import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Terms of Service — Visa Readiness" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="19 August 2026">
      <p>
        These terms govern your use of Visa Readiness. By using the service you agree to them. They
        are deliberately short and written in plain language; nothing in them takes away rights
        your local consumer or data protection law gives you.
      </p>

      <h2>1. What the service is</h2>
      <p>
        Visa Readiness is a free, informational self-assessment tool. It checks how complete,
        consistent and well-supported your visa application appears, based on the information you
        provide and published official requirements, and gives you a readiness score,
        detected issues, and suggestions.
      </p>

      <h2>2. What the service is not</h2>
      <ul>
        <li>It is <strong>not legal or immigration advice</strong>, and using it does not create any advisor–client relationship. For advice on your specific case, consult a licensed immigration lawyer or authorized representative in the relevant jurisdiction.</li>
        <li>It is <strong>not affiliated with any government</strong>, embassy, consulate or visa authority, and it does not submit anything on your behalf.</li>
        <li>It does <strong>not predict or guarantee any decision</strong>. A high readiness score does not mean approval; a low one does not mean refusal. Decisions rest solely with the deciding authority.</li>
        <li>Official requirements change. We link requirements to their official sources with verification dates, but you must confirm current requirements on the official site before submitting.</li>
      </ul>

      <h2>3. Your responsibilities</h2>
      <ul>
        <li>Provide truthful, accurate information. The tool exists to help you present your <em>real</em> circumstances well.</li>
        <li>Only upload documents you are entitled to use. If you manage an application for someone else (for example your child), you confirm you are authorized to do so.</li>
        <li>Do not use the service to prepare fraudulent applications. We refuse to help fabricate documents, disguise funds, conceal refusals, or rehearse untrue answers — and requests for such help may lead to loss of access.</li>
        <li>Keep your account credentials secure.</li>
      </ul>

      <h2>4. Fees</h2>
      <p>
        The service is currently free. If paid features are ever introduced, they will be clearly
        marked and priced before you use them; nothing you have already stored will be held behind
        a paywall.
      </p>

      <h2>5. Intellectual property and your content</h2>
      <p>
        Your documents and answers remain yours. You grant us only the limited license needed to
        process them for the assessment you request. The service's software, scoring methodology
        and content remain ours or our licensors'.
      </p>

      <h2>6. Liability</h2>
      <p>
        We provide the service with care but "as is". To the fullest extent permitted by law, we
        are not liable for visa outcomes, missed deadlines, costs of applications, or decisions you
        make based on the assessment. Nothing limits liability that cannot lawfully be limited,
        including for fraud or gross negligence.
      </p>

      <h2>7. Ending use</h2>
      <p>
        You can stop using the service and delete your data at any time (see the privacy policy and
        data-rights page). We may suspend accounts used for fraud, abuse, or attacks on the service.
      </p>

      <h2>8. Changes and contact</h2>
      <p>
        We will announce material changes to these terms in the product before they take effect.
        Questions: <strong>legal@visareadiness.com</strong>. The registered operating entity
        behind visareadiness.com must be named here before public launch.
      </p>
    </LegalPage>
  );
}
