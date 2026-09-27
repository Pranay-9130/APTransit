import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import sharedEn from "../../../packages/shared/src/messages/en.json";
import sharedTe from "../../../packages/shared/src/messages/te.json";
import webEn from "../messages/en.json";
import webTe from "../messages/te.json";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;

  let locale = "en";
  if (localeCookie === "en" || localeCookie === "te") {
    locale = localeCookie;
  } else {
    const headerList = await headers();
    const acceptLanguage = headerList.get("accept-language") || "";
    if (acceptLanguage.toLowerCase().includes("te")) {
      locale = "te";
    }
  }

  const webMessages = locale === "te" ? webTe : webEn;
  const sharedMessages = locale === "te" ? sharedTe : sharedEn;

  const messages = {
    ...webMessages,
    ...sharedMessages,
  };

  return {
    locale,
    messages,
  };
});
