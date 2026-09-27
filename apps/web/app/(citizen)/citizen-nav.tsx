"use client";

import { cn } from "@aptransit/ui";
import { CalendarClock, CreditCard, Home, MapPin, Ticket, User, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavKey = "home" | "tickets" | "track" | "passes" | "timetable" | "account";

interface Item {
  href: string;
  key: NavKey;
  icon: LucideIcon;
}

// docs/11: bottom nav on mobile (Home, Tickets, Track, Passes, Account), top nav from md.
const BOTTOM_ITEMS: Item[] = [
  { href: "/", key: "home", icon: Home },
  { href: "/tickets", key: "tickets", icon: Ticket },
  { href: "/track", key: "track", icon: MapPin },
  { href: "/passes", key: "passes", icon: CreditCard },
  { href: "/account", key: "account", icon: User },
];

const TOP_ITEMS: Item[] = [
  { href: "/", key: "home", icon: Home },
  { href: "/tickets", key: "tickets", icon: Ticket },
  { href: "/track", key: "track", icon: MapPin },
  { href: "/passes", key: "passes", icon: CreditCard },
  { href: "/timetable", key: "timetable", icon: CalendarClock },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function CitizenTopNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("main")} className="hidden items-center gap-1 md:flex">
      {TOP_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center rounded-md px-3 text-small font-medium transition-colors duration-fast",
              active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface hover:text-fg",
            )}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function CitizenBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("main")}
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-default bg-surface-raised md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-w-0 flex-col items-center justify-center gap-1 px-1 transition-colors duration-fast",
                  active ? "font-semibold text-primary" : "text-muted hover:text-fg",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="line-clamp-2 max-w-full text-center text-caption">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
