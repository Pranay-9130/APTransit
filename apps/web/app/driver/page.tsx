import { Button, Card, StatusBadge } from "@aptransit/ui";
import { AlertTriangle, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function DriverPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6 py-4">
      <Card className="p-6 bg-surface-raised border-subtle flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display font-bold text-text">AP 39 Z 1234</h1>
            <p className="text-body-lg text-muted mt-1">Route 101: Vijayawada to Guntur</p>
          </div>
          <StatusBadge status="UPCOMING" label={t("status.UPCOMING")} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-card bg-surface border border-subtle">
          <div>
            <p className="text-caption text-muted">{t("common.departure")}</p>
            <p className="text-h3 font-bold text-text">06:30 AM</p>
          </div>
          <div>
            <p className="text-caption text-muted">{t("common.nextStop")}</p>
            <p className="text-h3 font-bold text-text">Mangalagiri Bypass</p>
          </div>
        </div>

        {/* Large action buttons (xl size 56px per docs/09) */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button size="xl" variant="primary" className="flex-1 font-bold text-body-lg">
            <Play className="size-6 mr-2" aria-hidden="true" />
            {t("driver.startTrip")}
          </Button>

          <Button size="xl" variant="secondary" className="flex-1 font-bold text-body-lg">
            <AlertTriangle className="size-6 mr-2" aria-hidden="true" />
            {t("driver.reportIssue")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
