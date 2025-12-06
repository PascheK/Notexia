import type { ReactNode } from "react";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  sideRail?: ReactNode;
  statusBar?: ReactNode;
  topBar?: ReactNode;
};

export function AppShell({
  children,
  sidebar,
  sideRail,
  statusBar,
  topBar
}: AppShellProps) {
  return (
    <div className="h-screen max-h-screen w-screen max-w-screen bg-app-bg text-app-fg flex overflow-hidden">
      {/* Rail latéral gauche */}
      <aside className="w-12 border-r border-app-border/60 bg-app-surface-alt flex flex-col items-center py-3 gap-3 transition-colors duration-150">
        {sideRail}
      </aside>

      {/* Colonne principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-11 border-b border-app-border/60 flex items-center px-3 text-xs text-app-fg-muted bg-app-surface/80 backdrop-blur-sm transition-colors duration-150">
          {topBar}
        </header>

        {/* Contenu + sidebar avec panneaux redimensionnables */}
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-0 min-w-0"
        >
          <ResizablePanel
            defaultSize={22}
            minSize={16}
            maxSize={30}
            className="border-r border-app-border bg-app-surface flex flex-col min-w-[200px] transition-colors duration-150"
          >
            {sidebar}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-app-border/40 hover:border-app-accent hover:bg-app-accent hover:border-1 transition-colors"
          />

          <ResizablePanel
            defaultSize={78}
            minSize={45}
            className="flex flex-col bg-app-surface-alt min-w-0"
          >
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Status bar */}
        <footer className="h-7 border-t border-app-border/60 bg-app-surface/90 text-[11px] text-app-fg-muted flex items-center px-3 justify-between transition-colors duration-150">
          {statusBar}
        </footer>
      </div>
    </div>
  );
}
