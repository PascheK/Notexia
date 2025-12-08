import type { ReactElement } from "react";
import { Bold, Code, Code2, Heading1, Heading2, Italic, List, ListOrdered, Quote, Underline } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MarkdownCommand =
  | "bold"
  | "italic"
  | "underline"
  | "h1"
  | "h2"
  | "ul"
  | "ol"
  | "quote"
  | "code"
  | "codeblock";

type MarkdownToolbarFloatingProps = {
  onCommand: (command: MarkdownCommand) => void;
  className?: string;
  disabled?: boolean;
};

const toolbarItems: {
  command: MarkdownCommand;
  label: string;
  icon: ReactElement;
}[] = [
  { command: "bold", label: "Gras", icon: <Bold className="h-4 w-4" /> },
  { command: "italic", label: "Italique", icon: <Italic className="h-4 w-4" /> },
  { command: "underline", label: "Souligner", icon: <Underline className="h-4 w-4" /> },
  { command: "h1", label: "Titre 1", icon: <Heading1 className="h-4 w-4" /> },
  { command: "h2", label: "Titre 2", icon: <Heading2 className="h-4 w-4" /> },
  { command: "ul", label: "Liste à puces", icon: <List className="h-4 w-4" /> },
  { command: "ol", label: "Liste numérotée", icon: <ListOrdered className="h-4 w-4" /> },
  { command: "quote", label: "Citation", icon: <Quote className="h-4 w-4" /> },
  { command: "code", label: "Code inline", icon: <Code className="h-4 w-4" /> },
  { command: "codeblock", label: "Bloc de code", icon: <Code2 className="h-4 w-4" /> }
];

export function MarkdownToolbarFloating({
  onCommand,
  className,
  disabled
}: MarkdownToolbarFloatingProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto max-w-xl w-full flex justify-center",
          className
        )}
      >
        <div className="bg-app-surface-alt/95 border border-app-border/60 rounded-full shadow-lg backdrop-blur-sm px-2.5 py-1.5 flex items-center gap-1">
          {toolbarItems.map((item) => (
            <Button
              key={item.command}
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-app-fg-muted hover:text-app-fg hover:bg-app-surface transition-colors duration-150"
              aria-label={item.label}
              title={item.label}
              disabled={disabled}
              onClick={() => onCommand(item.command)}
            >
              {item.icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
