"use client";

import { useEffect, useState, useCallback } from "react";
import { liveQuery } from "dexie";
import { db, type LocalProject } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

export function useProjects() {
 const [projects, setProjects] = useState<LocalProject[]>([]);
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);
 const supabase = createClient();

 useEffect(() => {
 if (!nucleusId) return;

 function sortProjects(list: LocalProject[]) {
 return list.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
 }

 db.projects
 .where("nuclei_id")
 .equals(nucleusId)
 .toArray()
 .then((result) => setProjects(sortProjects(result)));

 const sub = liveQuery(() =>
 db.projects.where("nuclei_id").equals(nucleusId).toArray(),
 ).subscribe({
 next: (result) => setProjects(sortProjects(result)),
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

 const addProject = useCallback(
 async (name: string, areaId?: string | null) => {
 if (!nucleusId) return;

 const now = new Date().toISOString();
 const project: LocalProject = {
 id: crypto.randomUUID(),
 nuclei_id: nucleusId,
 name,
 area_id: areaId ?? null,
 position: projects.length,
 created_at: now,
 _sync: "pending",
 _local_mtime: Date.now(),
 _server_updated_at: now,
 };

 await db.projects.add(project);
 await syncEngine.enqueue(project.id, "project", "insert", {
 id: project.id,
 nuclei_id: nucleusId,
 name,
 area_id: areaId ?? null,
 position: projects.length,
 created_at: now,
 });

 if (navigator.onLine) syncEngine.pushPending();
 },
 [nucleusId, projects.length],
 );

 const updateProject = useCallback(
 async (id: string, data: Partial<LocalProject>) => {
 await db.projects.update(id, {
 ...data,
 _sync: "pending",
 _local_mtime: Date.now(),
 });
 await syncEngine.enqueue(id, "project", "update", { ...data });
 if (navigator.onLine) syncEngine.pushPending();
 },
 [],
 );

 const removeProject = useCallback(async (id: string) => {
 await db.projects.delete(id);
 await syncEngine.enqueue(id, "project", "delete", {});
 if (navigator.onLine) syncEngine.pushPending();
 }, []);

 const reorderProjects = useCallback(
 async (orderedIds: string[]) => {
 for (let i = 0; i < orderedIds.length; i++) {
 await db.projects.update(orderedIds[i], {
 position: i,
 _sync: "pending",
 _local_mtime: Date.now(),
 });
 await syncEngine.enqueue(orderedIds[i], "project", "update", { position: i });
 }
 if (navigator.onLine) syncEngine.pushPending();
 },
 [],
 );

 return { projects, addProject, updateProject, removeProject, reorderProjects };
}
