"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../cn";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

// Dates are calendar days as "YYYY-MM-DD" strings. The caller passes `today` (IST from @aptransit/shared),
// so this file never reads the device clock or time zone. Month and weekday names come from Intl.

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

function clampDate(date: string, min: string, max: string): string {
  return date < min ? min : date > max ? max : date;
}

function addMonths(date: string, months: number): string {
  const d = new Date(toUtcMs(date));
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return fromUtcMs(d.getTime());
}

/** Weeks (Sunday first) covering the month of `date`. Days outside the month are null. */
export function monthGrid(date: string): (string | null)[][] {
  const d = new Date(toUtcMs(date));
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const first = Date.UTC(year, month, 1);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: new Date(first).getUTCDay() }, () => null);
  for (let i = 0; i < daysInMonth; i++) cells.push(fromUtcMs(first + i * DAY_MS));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function format(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(new Date(toUtcMs(date)));
}

export interface CalendarLabels {
  previousMonth: string;
  nextMonth: string;
}

export interface CalendarProps {
  value: string;
  onSelect: (date: string) => void;
  min: string;
  max: string;
  locale: string;
  labels: CalendarLabels;
  className?: string;
}

/** Month grid with the ARIA grid keyboard pattern: arrows, Home, End, Page Up, Page Down, Enter. */
export function Calendar({ value, onSelect, min, max, locale, labels, className }: CalendarProps) {
  const [focused, setFocused] = React.useState(() => clampDate(value, min, max));
  const [month, setMonth] = React.useState(() => focused);
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const moveFocus = React.useRef(false);

  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    buttons.current.get(focused)?.focus();
  }, [focused]);

  const goTo = (date: string) => {
    const next = clampDate(date, min, max);
    moveFocus.current = true;
    setFocused(next);
    setMonth(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const weekday = new Date(toUtcMs(focused)).getUTCDay();
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    goTo(move());
  };

  const monthStart = `${month.slice(0, 7)}-01`;
  const canGoBack = monthStart > min;
  const canGoForward = addMonths(monthStart, 1) <= max;
  const weekdays = monthGrid("2026-02-01")[0]!.map((d) => ({
    short: format(d!, locale, { weekday: "short" }),
    long: format(d!, locale, { weekday: "long" }),
  }));
  const heading = format(month, locale, { month: "long", year: "numeric" });
  const headingId = React.useId();

  const navButton =
    "inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className={navButton}
          aria-label={labels.previousMonth}
          disabled={!canGoBack}
          onClick={() => setMonth(addMonths(monthStart, -1))}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p id={headingId} aria-live="polite" className="text-h3 text-fg">
          {heading}
        </p>
        <button
          type="button"
          className={navButton}
          aria-label={labels.nextMonth}
          disabled={!canGoForward}
          onClick={() => setMonth(addMonths(monthStart, 1))}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <table role="grid" aria-labelledby={headingId} className="w-full border-collapse" onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w.long} scope="col" abbr={w.long} className="h-8 text-caption font-medium text-muted">
                {w.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                if (!day) return <td key={j} />;
                const disabled = day < min || day > max;
                const selected = day === value;
                return (
                  <td key={day} className="p-0 text-center">
                    <button
                      ref={(el) => {
                        if (el) buttons.current.set(day, el);
                        else buttons.current.delete(day);
                      }}
                      type="button"
                      tabIndex={day === focused ? 0 : -1}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={format(day, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      onClick={() => onSelect(day)}
                      onFocus={() => setFocused(day)}
                      className={cn(
                        "inline-flex size-11 items-center justify-center rounded-md text-body tabular-nums transition-colors duration-fast",
                        "disabled:pointer-events-none disabled:text-subtle disabled:opacity-50",
                        selected ? "bg-primary text-on-primary" : "text-fg hover:bg-surface",
                      )}
                    >
                      {format(day, locale, { day: "numeric" })}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface DatePickerLabels extends CalendarLabels {
  today: string;
  tomorrow: string;
  /** Chip text when the date is not today or tomorrow, and the dialog title. */
  pickDate: string;
  close: string;
}

export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  /** Today as YYYY-MM-DD in the service time zone (IST). */
  today: string;
  /** Last selectable day, counted from today. docs/09: today + 30. */
  maxDaysAhead?: number;
  locale: string;
  labels: DatePickerLabels;
  /** Accessible name of the chip group. */
  groupLabel: string;
  className?: string;
}

/** docs/09 DatePicker: Today and Tomorrow chips plus a calendar in a dialog. */
export function DatePicker({
  value,
  onChange,
  today,
  maxDaysAhead = 30,
  locale,
  labels,
  groupLabel,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const tomorrow = addDays(today, 1);
  const max = addDays(today, maxDaysAhead);
  const isOther = value !== today && value !== tomorrow;

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border px-4 text-small font-medium transition-colors duration-fast",
      active ? "border-primary bg-primary-soft text-primary" : "border-strong bg-surface-raised text-fg hover:bg-surface",
    );

  return (
    <div role="group" aria-label={groupLabel} className={cn("flex flex-wrap items-center gap-2", className)}>
      <button type="button" aria-pressed={value === today} className={chip(value === today)} onClick={() => onChange(today)}>
        {labels.today}
      </button>
      <button
        type="button"
        aria-pressed={value === tomorrow}
        className={chip(value === tomorrow)}
        onClick={() => onChange(tomorrow)}
      >
        {labels.tomorrow}
      </button>
      <button type="button" aria-pressed={isOther} aria-haspopup="dialog" className={chip(isOther)} onClick={() => setOpen(true)}>
        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{isOther ? format(value, locale, { weekday: "short", day: "numeric", month: "short" }) : labels.pickDate}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          closeLabel={labels.close}
          // 7 columns of 44 px targets fit a 360 px phone only with the smaller padding
          className="max-w-sm p-4"
          // Start on the selected day, as the ARIA date picker dialog pattern does
          onOpenAutoFocus={(event) => {
            const day = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLButtonElement>('[role="grid"] button[tabindex="0"]');
            if (day) {
              event.preventDefault();
              day.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{labels.pickDate}</DialogTitle>
          </DialogHeader>
          <Calendar
            value={value}
            min={today}
            max={max}
            locale={locale}
            labels={labels}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
