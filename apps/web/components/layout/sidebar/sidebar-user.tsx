import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/use-auth';

export function SidebarUser() {
  const { user, logout } = useAuth();
  const initial = (user?.displayName || user?.email || 'N').charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between rounded-lg border border-sidebar-border/70 bg-sidebar/70 px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          {initial}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{user?.displayName ?? 'Utilisateur'}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? 'Non connecté'}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Se déconnecter"
        className="text-muted-foreground hover:text-foreground"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
