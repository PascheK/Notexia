import type { FsEntry } from "@/platform/tauri/fs-adapter";

export type SortOrder = "asc" | "desc";

export type FsNode = {
  name: string;
  path: string;
  relPath: string;
  isDir: boolean;
  created?: string | null;
  modified?: string | null;
  children?: FsNode[];
};

const normalizeParts = (path: string) =>
  path
    .split(/[/\\]/)
    .map((p) => p.trim())
    .filter(Boolean);

export function buildFsTree(entries: FsEntry[], sortOrder: SortOrder): FsNode[] {
  const root: Record<string, any> = {};

  for (const entry of entries) {
    const parts = normalizeParts(entry.rel_path);
    if (!parts.length) continue;

    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = index === parts.length - 1;

      if (!currentLevel[currentPath]) {
        currentLevel[currentPath] = {
          name: part,
          relPath: currentPath,
          path: isLeaf ? entry.path : "",
          isDir: isLeaf ? entry.is_dir : true,
          created: isLeaf ? entry.created : undefined,
          modified: isLeaf ? entry.modified : undefined,
          children: {}
        };
      }

      if (isLeaf) {
        currentLevel[currentPath].path = entry.path;
        currentLevel[currentPath].relPath = currentPath;
        currentLevel[currentPath].isDir = entry.is_dir;
        currentLevel[currentPath].created = entry.created;
        currentLevel[currentPath].modified = entry.modified;
      }

      if (!isLeaf) {
        currentLevel = currentLevel[currentPath].children;
      } else if (entry.is_dir) {
        currentLevel[currentPath].children ??= {};
      }
    });
  }

  const toArray = (map: Record<string, any>): FsNode[] =>
    Object.values(map)
      .map((node: any) => ({
        name: node.name,
        path: node.path,
        relPath: node.relPath,
        isDir: node.isDir,
        created: node.created,
        modified: node.modified,
        children: node.children ? toArray(node.children) : undefined
      }))
      .sort(
        (a: FsNode, b: FsNode) =>
          Number(b.isDir) - Number(a.isDir) ||
          (sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name))
      );

  return toArray(root);
}

export function filterTree(nodes: FsNode[], term: string): FsNode[] {
  const query = term.trim().toLowerCase();
  if (!query) return nodes;

  return nodes.reduce<FsNode[]>((acc, node) => {
    const children = node.children ? filterTree(node.children, term) : undefined;
    if (node.name.toLowerCase().includes(query) || (children && children.length)) {
      acc.push({ ...node, children });
    }
    return acc;
  }, []);
}

export function collectDirPaths(nodes: FsNode[]): string[] {
  const acc: string[] = [];
  const walk = (list: FsNode[]) => {
    for (const node of list) {
      if (node.isDir) {
        acc.push(node.path);
        if (node.children) walk(node.children);
      }
    }
  };
  walk(nodes);
  return acc;
}

export function extractBaseName(path: string): string {
  const parts = normalizeParts(path);
  return parts[parts.length - 1] ?? path;
}
