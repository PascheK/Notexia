import type React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

import type { FsNode } from "@/lib/explorer/tree";
import { explorerIdFromPath, type ExplorerDndItem } from "@/lib/explorer/dnd-model";

type NodeItemProps = {
  node: FsNode;
  depth: number;
  expandedPaths: Set<string>;
  forceExpanded: boolean;
  selectedPath?: string | null;
  searchTerm: string;
  editingPath: string | null;
  renameDraft: string;
  onRenameDraftChange: (value: string) => void;
  onToggleExpand: (path: string) => void;
  onSelect: (node: FsNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FsNode) => void;
  onSubmitRename: (path: string, value: string, currentName: string) => void;
  onCancelRename: () => void;
};

const parseTimestamp = (value?: string | null): Date | null => {
  if (!value) return null;
  if (/^\d+$/.test(value)) {
    const num = Number(value);
    if (!Number.isNaN(num)) return new Date(num * 1000);
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const formatDateLabel = (value?: string | null): string => {
  const date = parseTimestamp(value);
  if (!date) return "Inconnue";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const highlight = (text: string, term: string) => {
  const query = term.trim();
  if (!query) return text;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-app-accent-soft text-app-fg px-0.5 rounded-sm">
        {match}
      </mark>
      {after}
    </>
  );
};

export function ExplorerNodeItem({
  node,
  depth,
  expandedPaths,
  forceExpanded,
  selectedPath,
  searchTerm,
  editingPath,
  renameDraft,
  onRenameDraftChange,
  onToggleExpand,
  onSelect,
  onContextMenu,
  onSubmitRename,
  onCancelRename,
}: NodeItemProps) {
  const isExpanded = forceExpanded || expandedPaths.has(node.path);
  const hasChildren = Boolean(node.children?.length);
  const isActive = selectedPath === node.path;
  const isEditing = editingPath === node.path;
  const createdLabel = node.created
    ? formatDateLabel(node.created)
    : "Inconnue";
  const modifiedLabel = node.modified
    ? formatDateLabel(node.modified)
    : "Inconnue";
  const tooltipText = `Nom : ${node.name}\nCréé le ${createdLabel}\nModifié le ${modifiedLabel}`;

  // DnD: make all nodes draggable
  const draggable = useDraggable({
    id: explorerIdFromPath(node.path),
    data: {
      type: node.isDir ? "folder" : "file",
      path: node.path,
      relPath: node.relPath || node.name,
    } satisfies ExplorerDndItem,
  });

  // DnD: make folders droppable
  const droppable = useDroppable({
    id: explorerIdFromPath(node.path),
    data: node.isDir ? ({
      type: "folder",
      path: node.path,
      relPath: node.relPath || node.name,
    } satisfies ExplorerDndItem) : undefined,
    disabled: !node.isDir,
  });

  const isDragging = draggable.isDragging;
  const isOverDrop = droppable.isOver;
  const transform = draggable.transform;
  
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    if (node.isDir) {
      onToggleExpand(node.path);
    } else {
      onSelect(node);
    }
  };

  const paddingLeft = 10 + depth * 14;
  
  // Merge refs if both draggable and droppable
  const setNodeRef = (el: HTMLElement | null) => {
    draggable.setNodeRef(el);
    if (node.isDir) {
      droppable.setNodeRef(el);
    }
  };

  return (
    <div style={style}>
      <div
        ref={setNodeRef}
        {...draggable.attributes}
        {...draggable.listeners}
        role="button"
        tabIndex={0}
        data-fs-node="true"
        data-path={node.path}
        className={[
          "group flex flex-row items-center justify-between gap-2 py-1.5 pr-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-app-accent-soft/60 text-app-fg border border-app-border/50"
            : "text-app-fg-muted hover:bg-app-surface-alt hover:text-app-fg",
          isOverDrop && node.isDir && "bg-app-accent/10 border border-app-accent/40",
        ].join(" ")}
        style={{ paddingLeft }}
        onContextMenu={(e) => onContextMenu(e, node)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        title={tooltipText}
      >
        <div className="group flex flex-row items-center gap-2 py-1.5 pr-2 rounded-md text-sm transition-colors">
          {node.isDir ? (
            <button
              type="button"
              aria-label={isExpanded ? "Replier" : "Déplier"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.path);
              }}
              className="h-5 w-5 inline-flex items-center justify-center rounded text-app-fg-muted hover:text-app-fg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="h-5 w-5 inline-flex items-center justify-center" />
          )}

          {node.isDir ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-app-fg-muted" />
            ) : (
              <Folder className="h-4 w-4 text-app-fg-muted" />
            )
          ) : (
            <FileText className="h-4 w-4 text-app-fg-muted" />
          )}

          <div className="flex-1 min-w-0 max-w-[220px]">
            {isEditing ? (
              <Input
                autoFocus
                value={renameDraft}
                onChange={(e) => onRenameDraftChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmitRename(node.path, renameDraft, node.name);
                  }
                  if (e.key === "Escape") {
                    onCancelRename();
                  }
                }}
                onBlur={() => onSubmitRename(node.path, renameDraft, node.name)}
                className="h-7 text-xs bg-app-surface border-app-border text-app-fg w-full"
              />
            ) : (
              <span className="truncate" title={node.name}>
                {highlight(node.name, searchTerm)}
              </span>
            )}
          </div>
        </div>
        {node.modified && (
          <span className="text-[10px] text-app-fg-muted/80 hidden lg:inline-block justify-self-end">
            {formatDateLabel(node.modified)}
          </span>
        )}
      </div>

      {node.isDir && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <ExplorerNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              forceExpanded={forceExpanded}
              selectedPath={selectedPath}
              searchTerm={searchTerm}
              editingPath={editingPath}
              renameDraft={renameDraft}
              onRenameDraftChange={onRenameDraftChange}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              onSubmitRename={onSubmitRename}
              onCancelRename={onCancelRename}
            />
          ))}
        </div>
      )}
    </div>
  );
}
