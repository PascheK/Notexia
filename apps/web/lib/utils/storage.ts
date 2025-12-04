const LAYOUT_KEY = 'notexia_layout_v1';
const TOKEN_KEY = 'notexia_token';

export const storage = {
  loadLayout: <T>() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  saveLayout: <T>(state: T) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(state));
  },
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};
