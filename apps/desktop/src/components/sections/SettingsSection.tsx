import { Settings } from "lucide-react";

import { SectionPlaceholder } from "./SectionPlaceholder";

export function SettingsSection() {
  return (
    <SectionPlaceholder
      title="Réglages"
      description="Réglages à venir. Utilise Cmd/Ctrl+K pour naviguer rapidement."
      icon={<Settings className="h-5 w-5" />}
    />
  );
}
