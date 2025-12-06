export const theme = {
  radius: {
    base: 12,
    sm: 8,
    md: 10
  },
  colors: {
    background: "210 20% 98%",
    foreground: "222.2 47.4% 11.2%",
    primary: "222.2 47.4% 11.2%",
    primaryForeground: "210 40% 98%",
    sidebar: "220 14% 96%",
    sidebarForeground: "224 71% 4%"
  }
} as const;

export type ThemeConfig = typeof theme;
