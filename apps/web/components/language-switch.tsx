"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: "en" | "te") => {
    if (newLocale === locale) return;
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center rounded-control bg-surface-raised p-1 border border-subtle"
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`px-3 py-1 rounded-sm text-caption font-medium transition-colors ${
          locale === "en"
            ? "bg-surface text-text shadow-sm"
            : "text-muted hover:text-text"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => switchLocale("te")}
        disabled={isPending}
        className={`px-3 py-1 rounded-sm text-caption font-medium transition-colors font-telugu ${
          locale === "te"
            ? "bg-surface text-text shadow-sm"
            : "text-muted hover:text-text"
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
}
