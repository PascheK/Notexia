const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--nx-background)",
        foreground: "var(--nx-foreground)",
        border: "var(--nx-border)",
        card: {
          DEFAULT: "var(--nx-sidebar-bg)",
          foreground: "var(--nx-foreground)",
        },
        popover: {
          DEFAULT: "var(--nx-sidebar-bg)",
          foreground: "var(--nx-foreground)",
        },
        input: "var(--nx-border)",
        muted: {
          DEFAULT: "var(--nx-muted)",
          foreground: "var(--nx-muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--nx-primary)",
          foreground: "var(--nx-primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--nx-accent)",
          foreground: "var(--nx-accent-foreground)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#0b1220",
        },
        sidebar: {
          DEFAULT: "var(--nx-sidebar-bg)",
          border: "var(--nx-sidebar-border)",
        },
        editor: "var(--nx-editor-bg)",
        ring: "var(--nx-primary)",
      },
      borderRadius: {
        lg: "var(--nx-radius-lg)",
        md: "var(--nx-radius)",
        sm: "calc(var(--nx-radius) - 2px)",
        xl: "var(--nx-radius-xl)",
      },
      fontFamily: {
        sans: ['var(--nx-font-body)', ...fontFamily.sans],
        mono: ['var(--nx-font-mono)', ...fontFamily.mono],
      },
    },
  },
  plugins: [],
};
