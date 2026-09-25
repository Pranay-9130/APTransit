"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ManagementSidebarProps {
  title: string;
  baseHref: string;
  items: NavItem[];
}

export function ManagementSidebar({ title, baseHref, items }: ManagementSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label={`${title} navigation`}
      className="hidden md:flex flex-col w-16 lg:w-[248px] shrink-0 bg-surface-raised border-r border-subtle transition-all duration-200"
    >
      <div className="h-16 px-4 flex items-center border-b border-subtle">
        <Link
          href={baseHref}
          className="text-h3 font-black text-primary tracking-tight truncate hidden lg:block"
        >
          {title}
        </Link>
        <Link
          href={baseHref}
          className="text-h3 font-black text-primary tracking-tight lg:hidden mx-auto"
        >
          APT
        </Link>
      </div>

      <nav className="flex-1 p-2 lg:p-3 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.href === baseHref
              ? pathname === baseHref
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-control text-body-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted hover:text-text hover:bg-surface"
              }`}
              title={item.label}
            >
              <Icon className="size-5 shrink-0 mx-auto lg:mx-0" aria-hidden="true" />
              <span className="hidden lg:inline truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
