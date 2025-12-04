import { useEffect, useState } from 'react';
import { FolderIcon } from 'lucide-react';
import { getFoldersTree } from '@/lib/api/folders';
import { Folder } from '@/lib/types/api';

export function SidebarFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    getFoldersTree().then(setFolders).catch(console.error);
  }, []);

  const renderTree = (nodes: Folder[], depth = 0) =>
    nodes.map((folder) => (
      <div key={folder.id} className="space-y-1">
        <div
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-foreground/90 transition hover:bg-muted/40"
          style={{ paddingLeft: depth * 12 }}
        >
          <FolderIcon className="h-4 w-4 text-primary/80" aria-hidden />
          <span className="truncate">{folder.name}</span>
        </div>
        {folder.children && folder.children.length > 0 && renderTree(folder.children, depth + 1)}
      </div>
    ));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Dossiers</span>
        <span className="text-[10px] text-muted-foreground/80">{folders.length}</span>
      </div>
      <div className="space-y-1 text-sm">{renderTree(folders)}</div>
    </div>
  );
}
