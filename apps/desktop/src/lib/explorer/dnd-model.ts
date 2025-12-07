export type ExplorerDndItemType = "file" | "folder";

export type ExplorerDndItem = {
  type: ExplorerDndItemType;
  path: string; // chemin absolu
  relPath: string; // chemin relatif au vault
};

// Id utilisé par dnd-kit pour les nodes de l'arbre
export function explorerIdFromPath(path: string): string {
  return `explorer:${path}`; // suffisamment unique dans un vault
}

// Id pour des zones spéciales
export const ROOT_DROP_ID = "explorer-root-drop";
export const EDITOR_CENTER_DROP_ID = "editor-center-drop";
export const EDITOR_RIGHT_DROP_ID = "editor-right-drop";
export const EDITOR_BOTTOM_DROP_ID = "editor-bottom-drop";
export const EDITOR_LEFT_DROP_ID = "editor-left-drop";
export const EDITOR_TOP_DROP_ID = "editor-top-drop";

export type EditorDropDisposition = "replace" | "split-right" | "split-down";

export type EditorDropZoneData = {
  disposition: EditorDropDisposition;
};
