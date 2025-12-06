import { useEffect, useMemo, useState } from "react";

import { AppShell } from "./AppShell";
import { SideRail } from "./SideRail";
import { StatusBar } from "./StatusBar";
import { TopBar } from "./TopBar";
import { SpaceSelector } from "./SpaceSelector";

import { NoteEditor } from "@/components/NoteEditor";
import { NoteViewer } from "@/components/NoteViewer";
import { Button } from "@/components/ui/button";
import { VaultExplorer } from "@/components/vault/VaultExplorer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listVaultEntries } from "@/platform/tauri/fs-adapter";
import { useVaultStore } from "@/store/vaultStore";
import type { AppConfig } from "@/config/app-config";
import type { SpaceRegistryEntry } from "@/config/space-registry";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, X } from "lucide-react";

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

  const openTabs = useVaultStore((s) => s.openTabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const setActiveTab = useVaultStore((s) => s.setActiveTab);
  const closeTab = useVaultStore((s) => s.closeTab);
  const reorderTabs = useVaultStore((s) => s.reorderTabs);
  const duplicateTab = useVaultStore((s) => s.duplicateTab);

  const noteContent = useVaultStore((s) => s.noteContent);
  const isSavingNote = useVaultStore((s) => s.isSavingNote);
  const setNoteContent = useVaultStore((s) => s.setNoteContent);
  const saveCurrentNote = useVaultStore((s) => s.saveCurrentNote);
  const selectedNotePath = useVaultStore((s) => s.selectedNotePath);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const tabsOrder = useMemo(() => openTabs.map((t) => t.id), [openTabs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tabsOrder.indexOf(active.id);
    const newIndex = tabsOrder.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedIds = arrayMove(tabsOrder, oldIndex, newIndex);
    reorderTabs(reorderedIds);
  };

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

        const firstNote = notes[0];
        if (firstNote) {
          await useVaultStore.getState().openNoteInTab(firstNote.path);
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
        <Tabs
          value={activeTabId ?? openTabs[0]?.id ?? "empty"}
          onValueChange={(value) => value !== "empty" && setActiveTab(value)}
          className="border-b border-app-border bg-app-surface-alt"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabsOrder}
              strategy={horizontalListSortingStrategy}
            >
              <TabsList className="h-9 bg-transparent gap-1 px-2 overflow-x-auto">
                {openTabs.map((tab) => (
                  <SortableTab
                    key={tab.id}
                    tab={tab}
                    onClose={() => void closeTab(tab.id)}
                    onSelect={() => void setActiveTab(tab.id)}
                    onDuplicate={() => void duplicateTab(tab.id)}
                  />
                ))}

                {!openTabs.length && (
                  <span className="text-app-fg-muted text-[11px] px-2">
                    Ouvrez une note pour commencer
                  </span>
                )}
              </TabsList>
            </SortableContext>
          </DndContext>
        </Tabs>

        <ContextMenu>
          <ContextMenuTrigger className="flex-1 min-h-0">
            <div className="h-full p-4 overflow-auto">
              {activeTabId ? (
                mode === "view" ? (
                  <NoteViewer content={noteContent} />
                ) : (
                  <NoteEditor
                    content={noteContent}
                    onChange={setNoteContent}
                    onSave={saveCurrentNote}
                    isSaving={isSavingNote}
                  />
                )
              ) : (
                <p className="text-sm text-app-fg-muted">
                  Aucune note ouverte. Sélectionnez un fichier dans la sidebar.
                </p>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onSelect={() => setMode("view")}>
              Passer en mode lecture
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setMode("edit")}>
              Passer en mode édition
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              disabled={!activeTabId}
              onSelect={() => activeTabId && duplicateTab(activeTabId)}
            >
              Dupliquer l’onglet
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!activeTabId}
              onSelect={() => activeTabId && closeTab(activeTabId)}
            >
              Fermer l’onglet
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </AppShell>
  );
}

type SortableTabProps = {
  tab: { id: string; title: string };
  onClose: () => void;
  onSelect: () => void;
  onDuplicate: () => void;
};

function SortableTab({ tab, onClose, onSelect, onDuplicate }: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TabsTrigger
          ref={setNodeRef}
          style={style}
          value={tab.id}
          {...attributes}
          {...listeners}
          className="group h-8 px-3 gap-2 text-[11px] data-[state=active]:bg-app-surface data-[state=active]:border data-[state=active]:border-app-border data-[state=active]:text-app-fg text-app-fg-muted hover:text-app-fg rounded-md transition-colors flex items-center"
          onClick={onSelect}
          data-dragging={isDragging ? "true" : undefined}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-app-fg-muted" />
          <span className="truncate max-w-[180px]">{tab.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </TabsTrigger>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={onSelect}>Activer l’onglet</ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate}>Dupliquer l’onglet</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onClose}>Fermer l’onglet</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
