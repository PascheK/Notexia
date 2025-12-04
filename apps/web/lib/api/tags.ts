// apps/web/src/lib/api/tags.ts

import { apiFetch } from './client';
import type { Tag } from '../types/api';

export async function getTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/tags');
}