"use client";

import { useState } from "react";
import Link from "next/link";
import { CloudDownload, CloudUpload, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { cloudConfigured, supabaseClient } from "@/lib/supabase";
import { deleteCloudCopies, pullApplication, pushApplication } from "@/lib/cloud";
import { useCloudSession } from "@/components/cloud-sync";
import { useApp } from "@/lib/store";
import { getRoute } from "@/lib/routes/definitions";
import { useHydrated } from "@/components/ui";

export default function AccountPage() {
  const hydrated = useHydrated();
  const { session, ready } = useCloudSession();

  if (!hydrated || !ready) return null;

  if (!cloudConfigured()) {
    return (
      <div className="card space-y-3 p-6">
        <h1 className="text-xl font-semibold">Accounts are not enabled here</h1>
        <p className="text-muted">
          This deployment runs fully on your device — your application never leaves your browser.
          Accounts and cross-device sync become available when the operator configures a database
          (see <code>db/schema.sql</code> and <code>.env.example</code> in the repository).
        </p>
        <Link href="/application" className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand">
          Back to my application
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My account</h1>
        <p className="text-muted">
          Signing in saves your application to your own private, encrypted row — only your account
          can read it — so you can continue on another device. It is entirely optional.
        </p>
      </header>
      {session ? <SignedIn email={session.user.email ?? ""} /> : <SignInForm />}
      <p className="flex items-start gap-2 text-xs text-faint">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Your data is protected by row-level security: every read and write is scoped to your user id
        at the database layer. Document files are never uploaded — only your answers, the document
        details you confirmed, and your assessment results. Deleting your cloud copy below removes
        it permanently. <Link href="/legal/privacy" className="underline">Privacy policy</Link>
      </p>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    const supabase = supabaseClient();
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (err) setError(err.message);
    else setStage("code");
  };

  const verify = async () => {
    const supabase = supabaseClient();
    if (!supabase || !code.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <div className="card space-y-3 p-5">
      {stage === "email" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode();
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2.5 text-[15px] outline-none focus:border-brand"
            />
            <p className="text-xs text-faint">We send a one-time sign-in code — there is no password to remember or leak.</p>
          </div>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand disabled:opacity-40"
          >
            {busy ? "Sending…" : "Send sign-in code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Enter the code sent to {email}</label>
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-surface-1 px-3 py-2.5 text-[15px] tracking-widest outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand disabled:opacity-40"
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button type="button" onClick={() => setStage("email")} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
              Different email
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-sm text-neg">{error}</p>}
    </div>
  );
}

function SignedIn({ email }: { email: string }) {
  const application = useApp((s) => s.application);
  const loadApplication = useApp((s) => s.loadApplication);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const act = async (label: string, fn: () => Promise<string>) => {
    setBusy(true);
    setStatus(`${label}…`);
    try {
      setStatus(await fn());
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          Signed in as <strong>{email}</strong> — changes now sync automatically.
        </p>
        <button
          onClick={() => void supabaseClient()?.auth.signOut()}
          className="flex shrink-0 items-center gap-1 text-sm text-muted hover:text-text"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy || !application}
          onClick={() =>
            void act("Saving", async () => {
              await pushApplication(application!);
              return "Saved to your account.";
            })
          }
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          <CloudUpload className="h-4 w-4" aria-hidden /> Save now
        </button>
        <button
          disabled={busy}
          onClick={() =>
            void act("Loading", async () => {
              const copy = await pullApplication();
              if (!copy) return "No saved application found in your account.";
              loadApplication(copy.application);
              const route = getRoute(copy.application.routeId);
              return `Loaded your ${route?.shortName ?? "application"} (saved ${new Date(copy.updatedAt).toLocaleString()}).`;
            })
          }
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          <CloudDownload className="h-4 w-4" aria-hidden /> Load from my account
        </button>
        <button
          disabled={busy}
          onClick={() =>
            void act("Deleting", async () => {
              await deleteCloudCopies();
              return "Your cloud copy has been permanently deleted. The copy on this device is untouched.";
            })
          }
          className="flex items-center gap-1.5 rounded-full border border-neg px-4 py-2 text-sm font-medium text-neg disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" aria-hidden /> Delete my cloud copy
        </button>
      </div>

      {status && <p className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-sm text-muted">{status}</p>}
    </div>
  );
}
