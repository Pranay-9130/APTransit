import * as React from "react";
import { cn } from "../cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", isError, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "h-11 w-full rounded-md border border-strong bg-surface-raised px-3.5 text-body text-fg placeholder:text-subtle transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-status-danger-solid",
          isError && "border-status-danger-solid",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
