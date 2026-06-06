import { create } from "zustand";

const STORAGE_KEY = "plco_current_nucleus_id";

function loadId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface NucleusState {
  currentNucleusId: string | null;
  setCurrentNucleus: (id: string) => void;
}

export const useNucleusStore = create<NucleusState>((set) => ({
  currentNucleusId: loadId(),
  setCurrentNucleus: (id) => {
    saveId(id);
    set({ currentNucleusId: id });
  },
}));
