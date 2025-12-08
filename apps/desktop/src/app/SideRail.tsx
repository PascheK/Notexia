import { Command as CommandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SideRailNav } from "@/components/layout/SideRailNav";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";

export function SideRail() {
  const openPalette = useCommandPaletteStore((s) => s.open);

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      {/* Logo / app icon */}
      <div className="w-9 h-9 rounded-xl bg-app-surface/70 backdrop-blur-sm shadow-surface flex items-center justify-center text-sm font-semibold mb-2 text-app-fg">
        N
      </div>

      <div className="flex-1 w-full">
        <SideRailNav />
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2 pb-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Palette de commandes (Cmd/Ctrl + K)"
          className="h-9 w-9 rounded-lg text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt/60 transition-colors"
          onClick={openPalette}
        >
          <CommandIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
