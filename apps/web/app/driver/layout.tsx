import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { FieldShell } from "../../components/field-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const app = t("common.appName");
  return { title: { absolute: `${t("shell.driver")} · ${app}`, template: `%s · ${app}` } };
}

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  return (
    <FieldShell title={t("shell.driver")} homeHref="/driver">
      {children}
    </FieldShell>
  );
}
