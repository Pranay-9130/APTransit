import { Card } from "@aptransit/ui";
import { ArrowRight, Bus, Calendar, MapPin, Sparkles, Ticket } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Hero card */}
      <Card className="p-6 sm:p-8 bg-surface-raised border-subtle flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-caption">
          <Sparkles className="size-4" aria-hidden="true" />
          <span>Andhra Pradesh Public Transport</span>
        </div>
        <h1 className="text-h1 font-bold text-text tracking-tight">
          {t("home.question")}
        </h1>
        <p className="text-body text-muted max-w-xl">
          {t("home.placeholderDescription")}
        </p>

        <div className="pt-2">
          <div className="inline-block p-4 rounded-card bg-surface border border-subtle">
            <p className="text-body-sm font-medium text-text">
              {t("home.placeholderTitle")}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick link cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/tickets" className="group">
          <Card variant="interactive" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-control bg-primary/10 text-primary">
                <Ticket className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-text group-hover:text-primary transition-colors">
                  {t("nav.tickets")}
                </p>
                <p className="text-caption text-muted">View upcoming and active tickets</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-muted group-hover:text-primary transition-colors" />
          </Card>
        </Link>

        <Link href="/track" className="group">
          <Card variant="interactive" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-control bg-status-running/10 text-status-running">
                <Bus className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-text group-hover:text-status-running transition-colors">
                  {t("nav.track")}
                </p>
                <p className="text-caption text-muted">Live bus tracking and delays</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-muted group-hover:text-status-running transition-colors" />
          </Card>
        </Link>

        <Link href="/timetable" className="group">
          <Card variant="interactive" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-control bg-status-upcoming/10 text-status-upcoming">
                <Calendar className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-text group-hover:text-status-upcoming transition-colors">
                  {t("nav.timetable")}
                </p>
                <p className="text-caption text-muted">Schedules across all districts</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-muted group-hover:text-status-upcoming transition-colors" />
          </Card>
        </Link>

        <Link href="/design" className="group">
          <Card variant="interactive" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-control bg-surface-sunken text-muted">
                <MapPin className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-text group-hover:text-primary transition-colors">
                  {t("design.title")}
                </p>
                <p className="text-caption text-muted">Dev component gallery</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-muted group-hover:text-primary transition-colors" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
