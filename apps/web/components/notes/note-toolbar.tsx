import { MoreHorizontal, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';

export type NoteSaveState = 'idle' | 'saving' | 'saved' | 'dirty';

interface Props {
  status: NoteSaveState;
  onSave: () => void;
  onToggleEditor: () => void;
}

export function NoteToolbar({ status, onSave, onToggleEditor }: Props) {
  const statusConfig: Record<NoteSaveState, { label: string; className: string; dot: string }> = {
    idle: {
      label: 'Prêt',
      className: 'text-muted-foreground',
      dot: 'bg-muted-foreground/80',
    },
    dirty: {
      label: 'En cours…',
      className: 'text-sky-300',
      dot: 'bg-sky-400 animate-pulse',
    },
    saving: {
      label: 'Enregistrement…',
      className: 'text-amber-300',
      dot: 'bg-amber-300 animate-pulse',
    },
    saved: {
      label: 'Enregistré',
      className: 'text-emerald-300',
      dot: 'bg-emerald-400',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-surface/80 px-4 py-3 shadow-sm shadow-black/30 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold text-muted-foreground">Éditeur</div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs font-medium',
            currentStatus.className,
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', currentStatus.dot)} aria-hidden />
          {currentStatus.label}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="gap-2" type="button">
          <Sparkles className="h-4 w-4" aria-hidden />
          IA (bientôt)
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={onToggleEditor}>
          Masquer
        </Button>
        <Button
          variant="default"
          size="sm"
          type="button"
          onClick={onSave}
          disabled={status === 'saving'}
        >
          Enregistrer
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button" className="text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuItem disabled>Dupliquer (bientôt)</DropdownMenuItem>
            <DropdownMenuItem disabled>Exporter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
