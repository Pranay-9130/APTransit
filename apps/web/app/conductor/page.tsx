import { Button, Card, StatusBadge } from "@aptransit/ui";
import { QrCode } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ConductorPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Mobile trip counts */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        <Card className="p-3 text-center">
          <p className="text-caption text-muted">Passengers</p>
          <p className="text-h2 font-bold text-text">48</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-caption text-status-running">Checked</p>
          <p className="text-h2 font-bold text-status-running">32</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-caption text-status-warning">Pending</p>
          <p className="text-h2 font-bold text-status-warning">16</p>
        </Card>
      </div>

      <Card className="p-6 bg-surface-raised border-subtle flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text">Trip 101</h1>
            <p className="text-body text-muted mt-1">Vijayawada to Guntur · Super Luxury</p>
          </div>
          <StatusBadge status="RUNNING" label={t("status.RUNNING")} size="md" />
        </div>

        {/* Big scan action */}
        <div className="pt-2">
          <Button size="xl" variant="primary" className="w-full font-bold text-h3 h-20">
            <QrCode className="size-8 mr-3" aria-hidden="true" />
            {t("conductor.scan")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
