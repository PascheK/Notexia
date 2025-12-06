import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type NoteEditorProps = {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function NoteEditor({
  content,
  onChange,
  onSave,
  isSaving
}: NoteEditorProps) {
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="flex-1 min-h-0 rounded-lg border border-app-border/40 bg-app-surface overflow-hidden shadow-surface">
        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={[markdown()]}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true
          }}
          onChange={(value) => onChange(value)}
          className="h-full text-sm"
        />
      </div>
      <div className="text-[11px] text-app-fg-muted h-4">
        {isSaving ? "Saving…" : "Saved"}
      </div>
    </div>
  );
}
