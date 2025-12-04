"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { defaultPaneLayout, PaneId, PaneLayoutState } from '@/lib/utils/layout';
import { storage } from '@/lib/utils/storage';

interface PaneContextValue {
  layout: PaneLayoutState;
  setPaneVisibility: (id: PaneId, visible: boolean) => void;
  setPaneWidth: (id: PaneId, width: number) => void;
}

const PaneContext = createContext<PaneContextValue | undefined>(undefined);

export function PaneProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<PaneLayoutState>(defaultPaneLayout);

  useEffect(() => {
    const saved = storage.loadLayout<PaneLayoutState>();
    if (saved) setLayout(saved);
  }, []);

  useEffect(() => {
    storage.saveLayout(layout);
  }, [layout]);

  const setPaneVisibility = useCallback((id: PaneId, visible: boolean) => {
    setLayout((prev) => ({
      panes: prev.panes.map((p) => (p.id === id ? { ...p, visible } : p)),
    }));
  }, []);

  const setPaneWidth = useCallback((id: PaneId, width: number) => {
    setLayout((prev) => ({
      panes: prev.panes.map((p) => (p.id === id ? { ...p, width } : p)),
    }));
  }, []);

  return (
    <PaneContext.Provider value={{ layout, setPaneVisibility, setPaneWidth }}>
      {children}
    </PaneContext.Provider>
  );
}

export const usePaneLayout = () => {
  const ctx = useContext(PaneContext);
  if (!ctx) throw new Error('usePaneLayout must be used within PaneProvider');
  return ctx;
};
