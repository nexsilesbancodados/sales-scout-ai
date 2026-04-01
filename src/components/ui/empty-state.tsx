import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
      {Icon && (
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-5 animate-bounce-in">
          <Icon className="h-10 w-10 text-primary/60" />
          <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse-soft" />
        </div>
      )}
      <h3 className="text-lg font-bold mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      <div className="flex items-center gap-3">
        {action && (
          <Button onClick={action.onClick} className="gradient-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
