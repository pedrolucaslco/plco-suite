"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

type Nucleus = {
 id: string;
 name: string;
};

export function NucleusSelector() {
 const [nuclei, setNuclei] = useState<Nucleus[]>([]);
 const currentNucleusId = useNucleusStore((s) => s.currentNucleusId);
 const setCurrentNucleus = useNucleusStore((s) => s.setCurrentNucleus);
 const supabase = createClient();
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let cancelled = false;

 async function fetch() {
 const { data: userData } = await supabase.auth.getUser();
 if (!userData.user) return;

 const { data: profile } = await supabase
 .from("profiles")
 .select("id")
 .eq("user_id", userData.user.id)
 .maybeSingle();

 if (!profile) return;

 const { data: members } = await supabase
 .from("nuclei_members")
 .select("nuclei_id")
 .eq("user_id", profile.id);

 if (!members || members.length === 0) {
 if (!cancelled) setLoading(false);
 return;
 }

 const ids = members.map((m) => m.nuclei_id);
 const { data: nucleiData } = await supabase
 .from("nuclei")
 .select("id, name")
 .in("id", ids);

 if (!cancelled && nucleiData) {
 setNuclei(nucleiData);
 }
 if (!cancelled) setLoading(false);
 }

 fetch();
 return () => { cancelled = true; };
 }, [supabase, setCurrentNucleus]);

 // Auto-select when nuclei load and none is selected yet
 useEffect(() => {
 if (nuclei.length === 1 && !currentNucleusId) {
 setCurrentNucleus(nuclei[0].id);
 }
 }, [nuclei, currentNucleusId, setCurrentNucleus]);

 const currentNucleus = nuclei.find((n) => n.id === currentNucleusId);

 if (loading || nuclei.length === 0) return null;

 return (
 <div className="relative">
 <button
 type="button"
 onClick={() => setOpen(!open)}
 className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[180px]"
 >
 <span className="truncate">{currentNucleus?.name ?? "Selecionar"}</span>
 <svg
 className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>

 {open && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
 <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-popover border border rounded-lg shadow-lg py-1">
 {nuclei.map((n) => (
 <button
 key={n.id}
 type="button"
 className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-muted ${
 n.id === currentNucleusId
 ? "text-foreground font-medium"
 : "text-muted-foreground"
 }`}
 onClick={() => {
 setCurrentNucleus(n.id);
 setOpen(false);
 }}
 >
 {n.name}
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 );
}
