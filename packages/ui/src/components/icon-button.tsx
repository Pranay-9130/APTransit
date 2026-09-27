"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";
import { Spinner } from "./spinner";

export const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover",
        secondary:
          "bg-surface text-fg border border-strong hover:bg-surface-raised active:bg-surface",
        ghost:
          "bg-transparent text-fg hover:bg-surface active:bg-surface-raised",
        danger:
          "bg-status-danger-solid text-on-solid hover:opacity-90 active:opacity-100",
      },
      size: {
        md: "h-11 w-11 min-h-11 min-w-11",
        lg: "h-13 w-13 min-h-13 min-w-13",
        xl: "h-14 w-14 min-h-14 min-w-14",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  /** Required aria-label for accessibility (TypeScript enforced) */
  "aria-label": string;
  loading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(iconButtonVariants({ variant, size, className }))}
        aria-busy={loading ? "true" : undefined}
        onClick={handleClick}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
