import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertOctagon,
  Building2,
  Bus,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { LanguageSwitch } from "../../components/language-switch";
import { ManagementSidebar } from "../../components/management-sidebar";
import { ThemeSwitch } from "../../components/theme-switch";

export const metadata: Metadata = {
  title: {
    default: "Depot Operations · AP TransitOS",
    template: "%s · Depot Operations · AP TransitOS",
  },
};

export default async function OpsLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  const navItems = [
    { href: "/ops", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ops/buses", label: t("nav.buses"), icon: Bus },
    { href: "/ops/trips", label: t("nav.trips"), icon: Calendar },
    { href: "/ops/incidents", label: t("nav.incidents"), icon: AlertOctagon },
    { href: "/ops/staff", label: t("nav.staff"), icon: Users },
    { href: "/ops/complaints", label: t("nav.complaints"), icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex bg-surface text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-control"
      >
        {t("nav.skipToContent")}
      </a>

      {/* Sidebar */}
      <ManagementSidebar
        title="Depot Ops"
        baseHref="/ops"
        items={navItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with scope switcher */}
        <header
          role="banner"
          className="h-16 px-4 sm:px-6 bg-surface-raised border-b border-subtle flex items-center justify-between gap-4"
        >
          {/* Scope switcher placeholder */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-surface border border-subtle text-body-sm font-medium">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              <span>Depot: <strong>Kurnool 1</strong></span>
              <ChevronDown className="size-4 text-muted ml-1" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <ThemeSwitch />

            <div className="flex items-center gap-2 pl-2 border-l border-subtle">
              <div className="flex items-center gap-2 text-body-sm font-semibold">
                <User className="size-5 text-muted" aria-hidden="true" />
                <span className="hidden sm:inline">Depot Staff</span>
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
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
