import { JSX, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectVaultFolder } from "@/platform/tauri/fs-adapter";
import { Folder, Sparkles, User } from "lucide-react";

export type WizardStepId = "welcome" | "select-vault" | "user-profile" | "summary" | (string & {});

export type WizardState = {
  vaultPath: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  spaceLabel?: string;
};

export type WizardStepProps = {
  state: WizardState;
  updateState: (patch: Partial<WizardState>) => void;
  goNext: () => void;
  goBack: () => void;
  isLast: boolean;
  isFirst: boolean;
};

export type WizardStepDefinition = {
  id: WizardStepId;
  title: string;
  description?: string;
  component: (props: WizardStepProps) => JSX.Element;
  canProceed?: (state: WizardState) => boolean;
};

function WelcomeStep({ goNext }: WizardStepProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-app-accent text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Prêt à configurer Notexia</span>
        </div>
        <p className="text-sm text-app-fg-muted leading-relaxed">
          Notexia utilise un Space local (dossier de notes Markdown) et y crée un
          dossier <code>.notexia</code> pour stocker ses métadonnées. Ce wizard te
          guide pas à pas pour choisir ton Space et enregistrer ton profil.
        </p>
      </div>

      <div className="rounded-lg border border-app-border bg-app-surface-alt/60 p-4 text-sm text-app-fg-muted space-y-2">
        <div className="font-medium text-app-fg">Ce qui va se passer :</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Choisir ou créer ton dossier de Space</li>
          <li>Enregistrer quelques infos de profil</li>
          <li>Créer <code>.notexia/space.json</code> dans ce dossier</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button onClick={goNext} className="gap-2">
          C&apos;est parti
        </Button>
      </div>
    </div>
  );
}

function SelectVaultStep({ state, updateState }: WizardStepProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inferLabelFromPath = (path: string) => {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] ?? "Space";
};

  const handlePick = async () => {
    setIsPicking(true);
    setError(null);
    try {
      const result = await selectVaultFolder();
      if (!result) return;
      const path = result.path;
      updateState({
        vaultPath: path,
        spaceLabel: state.spaceLabel ?? inferLabelFromPath(path)
      });
    } catch (e) {
      console.error(e);
      setError("Impossible d'ouvrir le sélecteur de dossier.");
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-app-fg-muted leading-relaxed">
        Sélectionne le dossier qui servira de Space Notexia. Nous créerons un dossier
        <code> .notexia </code> à l'intérieur pour conserver la configuration du Space.
      </p>

      <div className="rounded-lg border border-app-border bg-app-surface-alt/60 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-app-fg">
            <Folder className="w-4 h-4 text-app-fg-muted" />
            <span>Dossier du Space</span>
          </div>
          <Button size="sm" variant="outline" onClick={handlePick} disabled={isPicking}>
            {isPicking ? "Ouverture…" : "Choisir…"}
          </Button>
        </div>

        <div className="text-[11px] px-2 py-1 rounded-md bg-app-surface-alt border border-app-border/60 min-h-[24px] flex items-center">
          {state.vaultPath ? (
            <span className="truncate" title={state.vaultPath}>
              {state.vaultPath}
            </span>
          ) : (
            <span className="text-app-fg-muted">Aucun dossier sélectionné pour l’instant.</span>
          )}
        </div>

        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    </div>
  );
}

function UserProfileStep({ state, updateState }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-app-fg-muted leading-relaxed">
        Ces informations seront stockées dans ton fichier <code>.notexia/space.json</code>
        et pourront être affichées dans l’app.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1 text-sm">
            <span className="flex items-center gap-2 text-app-fg">
              <User className="w-4 h-4 text-app-fg-muted" />
              <span>Prénom</span>
            </span>
            <Input
              placeholder="Ada"
              value={state.ownerFirstName}
              onChange={(e) => updateState({ ownerFirstName: e.target.value })}
              className="bg-app-surface-alt border-app-border text-sm"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-app-fg">Nom</span>
            <Input
              placeholder="Lovelace"
              value={state.ownerLastName}
              onChange={(e) => updateState({ ownerLastName: e.target.value })}
              className="bg-app-surface-alt border-app-border text-sm"
            />
          </label>
        </div>

        <div className="rounded-lg border border-app-border bg-app-surface-alt/60 p-3 text-[13px] text-app-fg-muted">
          Aperçu :{" "}
          <span className="text-app-fg">
            Bonjour,{" "}
            {state.ownerFirstName || state.ownerLastName
              ? `${state.ownerFirstName} ${state.ownerLastName}`.trim()
              : "prénom nom"}
            👋
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryStep({ state }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-app-fg-muted leading-relaxed">
        Vérifie tes choix avant de lancer la configuration du Space.
      </p>

      <div className="space-y-3 rounded-lg border border-app-border bg-app-surface-alt/60 p-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="text-app-fg-muted">Space sélectionné</div>
          <div className="text-right text-app-fg truncate max-w-[240px]" title={state.vaultPath ?? undefined}>
            {state.vaultPath ?? "—"}
          </div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-app-fg-muted">Nom du Space</div>
          <div className="text-right text-app-fg truncate max-w-[240px]">
            {state.spaceLabel || "—"}
          </div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-app-fg-muted">Propriétaire</div>
          <div className="text-right text-app-fg truncate max-w-[240px]">
            {(state.ownerFirstName || state.ownerLastName
              ? `${state.ownerFirstName} ${state.ownerLastName}`.trim()
              : "Non renseigné")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-app-border/60 bg-app-surface-alt/40 p-3 text-[12px] text-app-fg-muted leading-relaxed">
        <p>
          Nous allons créer un dossier <code>.notexia</code> dans ton Space avec un fichier{" "}
          <code>space.json</code> contenant ces informations.
        </p>
      </div>
    </div>
  );
}

export const WIZARD_STEPS: WizardStepDefinition[] = [
  {
    id: "welcome",
    title: "Bienvenue",
    description: "Découvre comment Notexia configure ton Space.",
    component: WelcomeStep,
  },
  {
    id: "select-vault",
    title: "Choisir un Space",
    description: "Sélectionne le dossier qui accueillera tes notes.",
    component: SelectVaultStep,
    canProceed: (state) => Boolean(state.vaultPath),
  },
  {
    id: "user-profile",
    title: "Infos utilisateur",
    description: "Ajoute ton nom pour personnaliser ton espace.",
    component: UserProfileStep,
    canProceed: (state) => state.ownerFirstName.trim().length > 0,
  },
  {
    id: "summary",
    title: "Résumé",
    description: "Valide et crée la configuration du Space.",
    component: SummaryStep,
    canProceed: (state) =>
      Boolean(state.vaultPath) && state.ownerFirstName.trim().length > 0,
  },
];
