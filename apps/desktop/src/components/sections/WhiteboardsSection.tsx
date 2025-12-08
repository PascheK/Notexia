import { PenSquare } from "lucide-react";

import { SectionPlaceholder } from "./SectionPlaceholder";

export function WhiteboardsSection() {
  return (
    <SectionPlaceholder
      title="Tableaux blancs"
      description="Une zone de croquis et de brainstorming arrivera bientôt."
      icon={<PenSquare className="h-5 w-5" />}
    />
  );
}
