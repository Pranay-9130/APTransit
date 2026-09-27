import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

/** Ops, gov and admin page header (docs/09): title, optional description, filters, primary action. */
export function PageHeader({ title, description, filters, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-default pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h1 text-fg">{title}</h1>
          {description ? <p className="mt-1 text-body text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}
    </div>
  );
}
