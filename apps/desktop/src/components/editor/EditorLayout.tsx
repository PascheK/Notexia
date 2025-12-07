import { useDroppable } from "@dnd-kit/core";
import { NoteEditor } from "@/components/note/NoteEditor";
import { NoteViewer } from "@/components/note/NoteViewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/store/editorStore";
import {
  EDITOR_CENTER_DROP_ID,
  EDITOR_RIGHT_DROP_ID,
  EDITOR_BOTTOM_DROP_ID,
  type EditorDropZoneData,
} from "@/lib/explorer/dnd-model";

type EditorLayoutProps = {
  mode: "view" | "edit";
};

export function EditorLayout({ mode }: EditorLayoutProps) {
  const layout = useEditorStore((s) => s.layout);
  const tabsById = useEditorStore((s) => s.tabsById);
  const loadingTabs = useEditorStore((s) => s.loadingTabs);
  const savingTabs = useEditorStore((s) => s.savingTabs);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const setActivePane = useEditorStore((s) => s.setActivePane);
  const closeTab = useEditorStore((s) => s.closeTab);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);
  const saveTab = useEditorStore((s) => s.saveTab);

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

  const orientation = layout.orientation ?? "single";
  const hasSecondPane = layout.panes.length > 1;
  const gridClass = hasSecondPane
    ? orientation === "vertical"
      ? "grid grid-rows-2 grid-cols-1"
      : "grid grid-cols-2"
    : "grid grid-cols-1";

  return (
    <div className={`h-full w-full ${gridClass} gap-2 relative`}>
      {/* DnD drop zones */}
      <div
        ref={centerDrop.setNodeRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: centerDrop.isOver ? "rgba(110,86,207,0.08)" : undefined,
          border: centerDrop.isOver ? "2px dashed rgb(110,86,207)" : undefined,
        }}
      />
      <div
        ref={rightDrop.setNodeRef}
        className="absolute right-0 top-0 bottom-0 w-[15%] pointer-events-auto z-10"
        style={{
          backgroundColor: rightDrop.isOver ? "rgba(110,86,207,0.15)" : undefined,
          borderLeft: rightDrop.isOver ? "2px solid rgb(110,86,207)" : undefined,
        }}
      />
      <div
        ref={bottomDrop.setNodeRef}
        className="absolute left-0 right-0 bottom-0 h-[15%] pointer-events-auto z-10"
        style={{
          backgroundColor: bottomDrop.isOver ? "rgba(110,86,207,0.15)" : undefined,
          borderTop: bottomDrop.isOver ? "2px solid rgb(110,86,207)" : undefined,
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

        return (
          <div
            key={pane.id}
            className="relative z-20 flex flex-col bg-app-surface border border-app-border/40 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-app-border/60 bg-app-surface-alt">
              <Tabs
                value={pane.activeTabId ?? pane.tabs[0] ?? "empty"}
                onValueChange={(value) => value !== "empty" && setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="h-9 bg-transparent gap-1 px-1 overflow-x-auto">
                  {pane.tabs.map((tabId) => {
                    const tab = tabsById[tabId];
                    if (!tab) return null;
                    const isActive = pane.activeTabId === tabId;
                    return (
                      <TabsTrigger
                        key={tabId}
                        value={tabId}
                        className="group h-8 px-3 gap-2 text-[11px] data-[state=active]:bg-app-surface data-[state=active]:border data-[state=active]:border-app-border data-[state=active]:text-app-fg text-app-fg-muted hover:text-app-fg rounded-md transition-colors flex items-center"
                      >
                        <span className="truncate max-w-40">
                          {tab.title}
                          {tab.isDirty && " •"}
                        </span>
                        <span
                          role="button"
                          aria-label="Fermer l’onglet"
                          tabIndex={0}
                          className="inline-flex items-center justify-center h-6 w-6 rounded-md text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tabId);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              closeTab(tabId);
                            }
                          }}
                        >
                          x
                        </span>
                        {isSaving && isActive && (
                          <span className="text-[10px] text-app-accent">Saving…</span>
                        )}
                      </TabsTrigger>
                    );
                  })}

                  {!pane.tabs.length && (
                    <span className="text-app-fg-muted text-[11px] px-2">
                      Aucun onglet dans ce panneau
                    </span>
                  )}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 min-h-0 p-3 relative overflow-auto">
              {!activeTab ? (
                <p className="text-sm text-app-fg-muted">
                  Glisse un fichier ici ou sélectionne-en un dans l’explorateur.
                </p>
              ) : mode === "view" ? (
                <NoteViewer content={activeTab.content} />
              ) : (
                <NoteEditor
                  content={activeTab.content}
                  onChange={(value) => updateTabContent(activeTab.id, value)}
                  onSave={() => void saveTab(activeTab.id)}
                  isSaving={isSaving}
                />
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
  );
}
