// apps/web/src/lib/api/auth.ts

import { apiFetch } from './client';
import type { User } from '../types/api';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/users/me');
}