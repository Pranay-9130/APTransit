"use client";

import { MeDto } from "@aptransit/shared";
import { cn, toast } from "@aptransit/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { api } from "../lib/api";
import { writePreferenceCookie } from "../lib/preferences";
import { queryKeys } from "../lib/query-keys";
import { useAuth } from "./auth-provider";

// Each language is written in its own script, so it is never translated (docs/09, LanguageSwitch).
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
] as const;

export function LanguageSwitch() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const switchLocale = (next: (typeof LANGUAGES)[number]["code"]) => {
    if (next === locale) return;
    writePreferenceCookie("locale", next);
    // Logged in: also save it on the account, so emails and other devices use it (docs/11 /account).
    if (status === "authenticated") {
      api("/me", { method: "PATCH", body: { preferredLocale: next }, schema: MeDto })
        .then((me) => queryClient.setQueryData(queryKeys.me, me))
        .catch(() => toast.error(t("account.language.saveFailed")));
    }
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label={t("common.language")}
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
