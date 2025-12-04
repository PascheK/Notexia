'use client';

import { useEffect, useMemo, useState } from 'react';
import { NoteModel } from '@/lib/notes-repository';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { NoteToolbar, NoteSaveState } from './note-toolbar';
import { Badge } from '../ui/badge';

interface Props {
  note: NoteModel | null;
  status: NoteSaveState;
  onSave: (patch: Partial<NoteModel>) => Promise<void>;
  onEdit: () => void;
  onToggleEditor: () => void;
}

export function NoteEditor({ note, status, onSave, onEdit, onToggleEditor }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const tags = useMemo(() => note?.tags ?? [], [note?.tags]);
  const updatedLabel = note?.updatedAt
    ? new Date(note.updatedAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
  }, [note]);

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface/80 text-muted-foreground">
        <p className="text-sm">Sélectionnez un vault puis une note pour commencer.</p>
      </div>
    );
  }

  const handleSave = () => onSave({ title: title.trim(), content });

  return (
    <div className="flex h-full flex-col bg-background/60 backdrop-blur-sm">
      <NoteToolbar status={status} onSave={handleSave} onToggleEditor={onToggleEditor} />
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-xl border border-border/70 bg-surface/90 p-6 shadow-xl shadow-black/30">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                onEdit();
              }}
              placeholder="Titre de la note"
              className="h-12 border-border/80 bg-surface-muted/90 text-2xl font-semibold text-foreground shadow-inner shadow-black/20"
            />
            {updatedLabel && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Dernière mise à jour {updatedLabel}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-[11px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onEdit();
            }}
            rows={24}
            className="min-h-[520px] border-border/70 bg-surface-muted/80 text-base leading-relaxed shadow-inner shadow-black/20"
            placeholder="Contenu Markdown..."
          />
        </div>
      </div>
    </div>
  );
}
