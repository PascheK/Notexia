import { useMemo } from "react";
import { ArrowUpRight, Link2 } from "lucide-react";

import { openNoteInLayout } from "@/lib/editor/actions";
import { useVaultStore } from "@/store/vaultStore";

type InternalNoteLinkProps = {
  noteTitle: string;
  children?: React.ReactNode;
};

const stripExtension = (name: string) => name.replace(/\.md$/i, "");

export function InternalNoteLink({ noteTitle, children }: InternalNoteLinkProps) {
  const notes = useVaultStore((s) => s.notes);

  const target = useMemo(() => {
    const normalized = noteTitle.trim().toLowerCase();
    return notes.find(
      (note) => stripExtension(note.name).toLowerCase() === normalized
    );
  }, [noteTitle, notes]);

  const handleClick = () => {
    if (target) {
      void openNoteInLayout(target.path, "replace");
    }
  };

  const isBroken = !target;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!target}
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] transition-colors",
        "border",
        isBroken
          ? "text-destructive border-destructive/40 bg-destructive/10"
          : "text-app-fg border-app-border/70 bg-app-surface-alt/80 hover:border-app-accent/60 hover:text-app-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50"
      ].join(" ")}
      title={isBroken ? "Note introuvable" : `Ouvrir ${noteTitle}`}
    >
      <Link2 className="h-3.5 w-3.5" />
      <span className="font-medium">{children ?? noteTitle}</span>
      {!isBroken && <ArrowUpRight className="h-3 w-3" />}
    </button>
  );
}
