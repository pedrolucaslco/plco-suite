"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/db/client";
import { db, type LocalTask, type LocalArea, type LocalProject } from "@/lib/db/dexie";

function serverTimestamp(newRow: Record<string, unknown>): string {
 return (newRow.updated_at ?? newRow.created_at) as string;
}

type RealtimePayload = {
 event_type: string;
 new: Record<string, unknown>;
 old: Record<string, unknown>;
};

async function handleInsertTask(newRow: Record<string, unknown>) {
 const existing = await db.tasks.get(newRow.id as string);
 if (existing) return;
 await db.tasks.put({
 ...(newRow as unknown as LocalTask),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleUpdateTask(newRow: Record<string, unknown>) {
 const existing = await db.tasks.get(newRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.tasks.put({
 ...(newRow as unknown as LocalTask),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleDeleteTask(oldRow: Record<string, unknown>) {
 const existing = await db.tasks.get(oldRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.tasks.delete(oldRow.id as string);
}

async function handleInsertArea(newRow: Record<string, unknown>) {
 const existing = await db.areas.get(newRow.id as string);
 if (existing) return;
 await db.areas.put({
 ...(newRow as unknown as LocalArea),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleUpdateArea(newRow: Record<string, unknown>) {
 const existing = await db.areas.get(newRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.areas.put({
 ...(newRow as unknown as LocalArea),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleDeleteArea(oldRow: Record<string, unknown>) {
 const existing = await db.areas.get(oldRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.areas.delete(oldRow.id as string);
}

async function handleInsertProject(newRow: Record<string, unknown>) {
 const existing = await db.projects.get(newRow.id as string);
 if (existing) return;
 await db.projects.put({
 ...(newRow as unknown as LocalProject),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleUpdateProject(newRow: Record<string, unknown>) {
 const existing = await db.projects.get(newRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.projects.put({
 ...(newRow as unknown as LocalProject),
 _sync: "synced",
 _local_mtime: 0,
 _server_updated_at: serverTimestamp(newRow),
 });
}

async function handleDeleteProject(oldRow: Record<string, unknown>) {
 const existing = await db.projects.get(oldRow.id as string);
 if (!existing || existing._sync === "pending") return;
 await db.projects.delete(oldRow.id as string);
}

export function useRealtimeSync(nucleusId: string | null) {
 useEffect(() => {
 if (!nucleusId) return;

 const supabase = createClient();

 const channel = supabase
 .channel("realtime-sync")
 .on(
 "postgres_changes" as never,
 { event: "*", schema: "public", table: "tasks", filter: `nuclei_id=eq.${nucleusId}` },
 (payload: RealtimePayload) => {
 const { event_type: event, new: newRow, old: oldRow } = payload;
 if (event === "INSERT" && newRow) handleInsertTask(newRow);
 else if (event === "UPDATE" && newRow) handleUpdateTask(newRow);
 else if (event === "DELETE" && oldRow) handleDeleteTask(oldRow);
 },
 )
 .on(
 "postgres_changes" as never,
 { event: "*", schema: "public", table: "areas", filter: `nuclei_id=eq.${nucleusId}` },
 (payload: RealtimePayload) => {
 const { event_type: event, new: newRow, old: oldRow } = payload;
 if (event === "INSERT" && newRow) handleInsertArea(newRow);
 else if (event === "UPDATE" && newRow) handleUpdateArea(newRow);
 else if (event === "DELETE" && oldRow) handleDeleteArea(oldRow);
 },
 )
 .on(
 "postgres_changes" as never,
 { event: "*", schema: "public", table: "projects", filter: `nuclei_id=eq.${nucleusId}` },
 (payload: RealtimePayload) => {
 const { event_type: event, new: newRow, old: oldRow } = payload;
 if (event === "INSERT" && newRow) handleInsertProject(newRow);
 else if (event === "UPDATE" && newRow) handleUpdateProject(newRow);
 else if (event === "DELETE" && oldRow) handleDeleteProject(oldRow);
 },
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [nucleusId]);
}
