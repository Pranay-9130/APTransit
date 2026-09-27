import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Clock, FileCheck, MapPin, Route, ScrollText, Shield, Users } from "lucide-react";
import { ManagementShell } from "../../components/management-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const app = t("common.appName");
  return { title: { absolute: `${t("shell.admin")} · ${app}`, template: `%s · ${app}` } };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  const navItems = [
    { href: "/admin", label: t("nav.overview"), icon: <Shield /> },
    { href: "/admin/routes", label: t("nav.routes"), icon: <Route /> },
    { href: "/admin/stops", label: t("nav.stops"), icon: <MapPin /> },
    { href: "/admin/timetables", label: t("nav.timetables"), icon: <Clock /> },
    { href: "/admin/users", label: t("nav.users"), icon: <Users /> },
    { href: "/admin/policies", label: t("nav.policies"), icon: <FileCheck /> },
    { href: "/admin/audit", label: t("nav.audit"), icon: <ScrollText /> },
  ];

  return (
    <ManagementShell title={t("shell.admin")} baseHref="/admin" items={navItems}>
      {children}
    </ManagementShell>
  );
}
