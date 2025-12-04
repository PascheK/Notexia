export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
}

export interface NoteTag {
  tagId: string;
  noteId: string;
  tag?: Tag;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  format: 'MARKDOWN' | string;
  status: 'ACTIVE' | 'TRASHED' | string;
  isPinned: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: NoteTag[];
}
