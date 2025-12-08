import { PanelsLeftRight, Search, FilePlus2, Settings } from "lucide-react";

import { APP_SECTIONS, type AppSection } from "@/lib/ui/sections";
import { useUIStore } from "@/store/uiStore";
import { useVaultStore } from "@/store/vaultStore";
import { useEditorUIStore } from "@/store/editorUIStore";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";
import { openNoteInLayout } from "@/lib/editor/actions";
import type { NoteFile } from "@/platform/tauri/fs-adapter";

import type { Command } from "./types";

type RegistryContext = {
  notes: NoteFile[];
  vaultPath: string | null;
};

const closePalette = () => useCommandPaletteStore.getState().close();

const navigationCommand = (section: AppSection): Command => {
  const meta = APP_SECTIONS.find((s) => s.id === section);
  return {
    id: `app.switchSection.${section}`,
    label: meta ? `Aller vers ${meta.label}` : "Changer de section",
    section: "Navigation",
    icon: meta?.icon,
    keywords: meta?.label ? [meta.label] : undefined,
    perform: () => {
      useUIStore.getState().setActiveSection(section);
      closePalette();
    }
  };
};

export function getBaseCommands({ notes, vaultPath }: RegistryContext): Command[] {
  const noteCommands: Command[] = notes.map((note) => ({
    id: `notes.open:${note.path}`,
    label: note.name.replace(/\.md$/i, "") || note.name,
    description: note.path,
    section: "Notes",
    keywords: note.path.split(/[/\\]/),
    perform: () => {
      closePalette();
      void openNoteInLayout(note.path, "replace");
    }
  }));

  const commands: Command[] = [
    {
      id: "notes.search",
      label: "Rechercher une note",
      description: "Filtrer les notes et ouvrir rapidement",
      section: "Notes",
      icon: Search,
      perform: () => {
        useUIStore.getState().setActiveSection("search");
        closePalette();
      }
    },
    {
      id: "notes.create",
      label: "Créer une nouvelle note",
      description: vaultPath ? `Dans ${vaultPath}` : undefined,
      section: "Notes",
      icon: FilePlus2,
      perform: async () => {
        const { createNote } = useVaultStore.getState();
        closePalette();
        await createNote(vaultPath);
      }
    },
    ...noteCommands,
    navigationCommand("notes"),
    navigationCommand("whiteboards"),
    navigationCommand("tasks"),
    navigationCommand("search"),
    navigationCommand("settings"),
    {
      id: "ui.toggleSidebar",
      label: "Basculer l’explorer",
      description: "Afficher ou masquer l’arborescence des notes",
      section: "Interface",
      icon: PanelsLeftRight,
      perform: () => {
        useEditorUIStore.getState().toggleSidebar();
        closePalette();
      }
    },
    {
      id: "ui.openSettings",
      label: "Ouvrir les réglages",
      section: "Navigation",
      icon: Settings,
      perform: () => {
        useUIStore.getState().setActiveSection("settings");
        closePalette();
      }
    }
  ];

  return commands;
}
