import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy Policy — Visa Readiness" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="19 August 2026">
      <p>
        Visa Readiness helps you assess how complete and consistent your visa application looks
        before you submit it. Because visa applications involve some of the most sensitive personal
        information a person has, this policy is written to be read, not skimmed. The short version:
        we collect as little as possible, you stay in control of everything you enter, and your
        information is never sold, never used for advertising, and never used to train AI models
        without your separate, explicit consent.
      </p>

      <h2>1. Who is responsible for your data</h2>
      <p>
        The service is operated by the Visa Readiness project ("we"). Contact for all privacy
        matters, including exercising your rights: <strong>privacy@[operator-domain]</strong>.
        Before public launch this placeholder must be replaced with the registered operating
        entity, its address, and — where required — its data protection officer.
      </p>

      <h2>2. What this preview version stores — and where</h2>
      <p>
        The version you are using is a <strong>local preview</strong>. Your questionnaire answers
        and the document details you type in are stored only in your own browser's storage on your
        own device. They are not transmitted to our servers. Document files you select are read for
        their name and size only; their contents are not uploaded anywhere — with one exception you
        control, described next. Clearing the application from the settings screen, or clearing
        your browser data, permanently removes everything.
      </p>

      <h2>2a. Optional AI features — only when you tap the button</h2>
      <p>
        Where the operator has configured them, two optional AI features exist, and both are
        strictly opt-in per use:
      </p>
      <ul>
        <li>
          <strong>"Read details with AI"</strong> on a document sends that one file to our server
          and on to our AI provider, solely to read the fields for you. The result comes straight
          back to your screen for review; the file is not stored by us, and every extracted value
          must be confirmed by you before it counts.
        </li>
        <li>
          <strong>Interview answer feedback</strong> sends your practice answer and your case
          details to the AI provider, solely to generate the feedback shown to you. It is not
          stored.
        </li>
        <li>
          <strong>"Ask about my application"</strong> free-form questions send your question and
          case details to the AI provider, solely to generate the cited answer shown to you. The
          page's instant answers are computed on your device and send nothing.
        </li>
      </ul>
      <p>
        If you never tap those buttons — or the operator has not configured them — nothing you
        enter leaves your device. AI provider processing runs under a data processing agreement
        that forbids training on your data.
      </p>

      <h2>3. What the full service will collect, and why</h2>
      <p>When account-based features launch, we will process, with your knowledge, only what the assessment needs:</p>
      <ul>
        <li><strong>Account data</strong> — email address and sign-in credentials, to operate your account (legal basis: contract).</li>
        <li><strong>Application data</strong> — questionnaire answers and uploaded documents (which may include your passport, bank statements, employment and school records), to run the readiness assessment you request (legal basis: contract; for special-category or highly sensitive data, your explicit consent).</li>
        <li><strong>Extracted data</strong> — structured fields read from your documents, always shown to you for correction before use.</li>
        <li><strong>Outcome data</strong> — only if you volunteer it after your real decision, to improve guidance; anonymized before any analysis (legal basis: consent).</li>
        <li><strong>Technical data</strong> — security logs (sign-ins, access to your files) kept to protect your account (legal basis: legitimate interest in security).</li>
      </ul>
      <p>
        We practice data minimization: we do not ask for information the assessment does not use,
        we mask identifiers such as account and passport numbers wherever possible, and sensitive
        values are not written to application logs.
      </p>

      <h2>4. What we never do with your data</h2>
      <ul>
        <li>We never sell your personal data, and never share it for advertising.</li>
        <li>We never send your data to any government, embassy or visa authority. Only you submit your application.</li>
        <li>We never use your documents or answers to train AI models without your separate, explicit, revocable consent — using the service is not consent.</li>
        <li>We never make your documents publicly accessible, and never expose direct storage links.</li>
      </ul>

      <h2>5. AI processing</h2>
      <p>
        The full service uses AI models to read documents you upload and to phrase explanations.
        Where an external AI provider processes data on our behalf, it does so under a data
        processing agreement that forbids using your data to train its models. Extracted values are
        always shown to you for review; the readiness score itself is computed by deterministic
        rules, not by an AI's opinion.
      </p>

      <h2>6. How long we keep data</h2>
      <p>
        Only as long as it serves you. You can delete any document, any application, or your whole
        account at any time, and deletion is real deletion — files, database records and derived
        data, with backup copies expiring on a fixed schedule. Applications left inactive are
        deleted after a retention period communicated in-product; visa documents are not kept
        indefinitely merely because an account exists.
      </p>

      <h2>7. Security</h2>
      <p>
        Data is encrypted in transit and at rest. Documents live in private storage reachable only
        through short-lived, signed links tied to your session. Access is protected by
        authentication (with multi-factor authentication available), role-based access controls,
        rate limiting and audit logging. No staff member browses your documents; any access for
        support requires your request and is logged.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Wherever you are, we give you the same rights — aligned with the EU/UK GDPR, Nigeria's NDPA,
        Ghana's Data Protection Act (2012), Kenya's Data Protection Act (2019) and South Africa's
        POPIA:
      </p>
      <ul>
        <li>Access and export a copy of everything we hold about you.</li>
        <li>Correct anything inaccurate.</li>
        <li>Delete individual documents, an application, or everything ("right to erasure").</li>
        <li>Withdraw any consent as easily as you gave it.</li>
        <li>Object to or restrict processing, and complain to your data protection authority.</li>
      </ul>
      <p>
        Exercise any of these from the in-product controls (see <a href="/legal/data-rights" className="underline">Your data rights</a>)
        or by writing to the contact in section 1. We respond within 30 days.
      </p>

      <h2>9. Children</h2>
      <p>
        The service is not directed at children. Applications for minors (for example a child's
        visitor visa) must be managed by a parent or legal guardian using their own account.
      </p>

      <h2>10. Changes</h2>
      <p>
        If this policy changes in any way that affects your rights or what we collect, we will tell
        you in the product before the change takes effect, with the previous version available on
        request.
      </p>
    </LegalPage>
  );
}
