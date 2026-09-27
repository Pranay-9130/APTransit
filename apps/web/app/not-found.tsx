import { Button, EmptyState } from "@aptransit/ui";
import { FileQuestion, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <EmptyState
        icon={FileQuestion}
        title={t("notFound.title")}
        hint={t("notFound.description")}
        action={
          <Link href="/">
            <Button variant="primary" size="md">
              <Home className="size-4 mr-2" aria-hidden="true" />
              {t("common.goHome")}
            </Button>
          </Link>
        }
      />
    </div>
  );
}
