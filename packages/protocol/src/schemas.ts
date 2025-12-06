import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  vaultId: z.string(),
  title: z.string(),
  content: z.string(),
  path: z.string().optional(),
  updatedAt: z.string()
});

export const VaultSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["local", "cloud"]),
  rootPath: z.string().optional(),
  createdAt: z.string()
});

export const SyncNoteSchema = NoteSchema.pick({
  id: true,
  title: true,
  content: true,
  path: true,
  updatedAt: true
});

export const SyncRequestSchema = z.object({
  vaultId: z.string(),
  notes: z.array(SyncNoteSchema)
});

export const SyncResponseSchema = z.object({
  status: z.literal("ok"),
  received: z.number(),
  serverTime: z.string()
});

export type NoteDTO = z.infer<typeof NoteSchema>;
export type VaultDTO = z.infer<typeof VaultSchema>;
export type SyncNoteDTO = z.infer<typeof SyncNoteSchema>;
export type SyncRequestDTO = z.infer<typeof SyncRequestSchema>;
export type SyncResponseDTO = z.infer<typeof SyncResponseSchema>;
