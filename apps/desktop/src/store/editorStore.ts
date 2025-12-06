import { create } from "zustand";

import { openInLayout, createInitialLayout, type EditorLayoutState, type EditorOpenDisposition, type EditorPaneId, type EditorPane, type EditorTab, type EditorTabId } from "@/lib/editor/layout";
import { readNote, writeNote } from "@/platform/tauri/fs-adapter";

type EditorTabState = EditorTab & {
  content: string;
};

type EditorState = {
  layout: EditorLayoutState;
  tabsById: Record<EditorTabId, EditorTabState>;
  loadingTabs: Record<EditorTabId, boolean>;
  savingTabs: Record<EditorTabId, boolean>;
  error: string | null;

  openNote: (path: string, disposition: EditorOpenDisposition) => Promise<void>;
  setActiveTab: (tabId: EditorTabId) => void;
  setActivePane: (paneId: EditorPaneId) => void;
  closeTab: (tabId: EditorTabId) => void;
  updateTabContent: (tabId: EditorTabId, content: string) => void;
  saveTab: (tabId: EditorTabId) => Promise<void>;
  renameTabsForPath: (oldPath: string, newPath: string, newTitle?: string) => void;
  removeTabsForPath: (path: string) => void;
  getActiveTab: () => EditorTabState | null;
};

const titleFromPath = (path: string) => path.split(/[/\\]/).filter(Boolean).pop() ?? path;

const removeTabFromLayout = (layout: EditorLayoutState, tabId: EditorTabId): EditorLayoutState => {
  const panes = layout.panes.map((pane) => ({
    ...pane,
    tabs: pane.tabs.filter((id) => id !== tabId),
    activeTabId: pane.activeTabId === tabId ? null : pane.activeTabId
  }));

  const cleaned: EditorPane[] = panes.map((pane) => {
    const activeTabId: EditorTabId | null =
      pane.activeTabId ? pane.activeTabId : pane.tabs[0] ?? null;
    return {
      ...pane,
      activeTabId
    };
  });

  let nextPanes = cleaned;
  if (cleaned.length > 1) {
    nextPanes = cleaned.filter((pane) => pane.tabs.length > 0);
  }
  if (!nextPanes.length) {
    nextPanes = createInitialLayout().panes;
  }

  const activePaneId = nextPanes.find((p) => p.id === layout.activePaneId)?.id ?? nextPanes[0]?.id ?? null;
  const orientation = nextPanes.length > 1 ? layout.orientation : "single";

  return { panes: nextPanes, activePaneId, orientation };
};

export const useEditorStore = create<EditorState>((set, get) => ({
  layout: createInitialLayout(),
  tabsById: {},
  loadingTabs: {},
  savingTabs: {},
  error: null,

  openNote: async (path: string, disposition: EditorOpenDisposition) => {
    const tabId: EditorTabId = path;
    const title = titleFromPath(path);

    set((state) => {
      const nextTabs = state.tabsById[tabId]
        ? state.tabsById
        : {
            ...state.tabsById,
            [tabId]: {
              id: tabId,
              path,
              title,
              isDirty: false,
              content: ""
            }
          };

      return {
        layout: openInLayout(state.layout, tabId, disposition),
        tabsById: nextTabs,
        loadingTabs: { ...state.loadingTabs, [tabId]: true },
        error: null
      };
    });

    try {
      const content = await readNote(path);
      set((state) => {
        const existing = state.tabsById[tabId];
        if (!existing) return state;

        return {
          tabsById: {
            ...state.tabsById,
            [tabId]: { ...existing, content, isDirty: false }
          },
          loadingTabs: { ...state.loadingTabs, [tabId]: false },
          error: null
        };
      });
    } catch (err) {
      set((state) => ({
        loadingTabs: { ...state.loadingTabs, [tabId]: false },
        error: err instanceof Error ? err.message : "Impossible d'ouvrir la note"
      }));
    }
  },

  setActiveTab: (tabId: EditorTabId) => {
    set((state) => {
      const paneIndex = state.layout.panes.findIndex((pane) => pane.tabs.includes(tabId));
      if (paneIndex === -1) return state;

      const panes = state.layout.panes.map((pane, idx) =>
        idx === paneIndex ? { ...pane, activeTabId: tabId } : pane
      );

      return {
        layout: {
          ...state.layout,
          panes,
          activePaneId: panes[paneIndex]?.id ?? state.layout.activePaneId
        }
      };
    });
  },

  setActivePane: (paneId: EditorPaneId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        activePaneId: paneId
      }
    }));
  },

  closeTab: (tabId: EditorTabId) => {
    set((state) => {
      const layout = removeTabFromLayout(state.layout, tabId);
      const { [tabId]: _removed, ...restTabs } = state.tabsById;
      const { [tabId]: _loading, ...restLoading } = state.loadingTabs;
      const { [tabId]: _saving, ...restSaving } = state.savingTabs;

      return {
        layout,
        tabsById: restTabs,
        loadingTabs: restLoading,
        savingTabs: restSaving
      };
    });
  },

  updateTabContent: (tabId: EditorTabId, content: string) => {
    set((state) => {
      const tab = state.tabsById[tabId];
      if (!tab) return state;
      return {
        tabsById: {
          ...state.tabsById,
          [tabId]: { ...tab, content, isDirty: true }
        }
      };
    });
  },

  saveTab: async (tabId: EditorTabId) => {
    const tab = get().tabsById[tabId];
    if (!tab) return;

    set((state) => ({
      savingTabs: { ...state.savingTabs, [tabId]: true }
    }));

    try {
      await writeNote(tab.path, tab.content);
      set((state) => {
        const refreshed = state.tabsById[tabId];
        if (!refreshed) return state;
        return {
          tabsById: {
            ...state.tabsById,
            [tabId]: { ...refreshed, isDirty: false }
          },
          savingTabs: { ...state.savingTabs, [tabId]: false },
          error: null
        };
      });
    } catch (err) {
      set((state) => ({
        savingTabs: { ...state.savingTabs, [tabId]: false },
        error: err instanceof Error ? err.message : "Impossible d'enregistrer la note"
      }));
    }
  },

  renameTabsForPath: (oldPath: string, newPath: string, newTitle?: string) => {
    const normalize = (p: string) => p.replace(/\\+/g, "/");
    const source = normalize(oldPath);
    const target = normalize(newPath);

    set((state) => {
      const nextTabs: Record<EditorTabId, EditorTabState> = {};
      const nextLoading: Record<EditorTabId, boolean> = {};
      const nextSaving: Record<EditorTabId, boolean> = {};

      Object.entries(state.tabsById).forEach(([id, tab]) => {
        const normalizedId = normalize(id);
        if (
          normalizedId === source ||
          normalizedId.startsWith(`${source}/`)
        ) {
          const updatedId = normalizedId.replace(source, target);
          const updatedTitle =
            normalizedId === source && newTitle ? newTitle : tab.title;
          nextTabs[updatedId] = {
            ...tab,
            id: updatedId,
            path: tab.path.replace(oldPath, newPath),
            title: updatedTitle
          };
          if (state.loadingTabs[id]) {
            nextLoading[updatedId] = state.loadingTabs[id];
          }
          if (state.savingTabs[id]) {
            nextSaving[updatedId] = state.savingTabs[id];
          }
        } else {
          nextTabs[id] = tab;
          if (state.loadingTabs[id]) nextLoading[id] = state.loadingTabs[id];
          if (state.savingTabs[id]) nextSaving[id] = state.savingTabs[id];
        }
      });

      const panes = state.layout.panes.map((pane) => {
        const tabs = pane.tabs.map((id) => {
          const normalizedId = normalize(id);
          if (
            normalizedId === source ||
            normalizedId.startsWith(`${source}/`)
          ) {
            return normalizedId.replace(source, target);
          }
          return id;
        });

        const activeTabId =
          pane.activeTabId && tabs.includes(pane.activeTabId)
            ? pane.activeTabId
            : tabs[0] ?? null;

        return { ...pane, tabs, activeTabId };
      });

      return {
        tabsById: nextTabs,
        loadingTabs: nextLoading,
        savingTabs: nextSaving,
        layout: { ...state.layout, panes }
      };
    });
  },

  removeTabsForPath: (path: string) => {
    const normalize = (p: string) => p.replace(/\\+/g, "/");
    const target = normalize(path);
    set((state) => {
      const toRemove = Object.keys(state.tabsById).filter((id) => {
        const normalizedId = normalize(id);
        return normalizedId === target || normalizedId.startsWith(`${target}/`);
      });
      if (!toRemove.length) return state;

      let layout = state.layout;
      toRemove.forEach((id) => {
        layout = removeTabFromLayout(layout, id);
      });

      const tabsById = { ...state.tabsById };
      const loadingTabs = { ...state.loadingTabs };
      const savingTabs = { ...state.savingTabs };
      toRemove.forEach((id) => {
        delete tabsById[id];
        delete loadingTabs[id];
        delete savingTabs[id];
      });

      return {
        layout,
        tabsById,
        loadingTabs,
        savingTabs
      };
    });
  },

  getActiveTab: () => {
    const state = get();
    const pane = state.layout.panes.find((p) => p.id === state.layout.activePaneId) ?? state.layout.panes[0];
    if (!pane || !pane.activeTabId) return null;
    return state.tabsById[pane.activeTabId] ?? null;
  }
}));
