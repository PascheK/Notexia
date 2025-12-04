"use client";

import React from 'react';
import { PaneId } from '@/lib/utils/layout';
import { usePaneLayout } from './pane-context';
import { PaneResizer } from './pane-resizer';

interface PaneLayoutProps {
  panes: {
    id: string;
    node: React.ReactNode;
  }[];
}

export function PaneLayout({ panes }: PaneLayoutProps) {
  const { layout } = usePaneLayout();
  const visibleConfigs = layout.panes.filter((p) => p.visible);
  const elements = panes.filter((pane) =>
    visibleConfigs.some((cfg) => cfg.id === pane.id),
  );

  const minWidths: Record<PaneId, string> = {
    sidebar: '220px',
    notesList: 'var(--nx-notes-pane-min-width)',
    noteEditor: 'var(--nx-editor-pane-min-width)',
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-background/70 shadow-[0_1px_0_rgba(255,255,255,0.04),0_20px_50px_-28px_rgba(0,0,0,0.9)] backdrop-blur">
      {elements.map((pane, idx) => {
        const cfg = visibleConfigs.find((c) => c.id === pane.id)!;
        const style = { width: `${cfg.width}%`, minWidth: minWidths[cfg.id] };
        const isLast = idx === elements.length - 1;
        return (
          <div key={pane.id} className="flex h-full" style={style}>
            <div className="flex-1 h-full overflow-hidden">{pane.node}</div>
            {!isLast && (
              <PaneResizer leftId={cfg.id} rightId={visibleConfigs[idx + 1].id} />
            )}
          </div>
        );
      })}
    </div>
  );
}
