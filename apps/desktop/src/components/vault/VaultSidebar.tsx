import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePlus } from "lucide-react";
import { useVaultStore } from "@/store/vaultStore";
import type { NoteFile } from "@/platform/tauri/fs-adapter";
import { useEditorStore } from "@/store/editorStore";
import { openNoteInLayout } from "@/lib/editor/actions";

type NotesListProps = {
  notes: Pick<NoteFile, "path" | "name" | "modified">[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onRename: (path: string, currentName: string) => void;
  onDelete: (path: string) => void;
};

function NotesList({ notes, selectedPath, onSelect, onRename, onDelete }: NotesListProps) {
  if (!notes.length) {
    return (
      <div className="text-[11px] text-app-fg-muted py-2 px-1">
        Aucune note pour l’instant.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notes.map((note) => {
        const isActive = selectedPath === note.path;
        return (
          <div
            key={note.path}
            className={[
              "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors",
              isActive
                ? "bg-app-accent-soft text-app-fg"
                : "text-app-fg-muted hover:bg-app-surface-alt hover:text-app-fg"
            ].join(" ")}
            onClick={() => onSelect(note.path)}
          >
            <div className="truncate" title={note.name}>
              {note.name}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-[10px] text-app-fg-muted hover:text-app-fg"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(note.path, note.name);
                }}
              >
                Renommer
              </button>
              <button
                type="button"
                className="text-[10px] text-destructive hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.path);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VaultSidebar() {
  const notes = useVaultStore((s) => s.notes);
  const selectedNotePath = useEditorStore((state) => {
    const pane =
      state.layout.panes.find((p) => p.id === state.layout.activePaneId) ??
      state.layout.panes[0];
    if (!pane || !pane.activeTabId) return null;
    const tab = state.tabsById[pane.activeTabId];
    return tab?.path ?? null;
  });
  const createNote = useVaultStore((s) => s.createNote);
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const openVault = useVaultStore((s) => s.openVault);
  const isOpeningVault = useVaultStore((s) => s.isOpeningVault);
  const renameNote = useVaultStore((s) => s.renameNote);
  const deleteNote = useVaultStore((s) => s.deleteNote);
  const searchQuery = useVaultStore((s) => s.searchQuery);
  const setSearchQuery = useVaultStore((s) => s.setSearchQuery);
  const runSearch = useVaultStore((s) => s.runSearch);
  const searchResults = useVaultStore((s) => s.searchResults);

  const displayedNotes =
    searchQuery.trim().length > 0
      ? searchResults.map((r) => ({ path: r.path, name: r.name, modified: null }))
      : notes;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-app-border/40 bg-app-surface">
        <div className="text-[11px] font-semibold text-app-fg mb-1">
          Vault
        </div>
        <div className="text-[10px] text-app-fg-muted truncate">
          {vaultPath ?? "Aucun vault sélectionné"}
        </div>
      </div>

      {/* Recherche + Liste de notes */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            runSearch(e.target.value);
          }}
          placeholder="Rechercher une note..."
          className="h-9 text-xs bg-app-surface border-app-border/40 text-app-fg placeholder:text-app-fg-muted focus:border-app-accent transition-colors"
        />

        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-app-fg-muted">
            Notes
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 text-xs p-0 border-app-border/40"
            onClick={() => void createNote()}
          >
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <NotesList
            notes={displayedNotes as any}
            selectedPath={selectedNotePath}
            onSelect={(path) => void openNoteInLayout(path, "replace")}
            onRename={(path, currentName) => {
              const newName = window.prompt("Nouveau nom du fichier", currentName);
              if (newName) renameNote(path, newName);
            }}
            onDelete={(path) => {
              const confirmed = window.confirm("Supprimer cette note ?");
              if (confirmed) deleteNote(path);
            }}
          />
        </ScrollArea>
      </div>

      {/* Switch vault en bas */}
      <div className="border-t border-app-border/40 px-3 py-2 flex items-center justify-between gap-2 text-[11px] bg-app-surface">
        <span className="text-app-fg-muted truncate">Changer de vault</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] border-app-border/40"
          onClick={openVault}
          disabled={isOpeningVault}
        >
          {isOpeningVault ? "..." : "Ouvrir"}
        </Button>
      </div>
    </div>
  );
}
