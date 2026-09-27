"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aptransit/ui";
import { LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Account menu for staff shells. Log out is a plain link until the Day 4 session
 * (AuthProvider.logout) exists; swap the item's onSelect for logout() then.
 */
export function AccountMenu({ title }: { title: string }) {
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("account")}
        className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface hover:text-fg"
      >
        <User className="size-5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <LogOut className="size-4" aria-hidden="true" />
            {t("logout")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
