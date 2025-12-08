import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

export type MarkdownCommand =
  | "bold"
  | "italic"
  | "h1"
  | "h2"
  | "ul"
  | "ol"
  | "quote"
  | "code";

type MarkdownToolbarProps = {
  onCommand: (command: MarkdownCommand) => void;
  disabled?: boolean;
};

const toolbarItems: {
  command: MarkdownCommand;
  label: string;
  icon: React.ReactNode;
}[] = [
  { command: "h1", label: "Titre 1", icon: <Heading1 className="h-4 w-4" /> },
  { command: "h2", label: "Titre 2", icon: <Heading2 className="h-4 w-4" /> },
  { command: "bold", label: "Gras", icon: <Bold className="h-4 w-4" /> },
  { command: "italic", label: "Italique", icon: <Italic className="h-4 w-4" /> },
  { command: "ul", label: "Liste", icon: <List className="h-4 w-4" /> },
  { command: "ol", label: "Liste ordonnée", icon: <ListOrdered className="h-4 w-4" /> },
  { command: "quote", label: "Citation", icon: <Quote className="h-4 w-4" /> },
  { command: "code", label: "Code", icon: <Code className="h-4 w-4" /> },
];

export function MarkdownToolbar({ onCommand, disabled }: MarkdownToolbarProps) {
  return (
    <div className="flex items-center gap-1 h-10 px-2 border-b border-app-border/60 bg-app-surface/80 backdrop-blur-sm">
      {toolbarItems.map((item, index) => {
        const isEdge = index === 1 || index === 3 || index === 5;
        return (
          <div key={item.command} className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-app-fg-muted hover:text-app-fg hover:bg-app-surface-alt transition-colors duration-150 active:scale-[0.98] focus-visible:ring-1 focus-visible:ring-app-accent/60"
              aria-label={item.label}
              title={item.label}
              disabled={disabled}
              onClick={() => onCommand(item.command)}
            >
              {item.icon}
            </Button>
            {isEdge && (
              <span className="h-6 w-px bg-app-border/60" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
