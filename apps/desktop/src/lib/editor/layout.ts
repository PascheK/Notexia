export type EditorPaneId = string;

export type EditorOpenDisposition =
  | "replace"
  | "split-right"
  | "split-down";

export type EditorTabId = string;

export type EditorTab = {
  id: EditorTabId;
  path: string;
  title: string;
  isDirty: boolean;
};

export type EditorPane = {
  id: EditorPaneId;
  tabs: EditorTabId[];
  activeTabId: EditorTabId | null;
};

export type EditorLayoutState = {
  panes: EditorPane[];
  activePaneId: EditorPaneId | null;
  orientation: "single" | "horizontal" | "vertical";
};

const clonePane = (pane: EditorPane): EditorPane => ({
  ...pane,
  tabs: [...pane.tabs]
});

const removeTabFromPane = (pane: EditorPane, tabId: EditorTabId) => {
  const nextTabs = pane.tabs.filter((id) => id !== tabId);
  const nextActive = pane.activeTabId === tabId ? nextTabs[0] ?? null : pane.activeTabId;
  pane.tabs = nextTabs;
  pane.activeTabId = nextActive;
};

export function createInitialLayout(initialTabId?: EditorTabId): EditorLayoutState {
  const paneId: EditorPaneId = "pane-1";
  return {
    panes: [
      {
        id: paneId,
        tabs: initialTabId ? [initialTabId] : [],
        activeTabId: initialTabId ?? null
      }
    ],
    activePaneId: paneId,
    orientation: "single"
  };
}

const ensureBaseLayout = (state: EditorLayoutState): EditorLayoutState => {
  if (state.panes.length) return state;
  return createInitialLayout();
};

const pickActivePaneIndex = (layout: EditorLayoutState): number => {
  const idx = layout.panes.findIndex((p) => p.id === layout.activePaneId);
  if (idx !== -1) return idx;
  return 0;
};

const createPaneId = () => `pane-${Math.random().toString(36).slice(2, 8)}`;

export function openInLayout(
  state: EditorLayoutState,
  tabId: EditorTabId,
  disposition: EditorOpenDisposition
): EditorLayoutState {
  const normalized = ensureBaseLayout(state);
  const panes = normalized.panes.map(clonePane);
  let orientation = normalized.orientation ?? "single";
  let activePaneId = normalized.activePaneId ?? panes[0]?.id ?? "pane-1";

  // Remove the tab from any pane where it already exists to avoid duplicates.
  panes.forEach((pane) => removeTabFromPane(pane, tabId));

  let targetPaneIndex = pickActivePaneIndex({ ...normalized, panes, activePaneId });

  if (disposition === "split-right" || disposition === "split-down") {
    orientation = disposition === "split-right" ? "horizontal" : "vertical";

    if (panes.length < 2) {
      const newPaneId = createPaneId();
      panes.push({
        id: newPaneId,
        tabs: [],
        activeTabId: null
      });
      targetPaneIndex = panes.length - 1;
      activePaneId = newPaneId;
    } else {
      targetPaneIndex = panes.length > 1 ? 1 : 0;
      activePaneId = panes[targetPaneIndex]?.id ?? activePaneId;
    }
  } else {
    targetPaneIndex = pickActivePaneIndex({ ...normalized, panes, activePaneId });
    activePaneId = panes[targetPaneIndex]?.id ?? activePaneId;
    if (panes.length === 1) {
      orientation = "single";
    }
  }

  const targetPane = panes[targetPaneIndex] ?? panes[0];
  if (targetPane) {
    if (!targetPane.tabs.includes(tabId)) {
      targetPane.tabs.push(tabId);
    }
    targetPane.activeTabId = tabId;
  }

  // Ensure every pane still has a valid active tab if tabs remain.
  panes.forEach((pane) => {
    if (pane.tabs.length && !pane.activeTabId) {
      pane.activeTabId = pane.tabs[0];
    }
  });

  return {
    panes,
    activePaneId,
    orientation
  };
}
