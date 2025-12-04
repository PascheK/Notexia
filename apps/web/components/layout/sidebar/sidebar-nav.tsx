import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FileText, Pin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const links = [
  { key: 'all', href: '/app/notes', label: 'Toutes les notes', icon: FileText },
  { key: 'pinned', href: '/app/notes?pinned=1', label: 'Favoris', icon: Pin },
  { key: 'trash', href: '/app/notes?status=TRASHED', label: 'Corbeille', icon: Trash2 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPinned = searchParams?.get('pinned') === '1';
  const status = searchParams?.get('status');

  const isActive = (key: string, href: string) => {
    if (!pathname.startsWith('/app/')) return false;
    if (key === 'pinned') return pathname.startsWith('/app/notes') && isPinned;
    if (key === 'trash') return pathname.startsWith('/app/notes') && status === 'TRASHED';
    if (key === 'all') {
      return pathname.startsWith('/app/notes') && !isPinned && status !== 'TRASHED';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active = isActive(link.key, link.href);
        const Icon = link.icon;
        return (
          <Button
            key={link.href}
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-start gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-primary/30 bg-primary/10 text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60',
            )}
          >
            <Link href={link.href}>
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
