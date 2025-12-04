"use client";

import { useMemo, useState } from 'react';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Vault } from '@/lib/notes-repository';

interface Props {
  vaults: Vault[];
  selectedVaultId: string | null;
  onSelectVault: (id: string) => void;
}

export function SidebarVaults({ vaults, selectedVaultId, onSelectVault }: Props) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const sortedVaults = useMemo(
    () => [...vaults].sort((a, b) => a.name.localeCompare(b.name)),
    [vaults],
  );

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
    onSelectVault(id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Vaults</span>
        <span className="text-[10px] text-muted-foreground/80">{vaults.length}</span>
      </div>
      <div className="space-y-1">
        {vaults.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun vault mocké pour le moment.</p>
        )}
        {sortedVaults.map((vault) => {
          const active = vault.id === selectedVaultId;
          const isOpen = openMap[vault.id] ?? true;
          return (
            <div key={vault.id} className="space-y-1 rounded-md">
              <button
                type="button"
                onClick={() => toggle(vault.id)}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-surface-muted/70 text-foreground ring-1 ring-primary/30'
                    : 'text-muted-foreground hover:bg-muted/50',
                )}
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isOpen && 'rotate-90 text-foreground',
                  )}
                  aria-hidden
                />
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold"
                  style={{
                    backgroundColor: vault.color ? `${vault.color}1a` : 'var(--nx-muted)',
                    color: vault.color ?? 'var(--nx-foreground)',
                  }}
                >
                  {vault.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate font-semibold">{vault.name}</span>
                  {vault.description && (
                    <span className="truncate text-xs text-muted-foreground">{vault.description}</span>
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="space-y-1 pl-9">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/50',
                      active && 'text-foreground',
                    )}
                    onClick={() => onSelectVault(vault.id)}
                  >
                    <Folder className="h-4 w-4 text-primary/80" aria-hidden />
                    Toutes les notes
                  </Button>
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/80">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    Notes listées dans la colonne centrale
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
