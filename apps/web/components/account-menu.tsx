"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aptransit/ui";
import { LogOut, Settings, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth, useMe } from "./auth-provider";

/** Account menu for staff shells: who is logged in, the account page, and Log out. */
export function AccountMenu({ title }: { title: string }) {
  const t = useTranslations("nav");
  const { logout } = useAuth();
  const me = useMe();
  const who = me.data?.name ?? me.data?.email ?? me.data?.phone ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("account")}
        className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface hover:text-fg"
      >
        <User className="size-5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block">{title}</span>
          {who ? <span className="block max-w-60 truncate text-caption font-normal text-muted">{who}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings className="size-4" aria-hidden="true" />
            {t("account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void logout()}>
          <LogOut className="size-4" aria-hidden="true" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
