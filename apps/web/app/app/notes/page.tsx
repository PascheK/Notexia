"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PaneLayout } from '@/components/layout/pane-layout/pane-layout';
import { Sidebar } from '@/components/layout/sidebar/sidebar';
import { NoteList } from '@/components/notes/note-list';
import { NoteEditor } from '@/components/notes/note-editor';
import { usePaneLayout } from '@/components/layout/pane-layout/pane-context';
import {
  createNote,
  listNotes,
  listVaults,
  NoteModel,
  updateNote,
  Vault,
} from '@/lib/notes-repository';
import { NoteSaveState } from '@/components/notes/note-toolbar';

function NotesPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<NoteSaveState>('idle');
  const { layout, setPaneVisibility } = usePaneLayout();
  const searchParams = useSearchParams();

  useEffect(() => {
    listVaults()
      .then((items) => {
        setVaults(items);
        setSelectedVaultId((prev) => prev ?? items[0]?.id ?? null);
      })
      .catch(console.error);
  }, []);

  const fetchNotes = useCallback(async () => {
    if (!selectedVaultId) {
      setNotes([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedNotes = await listNotes(selectedVaultId);
      setNotes(fetchedNotes);
      setSelectedId((prev) => {
        if (prev && fetchedNotes.some((n) => n.id === prev)) return prev;
        return fetchedNotes[0]?.id ?? null;
      });
      setSaveState('idle');
    } finally {
      setLoading(false);
    }
  }, [selectedVaultId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const pinnedOnly = searchParams?.get('pinned') === '1';
  const statusFilter = searchParams?.get('status');

  const visibleNotes = useMemo(() => {
    let scoped = notes;
    if (statusFilter === 'TRASHED') {
      scoped = scoped.filter((note) => note.status === 'TRASHED');
    } else {
      scoped = scoped.filter((note) => note.status !== 'TRASHED');
    }
    if (pinnedOnly) {
      scoped = scoped.filter((note) => note.isPinned);
    }
    return scoped;
  }, [notes, pinnedOnly, statusFilter]);

  const selectedNote = useMemo(
    () => visibleNotes.find((n) => n.id === selectedId) || null,
    [visibleNotes, selectedId],
  );

  const activeVault = useMemo(
    () => vaults.find((vault) => vault.id === selectedVaultId) ?? null,
    [selectedVaultId, vaults],
  );

  useEffect(() => {
    if (visibleNotes.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !visibleNotes.some((n) => n.id === selectedId)) {
      setSelectedId(visibleNotes[0].id);
    }
  }, [selectedId, visibleNotes]);

  const toggleEditor = () => {
    const editorPane = layout.panes.find((p) => p.id === 'noteEditor');
    setPaneVisibility('noteEditor', !(editorPane?.visible ?? true));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSaveState('idle');
    setPaneVisibility('noteEditor', true);
  };

  const handleSave = async (patch: Partial<NoteModel>) => {
    if (!selectedId) return;
    setSaveState('saving');
    const updated = await updateNote(selectedId, patch);
    const refreshed = await listNotes(selectedVaultId ?? undefined);
    setNotes(refreshed);
    setSelectedId(updated.id);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1200);
  };

  const handleCreate = async () => {
    const targetVault = selectedVaultId ?? vaults[0]?.id;
    if (!targetVault) return;
    const newNote = await createNote({ vaultId: targetVault, title: 'Nouvelle note' });
    const refreshed = await listNotes(targetVault);
    setNotes(refreshed);
    setSelectedId(newNote.id);
    setPaneVisibility('noteEditor', true);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 800);
  };

  const handleEdit = () => {
    setSaveState((current) => (current === 'saving' ? 'saving' : 'dirty'));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-surface/80 px-3 py-2 shadow-sm shadow-black/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Précédent">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Suivant">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <Tabs defaultValue="release" className="ml-2">
            <TabsList className="bg-surface-muted/80">
              <TabsTrigger value="release">Release Notes</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Rechercher">
            <Search className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="outline" size="sm" onClick={fetchNotes}>
            Rafraîchir
          </Button>
          <Button variant="default" size="sm" onClick={handleCreate}>
            Nouvelle note
          </Button>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">Bloc-notes</p>
          <p className="text-sm text-muted-foreground">
            Mode Obsidian, palette SaaS : vos notes, vos idées.
          </p>
          {activeVault && (
            <div className="mt-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Vault : {activeVault.name}
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.75)]">
        <PaneLayout
          panes={[
            {
              id: 'sidebar',
              node: (
                <Sidebar
                  vaults={vaults}
                  selectedVaultId={selectedVaultId}
                  onSelectVault={setSelectedVaultId}
                />
              ),
            },
            {
              id: 'notesList',
              node: (
                <NoteList
                  notes={visibleNotes}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              ),
            },
            {
              id: 'noteEditor',
              node: (
                <NoteEditor
                  note={selectedNote}
                  status={saveState}
                  onSave={handleSave}
                  onEdit={handleEdit}
                  onToggleEditor={toggleEditor}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
export default NotesPage;
