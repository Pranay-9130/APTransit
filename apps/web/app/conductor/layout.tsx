import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { FieldShell } from "../../components/field-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const app = t("common.appName");
  return { title: { absolute: `${t("shell.conductor")} · ${app}`, template: `%s · ${app}` } };
}

export default async function ConductorLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  // Trip counts area: filled from the assigned trip once the conductor screens ship.
  const counts = (
    <dl aria-label={t("shell.tripCounts")} className="hidden items-center gap-4 text-small md:flex">
      {(["BOOKED", "SCANNED"] as const).map((status) => (
        <div key={status} className="flex items-center gap-1">
          <dt className="text-muted">{t(`ticketStatus.${status}`)}</dt>
          <dd className="font-semibold tabular-nums">0</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <FieldShell title={t("shell.conductor")} homeHref="/conductor" status={counts}>
      {children}
    </FieldShell>
  );
}
