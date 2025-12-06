import { load, type Store } from "@tauri-apps/plugin-store";

export type SpaceRegistryEntry = {
  id: string; // spaceId
  path: string; // vaultPath
  label?: string;
  lastOpenedAt: string;
  createdAt: string;
};

export type SpaceRegistry = {
  spaces: SpaceRegistryEntry[];
};

const REGISTRY_FILE_NAME = "vaults.json";

let registryStorePromise: Promise<Store> | null = null;

async function getRegistryStore(): Promise<Store> {
  if (!registryStorePromise) {
    registryStorePromise = load(REGISTRY_FILE_NAME, {
      autoSave: true,
      defaults: { spaces: [] }
    });
  }
  return registryStorePromise;
}

export async function getSpaceRegistry(): Promise<SpaceRegistry> {
  try {
    const store = await getRegistryStore();
    const spaces = (await store.get<SpaceRegistryEntry[]>("spaces")) ?? [];
    return { spaces };
  } catch (err) {
    console.error("[registry] Failed to load registry", err);
    return { spaces: [] };
  }
}

export async function upsertSpace(entry: SpaceRegistryEntry): Promise<void> {
  const store = await getRegistryStore();
  const current = (await store.get<SpaceRegistryEntry[]>("spaces")) ?? [];

  const filtered = current.filter(
    (s) => s.id !== entry.id && s.path !== entry.path
  );

  filtered.push(entry);

  await store.set("spaces", filtered);
  await store.save();
}

export async function removeSpaceById(id: string): Promise<void> {
  const store = await getRegistryStore();
  const current = (await store.get<SpaceRegistryEntry[]>("spaces")) ?? [];
  const next = current.filter((s) => s.id !== id);
  await store.set("spaces", next);
  await store.save();
}
