import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExplorerNodeItem } from "@/components/explorer/ExplorerNodeItem";
import { useVaultTree } from "@/hooks/explorer/useVaultTree";
import {
  collectDirPaths,
  filterTree,
  type FsNode,
  type SortOrder,
} from "@/lib/explorer/tree";
import { openNoteInLayout } from "@/lib/editor/actions";
import { useVaultStore } from "@/store/vaultStore";
import {
  ArrowUpDown,
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  Folder,
  FilePlus,
  FolderPlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { ROOT_DROP_ID } from "@/lib/explorer/dnd-model";

export function VaultExplorer() {
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const selectedPath = useEditorStore((state) => {
    const pane =
      state.layout.panes.find((p) => p.id === state.layout.activePaneId) ??
      state.layout.panes[0];
    if (!pane || !pane.activeTabId) return null;
    const tab = state.tabsById[pane.activeTabId];
    return tab?.path ?? null;
  });
  const createNote = useVaultStore((s) => s.createNote);
  const createFolder = useVaultStore((s) => s.createFolder);
  const renameEntry = useVaultStore((s) => s.renameNote);
  const deleteEntry = useVaultStore((s) => s.deleteEntry);
  const isOpeningVault = useVaultStore((s) => s.isOpeningVault);

  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { tree, isLoading, error, refresh } = useVaultTree(
    vaultPath,
    sortOrder
  );

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [contextTarget, setContextTarget] = useState<FsNode | null>(null);

  const visibleTree = useMemo(
    () => filterTree(tree, searchTerm),
    [tree, searchTerm]
  );
  const dirPaths = useMemo(() => collectDirPaths(tree), [tree]);
  const forceExpanded = Boolean(searchTerm);
  const busy = isOpeningVault || isLoading;

  useEffect(() => {
    if (!tree.length || expandedPaths.size > 0) return;
    const topLevel = tree.filter((n) => n.isDir && n.path).map((n) => n.path);
    if (topLevel.length) {
      setExpandedPaths(new Set());
    }
  }, [tree, expandedPaths.size]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleSelect = async (node: FsNode) => {
    if (node.isDir) {
      handleToggleExpand(node.path);
      return;
    }

    await openNoteInLayout(node.path, "replace");
  };

  const resolveParentDir = (target?: FsNode | null): string | null => {
    if (!vaultPath) return null;
    if (!target) return vaultPath;
    if (target.isDir) return target.path;
    const normalized = target.path.replace(/\\+/g, "/");
    const idx = normalized.lastIndexOf("/");
    if (idx === -1) return vaultPath;
    return normalized.slice(0, idx);
  };

  const handleCreateFile = async (target?: FsNode | null) => {
    const base = resolveParentDir(target);
    if (!base) return;
    await createNote(base);
  };

  const handleCreateFolder = async (target?: FsNode | null) => {
    const base = resolveParentDir(target);
    if (!base) return;
    const name = window.prompt("Nom du dossier");
    console.log(name);
    if (!name) return;
    await createFolder(base, name);
  };

  const handleSubmitRename = async (
    path: string,
    value: string,
    currentName: string
  ) => {
    const nextName = value.trim();
    if (!editingPath || editingPath !== path) return;

    if (!nextName) {
      setEditingPath(null);
      return;
    }

    if (nextName === currentName) {
      setEditingPath(null);
      return;
    }

    await renameEntry(path, nextName);
    setEditingPath(null);
    setRenameDraft("");
  };

  const handleDelete = async (node: FsNode) => {
    const confirmed = await window.confirm(
      node.isDir
        ? `Supprimer le dossier "${node.name}" et son contenu ?`
        : `Supprimer "${node.name}" ?`
    );
    if (!confirmed) return;
    await deleteEntry(node.path);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.delete(node.path);
      return next;
    });
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.warn("Clipboard unavailable", err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: FsNode | null) => {
    const target = e.target as HTMLElement | null;
    const isOnNode = Boolean(target?.closest("[data-fs-node]"));
    if (!node && isOnNode) return;
    setContextTarget(node);
  };

  const toggleAllExpanded = () => {
    if (!vaultPath) return;
    if (allExpanded) {
      setExpandedPaths(new Set());
      setAllExpanded(false);
    } else {
      setExpandedPaths(new Set(dirPaths));
      setAllExpanded(true);
    }
    console.log(vaultPath);
    console.log(allExpanded);
  };

  useEffect(() => {
    const shouldBeAllExpanded =
      dirPaths.length > 0 && expandedPaths.size >= dirPaths.length;
    setAllExpanded(shouldBeAllExpanded);
  }, [dirPaths.length, expandedPaths]);


  const contextNode = contextTarget;

  // DnD: root drop zone
  const rootDroppable = useDroppable({
    id: ROOT_DROP_ID,
    data: { type: "root" as const },
  });

  const emptyState = (
    <div className="text-sm text-app-fg-muted px-3 py-4">
      {searchTerm
        ? `Aucun résultat pour "${searchTerm}".`
        : vaultPath
          ? "Aucun fichier dans cet espace. Clic droit ici pour créer un fichier ou un dossier."
          : "Ouvre un vault pour afficher son contenu."}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full min-h-0 bg-app-surface text-xs border-r border-app-border/60">
        <div className="flex items-center justify-between gap-1 px-2 py-2 bg-app-surface-alt border-b border-app-border/60">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-app-fg-muted hover:text-app-fg"
                  onClick={() => void handleCreateFile()}
                  disabled={!vaultPath || busy}
                >
                  <FilePlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nouvelle note</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-app-fg-muted hover:text-app-fg"
                  onClick={() => void handleCreateFolder()}
                  disabled={!vaultPath || busy}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nouveau dossier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-app-fg-muted hover:text-app-fg"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  disabled={!vaultPath}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Trier (A-Z / Z-A)</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-app-fg-muted hover:text-app-fg"
                  onClick={toggleAllExpanded}
                  disabled={!vaultPath}
                >
                  {allExpanded ? (
                    <ChevronsUpDown className="h-4 w-4" />
                  ) : (
                    <ChevronsDownUp className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {allExpanded
                  ? "Replier toute l'arborescence"
                  : "Déplier toute l'arborescence"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="px-2 py-2 border-b border-app-border/60 bg-app-surface">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans cet espace..."
            className="h-9 text-xs bg-app-surface-alt border-app-border text-app-fg placeholder:text-app-fg-muted"
          />
        </div>

        <ContextMenu>
          <ContextMenuTrigger
            asChild
            onContextMenu={(e) =>
              handleContextMenu(e as React.MouseEvent, null)
            }
          >
            <div
              ref={rootDroppable.setNodeRef}
              className="flex-1 min-h-0 overflow-hidden relative"
              style={{
                backgroundColor: rootDroppable.isOver ? "rgba(110,86,207,0.08)" : undefined,
              }}
            >
              {busy && (
                <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-3 py-2 text-[11px] text-app-fg-muted bg-linear-to-b from-app-surface-alt/80 to-transparent pointer-events-none">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mise à jour…
                </div>
              )}

              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {visibleTree.length
                    ? visibleTree.map((node) => (
                        <ExplorerNodeItem
                          key={node.path}
                          node={node}
                          depth={0}
                          expandedPaths={expandedPaths}
                          forceExpanded={forceExpanded}
                          selectedPath={selectedPath}
                          searchTerm={searchTerm}
                          editingPath={editingPath}
                          renameDraft={renameDraft}
                          onRenameDraftChange={setRenameDraft}
                          onToggleExpand={handleToggleExpand}
                          onSelect={handleSelect}
                          onContextMenu={handleContextMenu}
                          onSubmitRename={handleSubmitRename}
                          onCancelRename={() => {
                            setEditingPath(null);
                            setRenameDraft("");
                          }}
                        />
                      ))
                    : emptyState}
                </div>
              </ScrollArea>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-56">
            {contextNode ? (
              <>
                {!contextNode.isDir && (
                  <ContextMenuItem
                    onSelect={() => void handleSelect(contextNode)}
                  >
                    <Check className="mr-2 h-3.5 w-3.5" />
                    Ouvrir
                  </ContextMenuItem>
                )}
                {contextNode.isDir && (
                  <ContextMenuItem
                    onSelect={() => handleToggleExpand(contextNode.path)}
                  >
                    <MoreHorizontal className="mr-2 h-3.5 w-3.5" />
                    {expandedPaths.has(contextNode.path)
                      ? "Replier"
                      : "Déplier"}
                  </ContextMenuItem>
                )}
                <ContextMenuItem
                  onSelect={() => {
                    setEditingPath(contextNode.path);
                    setRenameDraft(contextNode.name);
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Renommer
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => void handleCopy(contextNode.name)}
                >
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Copier le nom
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => void handleCopy(contextNode.path)}
                >
                  <Folder className="mr-2 h-3.5 w-3.5" />
                  Copier le chemin
                </ContextMenuItem>
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onSelect={() => void handleCreateFile(contextNode)}
                    disabled={!vaultPath}
                  >
                    <FilePlus className="mr-2 h-3.5 w-3.5" />
                    Nouvelle note ici
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => void handleCreateFolder(contextNode)}
                    disabled={!vaultPath}
                  >
                    <FolderPlus className="mr-2 h-3.5 w-3.5" />
                    Nouveau dossier ici
                  </ContextMenuItem>
                </>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => void handleDelete(contextNode)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Supprimer
                </ContextMenuItem>
              </>
            ) : (
              <>
                <ContextMenuItem
                  onSelect={() => void handleCreateFile()}
                  disabled={!vaultPath}
                >
                  <FilePlus className="mr-2 h-3.5 w-3.5" />
                  Nouveau fichier
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => void handleCreateFolder()}
                  disabled={!vaultPath}
                >
                  <FolderPlus className="mr-2 h-3.5 w-3.5" />
                  Nouveau dossier
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => void refresh()}
                  disabled={!vaultPath}
                >
                  <Loader2 className="mr-2 h-3.5 w-3.5" />
                  Rafraîchir
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {error && (
          <div className="px-3 py-2 text-[11px] text-destructive border-t border-app-border/60 bg-app-surface">
            {error}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
