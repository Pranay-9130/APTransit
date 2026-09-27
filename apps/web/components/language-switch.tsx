"use client";

import { cn } from "@aptransit/ui";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { writePreferenceCookie } from "../lib/preferences";

// Each language is written in its own script, so it is never translated (docs/09, LanguageSwitch).
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
] as const;

export function LanguageSwitch() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: (typeof LANGUAGES)[number]["code"]) => {
    if (next === locale) return;
    writePreferenceCookie("locale", next);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      aria-busy={isPending || undefined}
      className="inline-flex items-center rounded-md border border-default bg-surface-raised p-0.5"
    >
      {LANGUAGES.map((language) => {
        const active = locale === language.code;
        return (
          <button
            key={language.code}
            type="button"
            lang={language.code}
            aria-pressed={active}
            onClick={() => switchLocale(language.code)}
            disabled={isPending}
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center rounded-sm px-2 text-small font-medium transition-colors duration-fast sm:px-3",
              active ? "bg-primary-soft text-primary" : "text-muted hover:text-fg",
            )}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
