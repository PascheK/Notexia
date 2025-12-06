import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import type { AppConfig } from "@/config/app-config";
import {
  WIZARD_STEPS,
  type WizardState,
  type WizardStepDefinition
} from "./wizard-steps";
import { Button } from "@/components/ui/button";
import { initSpaceConfig } from "@/platform/tauri/fs-adapter";
import { upsertSpace, type SpaceRegistryEntry } from "@/config/space-registry";

type SetupWizardProps = {
  initialConfig: AppConfig;
  onComplete: (
    configPatch: Partial<AppConfig>,
    entry: SpaceRegistryEntry
  ) => void | Promise<void>;
};

const variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const inferLabelFromPath = (path: string) => {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? "Space";
};

export function SetupWizard({ initialConfig, onComplete }: SetupWizardProps) {
  const [state, setState] = useState<WizardState>({
    vaultPath: initialConfig.activeVaultPath,
    ownerFirstName: initialConfig.ownerFirstName ?? "",
    ownerLastName: initialConfig.ownerLastName ?? "",
    spaceLabel: undefined
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.vaultPath && !state.spaceLabel) {
      setState((prev) => ({
        ...prev,
        spaceLabel: prev.spaceLabel ?? inferLabelFromPath(state.vaultPath!)
      }));
    }
  }, [state.vaultPath, state.spaceLabel]);

  const currentStep: WizardStepDefinition = WIZARD_STEPS[currentIndex];
  const isLast = currentIndex === WIZARD_STEPS.length - 1;
  const isFirst = currentIndex === 0;

  const canProceed = useMemo(() => {
    return currentStep.canProceed ? currentStep.canProceed(state) : true;
  }, [currentStep, state]);

  const goNext = async () => {
    if (!canProceed || isSubmitting) return;

    if (isLast) {
      await finalize();
      return;
    }

    setError(null);
    setCurrentIndex((idx) => Math.min(idx + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => {
    if (isFirst || isSubmitting) return;
    setError(null);
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  const updateState = (patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const finalize = async () => {
    if (!state.vaultPath) {
      setError("Choisis un dossier de Space avant de continuer.");
      return;
    }
    if (!state.ownerFirstName.trim()) {
      setError("Renseigne au moins un prénom.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const spaceConfig = await initSpaceConfig(
        state.vaultPath,
        state.ownerFirstName,
        state.ownerLastName,
        state.spaceLabel
      );

      const entry: SpaceRegistryEntry = {
        id: spaceConfig.spaceId,
        path: spaceConfig.vaultPath,
        label:
          spaceConfig.label ??
          state.spaceLabel ??
          inferLabelFromPath(spaceConfig.vaultPath),
        createdAt: spaceConfig.createdAt,
        lastOpenedAt: new Date().toISOString()
      };

      await upsertSpace(entry);

      await onComplete(
        {
          activeSpaceId: spaceConfig.spaceId,
          activeVaultPath: spaceConfig.vaultPath,
          onboardingCompleted: true,
          ownerFirstName: state.ownerFirstName.trim(),
          ownerLastName: state.ownerLastName.trim()
        },
        entry
      );
    } catch (e) {
      console.error(e);
      setError("Impossible de créer la configuration du Space. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = currentStep.component;
  const progress = Math.round(((currentIndex + 1) / WIZARD_STEPS.length) * 100);

  return (
    <div className="h-screen w-screen bg-app-bg text-app-fg flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-app-border bg-app-surface shadow-[--shadow-soft] overflow-hidden">
        <div className="border-b border-app-border px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-app-fg-muted">
              Setup Notexia
            </div>
            <div className="text-base font-semibold text-app-fg">{currentStep.title}</div>
            {currentStep.description && (
              <div className="text-xs text-app-fg-muted">{currentStep.description}</div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-app-fg-muted">
            <div className="flex items-center gap-1">
              {WIZARD_STEPS.map((step, idx) => (
                <span
                  key={step.id}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-app-accent w-5"
                      : idx < currentIndex
                        ? "bg-app-fg-muted/70"
                        : "bg-app-border"
                  }`}
                />
              ))}
            </div>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="p-6 min-h-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <StepComponent
                state={state}
                updateState={updateState}
                goNext={goNext}
                goBack={goBack}
                isLast={isLast}
                isFirst={isFirst}
              />
            </motion.div>
          </AnimatePresence>

          {error && <div className="text-[11px] text-red-400 mt-3">{error}</div>}
        </div>

        <div className="border-t border-app-border px-6 py-4 flex items-center justify-between bg-app-surface-alt/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={isFirst || isSubmitting}
            className="text-[12px]"
          >
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={goNext}
              disabled={!canProceed || isSubmitting}
              className="text-[12px]"
            >
              {isLast ? (isSubmitting ? "Configuration…" : "Terminer") : "Suivant"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
