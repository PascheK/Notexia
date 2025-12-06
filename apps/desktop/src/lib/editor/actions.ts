import { useEditorStore } from "@/store/editorStore";

import type { EditorOpenDisposition } from "./layout";

export async function openNoteInLayout(
  path: string,
  disposition: EditorOpenDisposition
) {
  await useEditorStore.getState().openNote(path, disposition);
}
