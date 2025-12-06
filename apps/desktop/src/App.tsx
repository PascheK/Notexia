import { useEffect, useState } from "react";
import { DesktopRoot } from "@/app/DesktopRoot";
import {
  type AppConfig,
  defaultConfig,
  loadAppConfig,
  saveAppConfig
} from "@/config/app-config";
import {
  getSpaceRegistry,
  upsertSpace,
  type SpaceRegistryEntry
} from "@/config/space-registry";
import { SetupWizard } from "@/components/wizard/WizardRoot";

type AppState =
  | { status: "loading" }
  | { status: "needsOnboarding"; config: AppConfig; spaces: SpaceRegistryEntry[] }
  | {
      status: "ready";
      config: AppConfig;
      spaces: SpaceRegistryEntry[];
      activeSpace: SpaceRegistryEntry;
    };

export default function App() {
  const [state, setState] = useState<AppState>({ status: "loading" });

  const handleSelectSpace = async (spaceId: string) => {
    if (state.status !== "ready") return;
    const target = state.spaces.find((s) => s.id === spaceId);
    if (!target) return;

    const updatedConfig: AppConfig = {
      ...state.config,
      activeSpaceId: target.id,
      activeVaultPath: target.path
    };

    const entry: SpaceRegistryEntry = {
      ...target,
      lastOpenedAt: new Date().toISOString()
    };

    await saveAppConfig(updatedConfig);
    await upsertSpace(entry);

    const spaces = dedupeSpaces(state.spaces, entry);

    setState({
      status: "ready",
      config: updatedConfig,
      spaces,
      activeSpace: entry
    });
  };

  useEffect(() => {
    (async () => {
      const cfg = await loadAppConfig();
      const registry = await getSpaceRegistry();

      const activeSpace =
        registry.spaces.find((s) => s.id === cfg.activeSpaceId) ||
        registry.spaces.find((s) => s.path === cfg.activeVaultPath) ||
        null;

      if (!cfg.onboardingCompleted || !cfg.activeVaultPath || !cfg.activeSpaceId || !activeSpace) {
        setState({
          status: "needsOnboarding",
          config: cfg ?? defaultConfig,
          spaces: registry.spaces
        });
        return;
      }

      setState({
        status: "ready",
        config: cfg,
        spaces: registry.spaces,
        activeSpace
      });
    })();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-app-bg text-app-fg text-xs">
        <div className="opacity-70">Initialisation de Notexia…</div>
      </div>
    );
  }

  if (state.status === "needsOnboarding") {
    return (
      <SetupWizard
        initialConfig={state.config}
        onComplete={async (patch, entry) => {
          const finalConfig: AppConfig = {
            ...state.config,
            ...patch,
            onboardingCompleted: true
          };

          await saveAppConfig(finalConfig);
          const spaces = dedupeSpaces(state.spaces, entry);
          setState({
            status: "ready",
            config: finalConfig,
            spaces,
            activeSpace: entry
          });
        }}
      />
    );
  }

  // App ready : on passe la config au root si tu en as besoin
  return (
    <DesktopRoot
      initialConfig={state.config}
      activeSpace={state.activeSpace}
      spaces={state.spaces}
      onSelectSpace={handleSelectSpace}
      onCreateSpace={() =>
        setState({
          status: "needsOnboarding",
          config: { ...defaultConfig, ownerFirstName: state.config.ownerFirstName, ownerLastName: state.config.ownerLastName },
          spaces: state.spaces
        })
      }
    />
  );
}

function dedupeSpaces(spaces: SpaceRegistryEntry[], entry: SpaceRegistryEntry) {
  return [
    ...spaces.filter((s) => s.id !== entry.id && s.path !== entry.path),
    entry
  ];
}
