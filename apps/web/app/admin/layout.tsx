import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Clock,
  FileCheck,
  LogOut,
  MapPin,
  Route,
  ScrollText,
  Shield,
  User,
  Users,
} from "lucide-react";
import { LanguageSwitch } from "../../components/language-switch";
import { ManagementSidebar } from "../../components/management-sidebar";
import { ThemeSwitch } from "../../components/theme-switch";

export const metadata: Metadata = {
  title: {
    default: "System Admin · AP TransitOS",
    template: "%s · System Admin · AP TransitOS",
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  const navItems = [
    { href: "/admin", label: "Overview", icon: Shield },
    { href: "/admin/routes", label: t("nav.routes"), icon: Route },
    { href: "/admin/stops", label: t("nav.stops"), icon: MapPin },
    { href: "/admin/timetables", label: t("nav.timetables"), icon: Clock },
    { href: "/admin/users", label: t("nav.users"), icon: Users },
    { href: "/admin/policies", label: t("nav.policies"), icon: FileCheck },
    { href: "/admin/audit", label: t("nav.audit"), icon: ScrollText },
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
        title="Admin"
        baseHref="/admin"
        items={navItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          role="banner"
          className="h-16 px-4 sm:px-6 bg-surface-raised border-b border-subtle flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-control bg-status-danger/10 text-status-danger text-caption font-bold">
              SUPER ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <ThemeSwitch />

            <div className="flex items-center gap-2 pl-2 border-l border-subtle">
              <div className="flex items-center gap-2 text-body-sm font-semibold">
                <User className="size-5 text-muted" aria-hidden="true" />
                <span className="hidden sm:inline">Administrator</span>
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
