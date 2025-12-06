import type { ElementType } from "react";

import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, PenSquare, Settings } from "lucide-react";

type SideRailItem = {
  label: string;
  icon: ElementType;
  active?: boolean;
};

const items: SideRailItem[] = [
  { label: "Notes", icon: FileText, active: true },
  { label: "Whiteboard", icon: PenSquare },
  { label: "Dashboard", icon: LayoutDashboard }
];

export function SideRail() {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Logo / app icon */}
      <div className="w-9 h-9 rounded-xl bg-app-surface/70 backdrop-blur-sm shadow-surface flex items-center justify-center text-sm font-semibold mb-2 text-app-fg">
        N
      </div>

      {/* Items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {items.map(({ label, icon: Icon, active }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-lg transition-colors ${
              active
                ? "bg-app-accent/20 text-app-fg"
                : "text-app-fg-muted hover:text-app-fg hover:bg-app-surface/60"
            }`}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Bottom (settings) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-lg text-app-fg-muted hover:text-app-fg hover:bg-app-surface/60 transition-colors"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
