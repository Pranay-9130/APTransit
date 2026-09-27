import { Card } from "@aptransit/ui";
import { FileCheck, MapPin, Route, ScrollText, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "../../components/page-header";

export default async function AdminOverviewPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Administration"
        description="Network configuration, route and timetable management, user permissions, and audit log inspection."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-control bg-primary/10 text-primary">
              <Route className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-body font-bold text-text">{t("nav.routes")}</h2>
              <p className="text-caption text-muted">Network paths and ordered stops</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-control bg-primary/10 text-primary">
              <MapPin className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-body font-bold text-text">{t("nav.stops")}</h2>
              <p className="text-caption text-muted">Bus stands and pickup points</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-control bg-primary/10 text-primary">
              <Users className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-body font-bold text-text">{t("nav.users")}</h2>
              <p className="text-caption text-muted">Staff roles and permissions</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-control bg-primary/10 text-primary">
              <FileCheck className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-body font-bold text-text">{t("nav.policies")}</h2>
              <p className="text-caption text-muted">Fare rules and refund tiers</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-control bg-primary/10 text-primary">
              <ScrollText className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-body font-bold text-text">{t("nav.audit")}</h2>
              <p className="text-caption text-muted">Security and mutation log</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
