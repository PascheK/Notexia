import { useMemo, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  LocateFixed
} from "lucide-react";

export type NoteTreeNode = {
  type: "file" | "folder";
  name: string;
  path: string;
  children?: NoteTreeNode[];
  modified?: string;
  created?: string;
};

export type NotesExplorerProps = {
  tree: NoteTreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void | Promise<void>;

  onRename?: (path: string, currentName: string, type: "file" | "folder") => void;
  onDelete?: (path: string, type: "file" | "folder") => void;

  onCreateNote?: (parentFolderPath: string | null) => void;
  onCreateFolder?: (parentFolderPath: string | null) => void;

  onRevealCurrent?: () => void;
  onCopyPath?: (path: string) => void;
  onMove?: (sourcePath: string, targetPath: string) => void;
};

export function NotesExplorer({
  tree,
  selectedPath,
  onSelect,
  onRename,
  onDelete,
  onCreateNote,
  onCreateFolder,
  onRevealCurrent,
  onCopyPath,
  onMove
}: NotesExplorerProps) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [draggingPath, setDraggingPath] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const isFolderOpen = (path: string) => openFolders.has(path);

  const handleDragStart = (path: string) => {
    if (!onMove) return;
    setDraggingPath(path);
  };

  const handleDragEnd = () => {
    setDraggingPath(null);
  };

  const handleDrop = (targetPath: string) => {
    if (!onMove || !draggingPath || draggingPath === targetPath) return;
    onMove(draggingPath, targetPath);
    setDraggingPath(null);
  };

  const renderNodes = (nodes: NoteTreeNode[], level: number) =>
    nodes.map((node) => (
      <NoteTreeNodeItem
        key={node.path}
        node={node}
        level={level}
        isOpen={node.type === "folder" ? isFolderOpen(node.path) : false}
        isActive={node.path === selectedPath}
        onToggle={() => toggleFolder(node.path)}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        onCreateNote={onCreateNote}
        onCreateFolder={onCreateFolder}
        onCopyPath={onCopyPath}
        onMove={onMove}
        draggingPath={draggingPath}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
      >
        {node.type === "folder" && node.children && isFolderOpen(node.path)
          ? renderNodes(node.children, level + 1)
          : null}
      </NoteTreeNodeItem>
    ));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col flex-1 min-h-0 h-full text-xs">
        <NotesExplorerToolbar
          onCreateNote={onCreateNote}
          onCreateFolder={onCreateFolder}
          onRevealCurrent={onRevealCurrent}
        />
        <div className="mt-2 flex-1 min-h-0 overflow-auto space-y-1">
          {tree.length ? (
            renderNodes(tree, 0)
          ) : (
            <div className="text-app-fg-muted px-2 py-3">
              Aucun fichier. Crée une note ou un dossier pour commencer.
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

type NotesExplorerToolbarProps = {
  onCreateNote?: (parent: string | null) => void;
  onCreateFolder?: (parent: string | null) => void;
  onRevealCurrent?: () => void;
};

function NotesExplorerToolbar({
  onCreateNote,
  onCreateFolder,
  onRevealCurrent
}: NotesExplorerToolbarProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="text-[11px] uppercase tracking-[0.08em] text-app-fg-muted">
        Notes
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-app-fg-muted hover:text-app-fg"
              onClick={(e) => {
                e.stopPropagation();
                onCreateNote?.(null);
              }}
            >
              <FilePlus2 className="h-4 w-4" />
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
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder?.(null);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onRevealCurrent?.();
              }}
            >
              <LocateFixed className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-révéler le fichier actuel</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

type NoteTreeNodeItemProps = {
  node: NoteTreeNode;
  level: number;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
  onSelect: (path: string) => void | Promise<void>;
  onRename?: (path: string, currentName: string, type: "file" | "folder") => void;
  onDelete?: (path: string, type: "file" | "folder") => void;
  onCreateNote?: (parent: string | null) => void;
  onCreateFolder?: (parent: string | null) => void;
  onCopyPath?: (path: string) => void;
  onMove?: (sourcePath: string, targetPath: string) => void;
  draggingPath: string | null;
  onDragStart: (path: string) => void;
  onDragEnd: () => void;
  onDrop: (targetPath: string) => void;
  children?: React.ReactNode;
};

function NoteTreeNodeItem({
  node,
  level,
  isOpen,
  isActive,
  onToggle,
  onSelect,
  onRename,
  onDelete,
  onCreateNote,
  onCreateFolder,
  onCopyPath,
  onMove,
  draggingPath,
  onDragStart,
  onDragEnd,
  onDrop,
  children
}: NoteTreeNodeItemProps) {
  const isFolder = node.type === "folder";
  const paddingLeft = 8 + level * 12;
  const dateLabel = useMemo(
    () => node.created ?? node.modified ?? "Date inconnue",
    [node.created, node.modified]
  );

  const handleRowClick = () => {
    if (isFolder) {
      onToggle();
    } else {
      onSelect(node.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick();
    }
  };

  const row = (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      draggable={Boolean(onMove)}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(node.path);
      }}
      onDragOver={(e) => {
        if (onMove) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (onMove) {
          onDrop(node.path);
        }
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd();
      }}
      className={[
        "w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 outline-none",
        isActive
          ? "bg-app-surface border border-app-border/40 text-app-fg shadow-[var(--shadow-soft)]"
          : "text-app-fg-muted hover:bg-app-surface/50",
        draggingPath === node.path ? "opacity-70" : ""
      ].join(" ")}
      style={{ paddingLeft }}
    >
      <div
        className="flex items-center gap-2 flex-1 min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {isFolder ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="h-5 w-5 inline-flex items-center justify-center rounded text-app-fg-muted hover:text-app-fg"
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="h-5 w-5 inline-flex items-center justify-center" />
        )}

        {isFolder ? (
          isOpen ? (
            <FolderOpen className="h-4 w-4 text-app-fg-muted" />
          ) : (
            <Folder className="h-4 w-4 text-app-fg-muted" />
          )
        ) : (
          <FileText className="h-4 w-4 text-app-fg-muted" />
        )}

        <div className="truncate text-app-fg">{node.name}</div>
      </div>
    </div>
  );

  return (
    <ContextMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1 text-[11px] leading-snug text-app-fg">
            <div className="font-semibold truncate">{node.name}</div>
            <div className="text-app-fg-muted">{dateLabel}</div>
            <div className="text-app-fg-muted break-all">{node.path}</div>
          </div>
        </TooltipContent>
      </Tooltip>

      <ContextMenuContent className="w-56">
        {!isFolder && (
          <ContextMenuItem onSelect={() => onSelect(node.path)}>Ouvrir</ContextMenuItem>
        )}
        {isFolder && (
          <ContextMenuItem onSelect={onToggle}>
            {isOpen ? "Replier" : "Déplier"}
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem onSelect={() => onRename(node.path, node.name, node.type)}>
            Renommer
          </ContextMenuItem>
        )}
        {onCopyPath && (
          <ContextMenuItem onSelect={() => onCopyPath(node.path)}>
            Copier le chemin
          </ContextMenuItem>
        )}
        {isFolder && (onCreateNote || onCreateFolder) && (
          <>
            <ContextMenuSeparator />
            {onCreateNote && (
              <ContextMenuItem onSelect={() => onCreateNote(node.path)}>
                Nouvelle note ici
              </ContextMenuItem>
            )}
            {onCreateFolder && (
              <ContextMenuItem onSelect={() => onCreateFolder(node.path)}>
                Nouveau dossier ici
              </ContextMenuItem>
            )}
          </>
        )}
        {(onRename || onCopyPath || isFolder) && <ContextMenuSeparator />}
        {onDelete && (
          <ContextMenuItem
            onSelect={() => onDelete(node.path, node.type)}
            className="text-destructive focus:text-destructive"
          >
            Supprimer
          </ContextMenuItem>
        )}
      </ContextMenuContent>

      {children}
    </ContextMenu>
  );
}
