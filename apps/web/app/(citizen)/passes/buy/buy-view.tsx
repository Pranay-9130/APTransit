"use client";

import {
  CHILD_CARD_MAX_AGE,
  type CreatePassInput,
  DistrictsResponse,
  formatMoney,
  PassDto,
  PassTypeDto,
} from "@aptransit/shared";
import { Button, Card, Checkbox, ErrorState, Field, Input, Skeleton, toast } from "@aptransit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Baby, Check, HeartHandshake, MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { api, errorKey, isApiError } from "../../../../lib/api";
import { usePayment } from "../../../../lib/payments";
import { queryKeys } from "../../../../lib/query-keys";
import { serviceList } from "../../../../lib/service-list";

const PassTypes = z.array(PassTypeDto);

export function BuyPassView() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const payment = usePayment();
  const [selected, setSelected] = useState<string | null>(null);
  // D-034: zone passes name a district; a child card names the child (the parent gets a message on boarding)
  const [zone, setZone] = useState("");
  const [forChild, setForChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const districts = useQuery({
    queryKey: queryKeys.districts,
    queryFn: ({ signal }) =>
      api("/districts", { schema: DistrictsResponse, signal, redirectOn401: false }),
  });

  const typesQuery = useQuery({
    queryKey: queryKeys.passTypes,
    queryFn: ({ signal }) =>
      api("/pass-types", { schema: PassTypes, signal, redirectOn401: false }),
  });

  const create = useMutation({
    mutationFn: (body: CreatePassInput) =>
      api("/passes", { method: "POST", body, schema: PassDto }),
  });

  const pick = (p: { nameEn: string; nameTe: string }) => (locale === "te" ? p.nameTe : p.nameEn);

  if (typesQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4" aria-busy="true">
        <span className="sr-only" role="status">
          {t("common.loading")}
        </span>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
      </div>
    );
  }

  if (typesQuery.isError || !typesQuery.data) {
    return (
      <ErrorState
        headingLevel="h1"
        title={t("passBuy.errorTitle")}
        message={t(errorKey(typesQuery.error, (k) => t.has(k)))}
        requestId={isApiError(typesQuery.error) ? typesQuery.error.requestId : undefined}
        retryLabel={t("common.retry")}
        onRetry={() => void typesQuery.refetch()}
      />
    );
  }

  const paid = typesQuery.data.filter((type) => type.kind !== "FREE_TRAVEL");
  const free = typesQuery.data.find((type) => type.kind === "FREE_TRAVEL");
  const chosen = paid.find((type) => type.id === selected) ?? null;
  const busy =
    create.isPending || payment.state.phase === "working" || payment.state.phase === "checking";
  const failure = create.error
    ? t(errorKey(create.error, (k) => t.has(k)))
    : payment.state.errorKey
      ? t(payment.state.errorKey)
      : null;

  const buy = async () => {
    if (!chosen) return;
    setFormError(null);
    if (chosen.zoneScoped && !zone) return setFormError(t("passBuy.zoneRequired"));
    const age = Number(childAge);
    if (
      forChild &&
      (!childName.trim() || !Number.isInteger(age) || age < 1 || age >= CHILD_CARD_MAX_AGE)
    )
      return setFormError(t("passBuy.childInvalid", { max: CHILD_CARD_MAX_AGE - 1 }));
    let pass: PassDto;
    try {
      pass = await create.mutateAsync({
        passTypeId: chosen.id,
        ...(chosen.zoneScoped ? { zoneDistrictId: zone } : {}),
        ...(forChild ? { child: { name: childName.trim(), age } } : {}),
      });
    } catch {
      return;
    }
    await payment.pay({
      passId: pass.id,
      name: t("passBuy.paymentName"),
      description: t("passBuy.paymentDescription", { name: pick(chosen) }),
      onConfirmed: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.passes });
        toast.success(t("passBuy.done"));
        router.push("/passes");
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <h1 className="text-h1 text-fg">{t("passBuy.title")}</h1>
      <p className="text-body text-muted">{t("passBuy.intro")}</p>

      <div role="group" aria-label={t("passBuy.choose")} className="flex flex-col gap-3">
        {paid.map((type) => {
          const isSelected = type.id === selected;
          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(type.id)}
              className={
                isSelected
                  ? "flex flex-col gap-2 rounded-lg border-2 border-primary bg-primary-soft p-4 text-left transition-colors duration-fast"
                  : "flex flex-col gap-2 rounded-lg border border-default bg-surface-raised p-4 text-left transition-colors duration-fast hover:border-strong"
              }
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="text-h3 text-fg">{pick(type)}</span>
                <span className="flex items-center gap-2">
                  <span className="text-h3 tabular-nums text-fg">
                    {formatMoney(type.pricePaise, locale)}
                  </span>
                  {isSelected && <Check className="size-5 text-primary" aria-hidden="true" />}
                </span>
              </span>
              {type.zoneScoped ? (
                <span className="inline-flex items-center gap-1 self-start rounded-full bg-status-info-soft px-2 py-0.5 text-small font-medium text-status-info">
                  <MapPinned className="size-4" aria-hidden="true" />
                  {t("passBuy.zoneBadge")}
                </span>
              ) : null}
              <span className="text-small text-muted">
                {t("passBuy.validity", { days: type.durationDays })}
              </span>
              <span className="text-small text-muted">
                {t("passBuy.services", {
                  services: serviceList(type.eligibleServiceTypes, t, locale),
                })}
              </span>
            </button>
          );
        })}
      </div>

      {chosen?.zoneScoped ? (
        <Field id="pass-zone" label={t("passBuy.zoneLabel")} hint={t("passBuy.zoneHint")}>
          <select
            value={zone}
            onChange={(e) => setZone(e.currentTarget.value)}
            className="h-11 w-full rounded-md border border-strong bg-surface-raised px-3 text-body text-fg"
          >
            <option value="">{t("passBuy.zonePick")}</option>
            {(districts.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {pick(d)}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {chosen ? (
        <Card padding="md" className="flex flex-col gap-3">
          <label className="flex min-h-11 items-center gap-3 text-body text-fg">
            <Checkbox checked={forChild} onCheckedChange={(v) => setForChild(v === true)} />
            <Baby className="size-5 text-primary" aria-hidden="true" />
            {t("passBuy.forChild")}
          </label>
          {forChild ? (
            <>
              <p className="text-small text-muted">{t("passBuy.childHint")}</p>
              <div className="grid grid-cols-3 gap-3">
                <Field id="child-name" label={t("passBuy.childName")} className="col-span-2">
                  <Input
                    value={childName}
                    maxLength={100}
                    onChange={(e) => setChildName(e.currentTarget.value)}
                  />
                </Field>
                <Field id="child-age" label={t("passBuy.childAge")}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={CHILD_CARD_MAX_AGE - 1}
                    value={childAge}
                    onChange={(e) => setChildAge(e.currentTarget.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}
        </Card>
      ) : null}

      {formError && (
        <p role="alert" className="text-small text-status-danger">
          {formError}
        </p>
      )}
      {failure && (
        <p role="alert" className="text-small text-status-danger">
          {failure}
        </p>
      )}

      <Button size="lg" disabled={!chosen} loading={busy} onClick={() => void buy()}>
        {chosen
          ? t("passBuy.pay", { amount: formatMoney(chosen.pricePaise, locale) })
          : t("passBuy.choose")}
      </Button>

      {free && (
        <Card padding="md" className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-h3 text-fg">
            <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
            {t("passBuy.freeTitle")}
          </h2>
          <p className="text-small text-muted">{t("passBuy.freeHint")}</p>
          <Button asChild variant="secondary">
            <Link href="/free-travel">
              {t("passBuy.freeCta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
