import { Card } from "@aptransit/ui";
import { Activity, AlertTriangle, Bus, Clock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "../../components/page-header";

export default async function GovCommandPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.commandCenter")}
        description="Statewide operational KPIs, live fleet movements, and incident tracking across Andhra Pradesh."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Active Buses</span>
            <Bus className="size-5 text-primary" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-text">1,248</p>
          <p className="text-caption text-status-running">26 districts active</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Active Trips</span>
            <Activity className="size-5 text-status-running" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-text">864</p>
          <p className="text-caption text-muted">98% on-time</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Passengers Today</span>
            <Users className="size-5 text-text" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-text">48,210</p>
          <p className="text-caption text-status-running">+12% vs yesterday</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Delayed Trips</span>
            <Clock className="size-5 text-status-warning" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-status-warning">18</p>
          <p className="text-caption text-muted">Average delay 8 min</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Active Incidents</span>
            <AlertTriangle className="size-5 text-status-danger" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-status-danger">2</p>
          <p className="text-caption text-status-danger">All teams notified</p>
        </Card>
      </div>
    </div>
  );
}
