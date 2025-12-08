import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InternalNoteLink } from "@/components/editor/InternalNoteLink";
import { remarkInternalLinks } from "@/lib/editor/remark-internal-links";

type NoteViewerProps = {
  content: string;
};

export function NoteViewer({ content }: NoteViewerProps) {
  if (!content) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center text-app-fg-muted">
        <div className="space-y-2">
          <p className="text-sm">Sélectionne une note dans l’explorateur pour l’afficher ici.</p>
          <p className="text-[11px] text-app-fg-muted/80">
            Astuce : glisse un fichier dans l’éditeur pour l’ouvrir rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none text-[15px] leading-7 prose-headings:text-app-fg prose-strong:text-app-fg prose-code:text-app-accent prose-pre:bg-app-surface prose-pre:border prose-pre:border-app-border prose-blockquote:border-app-border">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkInternalLinks]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("internal:")) {
              const noteTitle = decodeURIComponent(href.replace("internal:", ""));
              return (
                <InternalNoteLink noteTitle={noteTitle}>
                  {children}
                </InternalNoteLink>
              );
            }
            return (
              <a href={href} className="text-app-accent hover:underline">
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
