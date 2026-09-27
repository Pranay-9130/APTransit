"use client";

import { CreditCard, Home, MapPin, Ticket, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CitizenNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/tickets", label: t("tickets"), icon: Ticket },
    { href: "/track", label: t("track"), icon: MapPin },
    { href: "/passes", label: t("passes"), icon: CreditCard },
    { href: "/account", label: t("account"), icon: User },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-sticky bg-surface/95 backdrop-blur-lg border-t border-subtle"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-0 py-1 transition-colors ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted hover:text-text"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-caption truncate max-w-full mt-1 px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
