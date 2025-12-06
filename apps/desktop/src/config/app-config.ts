// apps/desktop/src/config/app-config.ts
import { load, type Store } from "@tauri-apps/plugin-store";

export type AppConfig = {
  onboardingCompleted: boolean;
  activeSpaceId: string | null;
  activeVaultPath: string | null;
  ownerFirstName?: string;
  ownerLastName?: string;
};

const CONFIG_FILE_NAME = "settings.json";

export const defaultConfig: AppConfig = {
  onboardingCompleted: false,
  activeSpaceId: null,
  activeVaultPath: null,
  ownerFirstName: "",
  ownerLastName: ""
};

// on garde un store en cache pour ne pas recharger à chaque appel
let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store> {
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

    const onboardingCompleted =
      (await s.get<boolean>("onboardingCompleted")) ?? defaultConfig.onboardingCompleted;
    const activeSpaceId =
      (await s.get<string>("activeSpaceId")) ?? defaultConfig.activeSpaceId;
    const activeVaultPath =
      (await s.get<string>("activeVaultPath")) ?? defaultConfig.activeVaultPath;
    const ownerFirstName =
      (await s.get<string>("ownerFirstName")) ?? defaultConfig.ownerFirstName;
    const ownerLastName =
      (await s.get<string>("ownerLastName")) ?? defaultConfig.ownerLastName;

    return {
      onboardingCompleted,
      activeSpaceId,
      activeVaultPath,
      ownerFirstName,
      ownerLastName,
    };
  } catch (e) {
    console.error("[config] Failed to load app config:", e);
    return defaultConfig;
  }
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  const s = await getStore();

  await s.set("onboardingCompleted", config.onboardingCompleted);
  await s.set("activeSpaceId", config.activeSpaceId);
  await s.set("activeVaultPath", config.activeVaultPath);
  await s.set("ownerFirstName", config.ownerFirstName);
  await s.set("ownerLastName", config.ownerLastName);

  // optionnel si autoSave: true, mais ça ne fait pas de mal
  await s.save();
}
