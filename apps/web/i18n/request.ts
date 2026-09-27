import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import sharedEn from "../../../packages/shared/src/messages/en.json";
import sharedTe from "../../../packages/shared/src/messages/te.json";
import webEn from "../messages/en.json";
import webTe from "../messages/te.json";

type Locale = "en" | "te";

function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "te";
}

/**
 * Best supported language from Accept-Language by q weight, e.g. "en-IN,en;q=0.9,te;q=0.8" is en.
 * A bare substring check would pick te for any header that merely mentions it.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { lang: tag.toLowerCase().split("-")[0], weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  const match = ranked.find((entry) => isLocale(entry.lang));
  return match && isLocale(match.lang) ? match.lang : "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const locale = isLocale(localeCookie)
    ? localeCookie
    : localeFromAcceptLanguage((await headers()).get("accept-language"));

  const webMessages = locale === "te" ? webTe : webEn;
  const sharedMessages = locale === "te" ? sharedTe : sharedEn;

  return {
    locale,
    // Namespaces never overlap (web: UI, shared: notifications and email). check-i18n guards it.
    messages: { ...webMessages, ...sharedMessages },
  };
});
