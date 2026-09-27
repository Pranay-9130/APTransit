import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "../../components/coming-soon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("shell.conductor") };
}

export default async function ConductorHomePage() {
  const t = await getTranslations();
  return <ComingSoon title={t("shell.conductor")} />;
}
