import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type NoteViewerProps = {
  content: string;
};

export function NoteViewer({ content }: NoteViewerProps) {
  if (!content) {
    return (
      <p className="text-sm text-app-fg-muted">
        Sélectionne une note dans la liste pour l’afficher ici.
      </p>
    );
  }

  return (
    <div className="prose prose-invert max-w-3xl mx-auto text-sm prose-headings:text-app-fg prose-strong:text-app-fg prose-code:text-app-accent">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
