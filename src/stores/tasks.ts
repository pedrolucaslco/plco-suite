import { create } from "zustand";
import type { LocalTask } from "@/lib/db/dexie";

export type SyncState = "synced" | "syncing" | "error" | "offline" | "conflict";

interface TaskStoreState {
  tasks: LocalTask[];
  syncState: SyncState;
  syncError: string | null;

  setTasks: (tasks: LocalTask[]) => void;
  setSyncState: (state: SyncState, error?: string | null) => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  syncState: "syncing",
  syncError: null,

  setTasks: (tasks) => set({ tasks }),
  setSyncState: (state, error) =>
    set({ syncState: state, syncError: error ?? null }),
}));
