'use client';

import Link from 'next/link';
import { CircleUserRound, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { PaneProvider } from './pane-layout/pane-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <PaneProvider>
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(124,58,237,0.08),transparent_25%),radial-gradient(circle_at_90%_20%,rgba(56,189,248,0.06),transparent_30%)]"
          aria-hidden
        />
        <header className="relative z-10 flex h-14 items-center justify-between border-b border-border/70 bg-background/70 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
              NX
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Notexia</p>
              <p className="text-xs text-muted-foreground">Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/app/notes">Notes</Link>
            </Button>
            <Button variant="secondary" size="sm" className="hidden items-center gap-2 sm:flex">
              <Sparkles className="h-4 w-4" aria-hidden />
              Mode focus
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
                  <CircleUserRound className="h-5 w-5" aria-hidden />
                  <span className="hidden text-sm sm:inline">
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel>Compte</DropdownMenuLabel>
                {user?.email && (
                  <DropdownMenuItem className="text-muted-foreground" disabled>
                    {user.email}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-400 hover:text-red-50">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="relative z-10 flex-1 overflow-hidden">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </PaneProvider>
  );
}
