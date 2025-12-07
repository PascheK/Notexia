import { create } from "zustand";
import {
  createNote as createNoteOnDisk,
  deleteEntry as deleteEntryOnDisk,
  deleteNote as deleteNoteOnDisk,
  listVaultEntries,
  readNote,
  selectVaultFolder,
  createDirectory,
  writeNote,
  type NoteFile,
  type FsEntry
} from "@/platform/tauri/fs-adapter";
import { renameEntry as moveRenameEntry } from "@/lib/fsTree";
import { loadAppConfig, updateAppConfig } from "@/platform/config/appConfig";
import { useEditorStore } from "./editorStore";

type Tab = {
  id: string;
  path: string;
  title: string;
};

type SearchResult = {
  path: string;
  name: string;
  match: "name" | "content";
};

interface VaultState {
  vaultPath: string | null;
  entries: FsEntry[];
  notes: NoteFile[];
  selectedNotePath: string | null;
  noteContent: string;
  openTabs: Tab[];
  activeTabId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];

  isOpeningVault: boolean;
  isLoadingNote: boolean;
  isSavingNote: boolean;
  error: string | null;

  openVault: () => Promise<void>;
  refreshVault: () => Promise<void>;
  selectNote: (path: string) => Promise<void>;
  openNoteInTab: (path: string) => Promise<void>;
  setActiveTab: (tabId: string) => Promise<void>;
  closeTab: (tabId: string) => Promise<void>;
  reorderTabs: (orderedIds: string[]) => void;
  duplicateTab: (tabId: string) => Promise<void>;

  setNoteContent: (content: string) => void;
  saveCurrentNote: () => Promise<void>;

  createNote: (parentPath?: string | null) => Promise<void>;
  renameNote: (oldPath: string, newName: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  deleteEntry: (path: string) => Promise<void>;

  setSearchQuery: (q: string) => void;
  runSearch: (q?: string) => void;
}

const extractName = (path: string) => path.split(/[/\\]/).pop() ?? path;
const ensureMarkdownName = (name: string) =>
  name.endsWith(".md") ? name : `${name}.md`;
const toNoteList = (entries: FsEntry[]): NoteFile[] =>
  entries
    .filter(
      (entry) =>
        !entry.is_dir && entry.name.toLowerCase().endsWith(".md")
    )
    .map(({ path, name, modified }) => ({
      path,
      name,
      modified
    }));

export const useVaultStore = create<VaultState>((set, get) => ({
  vaultPath: null,
  entries: [],
  notes: [],
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

  openVault: async () => {
    set({ isOpeningVault: true, error: null });
    try {
      const selection = await selectVaultFolder();
      if (!selection) {
        set({ isOpeningVault: false });
        return;
      }

      const entries = await listVaultEntries(selection.path);
      const notes = toNoteList(entries);

      set({
        vaultPath: selection.path,
        entries,
        notes,
        selectedNotePath: null,
        noteContent: "",
        openTabs: [],
        activeTabId: null,
        isOpeningVault: false
      });

      try {
        const config = await loadAppConfig();
        const recentVaults = [
          selection.path,
          ...config.recentVaults.filter((p) => p !== selection.path)
        ].slice(0, 5);

        await updateAppConfig({
          lastVaultPath: selection.path,
          recentVaults
        });
      } catch (configError) {
        console.warn("Failed to persist vault selection", configError);
      }

      if (notes[0]) {
        await get().openNoteInTab(notes[0].path);
      }
    } catch (err) {
      set({
        isOpeningVault: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  refreshVault: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;

    set({ isOpeningVault: true, error: null });
    try {
      const entries = await listVaultEntries(vaultPath);
      const notes = toNoteList(entries);
      set({ entries, notes, isOpeningVault: false });
      if (get().searchQuery.trim()) {
        get().runSearch();
      }
    } catch (err) {
      set({
        isOpeningVault: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  selectNote: async (path: string) => {
    set({
      selectedNotePath: path,
      isLoadingNote: true,
      error: null
    });

    try {
      const content = await readNote(path);

      set({
        noteContent: content,
        isLoadingNote: false
      });
    } catch (err) {
      set({
        isLoadingNote: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  openNoteInTab: async (path: string) => {
    const { openTabs, notes } = get();
    const existing = openTabs.find((tab) => tab.path === path);
    const title = notes.find((n) => n.path === path)?.name ?? extractName(path);

    const nextTabs = existing
      ? openTabs
      : [...openTabs, { id: path, path, title }];

    set({
      openTabs: nextTabs,
      activeTabId: path
    });

    await get().selectNote(path);
  },

  setActiveTab: async (tabId: string) => {
    const target = get().openTabs.find((tab) => tab.id === tabId);
    if (!target) return;

    set({ activeTabId: tabId });
    await get().selectNote(target.path);
  },

  closeTab: async (tabId: string) => {
    const { openTabs, activeTabId } = get();
    const remaining = openTabs.filter((tab) => tab.id !== tabId);
    const nextActive =
      activeTabId === tabId
        ? remaining[remaining.length - 1]
        : remaining.find((t) => t.id === activeTabId);

    set({
      openTabs: remaining,
      activeTabId: nextActive?.id ?? null
    });

    if (nextActive) {
      await get().selectNote(nextActive.path);
    } else {
      set({ selectedNotePath: null, noteContent: "" });
    }
  },

  reorderTabs: (orderedIds: string[]) => {
    set((state) => {
      const tabMap = new Map(state.openTabs.map((t) => [t.id, t]));
      const nextTabs = orderedIds
        .map((id) => tabMap.get(id))
        .filter((t): t is Tab => Boolean(t));
      const remaining = state.openTabs.filter(
        (t) => !orderedIds.includes(t.id)
      );
      return { openTabs: [...nextTabs, ...remaining] };
    });
  },

  duplicateTab: async (tabId: string) => {
    const tab = get().openTabs.find((t) => t.id === tabId);
    if (!tab) return;

    const duplicateId = `${tab.id}-copy-${Date.now()}`;
    set((state) => ({
      openTabs: [...state.openTabs, { ...tab, id: duplicateId }],
      activeTabId: duplicateId
    }));

    await get().selectNote(tab.path);
  },

  setNoteContent: (content: string) => {
    set({ noteContent: content });
  },

  saveCurrentNote: async () => {
    const { selectedNotePath, noteContent } = get();
    if (!selectedNotePath) return;

    set({ isSavingNote: true, error: null });

    try {
      await writeNote(selectedNotePath, noteContent);
      set({ isSavingNote: false });
    } catch (err) {
      set({
        isSavingNote: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  createNote: async (parentPath?: string | null) => {
    const { vaultPath, refreshVault, openNoteInTab } = get();
    const base = parentPath ?? vaultPath;
    if (!base) return;

    try {
      const path = await createNoteOnDisk(base);
      await refreshVault();
      await openNoteInTab(path);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  renameNote: async (oldPath: string, newName: string) => {
    const entry = get().entries.find((e) => e.path === oldPath);
    const isDir = entry?.is_dir ?? false;
    const trimmed = newName.trim();
    const targetName = isDir ? trimmed : ensureMarkdownName(trimmed);

    if (!targetName.replace(".md", "").trim()) return;

    const currentName =
      entry?.name ?? oldPath.split(/[/\\]/).pop() ?? oldPath;
    if (targetName === currentName) return;

    try {
      const newPath = await moveRenameEntry(oldPath, targetName);
      useEditorStore.getState().renameTabsForPath(oldPath, newPath, targetName);

      set((state) => {
        const updatePath = (value: string | null) => {
          if (!value) return value;
          if (!isDir) return value === oldPath ? newPath : value;
          if (value === oldPath) return newPath;
          if (
            value.startsWith(`${oldPath}/`) ||
            value.startsWith(`${oldPath}\\`)
          ) {
            return value.replace(oldPath, newPath);
          }
          return value;
        };

        const nextTabs = state.openTabs.map((tab) => {
          const nextPath = updatePath(tab.path) ?? tab.path;
          const nextId = updatePath(tab.id) ?? tab.id;
          const nextTitle =
            !isDir && tab.path === oldPath ? targetName : tab.title;

          return { ...tab, id: nextId, path: nextPath, title: nextTitle };
        });

        const nextActiveTabId = updatePath(state.activeTabId);
        const nextSelectedPath = updatePath(state.selectedNotePath);

        return {
          openTabs: nextTabs,
          activeTabId: nextActiveTabId,
          selectedNotePath: nextSelectedPath ?? state.selectedNotePath
        };
      });

      await get().refreshVault();

      const { activeTabId, openTabs } = get();
      const activeTab = activeTabId
        ? openTabs.find((tab) => tab.id === activeTabId)
        : null;

      if (activeTab) {
        await get().selectNote(activeTab.path);
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  deleteNote: async (path: string) => {
    try {
      await deleteNoteOnDisk(path);

      set((state) => {
        const remainingTabs = state.openTabs.filter((tab) => tab.path !== path);
        const nextActiveId =
          state.activeTabId === path
            ? remainingTabs[remainingTabs.length - 1]?.id ?? null
            : state.activeTabId;

        return {
          openTabs: remainingTabs,
          activeTabId: nextActiveId,
          selectedNotePath:
            state.selectedNotePath === path ? null : state.selectedNotePath,
          noteContent: state.selectedNotePath === path ? "" : state.noteContent
        };
      });

      await get().refreshVault();

      const { activeTabId, openTabs } = get();
      if (activeTabId) {
        const active = openTabs.find((tab) => tab.id === activeTabId);
        if (active) {
          await get().selectNote(active.path);
        }
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  createFolder: async (parentPath: string, name: string) => {
    const base = parentPath || get().vaultPath;
    const trimmed = name.trim();
    const hasNotexiaSegment = (path: string) =>
      path.split(/[/\\]/).includes(".notexia");
    const hasSeparator = /[\\/]/.test(trimmed);

    if (!base) {
      if (import.meta.env.DEV) {
        console.warn("[vaultStore] createFolder called without base path");
      }
      return;
    }

    if (!trimmed) {
      set({ error: "Nom de dossier vide" });
      return;
    }

    if (trimmed === ".notexia" || hasNotexiaSegment(base)) {
      set({ error: "Le dossier .notexia est réservé" });
      return;
    }

    if (hasSeparator) {
      set({ error: "Le nom du dossier ne peut pas contenir de slash (/ ou \\)" });
      return;
    }

    try {
      await createDirectory(base, trimmed);
      await get().refreshVault();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  deleteEntry: async (path: string) => {
    const { vaultPath, selectedNotePath } = get();
    if (vaultPath && path === vaultPath) {
      set({ error: "Impossible de supprimer le dossier racine du vault" });
      return;
    }

    try {
      const isDir =
        get().entries.find((entry) => entry.path === path)?.is_dir ?? false;
      const matchesRemoved = (targetPath: string | null) =>
        !!targetPath &&
        (targetPath === path ||
          (isDir &&
            (targetPath.startsWith(`${path}/`) ||
              targetPath.startsWith(`${path}\\`))));

      await deleteEntryOnDisk(path);
      useEditorStore.getState().removeTabsForPath(path);

      set((state) => {

        const remainingTabs = state.openTabs.filter(
          (tab) => !matchesRemoved(tab.path)
        );

        const nextActiveId = matchesRemoved(state.activeTabId)
          ? remainingTabs[remainingTabs.length - 1]?.id ?? null
          : state.activeTabId;

        const noteRemoved = matchesRemoved(state.selectedNotePath);

        return {
          openTabs: remainingTabs,
          activeTabId: nextActiveId,
          selectedNotePath: noteRemoved ? null : state.selectedNotePath,
          noteContent: noteRemoved ? "" : state.noteContent
        };
      });

      await get().refreshVault();

      if (matchesRemoved(selectedNotePath)) {
        set({ noteContent: "" });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  },

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  runSearch: (q?: string) => {
    const query = (q ?? get().searchQuery).trim().toLowerCase();
    if (!query) {
      set({ searchResults: [] });
      return;
    }

    const results = get()
      .notes.filter((note) => note.name.toLowerCase().includes(query))
      .map((note) => ({
        path: note.path,
        name: note.name,
        match: "name" as const
      }));

    set({ searchResults: results });
  }
}));
