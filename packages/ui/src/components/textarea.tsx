import * as React from "react";
import { cn } from "../cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          "min-h-24 w-full rounded-md border border-strong bg-surface-raised p-3.5 text-body text-fg placeholder:text-subtle transition-colors resize-y",
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

Textarea.displayName = "Textarea";
