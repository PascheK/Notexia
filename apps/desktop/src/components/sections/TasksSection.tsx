import { CheckSquare } from "lucide-react";

import { SectionPlaceholder } from "./SectionPlaceholder";

export function TasksSection() {
  return (
    <SectionPlaceholder
      title="Tâches"
      description="Gère tes tâches et suivis depuis Notexia. Section en construction."
      icon={<CheckSquare className="h-5 w-5" />}
    />
  );
}
