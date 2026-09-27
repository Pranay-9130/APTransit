import { Card } from "@aptransit/ui";
import { getTranslations } from "next-intl/server";

// Placeholder until the Day 4 home screen (docs/11, Citizen "/").
export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <Card className="flex flex-col gap-3 p-6 sm:p-8">
      <h1 className="text-h1 text-fg">{t("question")}</h1>
      <p className="max-w-xl text-body text-muted">{t("placeholderDescription")}</p>
      <p className="text-small font-medium text-fg">{t("placeholderTitle")}</p>
    </Card>
  );
}
