"use client";

import { useCallback, useMemo } from "react";
import { db, type LocalTask } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";
import { useTaskStore } from "@/stores/tasks";

export type SyncState = "synced" | "syncing" | "error" | "offline" | "conflict";

export function useTasks(section: string) {
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);
 const allTasks = useTaskStore((s) => s.tasks);
 const syncState = useTaskStore((s) => s.syncState);
 const syncError = useTaskStore((s) => s.syncError);

 const tasks = useMemo(() => {
 if (!nucleusId) return [];
 const todayStr = new Date().toISOString().split("T")[0];
 const base = section === "today"
 ? allTasks.filter(
 (t) =>
 t.section === "today" ||
 (t.due_date != null && t.due_date.split("T")[0] <= todayStr),
 )
 : allTasks.filter((t) => t.section === section);
 return base.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
 }, [allTasks, nucleusId, section]);

 const getProfileId = useCallback(async () => {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return null;
 const { data: profile } = await supabase
 .from("profiles")
 .select("id")
 .eq("user_id", user.id)
 .maybeSingle();
 return profile?.id ?? null;
 }, []);

 const addTask = useCallback(
 async (data: { title: string; description?: string | null }) => {
 if (!nucleusId) return;
 const profileId = await getProfileId();
 if (!profileId) return;

 const now = new Date().toISOString();
 const task: LocalTask = {
 id: crypto.randomUUID(),
 nuclei_id: nucleusId,
 created_by: profileId,
 title: data.title,
 description: data.description ?? null,
 section,
 due_date: null,
 project_id: null,
 area_id: null,
 is_completed: false,
 completed_at: null,
 position: allTasks.filter((t) => t.section === section).length,
 created_at: now,
 updated_at: now,
 _sync: "pending",
 _local_mtime: Date.now(),
 _server_updated_at: now,
 };

 await db.tasks.add(task);
 await syncEngine.enqueue(task.id, "task", "insert", {
 id: task.id,
 nuclei_id: nucleusId,
 created_by: profileId,
 title: data.title,
 description: data.description ?? null,
 section,
 due_date: null,
 project_id: null,
 area_id: null,
 is_completed: false,
 completed_at: null,
 position: allTasks.filter((t) => t.section === section).length,
 created_at: now,
 updated_at: now,
 });

 if (navigator.onLine) {
 syncEngine.pushPending();
 }
 },
 [nucleusId, section, allTasks, getProfileId],
 );

 const updateTask = useCallback(
 async (id: string, data: Partial<LocalTask>) => {
 const now = new Date().toISOString();
 const payload: Record<string, unknown> = { ...data, updated_at: now };

 await db.tasks.update(id, {
 ...data,
 updated_at: now,
 _sync: "pending",
 _local_mtime: Date.now(),
 });

 await syncEngine.enqueue(id, "task", "update", payload);

 if (navigator.onLine) {
 syncEngine.pushPending();
 }
 },
 [],
 );

 const removeTask = useCallback(async (id: string) => {
 await db.tasks.delete(id);
 await syncEngine.enqueue(id, "task", "delete", {});

 if (navigator.onLine) {
 syncEngine.pushPending();
 }
 }, []);

 const reorderTasks = useCallback(
 async (orderedIds: string[]) => {
 for (let i = 0; i < orderedIds.length; i++) {
 await db.tasks.update(orderedIds[i], {
 position: i,
 _sync: "pending",
 _local_mtime: Date.now(),
 });
 await syncEngine.enqueue(orderedIds[i], "task", "update", {
 position: i,
 });
 }

 if (navigator.onLine) {
 syncEngine.pushPending();
 }
 },
 [],
 );

 const resolveConflict = useCallback(
 async (taskId: string, keep: "local" | "server") => {
 await syncEngine.resolveConflict(taskId, keep);
 },
 [],
 );

 return {
 tasks,
 syncState,
 syncError,
 addTask,
 updateTask,
 removeTask,
 reorderTasks,
 resolveConflict,
 };
}
