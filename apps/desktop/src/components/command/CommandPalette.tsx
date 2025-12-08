import { useEffect, useMemo } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { Command as CommandType } from "@/lib/commands/types";
import { getBaseCommands } from "@/lib/commands/registry";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";
import { useVaultStore } from "@/store/vaultStore";

const SECTION_ORDER = ["Notes", "Navigation", "Interface"];

const groupCommands = (commands: CommandType[]) => {
  const groups = new Map<string, CommandType[]>();

  commands.forEach((command) => {
    const key = command.section ?? "Divers";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(command);
  });

  return Array.from(groups.entries()).sort((a, b) => {
    const aIdx = SECTION_ORDER.indexOf(a[0]);
    const bIdx = SECTION_ORDER.indexOf(b[0]);
    if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0]);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
};

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const close = useCommandPaletteStore((s) => s.close);
  const notes = useVaultStore((s) => s.notes);
  const vaultPath = useVaultStore((s) => s.vaultPath);

  const commands = useMemo(
    () => getBaseCommands({ notes, vaultPath }),
    [notes, vaultPath]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const grouped = groupCommands(commands);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div className="mt-24 w-full max-w-xl rounded-xl border border-app-border bg-app-surface shadow-lg shadow-black/40">
        <Command
          loop
          className="rounded-xl border border-app-border/60 bg-app-surface text-app-fg shadow-inner"
        >
          <CommandInput
            placeholder="Rechercher une note ou une commande..."
            autoFocus
            className="border-b border-app-border/80 bg-app-surface-alt/30 text-sm placeholder:text-app-fg-muted"
          />

          <CommandList className="max-h-[320px]">
            <CommandEmpty className="py-6 text-center text-sm text-app-fg-muted">
              Aucune commande trouvée.
            </CommandEmpty>

            {grouped.map(([section, items], idx) => (
              <CommandGroup
                key={section}
                heading={section}
                className="text-app-fg [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-app-fg-muted"
              >
                {items.map((command) => (
                  <CommandItem
                    key={command.id}
                    value={
                      [
                        command.label,
                        command.description,
                        ...(command.keywords ?? [])
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                    onSelect={() => {
                      void command.perform();
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm data-[selected=true]:bg-app-surface-alt data-[selected=true]:text-app-fg transition-colors"
                  >
                    {command.icon ? (
                      <command.icon className="h-4 w-4 text-app-fg-muted" />
                    ) : null}
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{command.label}</span>
                      {command.description ? (
                        <span className="text-[11px] text-app-fg-muted">
                          {command.description}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
                {idx < grouped.length - 1 ? (
                  <CommandSeparator className="my-1 bg-app-border/60" />
                ) : null}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
