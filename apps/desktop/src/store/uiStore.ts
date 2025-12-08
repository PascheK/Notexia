import { create } from "zustand";

import type { AppSection } from "@/lib/ui/sections";

type AppUIState = {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
};

export const useUIStore = create<AppUIState>((set) => ({
  activeSection: "notes",
  setActiveSection: (section) => set({ activeSection: section })
}));
