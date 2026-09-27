import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "../../components/coming-soon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav.commandCenter") };
}

export default async function GovCommandCenterPage() {
  const t = await getTranslations();
  return <ComingSoon title={t("nav.commandCenter")} />;
}
