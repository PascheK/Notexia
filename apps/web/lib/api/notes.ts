// apps/web/lib/api/notes.ts

import { apiFetch } from './client';
import type { Note } from '../types/api';

export interface NotesQuery {
  search?: string;
  folderId?: string;
  status?: string;
  isPinned?: boolean;
  tagId?: string;
  page?: number;
  pageSize?: number;
}

export async function getNotes(query: NotesQuery = {}): Promise<Note[]> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });

  const qs = params.toString();
  const path = qs ? `/notes?${qs}` : '/notes';

  const res = await apiFetch<{ items: Note[] }>(path);
  return res.items; // ⬅️ on renvoie seulement le tableau de notes
}

export interface CreateNotePayload {
  title: string;
  content: string;
  folderId?: string | null;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  return apiFetch<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  folderId?: string | null;
  isPinned?: boolean;
  status?: string;
}

export async function updateNote(
  id: string,
  payload: UpdateNotePayload,
): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getNote(id: string): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`);
}

export async function deleteNote(id: string): Promise<void> {
  await apiFetch<void>(`/notes/${id}`, {
    method: 'DELETE',
  });
}

export async function addTagsToNote(
  noteId: string,
  tagIds: string[],
): Promise<Note> {
  return apiFetch<Note>(`/notes/${noteId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tagIds }),
  });
}

export async function removeTagFromNote(
  noteId: string,
  tagId: string,
): Promise<Note> {
  return apiFetch<Note>(`/notes/${noteId}/tags/${tagId}`, {
    method: 'DELETE',
  });
}