import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export type NoteFile = {
  path: string;
  name: string;
  modified?: string | null;
};

export type FsEntry = {
  path: string;
  rel_path: string;
  name: string;
  is_dir: boolean;
  created?: string | null;
  modified?: string | null;
};

export type VaultSelection = {
  path: string;
};

export type SpaceConfig = {
  spaceId: string;
  vaultPath: string;
  label?: string | null;
  owner: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
};

export async function selectVaultFolder(): Promise<VaultSelection | null> {
  const result = await open({
    directory: true,
    multiple: false
  });

  if (!result) return null;
  if (Array.isArray(result)) {
    return { path: result[0] };
  }

  return { path: result };
}

export async function listVaultEntries(vaultPath: string): Promise<FsEntry[]> {
  return invoke<FsEntry[]>("list_notes_in_vault", {
    vaultPath
  });
}

export async function readNote(path: string): Promise<string> {
  return invoke<string>("read_note", { path });
}

export async function writeNote(path: string, content: string): Promise<void> {
  await invoke("write_note", { path, content });
}

export async function createNote(vaultPath: string): Promise<string> {
  return invoke<string>("create_note", { vaultPath });
}

export async function deleteNote(path: string): Promise<void> {
  await invoke("delete_note", { path });
}

export async function renameNote(
  oldPath: string,
  newName: string
): Promise<string> {
  return invoke<string>("rename_note", { oldPath, newName });
}

export async function createDirectory(
  parentPath: string,
  name: string
): Promise<string> {
  return invoke<string>("create_directory", { parentPath, name });
}

export async function deleteEntry(path: string): Promise<void> {
  await invoke("delete_entry", { path });
}

export async function moveEntry(
  oldPath: string,
  newParentPath: string,
  newName?: string
): Promise<string> {
  return invoke<string>("move_entry", { oldPath, newParentPath, newName });
}

export async function initSpaceConfig(
  vaultPath: string,
  firstName: string,
  lastName: string,
  label?: string
): Promise<SpaceConfig> {
  return invoke<SpaceConfig>("init_space_config", {
    vaultPath,
    firstName,
    lastName,
    label
  });
}
