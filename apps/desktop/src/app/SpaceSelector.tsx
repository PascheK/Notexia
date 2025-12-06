import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SpaceRegistryEntry } from "@/config/space-registry";
import { FolderPlus, Layers } from "lucide-react";
import { useMemo } from "react";

type SpaceSelectorProps = {
  spaces: SpaceRegistryEntry[];
  activeSpaceId: string | null;
  onSelectSpace: (id: string) => void;
  onCreateSpace: () => void;
};

const inferLabelFromPath = (path: string) => {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

export function SpaceSelector({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onCreateSpace
}: SpaceSelectorProps) {
  const active = useMemo(
    () => spaces.find((s) => s.id === activeSpaceId) ?? null,
    [spaces, activeSpaceId]
  );

  const label = active?.label ?? (active ? inferLabelFromPath(active.path) : "Sélectionner un Space");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-[11px] bg-app-surface-alt border-app-border text-app-fg"
        >
          <Layers className="w-3.5 h-3.5 mr-2 text-app-fg-muted" />
          <span className="truncate max-w-[180px]" title={active?.path}>
            {label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-brand-50">
        <DropdownMenuLabel className="text-[11px] text-app-fg-muted">
          Notexia Spaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {spaces.map((space) => {
          const spaceLabel = space.label ?? inferLabelFromPath(space.path);
          return (
            <DropdownMenuItem
              key={space.id}
              onSelect={() => onSelectSpace(space.id)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="text-sm text-app-fg">{spaceLabel}</span>
              <span className="text-[11px] text-app-fg-muted truncate w-full" title={space.path}>
                {space.path}
              </span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCreateSpace} className="gap-2 text-app-fg">
          <FolderPlus className="w-4 h-4 text-app-fg-muted" />
          <span>Nouveau Space…</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
