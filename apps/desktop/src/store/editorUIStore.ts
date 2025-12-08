import { create } from "zustand";

export type EditorMode = "view" | "edit";

type EditorUIState = {
  mode: EditorMode;
  isSidebarOpen: boolean;
  setMode: (mode: EditorMode) => void;
  toggleMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

export const useEditorUIStore = create<EditorUIState>((set) => ({
  mode: "view",
  isSidebarOpen: true,
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === "view" ? "edit" : "view" })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
}));
