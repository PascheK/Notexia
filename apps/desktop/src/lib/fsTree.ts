import type { FsEntry } from "@/platform/tauri/fs-adapter";

export type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

export function buildTree(entries: FsEntry[]): TreeNode[] {
  const root: Record<string, any> = {};

  for (const entry of entries) {
    const parts = entry.rel_path.split(/[/\\]/).filter(Boolean);
    if (parts.length === 0) continue;

    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = index === parts.length - 1;

      if (!currentLevel[currentPath]) {
        currentLevel[currentPath] = {
          name: part,
          path: isLeaf ? entry.path : "",
          isDir: isLeaf ? entry.is_dir : true,
          children: {}
        };
      }

      if (isLeaf) {
        currentLevel[currentPath].path = entry.path;
        currentLevel[currentPath].isDir = entry.is_dir;
      }

      if (!isLeaf) {
        currentLevel = currentLevel[currentPath].children;
      } else if (entry.is_dir) {
        currentLevel[currentPath].children ??= {};
      }
    });
  }

  function toArray(map: Record<string, any>): TreeNode[] {
    return Object.values(map)
      .map((node: any) => ({
        name: node.name,
        path: node.path,
        isDir: node.isDir,
        children: node.children ? toArray(node.children) : undefined
      }))
      .sort(
        (a: TreeNode, b: TreeNode) =>
          Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name)
      );
  }

  return toArray(root);
}

