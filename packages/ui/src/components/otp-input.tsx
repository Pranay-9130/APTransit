"use client";

import * as React from "react";
import { cn } from "../cn";

export interface OtpInputProps {
  /** Digits typed so far, at most `length` characters. */
  value: string;
  onChange: (value: string) => void;
  /** Called once each time the last box gets filled. */
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Accessible name of the group, e.g. "Enter the 6 digit code". */
  groupLabel: string;
  /** Accessible name of one box, e.g. (1, 6) => "Digit 1 of 6". */
  digitLabel: (position: number, total: number) => string;
  /** Id of the element that describes an error, linked with aria-describedby. */
  describedBy?: string;
  className?: string;
}

const onlyDigits = (text: string) => text.replace(/\D/g, "");

/**
 * docs/09 OtpInput: one box per digit, paste and SMS autofill spread across the boxes,
 * `autocomplete="one-time-code"` on the first box, auto submit through onComplete.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      value,
      onChange,
      onComplete,
      length = 6,
      disabled = false,
      invalid = false,
      autoFocus = false,
      groupLabel,
      digitLabel,
      describedBy,
      className,
    },
    ref,
  ) => {
    const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    const focusBox = (index: number) => {
      const box = inputs.current[Math.max(0, Math.min(length - 1, index))];
      box?.focus();
      box?.select();
    };

    const commit = (next: string, focusIndex: number) => {
      const clean = onlyDigits(next).slice(0, length);
      onChange(clean);
      focusBox(focusIndex);
      if (clean.length === length && value.length < length) onComplete?.(clean);
    };

    /** Writes `text` starting at `index`, as typing, paste or autofill would. */
    const writeAt = (index: number, text: string) => {
      const incoming = onlyDigits(text);
      if (!incoming) return;
      // A full code arriving anywhere (autofill, paste) replaces everything.
      if (incoming.length >= length) {
        commit(incoming, length - 1);
        return;
      }
      // Digits stay contiguous: typing in an empty box further right lands in the first free box.
      const start = Math.min(index, value.length);
      const merged = (value.slice(0, start) + incoming + value.slice(start + incoming.length)).slice(0, length);
      commit(merged, start + incoming.length);
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        if (digits[index]) {
          commit(value.slice(0, index) + value.slice(index + 1), index);
        } else if (index > 0) {
          commit(value.slice(0, index - 1) + value.slice(index), index - 1);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusBox(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        focusBox(index + 1);
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={groupLabel}
        aria-describedby={describedBy}
        className={cn("flex items-center gap-2", className)}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            // The first box takes the whole code from SMS autofill or a password manager.
            maxLength={index === 0 ? length : 1}
            aria-label={digitLabel(index + 1, length)}
            aria-invalid={invalid || undefined}
            autoFocus={autoFocus && index === 0}
            disabled={disabled}
            value={digit}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => {
              const raw = event.currentTarget.value;
              // Mobile keyboards may delete without a Backspace keydown.
              if (raw === "") commit(value.slice(0, index) + value.slice(index + 1), index);
              // Typing into a filled box without selection gives two characters: keep the new one.
              else writeAt(index, raw.length === 2 && digit ? raw.replace(digit, "") || digit : raw);
            }}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => {
              event.preventDefault();
              writeAt(index, event.clipboardData.getData("text"));
            }}
            className={cn(
              "h-14 w-11 min-w-0 rounded-md border border-strong bg-surface-raised text-center text-h2 tabular-nums text-fg transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-status-danger-solid",
            )}
          />
        ))}
      </div>
    );
  },
);

OtpInput.displayName = "OtpInput";
