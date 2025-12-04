import { Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { NoteModel } from '@/lib/notes-repository';

interface Props {
  note: NoteModel;
  active: boolean;
  onSelect: () => void;
}

export function NoteListItem({ note, active, onSelect }: Props) {
  const excerpt =
    note.content?.length > 0 ? note.content.slice(0, 140).replace(/\n/g, ' ') : 'Aucun contenu';
  const tags = note.tags?.slice(0, 3) ?? [];
  const updatedLabel = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : '';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group block w-full px-4 py-3 text-left transition',
        active
          ? 'border border-primary/40 bg-primary/10 shadow-sm shadow-primary/25'
          : 'border border-transparent hover:bg-surface-muted/60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-foreground">
              {note.title || 'Sans titre'}
            </div>
            {note.isPinned && <Pin className="h-3.5 w-3.5 text-primary" aria-hidden />}
          </div>
          {updatedLabel && (
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {updatedLabel}
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{excerpt}</div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="px-2 py-0.5 text-[11px]">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
