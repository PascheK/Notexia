import { SidebarUser } from './sidebar-user';
import { SidebarNav } from './sidebar-nav';
import { SidebarVaults } from './sidebar-vaults';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Vault } from '@/lib/notes-repository';

interface Props {
  vaults: Vault[];
  selectedVaultId: string | null;
  onSelectVault: (vaultId: string) => void;
}

export function Sidebar({ vaults, selectedVaultId, onSelectVault }: Props) {
  return (
    <div className="flex h-full w-full flex-col border-r border-sidebar-border/80 bg-sidebar px-3 py-4 text-sm shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)]">
      <SidebarUser />
      <div className="mt-4">
        <SidebarNav />
      </div>
      <Separator className="my-3" />
      <ScrollArea className="flex-1 rounded-lg border border-sidebar-border/70 bg-sidebar/70 p-3 shadow-inner shadow-black/20">
        <div className="space-y-4">
          <SidebarVaults
            vaults={vaults}
            selectedVaultId={selectedVaultId}
            onSelectVault={onSelectVault}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
