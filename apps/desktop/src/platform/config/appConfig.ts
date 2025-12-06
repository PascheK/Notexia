import { load, type Store } from "@tauri-apps/plugin-store";

const CONFIG_FILE_NAME = "config.dat"; // sera stocké dans le répertoire de l'app

export type AppConfig = {
  lastVaultPath: string | null;
  recentVaults: string[];
  theme: "dark" | "light" | "system";
};

const defaultConfig: AppConfig = {
  lastVaultPath: null,
  recentVaults: [],
  theme: "dark"
};

let storePromise: Promise<Store> | null = null;

async function getStore() {
  if (!storePromise) {
    storePromise = load(CONFIG_FILE_NAME, {
      autoSave: true,
      defaults: defaultConfig
    });
  }
  return storePromise;
}

export async function loadAppConfig(): Promise<AppConfig> {
  try {
    const s = await getStore();
    const data = (await s.get<AppConfig>("config")) ?? null;

    if (!data) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...data
    };
  } catch (e) {
    console.error("[config] Failed to load legacy app config:", e);
    return defaultConfig;
  }
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  const s = await getStore();
  await s.set("config", config);
  await s.save();
}

export async function updateAppConfig(
  partial: Partial<AppConfig>
): Promise<AppConfig> {
  const current = await loadAppConfig();
  const next = { ...current, ...partial };
  await saveAppConfig(next);
  return next;
}
