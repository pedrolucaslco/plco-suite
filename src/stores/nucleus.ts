import { create } from "zustand";

const STORAGE_KEY = "plco_current_nucleus_id";

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
 hydrated: boolean;
 setCurrentNucleus: (id: string) => void;
 hydrate: () => void;
}

export const useNucleusStore = create<NucleusState>((set) => ({
 currentNucleusId: null,
 hydrated: false,
 setCurrentNucleus: (id) => {
 saveId(id);
 set({ currentNucleusId: id });
 },
 hydrate: () => {
 if (typeof window === "undefined") return;
 try {
 const id = sessionStorage.getItem(STORAGE_KEY);
 set({ currentNucleusId: id, hydrated: true });
 } catch {
 set({ hydrated: true });
 }
 },
}));
