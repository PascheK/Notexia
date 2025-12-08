import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";

import { MarkdownToolbarFloating, type MarkdownCommand } from "@/components/editor/MarkdownToolbarFloating";
import { NoteEditor, type NoteEditorHandle } from "@/components/note/NoteEditor";
import { NoteViewer } from "@/components/note/NoteViewer";
import { Button } from "@/components/ui/button";
import { useEditorUIStore } from "@/store/editorUIStore";
import { useEditorStore } from "@/store/editorStore";
import {
  EDITOR_CENTER_DROP_ID,
  EDITOR_RIGHT_DROP_ID,
  EDITOR_BOTTOM_DROP_ID,
  type EditorDropZoneData,
  type ExplorerDndItem,
} from "@/lib/explorer/dnd-model";
import { cn } from "@/lib/utils";

const stripExtension = (title: string) => title.replace(/\.md$/i, "");

type SortableTabProps = {
  tabId: string;
  title: string;
  isActive: boolean;
  isDirty: boolean;
  isSaving: boolean;
  paneId: string;
  onSelect: () => void;
  onClose: () => void;
};

function SortableTab({
  tabId,
  title,
  isActive,
  isDirty,
  isSaving,
  paneId,
  onSelect,
  onClose
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tabId,
    data: { kind: "tab", tabId, paneId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      style={style}
      className={cn(
        "group relative inline-flex items-center gap-2 px-3 py-1.5 text-[12px] border backdrop-blur-sm",
        "transition-all duration-150",
        isActive
          ? "bg-app-surface text-app-fg border-app-border shadow-sm border-b-app-bg rounded-t-md"
          : "text-app-fg-muted border-transparent hover:border-app-border/60 hover:text-app-fg",
        isDragging ? "opacity-80 shadow-md" : ""
      )}
    >
      <span className="truncate max-w-40">{title}</span>
      <span
        className={cn(
          "text-[14px] transition-colors",
          isDirty ? "text-app-accent" : "text-transparent"
        )}
      >
        •
      </span>
      {isSaving && isActive && (
        <span className="text-[10px] text-app-accent">Saving…</span>
      )}
      <span
        role="button"
        aria-label="Fermer l’onglet"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt transition-colors duration-150"
      >
        X
      </span>
    </button>
  );
}

export function EditorLayout() {
  const layout = useEditorStore((s) => s.layout);
  const tabsById = useEditorStore((s) => s.tabsById);
  const loadingTabs = useEditorStore((s) => s.loadingTabs);
  const savingTabs = useEditorStore((s) => s.savingTabs);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const closeTab = useEditorStore((s) => s.closeTab);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);
  const saveTab = useEditorStore((s) => s.saveTab);
  const mode = useEditorUIStore((s) => s.mode);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const editorRefs = useRef<Record<string, NoteEditorHandle | null>>({});

  // DnD: drop zones for editor
  const centerDrop = useDroppable({
    id: EDITOR_CENTER_DROP_ID,
    data: { disposition: "replace" } satisfies EditorDropZoneData,
  });

  const rightDrop = useDroppable({
    id: EDITOR_RIGHT_DROP_ID,
    data: { disposition: "split-right" } satisfies EditorDropZoneData,
  });

  const bottomDrop = useDroppable({
    id: EDITOR_BOTTOM_DROP_ID,
    data: { disposition: "split-down" } satisfies EditorDropZoneData,
  });

  useDndMonitor({
    onDragStart: ({ active }) => {
      const data = active.data.current as ExplorerDndItem | { kind?: string } | undefined;
      setIsDraggingFile(Boolean((data as ExplorerDndItem)?.type));
    },
    onDragEnd: () => setIsDraggingFile(false),
    onDragCancel: () => setIsDraggingFile(false),
  });

  const orientation = layout.orientation ?? "single";
  const hasSecondPane = layout.panes.length > 1;
  const gridClass = hasSecondPane
    ? orientation === "vertical"
      ? "grid grid-rows-2 grid-cols-1"
      : "grid grid-cols-2"
    : "grid grid-cols-1";

  const activePaneId = layout.activePaneId ?? layout.panes[0]?.id ?? null;
  const activeEditorHandle = activePaneId ? editorRefs.current[activePaneId] : null;

  const handleToolbarCommand = (command: MarkdownCommand) => {
    activeEditorHandle?.applyCommand(command);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.02),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(110,86,207,0.06),transparent_25%)]" />
      <div className={cn("relative h-full w-full", gridClass, "gap-3")}>
        {/* DnD drop zones */}
        <div
          ref={centerDrop.setNodeRef}
          className="absolute inset-0 z-0 transition-all duration-150 rounded-2xl"
          style={{
            pointerEvents: isDraggingFile ? "auto" : "none",
            opacity: isDraggingFile ? 1 : 0,
            backgroundColor: centerDrop.isOver ? "rgba(110,86,207,0.08)" : "transparent",
            border: centerDrop.isOver ? "2px dashed rgb(110,86,207)" : "2px dashed transparent",
          }}
        />
        <div
          ref={rightDrop.setNodeRef}
          className="absolute right-0 top-0 bottom-0 w-[50%] z-10 transition-all duration-150"
          style={{
            pointerEvents: isDraggingFile ? "auto" : "none",
            opacity: isDraggingFile ? 1 : 0,
            backgroundColor: rightDrop.isOver ? "rgba(110,86,207,0.12)" : "transparent",
            borderLeft: rightDrop.isOver ? "2px solid rgb(110,86,207)" : "2px solid transparent",
          }}
        />
        <div
          ref={bottomDrop.setNodeRef}
          className="absolute left-0 right-0 bottom-0 h-[50%] z-10 transition-all duration-150"
          style={{
            pointerEvents: isDraggingFile ? "auto" : "none",
            opacity: isDraggingFile ? 1 : 0,
            backgroundColor: bottomDrop.isOver ? "rgba(110,86,207,0.12)" : "transparent",
            borderTop: bottomDrop.isOver ? "2px solid rgb(110,86,207)" : "2px solid transparent",
          }}
        />

        {layout.panes.map((pane) => {
          const activeTab =
            pane.activeTabId && tabsById[pane.activeTabId]
              ? tabsById[pane.activeTabId]
              : null;
          const isLoading =
            pane.activeTabId && loadingTabs[pane.activeTabId]
              ? loadingTabs[pane.activeTabId]
              : false;
          const isSaving =
            pane.activeTabId && savingTabs[pane.activeTabId]
              ? savingTabs[pane.activeTabId]
              : false;

          const noteTitle = activeTab ? stripExtension(activeTab.title) : "";

          return (
            <div
              key={pane.id}
              className="relative z-20 flex flex-col bg-app-surface overflow-hidden shadow-surface backdrop-blur-md transition-colors duration-150"
              onMouseDown={() => setActivePane(pane.id)}
            >
              <div className="flex items-center justify-between  pl-1 pt-2 border-b border-app-border/60 bg-app-surface/60 backdrop-blur-sm">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {pane.tabs.length ? (
                    <SortableContext
                      items={pane.tabs}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex items-center gap-2">
                        {pane.tabs.map((tabId) => {
                          const tab = tabsById[tabId];
                          if (!tab) return null;
                          const isActive = pane.activeTabId === tabId;
                          return (
                            <SortableTab
                              key={tabId}
                              tabId={tabId}
                              title={tab.title}
                              isActive={isActive}
                              isDirty={tab.isDirty}
                              isSaving={Boolean(isSaving && isActive)}
                              paneId={pane.id}
                              onSelect={() => {
                                setActivePane(pane.id);
                                setActiveTab(tabId);
                              }}
                              onClose={() => closeTab(tabId)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  ) : (
                    <span className="text-app-fg-muted text-[11px] px-2 italic">
                      Aucun onglet dans ce panneau
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                {!activeTab ? (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-center text-app-fg-muted border border-dashed border-app-border/60 rounded-lg bg-app-surface/40 m-4">
                    <p className="text-sm">Sélectionne une note dans l’explorateur pour commencer.</p>
                    <p className="text-[11px] text-app-fg-muted/80">
                      Astuce : dépose un fichier ici pour l’ouvrir ou créer un split.
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto max-w-4xl px-8 py-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-app-fg-muted">
                          Note
                        </p>
                        <h1 className="text-2xl font-semibold text-app-fg tracking-tight">
                          {noteTitle || activeTab.title}
                        </h1>
                      </div>
                      {mode === "edit" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-full px-3 text-[12px] text-app-fg-muted hover:text-app-fg"
                          onClick={() => void saveTab(activeTab.id)}
                        >
                          {isSaving ? "Saving…" : activeTab.isDirty ? "Enregistrer" : "Sauvegardé"}
                        </Button>
                      )}
                    </div>

                    {mode === "view" ? (
                      <NoteViewer content={activeTab.content} />
                    ) : (
                      <NoteEditor
                        ref={(instance) => {
                          editorRefs.current[pane.id] = instance;
                        }}
                        content={activeTab.content}
                        onChange={(value) => updateTabContent(activeTab.id, value)}
                        onSave={() => void saveTab(activeTab.id)}
                        isSaving={isSaving}
                      />
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 bg-app-bg/60 backdrop-blur-[1px] flex items-center justify-center text-xs text-app-fg-muted">
                    Chargement…
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mode === "edit" && activeEditorHandle && (
        <MarkdownToolbarFloating
          onCommand={handleToolbarCommand}
          disabled={!activeEditorHandle}
        />
      )}
    </div>
  );
}
