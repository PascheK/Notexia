import { useEffect, useMemo } from "react";

import { buildFsTree, type SortOrder, type FsNode } from "@/lib/explorer/tree";
import { useVaultStore } from "@/store/vaultStore";

export function useVaultTree(vaultPath: string | null, sortOrder: SortOrder): {
  tree: FsNode[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const entries = useVaultStore((s) => s.entries);
  const refreshVault = useVaultStore((s) => s.refreshVault);
  const isOpeningVault = useVaultStore((s) => s.isOpeningVault);
  const error = useVaultStore((s) => s.error);

  useEffect(() => {
    if (vaultPath) {
      void refreshVault();
    }
  }, [vaultPath, refreshVault]);

  const tree = useMemo(() => buildFsTree(entries, sortOrder), [entries, sortOrder]);

  return {
    tree,
    isLoading: isOpeningVault,
    error,
    refresh: refreshVault
  };
}
