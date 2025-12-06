export type NoteId = string;
export type VaultId = string;

export type VaultType = "local" | "cloud";

export interface Note {
  id: NoteId;
  vaultId: VaultId;
  title: string;
  content: string;
  path?: string; // chemin dans le filesystem pour les vaults locaux
  updatedAt: string; // ISO date
}

export interface Vault {
  id: VaultId;
  name: string;
  type: VaultType;
  rootPath?: string; // pour les vaults locaux
  createdAt: string;
}