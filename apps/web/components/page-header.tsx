import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, filters, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-text tracking-tight">{title}</h1>
          {description ? (
            <p className="text-body text-muted mt-1">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-3 shrink-0">{actions}</div> : null}
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-3 pt-2">{filters}</div> : null}
    </div>
  );
}
