import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, QrCode, User } from "lucide-react";
import { LanguageSwitch } from "../../components/language-switch";
import { ThemeSwitch } from "../../components/theme-switch";

export const metadata: Metadata = {
  title: {
    default: "Conductor · AP TransitOS",
    template: "%s · Conductor · AP TransitOS",
  },
};

export default async function ConductorLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-control"
      >
        {t("nav.skipToContent")}
      </a>

      {/* Top bar with trip counts placeholder */}
      <header
        role="banner"
        className="h-16 px-4 sm:px-6 bg-surface-raised border-b border-subtle flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/conductor"
            className="text-h3 font-black text-primary tracking-tight"
          >
            AP TransitOS
          </Link>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-caption font-semibold items-center gap-1.5">
            <QrCode className="size-3.5" aria-hidden="true" />
            <span>Conductor PWA</span>
          </span>

          {/* Trip counts placeholder */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-subtle text-caption font-medium">
            <span className="text-muted">
              Passengers: <strong className="text-text font-bold">48</strong>
            </span>
            <span className="text-muted">
              Checked: <strong className="text-status-running font-bold">32</strong>
            </span>
            <span className="text-muted">
              Pending: <strong className="text-status-warning font-bold">16</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <ThemeSwitch />

          <div className="flex items-center gap-2 pl-2 border-l border-subtle">
            <div className="flex items-center gap-2 text-body-sm font-semibold">
              <User className="size-5 text-muted" aria-hidden="true" />
              <span>Conductor</span>
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

      {/* Main content */}
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
