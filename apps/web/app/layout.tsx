import type { Metadata } from "next";
import { Inter, Noto_Sans_Telugu } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import "./globals.css";

// Fonts are self hosted by Next at build time (no runtime Google calls). docs/09, Typography.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  display: "swap",
  variable: "--font-telugu",
});

export const metadata: Metadata = {
  title: { default: "AP TransitOS", template: "%s · AP TransitOS" },
  description: "One connected public transport platform for Andhra Pradesh.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const dataTheme = theme === "dark" || theme === "light" ? theme : undefined;

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-locale={locale}
      data-theme={dataTheme}
      className={`${inter.variable} ${notoSansTelugu.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
