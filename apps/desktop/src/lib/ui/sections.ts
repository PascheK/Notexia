import type { LucideIcon } from "lucide-react";
import { CheckSquare, Files, PenSquare, Search, Settings } from "lucide-react";

export type AppSection = "notes" | "whiteboards" | "tasks" | "search" | "settings";

export const APP_SECTIONS: { id: AppSection; label: string; icon: LucideIcon }[] = [
  { id: "notes", label: "Notes", icon: Files },
  { id: "whiteboards", label: "Tableaux", icon: PenSquare },
  { id: "tasks", label: "Tâches", icon: CheckSquare },
  { id: "search", label: "Recherche", icon: Search },
  { id: "settings", label: "Réglages", icon: Settings },
];
