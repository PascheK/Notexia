import type { ReactNode } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TopBarProps = {
  activeSpaceLabel: string;
  activeSpacePath: string | null;
  selectedNotePath: string | null;
  spaceSelector?: ReactNode;
  mode: "view" | "edit";
  onChangeMode: (mode: "view" | "edit") => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function TopBar({
  activeSpaceLabel,
  activeSpacePath,
  selectedNotePath,
  spaceSelector,
  mode,
  onChangeMode,
  isSidebarOpen,
  onToggleSidebar
}: TopBarProps) {

  return (
    <div className="flex items-center justify-between w-full text-xs text-app-fg-muted">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt transition-colors"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Masquer l’explorer" : "Afficher l’explorer"}
        >
          {isSidebarOpen ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelRight className="h-4 w-4" />
          )}
        </Button>
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
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => value && onChangeMode(value as "view" | "edit")}
          className="rounded-full bg-app-surface-alt/60 px-1 py-0.5 border border-app-border/60"
        >
          <ToggleGroupItem
            value="view"
            size="sm"
            className="data-[state=on]:bg-app-surface text-[11px]"
            aria-label="Mode lecture"
          >
            Lecture
          </ToggleGroupItem>
          <ToggleGroupItem
            value="edit"
            size="sm"
            className="data-[state=on]:bg-app-surface text-[11px]"
            aria-label="Mode édition"
          >
            Édition
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-app-fg-muted hidden sm:inline-flex">Markdown</span>
        <span className="text-app-fg-muted hidden sm:inline-flex">UTF-8</span>
      </div>
    </div>
  );
}
