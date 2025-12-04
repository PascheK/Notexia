export type NoteStatus = 'ACTIVE' | 'TRASHED';

export interface Vault {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface NoteModel {
  id: string;
  vaultId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: NoteStatus;
  isPinned?: boolean;
  tags?: string[];
}

interface RepositoryState {
  vaults: Vault[];
  notes: NoteModel[];
}

const STORAGE_KEY = 'notexia_mock_repo_v1';

const nowIso = () => new Date().toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const seedState: RepositoryState = {
  vaults: [
    {
      id: 'vault-personal',
      name: 'Personnel',
      description: 'Inbox, journal rapide, notes de vie',
      color: '#6366F1',
    },
    {
      id: 'vault-work',
      name: 'Travail',
      description: 'Projet Notexia + docs produit',
      color: '#22D3EE',
    },
    {
      id: 'vault-brain',
      name: 'Second cerveau',
      description: 'Références, bibliographie, idées longues',
      color: '#A855F7',
    },
  ],
  notes: [
    {
      id: 'note-inbox',
      vaultId: 'vault-personal',
      title: 'Inbox quotidienne',
      content:
        '# Inbox rapide\n\n- [ ] Faire le point sur la routine matinale\n- [ ] Lancer une note "Réflexion IA"\n- [ ] Synchroniser le carnet papier dans le vault perso\n\n## Captures\nQuelques pensées rapides à ranger plus tard.',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
      status: 'ACTIVE',
      isPinned: true,
      tags: ['daily', 'inbox'],
    },
    {
      id: 'note-structure',
      vaultId: 'vault-work',
      title: 'Structure produit Notexia',
      content:
        '# Structure produit\n\n- Vision : Obsidian-like léger, IA intégrée\n- P0 : layout 3 colonnes + vaults mockés\n- P1 : design system shadcn + thème\n- P2 : productivité (recherche, [[liens internes]])\n\n> Garder le focus sur la simplicité et le ressenti premium.',
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
      status: 'ACTIVE',
      isPinned: false,
      tags: ['product', 'roadmap'],
    },
    {
      id: 'note-reading',
      vaultId: 'vault-brain',
      title: 'Notes de lecture — Cal Newport',
      content:
        '# Notes de lecture\n\n- Profondeur > volume.\n- Organiser par projet actif plutôt que par thème abstrait.\n- Bloquer des créneaux focus quotidiens.\n\nAction : créer un modèle de note "Deep Work" dans le vault travail.',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(4),
      status: 'ACTIVE',
      tags: ['lecture', 'organisation'],
    },
  ],
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let memoryState: RepositoryState | null = null;

const persist = (state: RepositoryState) => {
  memoryState = state;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
};

const hydrate = (): RepositoryState => {
  if (memoryState) return memoryState;

  if (typeof window === 'undefined') {
    memoryState = clone(seedState);
    return memoryState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return persist(clone(seedState));
    }
    const parsed = JSON.parse(raw) as RepositoryState;
    memoryState = parsed;
    return parsed;
  } catch (err) {
    console.error('Unable to load notes repository, resetting to seed', err);
    return persist(clone(seedState));
  }
};

const sortByUpdated = (notes: NoteModel[]) =>
  [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `note-${Math.random().toString(36).slice(2, 10)}`;

export async function listVaults(): Promise<Vault[]> {
  const { vaults } = hydrate();
  return clone(vaults);
}

export async function listNotes(vaultId?: string): Promise<NoteModel[]> {
  const { notes } = hydrate();
  const scoped = vaultId ? notes.filter((note) => note.vaultId === vaultId) : notes;
  return sortByUpdated(scoped);
}

export async function getNote(id: string): Promise<NoteModel | null> {
  const { notes } = hydrate();
  const note = notes.find((n) => n.id === id) || null;
  return note ? clone(note) : null;
}

interface CreateNoteInput {
  vaultId: string;
  title?: string;
  content?: string;
}

export async function createNote(input: CreateNoteInput): Promise<NoteModel> {
  const state = hydrate();
  const timestamp = nowIso();
  const note: NoteModel = {
    id: randomId(),
    vaultId: input.vaultId,
    title: input.title?.trim() || 'Nouvelle note',
    content: input.content ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'ACTIVE',
    isPinned: false,
    tags: [],
  };

  const nextState: RepositoryState = {
    ...state,
    notes: sortByUpdated([note, ...state.notes]),
  };

  persist(nextState);
  return clone(note);
}

export async function updateNote(
  id: string,
  patch: Partial<Pick<NoteModel, 'title' | 'content' | 'status' | 'isPinned' | 'tags'>>,
): Promise<NoteModel> {
  const state = hydrate();
  const existing = state.notes.find((n) => n.id === id);
  if (!existing) {
    throw new Error('Note introuvable');
  }

  const timestamp = nowIso();
  const updated: NoteModel = {
    ...existing,
    ...patch,
    updatedAt: patch.title || patch.content ? timestamp : existing.updatedAt,
  };

  const updatedNotes = state.notes.map((n) => (n.id === id ? updated : n));

  const nextState: RepositoryState = {
    ...state,
    notes: sortByUpdated(updatedNotes),
  };

  persist(nextState);
  return clone(updated);
}

export async function resetRepository(): Promise<void> {
  persist(clone(seedState));
}
