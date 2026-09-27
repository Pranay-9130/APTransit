import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, User } from "lucide-react";
import { LanguageSwitch } from "../../components/language-switch";
import { ThemeSwitch } from "../../components/theme-switch";
import { CitizenNav } from "./citizen-nav";

export const metadata: Metadata = {
  title: {
    default: "AP TransitOS",
    template: "%s · AP TransitOS",
  },
};

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-control shadow-elevation-2"
      >
        {t("nav.skipToContent")}
      </a>

      {/* Top bar */}
      <header
        role="banner"
        className="sticky top-0 z-sticky bg-surface/90 backdrop-blur-md border-b border-subtle"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-h3 font-black tracking-tight text-primary hover:opacity-90 transition-opacity"
            >
              AP TransitOS
            </Link>

            {/* Desktop navigation */}
            <nav
              aria-label="Desktop navigation"
              className="hidden md:flex items-center gap-1"
            >
              <Link
                href="/"
                className="px-3 py-1.5 rounded-control text-body-sm font-medium text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/tickets"
                className="px-3 py-1.5 rounded-control text-body-sm font-medium text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                {t("nav.tickets")}
              </Link>
              <Link
                href="/track"
                className="px-3 py-1.5 rounded-control text-body-sm font-medium text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                {t("nav.track")}
              </Link>
              <Link
                href="/passes"
                className="px-3 py-1.5 rounded-control text-body-sm font-medium text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                {t("nav.passes")}
              </Link>
              <Link
                href="/timetable"
                className="px-3 py-1.5 rounded-control text-body-sm font-medium text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                {t("nav.timetable")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <ThemeSwitch />
            <Link
              href="/updates"
              aria-label={t("common.notifications")}
              className="p-2 rounded-control text-muted hover:text-text hover:bg-surface-raised transition-colors relative"
            >
              <Bell className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/account"
              aria-label={t("nav.account")}
              className="p-2 rounded-control text-muted hover:text-text hover:bg-surface-raised transition-colors"
            >
              <User className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8 focus:outline-none"
      >
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <CitizenNav />
    </div>
  );
}
