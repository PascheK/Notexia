import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import { EditorSelection, type SelectionRange } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { MarkdownCommand } from "@/components/editor/MarkdownToolbarFloating";
import { useVaultStore } from "@/store/vaultStore";

type NoteEditorProps = {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export type NoteEditorHandle = {
  applyCommand: (command: MarkdownCommand) => void;
  focus: () => void;
};

const stripExtension = (name: string) => name.replace(/\.md$/i, "");

export const NoteEditor = forwardRef<NoteEditorHandle, NoteEditorProps>(
  function NoteEditor(
    {
      content,
      onChange,
      onSave,
      isSaving
    }: NoteEditorProps,
    ref
  ) {
    const editorRef = useRef<EditorView | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [linkQuery, setLinkQuery] = useState("");
    const [linkFrom, setLinkFrom] = useState<number | null>(null);
    const [linkAnchor, setLinkAnchor] = useState<{ left: number; top: number } | null>(null);
    const notes = useVaultStore((s) => s.notes);

    const suggestions = useMemo(() => {
      const normalized = linkQuery.trim().toLowerCase();
      if (!normalized) {
        return notes.slice(0, 6);
      }
      return notes
        .filter((note) =>
          stripExtension(note.name).toLowerCase().includes(normalized)
        )
        .slice(0, 8);
    }, [linkQuery, notes]);

    const syncChange = (view: EditorView) => {
      onChange(view.state.doc.toString());
    };

    useEffect(() => {
      const handleSaveShortcut = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          onSave();
        }
      };

      window.addEventListener("keydown", handleSaveShortcut);
      return () => window.removeEventListener("keydown", handleSaveShortcut);
    }, [onSave]);

    const updateLinkState = (view: EditorView) => {
      const pos = view.state.selection.main.head;
      const line = view.state.doc.lineAt(pos);
      const beforeCursor = view.state.sliceDoc(line.from, pos);
      const match = beforeCursor.match(/\[\[([^[\]\n\r]*)$/);

      if (match) {
        const start = match.index !== undefined ? line.from + match.index : null;
        const coords = view.coordsAtPos(pos);
        const containerRect = containerRef.current?.getBoundingClientRect();
        setLinkFrom(start);
        setLinkQuery(match[1] ?? "");
        if (coords && containerRect) {
          setLinkAnchor({
            left: coords.left - containerRect.left,
            top: coords.bottom - containerRect.top
          });
        } else {
          setLinkAnchor(null);
        }
      } else {
        setLinkFrom(null);
        setLinkQuery("");
        setLinkAnchor(null);
      }
    };

    const wrapSelection = (before: string, after = before, placeholder = "texte") => {
      const view = editorRef.current;
      if (view) {
        const tr = view.state.changeByRange((range: SelectionRange) => {
          const selected = view.state.sliceDoc(range.from, range.to) || "";
          const body = selected || placeholder;
          const insert = `${before}${body}${after}`;
          const start = range.from + before.length;
          const end = start + body.length;
          return {
            changes: { from: range.from, to: range.to, insert },
            range: EditorSelection.range(start, end)
          };
        });
        view.dispatch(tr);
        syncChange(view);
        updateLinkState(view);
      } else {
        onChange(`${before}${content}${after}`);
      }
    };

    const wrapBlock = (before: string, after: string, placeholder = "bloc") => {
      const view = editorRef.current;
      if (view) {
        const tr = view.state.changeByRange((range: SelectionRange) => {
          const selected = view.state.sliceDoc(range.from, range.to) || "";
          const body = selected || placeholder;
          const insert = `${before}${body}${after}`;
          const start = range.from + before.length;
          const end = start + body.length;
          return {
            changes: { from: range.from, to: range.to, insert },
            range: EditorSelection.range(start, end)
          };
        });
        view.dispatch(tr);
        syncChange(view);
        updateLinkState(view);
      } else {
        onChange(`${before}${content}${after}`);
      }
    };

    const prefixLines = (prefix: string, ordered = false) => {
      const view = editorRef.current;
      const applyPrefix = (block: string) =>
        block
          .split("\n")
          .map((line, idx) => {
            const trimmed = line.trimStart();
            const indent = " ".repeat(line.length - trimmed.length);
            if (ordered) {
              const marker = `${idx + 1}. `;
              if (/^\d+\.\s/.test(trimmed)) return line;
              return `${indent}${marker}${trimmed || ""}`;
            }
            if (trimmed.startsWith(`${prefix} `)) return line;
            return `${indent}${prefix} ${trimmed}`;
          })
          .join("\n");

      if (view) {
        const tr = view.state.changeByRange((range: SelectionRange) => {
          const startLine = view.state.doc.lineAt(range.from);
          const endLine = view.state.doc.lineAt(range.to);
          const from = startLine.from;
          const to = endLine.to;
          const segment = view.state.sliceDoc(from, to);
          const next = applyPrefix(segment);
          return {
            changes: { from, to, insert: next },
            range: EditorSelection.range(from, from + next.length)
          };
        });
        view.dispatch(tr);
        syncChange(view);
        updateLinkState(view);
      } else {
        onChange(applyPrefix(content));
      }
    };

    const applyCommand = (command: MarkdownCommand) => {
      switch (command) {
        case "bold":
          wrapSelection("**");
          break;
        case "italic":
          wrapSelection("*");
          break;
        case "underline":
          wrapSelection("__");
          break;
        case "code":
          wrapSelection("`");
          break;
        case "codeblock":
          wrapBlock("```\n", "\n```", "code");
          break;
        case "quote":
          prefixLines(">");
          break;
        case "ul":
          prefixLines("-");
          break;
        case "ol":
          prefixLines("", true);
          break;
        case "h1":
          prefixLines("#");
          break;
        case "h2":
          prefixLines("##");
          break;
        default:
          break;
      }
    };

    const insertInternalLink = (noteTitle: string) => {
      const view = editorRef.current;
      const safeTitle = noteTitle.trim();
      if (!view || linkFrom === null) return;
      const cursor = view.state.selection.main.head;
      const insert = `[[${safeTitle}]]`;
      view.dispatch({
        changes: { from: linkFrom, to: cursor, insert },
        selection: { anchor: linkFrom + insert.length }
      });
      syncChange(view);
      updateLinkState(view);
      view.focus();
      setLinkFrom(null);
      setLinkQuery("");
      setLinkAnchor(null);
    };

    useImperativeHandle(
      ref,
      () => ({
        applyCommand,
        focus: () => {
          editorRef.current?.focus();
        }
      })
    );

    return (
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-wide text-app-fg-muted">
            Édition
          </div>
          <span className="text-[11px] text-app-fg-muted">
            {isSaving ? "Enregistrement..." : "Enregistré"}
          </span>
        </div>

        <div
          ref={containerRef}
          className="relative rounded-2xl border border-app-border/50 bg-app-surface/50 shadow-surface focus-within:border-app-accent/60 transition-colors"
        >
          <CodeMirror
            value={content}
            height="100%"
            theme={oneDark}
            extensions={[markdown()]}
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: true,
              highlightActiveLineGutter: false,
              foldGutter: false
            }}
            onCreateEditor={(view) => {
              editorRef.current = view;
              updateLinkState(view);
            }}
            onChange={(value, viewUpdate) => {
              onChange(value);
              if (viewUpdate?.view) {
                updateLinkState(viewUpdate.view);
              }
            }}
            onUpdate={(viewUpdate) => {
              if (viewUpdate?.view) {
                updateLinkState(viewUpdate.view);
              }
            }}
            className="h-full min-h-[520px] text-base leading-7 [&_.cm-editor]:bg-transparent [&_.cm-editor]:text-app-fg [&_.cm-editor]:font-[var(--font-body)] [&_.cm-gutters]:bg-transparent [&_.cm-activeLine]:bg-app-surface-alt/30 [&_.cm-line]:px-2"
          />

          {linkFrom !== null && linkAnchor && (
            <div
              className="absolute z-30"
              style={{ left: linkAnchor.left, top: linkAnchor.top + 12 }}
            >
              <div className="min-w-[220px] max-w-xs rounded-xl border border-app-border/60 bg-app-surface shadow-lg">
                <div className="px-3 py-2 text-[11px] text-app-fg-muted uppercase tracking-wide border-b border-app-border/50">
                  Lier une note
                </div>
                <div className="py-1">
                  {suggestions.length ? (
                    suggestions.map((note) => (
                      <button
                        key={note.path}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-app-surface-alt text-sm text-app-fg transition-colors"
                        onClick={() => insertInternalLink(stripExtension(note.name))}
                      >
                        <span className="block font-medium text-app-fg">
                          {stripExtension(note.name)}
                        </span>
                        <span className="block text-[11px] text-app-fg-muted">
                          {note.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-app-fg-muted">
                      Aucune note trouvée
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
