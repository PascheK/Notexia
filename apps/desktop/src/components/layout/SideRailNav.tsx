import { Button } from "@/components/ui/button";
import { APP_SECTIONS } from "@/lib/ui/sections";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function SideRailNav() {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {APP_SECTIONS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={activeSection === id}
          onClick={() => setActiveSection(id)}
          className={cn(
            "h-9 w-9 rounded-lg transition-colors",
            activeSection === id
              ? "bg-app-surface-alt text-app-fg"
              : "text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt/60"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
}
