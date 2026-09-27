"use client";

import { Button, ErrorState } from "@aptransit/ui";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Log the error to error reporting service if present
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <ErrorState
        title={t("error.title")}
        message={t("error.description")}
        retryLabel={t("common.retry")}
        onRetry={reset}
        requestId={error.digest}
      />
      <div className="mt-4">
        <Link href="/">
          <Button variant="ghost" size="md">
            <Home className="size-4 mr-2" aria-hidden="true" />
            {t("common.goHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
