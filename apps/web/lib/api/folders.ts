// apps/web/src/lib/api/folders.ts

import { apiFetch } from './client';
import type { Folder } from '../types/api';

export async function getFoldersTree(): Promise<Folder[]> {
  return apiFetch<Folder[]>('/folders/tree');
}