import type { ReactNode } from "react";

type TopBarProps = {
  activeSpaceLabel: string;
  activeSpacePath: string | null;
  selectedNotePath: string | null;
  spaceSelector?: ReactNode;
};

export function TopBar({
  activeSpaceLabel,
  activeSpacePath,
  selectedNotePath,
  spaceSelector
}: TopBarProps) {

  return (
    <div className="flex items-center justify-between w-full text-xs text-app-fg-muted">
      <div className="flex items-center gap-3">
        {spaceSelector}
        <div className="flex items-center gap-2">
          <span className="text-app-fg-muted/80">Space:</span>
          <span className="truncate max-w-xs" title={activeSpacePath ?? undefined}>
            {activeSpaceLabel}
          </span>
          {selectedNotePath && (
            <>
              <span className="text-app-fg-muted/50">/</span>
              <span className="truncate max-w-xs text-app-fg">
                {selectedNotePath.split("/").pop()}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-app-fg-muted">Markdown</span>
        <span className="text-app-fg-muted">UTF-8</span>
      </div>
    </div>
  );
}
