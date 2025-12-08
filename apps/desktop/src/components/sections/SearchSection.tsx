import { Search } from "lucide-react";

import { SectionPlaceholder } from "./SectionPlaceholder";

export function SearchSection() {
  return (
    <SectionPlaceholder
      title="Recherche"
      description="Recherche globale à venir. Utilise la palette de commandes pour filtrer les notes dès maintenant."
      icon={<Search className="h-5 w-5" />}
    />
  );
}
