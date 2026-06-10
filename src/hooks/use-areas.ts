"use client";

import { useEffect, useState, useCallback } from "react";
import { liveQuery } from "dexie";
import { db, type LocalArea } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

export function useAreas() {
 const [areas, setAreas] = useState<LocalArea[]>([]);
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);
 const supabase = createClient();

 useEffect(() => {
 if (!nucleusId) return;

 function sortAreas(list: LocalArea[]) {
 return list.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
 }

 db.areas
 .where("nuclei_id")
 .equals(nucleusId)
 .toArray()
 .then((result) => setAreas(sortAreas(result)));

 const sub = liveQuery(() =>
 db.areas.where("nuclei_id").equals(nucleusId).toArray(),
 ).subscribe({
 next: (result) => setAreas(sortAreas(result)),
 error: () => {},
 });

 return () => sub.unsubscribe();
 }, [nucleusId]);

 const getProfileId = useCallback(async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return null;
 const { data: profile } = await supabase
 .from("profiles")
 .select("id")
 .eq("user_id", user.id)
 .maybeSingle();
 return profile?.id ?? null;
 }, [supabase]);

 const addArea = useCallback(
 async (name: string) => {
 if (!nucleusId) return;

 const now = new Date().toISOString();
 const area: LocalArea = {
 id: crypto.randomUUID(),
 nuclei_id: nucleusId,
 name,
 position: areas.length,
 created_at: now,
 _sync: "pending",
 _local_mtime: Date.now(),
 _server_updated_at: now,
 };

 await db.areas.add(area);
 await syncEngine.enqueue(area.id, "area", "insert", {
 id: area.id,
 nuclei_id: nucleusId,
 name,
 position: areas.length,
 created_at: now,
 });

 if (navigator.onLine) syncEngine.pushPending();
 },
 [nucleusId, areas.length],
 );

 const updateArea = useCallback(
 async (id: string, data: Partial<LocalArea>) => {
 await db.areas.update(id, {
 ...data,
 _sync: "pending",
 _local_mtime: Date.now(),
 });
 await syncEngine.enqueue(id, "area", "update", { ...data });
 if (navigator.onLine) syncEngine.pushPending();
 },
 [],
 );

 const removeArea = useCallback(async (id: string) => {
 await db.areas.delete(id);
 await syncEngine.enqueue(id, "area", "delete", {});
 if (navigator.onLine) syncEngine.pushPending();
 }, []);

 const reorderAreas = useCallback(
 async (orderedIds: string[]) => {
 for (let i = 0; i < orderedIds.length; i++) {
 await db.areas.update(orderedIds[i], {
 position: i,
 _sync: "pending",
 _local_mtime: Date.now(),
 });
 await syncEngine.enqueue(orderedIds[i], "area", "update", { position: i });
 }
 if (navigator.onLine) syncEngine.pushPending();
 },
 [],
 );

 return { areas, addArea, updateArea, removeArea, reorderAreas };
}
