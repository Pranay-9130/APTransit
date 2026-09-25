import { Card } from "@aptransit/ui";
import { AlertTriangle, Bus, Clock } from "lucide-react";
import { PageHeader } from "../../components/page-header";

export default function OpsDashboardPage() {

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Depot Operations Dashboard"
        description="Real time fleet monitoring, trip assignments, and active incidents for Kurnool Depot."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Active Buses</span>
            <Bus className="size-5 text-primary" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-text">42 / 50</p>
          <p className="text-caption text-status-running">84% in service</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Active Trips</span>
            <Clock className="size-5 text-status-running" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-text">28</p>
          <p className="text-caption text-muted">14 upcoming today</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Delayed Trips</span>
            <Clock className="size-5 text-status-warning" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-status-warning">3</p>
          <p className="text-caption text-muted">Avg delay 12 min</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-caption font-medium">Incidents</span>
            <AlertTriangle className="size-5 text-status-danger" aria-hidden="true" />
          </div>
          <p className="text-display font-bold text-status-danger">1</p>
          <p className="text-caption text-status-danger">1 breakdown reported</p>
        </Card>
      </div>
    </div>
  );
}
