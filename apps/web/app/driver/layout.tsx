import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, Radio, User } from "lucide-react";
import { LanguageSwitch } from "../../components/language-switch";
import { ThemeSwitch } from "../../components/theme-switch";

export const metadata: Metadata = {
  title: {
    default: "Driver · AP TransitOS",
    template: "%s · Driver · AP TransitOS",
  },
};

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-control"
      >
        {t("nav.skipToContent")}
      </a>

      {/* Slim top bar */}
      <header
        role="banner"
        className="h-16 px-4 sm:px-6 bg-surface-raised border-b border-subtle flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/driver"
            className="text-h3 font-black text-primary tracking-tight"
          >
            AP TransitOS
          </Link>
          <span className="px-2 py-0.5 rounded-sm bg-status-running/10 text-status-running text-caption font-semibold flex items-center gap-1.5">
            <Radio className="size-3.5 animate-pulse" aria-hidden="true" />
            <span>Driver PWA</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <ThemeSwitch />

          <div className="flex items-center gap-2 pl-2 border-l border-subtle">
            <div className="flex items-center gap-2 text-body-sm font-semibold">
              <User className="size-5 text-muted" aria-hidden="true" />
              <span>Driver</span>
            </div>
            <Link
              href="/"
              aria-label={t("nav.logout")}
              className="p-2 rounded-control text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors ml-2"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Full screen main */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
