import { useEffect } from "react";

import { useSyncStore } from "@/store/syncStore";
import { useEditorStore } from "@/store/editorStore";

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countLines(text: string): number {
  return text === "" ? 0 : text.split(/\r?\n/).length;
}

export function StatusBar() {
  const activeTab = useEditorStore((state) => {
    const pane =
      state.layout.panes.find((p) => p.id === state.layout.activePaneId) ??
      state.layout.panes[0];
    if (!pane || !pane.activeTabId) return null;
    return state.tabsById[pane.activeTabId] ?? null;
  });
  const savingTabs = useEditorStore((s) => s.savingTabs);
  const noteContent = activeTab?.content ?? "";
  const isSaving = activeTab ? Boolean(savingTabs[activeTab.id]) : false;
  const syncStatus = useSyncStore((s) => s.status);
  const lastChecked = useSyncStore((s) => s.lastChecked);
  const ping = useSyncStore((s) => s.ping);

  const words = countWords(noteContent);
  const lines = countLines(noteContent);

  useEffect(() => {
    void ping();
  }, [ping]);

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-app-fg-muted">
          {lines} lignes
        </span>
        <span className="text-[11px] text-app-fg-muted">
          {words} mots
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        {isSaving && <span className="text-app-accent transition-colors">Saving…</span>}
        <button
          type="button"
          onClick={() => ping()}
          className="text-app-fg-muted hover:text-app-fg transition-colors"
        >
          Server:{" "}
          {syncStatus === "connected"
            ? "connecté"
            : syncStatus === "error"
              ? "déconnecté"
              : "…"}
          {lastChecked ? ` (${lastChecked})` : ""}
        </button>
      </div>
    </>
  );
}
