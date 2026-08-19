import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visa Readiness — know how strong your application is before you submit it",
  description:
    "Free tool that checks how complete, consistent and well-supported your visa application looks before you submit it. Not legal advice; no approval predictions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="no-print sticky top-0 z-20 border-b border-border bg-surface-1/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight text-brand">
              Visa Readiness
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted">
              <Link href="/application" className="hover:text-text">
                My application
              </Link>
              <Link href="/start" className="rounded-full bg-brand px-3 py-1.5 text-on-brand">
                Start
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">{children}</main>
        <footer className="no-print border-t border-border bg-surface-1">
          <div className="mx-auto max-w-2xl space-y-3 px-4 py-8 text-xs text-muted">
            <p>
              Visa Readiness is a free, informational self-assessment. It is not legal or immigration
              advice, it is not affiliated with any government, and it does not predict or guarantee any
              visa decision. Decisions are made solely by the relevant authorities.
            </p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/legal/privacy" className="underline hover:text-text">Privacy policy</Link>
              <Link href="/legal/terms" className="underline hover:text-text">Terms of service</Link>
              <Link href="/legal/disclaimer" className="underline hover:text-text">Disclaimer</Link>
              <Link href="/legal/data-rights" className="underline hover:text-text">Your data rights</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
