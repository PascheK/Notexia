import type { ReactNode } from "react";

type SectionPlaceholderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function SectionPlaceholder({ title, description, icon, children }: SectionPlaceholderProps) {
  return (
    <div className="flex flex-1 items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3 text-center rounded-2xl border border-app-border/50 bg-app-surface/60 px-8 py-10 shadow-surface">
        {icon && (
          <div className="rounded-full bg-app-surface-alt/70 p-3 text-app-fg-muted">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-app-fg">{title}</h2>
          {description && (
            <p className="text-sm text-app-fg-muted max-w-md">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
