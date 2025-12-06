import { useEffect, useState } from "react";

import { AppShell } from "./AppShell";
import { SideRail } from "./SideRail";
import { StatusBar } from "./StatusBar";
import { TopBar } from "./TopBar";
import { SpaceSelector } from "./SpaceSelector";

import { EditorLayout } from "@/components/editor/EditorLayout";
import { Button } from "@/components/ui/button";
import { VaultExplorer } from "@/components/vault/VaultExplorer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { listVaultEntries } from "@/platform/tauri/fs-adapter";
import { useVaultStore } from "@/store/vaultStore";
import { useEditorStore } from "@/store/editorStore";
import type { AppConfig } from "@/config/app-config";
import type { SpaceRegistryEntry } from "@/config/space-registry";
import { createInitialLayout } from "@/lib/editor/layout";
import { openNoteInLayout } from "@/lib/editor/actions";

const labelFromPath = (path: string) => {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

type DesktopRootProps = {
  initialConfig?: AppConfig;
  activeSpace: SpaceRegistryEntry;
  spaces: SpaceRegistryEntry[];
  onSelectSpace: (id: string) => void;
  onCreateSpace: () => void;
};

export function DesktopRoot({
  initialConfig,
  activeSpace,
  spaces,
  onSelectSpace,
  onCreateSpace
}: DesktopRootProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const activeEditorTab = useEditorStore((state) => {
    const pane =
      state.layout.panes.find((p) => p.id === state.layout.activePaneId) ??
      state.layout.panes[0];
    if (!pane || !pane.activeTabId) return null;
    return state.tabsById[pane.activeTabId] ?? null;
  });
  const closeEditorTab = useEditorStore((s) => s.closeTab);
  const selectedNotePath = activeEditorTab?.path ?? null;

  useEffect(() => {
    const vaultPath = activeSpace?.path ?? initialConfig?.activeVaultPath;
    if (!vaultPath) return;

    (async () => {
      try {
        const entries = await listVaultEntries(vaultPath);
        const notes = entries
          .filter((entry) => !entry.is_dir && entry.name.toLowerCase().endsWith(".md"))
          .map(({ path, name, modified }) => ({ path, name, modified }));

        useVaultStore.setState({
          vaultPath,
          entries,
          notes,
          selectedNotePath: null,
          noteContent: "",
          openTabs: [],
          activeTabId: null,
          searchQuery: "",
          searchResults: [],
          isOpeningVault: false,
          isLoadingNote: false,
          isSavingNote: false,
          error: null
        });
        useEditorStore.setState({
          layout: createInitialLayout(),
          tabsById: {},
          loadingTabs: {},
          savingTabs: {},
          error: null
        });

        const firstNote = notes[0];
        if (firstNote) {
          await openNoteInLayout(firstNote.path, "replace");
        }
      } catch {
        // vault introuvable : on ignore
      }
    })();
  }, [activeSpace?.path, initialConfig?.activeVaultPath]);

  return (
    <AppShell
      sideRail={<SideRail />}
      sidebar={<VaultExplorer />}
      topBar={
        <div className="flex items-center justify-between w-full">
          <TopBar
            activeSpaceLabel={activeSpace.label ?? labelFromPath(activeSpace.path)}
            activeSpacePath={activeSpace.path}
            selectedNotePath={selectedNotePath}
            spaceSelector={
              <SpaceSelector
                spaces={spaces}
                activeSpaceId={activeSpace.id}
                onSelectSpace={onSelectSpace}
                onCreateSpace={onCreateSpace}
              />
            }
          />
          {/* switch view / edit */}
          <div className="inline-flex items-center text-[11px] rounded-lg border border-app-border bg-app-surface-alt overflow-hidden">
            <Button
              type="button"
              variant={mode === "view" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setMode("view")}
            >
              View
            </Button>
            <Button
              type="button"
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setMode("edit")}
            >
              Edit
            </Button>
          </div>
        </div>
      }
      statusBar={<StatusBar />}
    >
      <div className="flex flex-col h-full">
        <ContextMenu>
          <ContextMenuTrigger className="flex-1 min-h-0">
            <div className="h-full p-4 overflow-auto">
              <EditorLayout mode={mode} />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onSelect={() => setMode("view")}>
              Passer en mode lecture
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setMode("edit")}>
              Passer en mode édition
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!activeEditorTab}
              onSelect={() => activeEditorTab && closeEditorTab(activeEditorTab.id)}
            >
              Fermer l’onglet
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </AppShell>
  );
}
