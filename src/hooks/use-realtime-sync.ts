"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/db/client";
import { db, type LocalTask, type LocalArea, type LocalProject } from "@/lib/db/dexie";

function makeInsertPayload(newRow: Record<string, unknown>) {
  return {
    id: newRow.id as string,
    nuclei_id: newRow.nuclei_id as string,
    _sync: "synced" as const,
    _local_mtime: 0,
    _server_updated_at: (newRow.updated_at ?? newRow.created_at) as string,
  };
}

export function useRealtimeSync(nucleusId: string | null) {
  useEffect(() => {
    if (!nucleusId) return;

    const supabase = createClient();

    async function handleTaskChange(payload: {
      event_type: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) {
      const { event_type: event, new: newRow, old: oldRow } = payload;

      if (event === "INSERT" && newRow) {
        const existing = await db.tasks.get(newRow.id as string);
        if (!existing) {
          await db.tasks.put({
            ...(newRow as unknown as LocalTask),
            ...makeInsertPayload(newRow),
          });
        }
      } else if (event === "UPDATE" && newRow) {
        const existing = await db.tasks.get(newRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.tasks.put({
            ...(newRow as unknown as LocalTask),
            _sync: "synced",
            _local_mtime: 0,
            _server_updated_at: (newRow.updated_at as string) ?? existing._server_updated_at,
          });
        }
      } else if (event === "DELETE" && oldRow) {
        const existing = await db.tasks.get(oldRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.tasks.delete(oldRow.id as string);
        }
      }
    }

    async function handleAreaChange(payload: {
      event_type: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) {
      const { event_type: event, new: newRow, old: oldRow } = payload;

      if (event === "INSERT" && newRow) {
        const existing = await db.areas.get(newRow.id as string);
        if (!existing) {
          await db.areas.put({
            ...(newRow as unknown as LocalArea),
            ...makeInsertPayload(newRow),
          });
        }
      } else if (event === "UPDATE" && newRow) {
        const existing = await db.areas.get(newRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.areas.put({
            ...(newRow as unknown as LocalArea),
            _sync: "synced",
            _local_mtime: 0,
            _server_updated_at: (newRow.created_at as string) ?? existing._server_updated_at,
          });
        }
      } else if (event === "DELETE" && oldRow) {
        const existing = await db.areas.get(oldRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.areas.delete(oldRow.id as string);
        }
      }
    }

    async function handleProjectChange(payload: {
      event_type: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) {
      const { event_type: event, new: newRow, old: oldRow } = payload;

      if (event === "INSERT" && newRow) {
        const existing = await db.projects.get(newRow.id as string);
        if (!existing) {
          await db.projects.put({
            ...(newRow as unknown as LocalProject),
            ...makeInsertPayload(newRow),
          });
        }
      } else if (event === "UPDATE" && newRow) {
        const existing = await db.projects.get(newRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.projects.put({
            ...(newRow as unknown as LocalProject),
            _sync: "synced",
            _local_mtime: 0,
            _server_updated_at: (newRow.created_at as string) ?? existing._server_updated_at,
          });
        }
      } else if (event === "DELETE" && oldRow) {
        const existing = await db.projects.get(oldRow.id as string);
        if (existing && existing._sync !== "pending") {
          await db.projects.delete(oldRow.id as string);
        }
      }
    }

    const channel = supabase
      .channel("realtime-sync")
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "tasks", filter: `nuclei_id=eq.${nucleusId}` },
        handleTaskChange,
      )
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "areas", filter: `nuclei_id=eq.${nucleusId}` },
        handleAreaChange,
      )
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "projects", filter: `nuclei_id=eq.${nucleusId}` },
        handleProjectChange,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nucleusId]);
}
