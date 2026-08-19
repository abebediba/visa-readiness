import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { CloudSync } from "@/components/cloud-sync";
import { BackdropAmbience } from "@/components/backdrop";
import "./globals.css";

const cloudEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const metadata: Metadata = {
  title: "Visa Readiness — know how strong your application is before you submit it",
  description:
    "Free tool that checks how complete, consistent and well-supported your visa application looks before you submit it. Not legal advice; no approval predictions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen antialiased">
        <BackdropAmbience />
        <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
          <div className="shell mx-auto flex h-16 w-full max-w-2xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand text-[13px] font-semibold text-on-brand">
                V
              </span>
              <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
                Visa Readiness
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/application"
                aria-label="My application"
                className="hidden whitespace-nowrap rounded-full px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-text sm:block"
              >
                My application
              </Link>
              <Link
                href="/application"
                aria-label="My application"
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text sm:hidden"
              >
                <FolderOpen className="h-[18px] w-[18px]" aria-hidden />
              </Link>
              {cloudEnabled && (
                <Link
                  href="/account"
                  className="hidden whitespace-nowrap rounded-full px-3 py-2 text-muted transition-colors hover:bg-surface-2 hover:text-text sm:block"
                >
                  Account
                </Link>
              )}
              <Link
                href="/start"
                className="ml-1 rounded-full bg-brand px-4 py-2 font-medium text-on-brand transition-colors hover:bg-brand-deep"
              >
                Start
              </Link>
            </nav>
          </div>
        </header>

        <CloudSync />

        <main className="shell mx-auto w-full max-w-2xl px-4 pb-28 pt-8 sm:px-6">{children}</main>

        <footer className="no-print border-t border-border bg-surface-1">
          <div className="shell mx-auto w-full max-w-2xl space-y-4 px-4 py-10 text-xs leading-relaxed text-muted sm:px-6">
            <p className="max-w-2xl">
              Visa Readiness is a free, informational self-assessment. It is not legal or immigration
              advice, it is not affiliated with any government, and it does not predict or guarantee
              any visa decision. Decisions are made solely by the relevant authorities.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/legal/privacy" className="transition-colors hover:text-text">Privacy policy</Link>
              <Link href="/legal/terms" className="transition-colors hover:text-text">Terms of service</Link>
              <Link href="/legal/disclaimer" className="transition-colors hover:text-text">Disclaimer</Link>
              <Link href="/legal/data-rights" className="transition-colors hover:text-text">Your data rights</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
