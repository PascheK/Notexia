"use client";

import { useEffect, useRef } from 'react';
import { defaultTheme } from '@/config/ui-theme';
import { PaneId } from '@/lib/utils/layout';
import { usePaneLayout } from './pane-context';

interface Props {
  leftId: PaneId;
  rightId: PaneId;
}

export function PaneResizer({ leftId, rightId }: Props) {
  const { layout, setPaneWidth } = usePaneLayout();
  const isDragging = useRef(false);

  const fallbackMinWidth: Record<PaneId, number> = {
    sidebar: 220,
    notesList: defaultTheme.layout.notesPaneMinWidth,
    noteEditor: defaultTheme.layout.editorPaneMinWidth,
  };

  const getMinWidth = (paneId: PaneId) => {
    if (typeof window === 'undefined') return fallbackMinWidth[paneId];
    const root = getComputedStyle(document.documentElement);
    const variable =
      paneId === 'notesList'
        ? root.getPropertyValue('--nx-notes-pane-min-width')
        : paneId === 'noteEditor'
          ? root.getPropertyValue('--nx-editor-pane-min-width')
          : '';
    const parsed = parseInt(variable, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    return fallbackMinWidth[paneId];
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const totalWidth = window.innerWidth;
      const delta = e.movementX;
      const leftPane = layout.panes.find((p) => p.id === leftId);
      const rightPane = layout.panes.find((p) => p.id === rightId);
      if (!leftPane || !rightPane) return;
      const leftPx = (leftPane.width / 100) * totalWidth + delta;
      const rightPx = (rightPane.width / 100) * totalWidth - delta;
      const minLeft = getMinWidth(leftId);
      const minRight = getMinWidth(rightId);
      if (leftPx < minLeft || rightPx < minRight) return;
      const newLeft = (leftPx / totalWidth) * 100;
      const newRight = (rightPx / totalWidth) * 100;
      setPaneWidth(leftId, newLeft);
      setPaneWidth(rightId, newRight);
    };
    const onUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [leftId, rightId, layout, setPaneWidth]);

  return (
    <div
      className="relative w-1.5 cursor-col-resize bg-border/70 transition-colors hover:bg-primary/50"
      onMouseDown={() => {
        isDragging.current = true;
      }}
    >
      <span className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 rounded-full bg-border/90" />
    </div>
  );
}
