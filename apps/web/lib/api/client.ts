// apps/web/src/lib/api/client.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('notexia_token');
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      // ignore
    }

    const error: ApiError = new Error(
      (details as any)?.message ?? `Request failed with status ${res.status}`,
    );
    error.status = res.status;
    error.details = details;

    // TODO: éventuellement gérer 401 (clear token + redirect)
    throw error;
  }

  if (res.status === 204) {
    // no content
    return undefined as T;
  }

  return (await res.json()) as T;
}