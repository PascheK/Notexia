import type { LucideIcon } from "lucide-react";

export type CommandId =
  | "notes.search"
  | "notes.create"
  | `notes.open:${string}`
  | "ui.toggleSidebar"
  | "ui.openSettings"
  | `app.switchSection.${string}`;

export type CommandSection = "Notes" | "Navigation" | "Interface" | "Divers" | string;

export interface Command {
  id: CommandId;
  label: string;
  description?: string;
  section?: CommandSection;
  keywords?: string[];
  icon?: LucideIcon;
  perform: () => void | Promise<void>;
}
