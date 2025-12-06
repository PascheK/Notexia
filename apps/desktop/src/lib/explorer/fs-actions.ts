import { moveEntry } from "@/platform/tauri/fs-adapter";
import { extractBaseName } from "./tree";

export async function moveEntryCommand(oldPath: string, targetDir: string) {
  const baseName = extractBaseName(oldPath);
  await moveEntry(oldPath, targetDir, baseName);
}
