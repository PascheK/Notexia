import { create } from "zustand";

import { pingServer } from "@/platform/server/sync-client";

type SyncState = {
  status: "idle" | "connected" | "error";
  lastChecked: string | null;
  error: string | null;
  ping: () => Promise<void>;
};

export const useSyncStore = create<SyncState>((set) => ({
  status: "idle",
  lastChecked: null,
  error: null,

  ping: async () => {
    try {
      const res = await pingServer();
      set({
        status: res.status === "ok" ? "connected" : "error",
        lastChecked: res.time,
        error: null
      });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        lastChecked: new Date().toISOString()
      });
    }
  }
}));
