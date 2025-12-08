import { useEffect, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { AppShell } from "./AppShell";
import { SideRail } from "./SideRail";
import { StatusBar } from "./StatusBar";
import { TopBar } from "./TopBar";
import { SpaceSelector } from "./SpaceSelector";

import { EditorLayout } from "@/components/editor/EditorLayout";
import { CommandPalette } from "@/components/command/CommandPalette";
import { TasksSection } from "@/components/sections/TasksSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { SettingsSection } from "@/components/sections/SettingsSection";
import { WhiteboardsSection } from "@/components/sections/WhiteboardsSection";
import { VaultExplorer } from "@/components/vault/VaultExplorer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { listVaultEntries } from "@/platform/tauri/fs-adapter";
import { useVaultStore } from "@/store/vaultStore";
import { useEditorStore } from "@/store/editorStore";
import { useEditorUIStore } from "@/store/editorUIStore";
import { useUIStore } from "@/store/uiStore";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";
import type { AppConfig } from "@/config/app-config";
import type { SpaceRegistryEntry } from "@/config/space-registry";
import { createInitialLayout } from "@/lib/editor/layout";
import { openNoteInLayout } from "@/lib/editor/actions";
import {
  type ExplorerDndItem,
  type EditorDropZoneData,
  ROOT_DROP_ID,
} from "@/lib/explorer/dnd-model";
import { moveEntryCommand } from "@/lib/explorer/fs-actions";

const labelFromPath = (path: string) => {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

type TabDndData = { kind: "tab"; tabId: string; paneId: string };

const isTabDnd = (value: unknown): value is TabDndData =>
  Boolean(
    value &&
    typeof value === "object" &&
    (value as TabDndData).kind === "tab" &&
    typeof (value as TabDndData).tabId === "string" &&
    typeof (value as TabDndData).paneId === "string"
  );

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
  onCreateSpace,
}: DesktopRootProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const mode = useEditorUIStore((s) => s.mode);
  const setMode = useEditorUIStore((s) => s.setMode);
  const isSidebarOpen = useEditorUIStore((s) => s.isSidebarOpen);
  const toggleSidebar = useEditorUIStore((s) => s.toggleSidebar);
  const activeSection = useUIStore((s) => s.activeSection);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    if (isTabDnd(data)) {
      setActiveDragId(null);
      return;
    }
    setActiveDragId(String(active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeData = active.data.current as ExplorerDndItem | EditorDropZoneData | TabDndData | undefined;
    const overData = over.data.current as ExplorerDndItem | EditorDropZoneData | TabDndData | undefined;

    // ----------------------------------
    // Case 0: Tab reordering
    // ----------------------------------
    if (isTabDnd(activeData)) {
      if (!isTabDnd(overData)) return;
      if (activeData.paneId !== overData.paneId) return;
      if (activeData.tabId === overData.tabId) return;

      const pane = useEditorStore
        .getState()
        .layout.panes.find((p) => p.id === activeData.paneId);
      if (!pane) return;

      const currentOrder = pane.tabs;
      const oldIndex = currentOrder.indexOf(activeData.tabId);
      const newIndex = currentOrder.indexOf(overData.tabId);
      if (oldIndex === -1 || newIndex === -1) return;

      const next = arrayMove(currentOrder, oldIndex, newIndex);
      useEditorStore.getState().reorderTabs(activeData.paneId, next);
      return;
    }

    const source = activeData as ExplorerDndItem | undefined;
    if (!source) {
      if (import.meta.env.DEV) {
        console.warn("[DND explorer] missing source data", { activeId: active.id });
      }
      return;
    }

    // On récupère l’état du vault pour les moves FS
    const { vaultPath, refreshVault } = useVaultStore.getState();

    // ----------------------------------
    // Case 1: Drop on explorer root
    // ----------------------------------
    if (over.id === ROOT_DROP_ID) {
      if (!vaultPath) {
        if (import.meta.env.DEV) {
          console.warn("[DND explorer] no vaultPath, ignoring move to root");
        }
        return;
      }

      try {
        if (import.meta.env.DEV) {
          console.log("[DND explorer] move to root", {
            from: source.path,
            newParent: vaultPath
          });
        }

        // Déplace le fichier/dossier dans le dossier racine du vault
        await moveEntryCommand(source.path, vaultPath);
        await refreshVault();
      } catch (err) {
        console.error("[DND explorer] move to root failed", err);
      }

      return;
    }

    if (!overData) return;

    // ----------------------------------
    // Case 2: Drop on a folder in explorer
    // ----------------------------------
    if ("type" in overData && (overData.type === "folder" || overData.type === "file")) {
      const target = overData as ExplorerDndItem;

      // drop sur soi-même → on ignore
      if (target.path === source.path) return;

      // Pour l’instant, on ne supporte que drop DANS un dossier
      if (target.type === "folder") {
        if (!vaultPath) {
          if (import.meta.env.DEV) {
            console.warn("[DND explorer] no vaultPath, ignoring move to folder");
          }
          return;
        }

        try {
          if (import.meta.env.DEV) {
            console.log("[DND explorer] move", {
              from: source.path,
              newParent: target.path
            });
          }

          // Ici, target.path est le dossier de destination
          await moveEntryCommand(source.path, target.path);
          await refreshVault();
        } catch (err) {
          console.error("[DND explorer] move failed", err);
        }
      } else if (import.meta.env.DEV) {
        console.log("[DND explorer] drop on file ignored", {
          from: source.path,
          target: target.path
        });
      }

      // Plus tard tu peux décider : drop sur fichier => move dans le parent du fichier
      return;
    }

    // ----------------------------------
    // Case 3: Drop on editor zones
    // ----------------------------------
    if ("disposition" in overData) {
      const editorDrop = overData as EditorDropZoneData;
      if (source.type !== "file") {
        if (import.meta.env.DEV) {
          console.warn("[DND editor] drop ignored (not a file)", {
            from: source.path,
            disposition: editorDrop.disposition
          });
        }
        return;
      }

      if (import.meta.env.DEV) {
        console.log("[DND editor] open file", {
          path: source.path,
          disposition: editorDrop.disposition
        });
      }

      void openNoteInLayout(source.path, editorDrop.disposition);
      return;
    }
  };

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
          .filter(
            (entry) => !entry.is_dir && entry.name.toLowerCase().endsWith(".md")
          )
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
          error: null,
        });
        useEditorStore.setState({
          layout: createInitialLayout(),
          tabsById: {},
          loadingTabs: {},
          savingTabs: {},
          error: null,
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isNotesSection = activeSection === "notes";
  const sidebarVisible = isNotesSection && isSidebarOpen;
  const mainSelectedNotePath = isNotesSection ? selectedNotePath : null;

  const notesContent: ReactNode = (
    <div className="flex flex-col h-full">
      <ContextMenu>
        <ContextMenuTrigger className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <EditorLayout />
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
            onSelect={() =>
              activeEditorTab && closeEditorTab(activeEditorTab.id)
            }
          >
            Fermer l’onglet
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );

  let mainContent: ReactNode;
  switch (activeSection) {
    case "whiteboards":
      mainContent = <WhiteboardsSection />;
      break;
    case "tasks":
      mainContent = <TasksSection />;
      break;
    case "search":
      mainContent = <SearchSection />;
      break;
    case "settings":
      mainContent = <SettingsSection />;
      break;
    case "notes":
    default:
      mainContent = notesContent;
      break;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AppShell
        sideRail={<SideRail />}
        sidebar={isNotesSection ? <VaultExplorer /> : null}
        isSidebarOpen={sidebarVisible}
        onToggleSidebar={toggleSidebar}
        topBar={
          <TopBar
            activeSpaceLabel={
              activeSpace.label ?? labelFromPath(activeSpace.path)
            }
            activeSpacePath={activeSpace.path}
            selectedNotePath={mainSelectedNotePath}
            spaceSelector={
              <SpaceSelector
                spaces={spaces}
                activeSpaceId={activeSpace.id}
                onSelectSpace={onSelectSpace}
                onCreateSpace={onCreateSpace}
              />
            }
            mode={mode}
            onChangeMode={setMode}
            isSidebarOpen={sidebarVisible}
            onToggleSidebar={toggleSidebar}
          />
        }
        statusBar={<StatusBar />}
      >
        {mainContent}
      </AppShell>

      <CommandPalette />

      <DragOverlay>
        {activeDragId ? (
          <div className="px-2 py-1.5 rounded-md border border-app-border/40 bg-app-surface text-app-fg text-xs shadow-lg">
            {activeDragId.replace("explorer:", "")}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
