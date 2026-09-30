import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RequireAuth } from "../../../components/require-auth";
import { AccountView } from "./account-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav.account") };
}

/** docs/11 Citizen "/account": name, email, masked phone, language, theme, role switcher, Log out. */
export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountView />
    </RequireAuth>
  );
}
