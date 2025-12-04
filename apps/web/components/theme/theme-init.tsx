'use client';

import { useEffect } from 'react';
import { applyTheme, defaultTheme } from '@/config/ui-theme';

export function ThemeInit() {
  useEffect(() => {
    applyTheme(defaultTheme);
  }, []);

  return null;
}
