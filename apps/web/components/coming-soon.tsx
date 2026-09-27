import { EmptyState } from "@aptransit/ui";
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "./page-header";

/** Honest placeholder for a shell landing page whose real screen ships on a later day. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("shell");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <EmptyState icon={Construction} title={t("comingSoonTitle")} hint={t("comingSoonHint")} />
    </div>
  );
}
