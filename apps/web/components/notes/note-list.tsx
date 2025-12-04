import { ScrollArea } from '@/components/ui/scroll-area';
import { NoteModel } from '@/lib/notes-repository';
import { NoteListItem } from './note-list-item';

interface Props {
  notes: NoteModel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ notes, selectedId, onSelect }: Props) {
  return (
    <div className="flex h-full flex-col border-r border-border/60 bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground/90">Notes</p>
          <p className="text-xs text-muted-foreground">{notes.length} entrées</p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/60">
          {notes.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">Aucune note pour le moment.</div>
          ) : (
            notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                active={note.id === selectedId}
                onSelect={() => onSelect(note.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
