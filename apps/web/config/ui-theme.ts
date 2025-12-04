export interface NotexiaThemeConfig {
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    accentWarm: string;
    accentInfo: string;
    border: string;
    muted: string;
    mutedForeground: string;
    surface: string;
    surfaceMuted: string;
    sidebarBg: string;
    sidebarBorder: string;
    editorBg: string;
  };
  radius: {
    base: string;
    lg: string;
    xl: string;
  };
  layout: {
    sidebarWidth: number; // en %
    notesPaneMinWidth: number;
    editorPaneMinWidth: number;
  };
  fontFamily: {
    body: string;
    mono: string;
  };
}

export const defaultTheme: NotexiaThemeConfig = {
  name: 'Notexia Dark',
  colors: {
    background: '#0b0f16',
    foreground: '#e5e7eb',
    primary: '#7c3aed',
    primaryForeground: '#0b0f16',
    accent: '#38bdf8',
    accentForeground: '#04121c',
    accentWarm: '#f59e0b',
    accentInfo: '#38bdf8',
    border: '#1f2937',
    muted: '#0f172a',
    mutedForeground: '#9ca3af',
    surface: '#111827',
    surfaceMuted: '#0f172a',
    sidebarBg: '#0a0e16',
    sidebarBorder: '#111827',
    editorBg: '#111827',
  },
  radius: {
    base: '8px',
    lg: '12px',
    xl: '18px',
  },
  layout: {
    sidebarWidth: 22,
    notesPaneMinWidth: 320,
    editorPaneMinWidth: 480,
  },
  fontFamily: {
    body: 'var(--font-geist-sans), "Inter", system-ui, -apple-system, sans-serif',
    mono: 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace',
  },
};

export function applyTheme(theme: NotexiaThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const set = (name: string, value: string) => {
    root.style.setProperty(name, value);
  };

  set('--nx-theme-name', theme.name);
  set('--nx-background', theme.colors.background);
  set('--nx-foreground', theme.colors.foreground);
  set('--nx-primary', theme.colors.primary);
  set('--nx-primary-foreground', theme.colors.primaryForeground);
  set('--nx-accent', theme.colors.accent);
  set('--nx-accent-foreground', theme.colors.accentForeground);
  set('--nx-accent-warm', theme.colors.accentWarm);
  set('--nx-accent-info', theme.colors.accentInfo);
  set('--nx-border', theme.colors.border);
  set('--nx-muted', theme.colors.muted);
  set('--nx-muted-foreground', theme.colors.mutedForeground);
  set('--nx-surface', theme.colors.surface);
  set('--nx-surface-muted', theme.colors.surfaceMuted);
  set('--nx-sidebar-bg', theme.colors.sidebarBg);
  set('--nx-sidebar-border', theme.colors.sidebarBorder);
  set('--nx-editor-bg', theme.colors.editorBg);

  set('--nx-radius', theme.radius.base);
  set('--nx-radius-lg', theme.radius.lg);
  set('--nx-radius-xl', theme.radius.xl);

  set('--nx-sidebar-width', `${theme.layout.sidebarWidth}%`);
  set('--nx-notes-pane-min-width', `${theme.layout.notesPaneMinWidth}px`);
  set('--nx-editor-pane-min-width', `${theme.layout.editorPaneMinWidth}px`);

  set('--nx-font-body', theme.fontFamily.body);
  set('--nx-font-mono', theme.fontFamily.mono);
}
