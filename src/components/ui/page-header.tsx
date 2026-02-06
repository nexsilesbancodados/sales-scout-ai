import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  gradient = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
        gradient && "p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-b-2xl",
        className
      )}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
