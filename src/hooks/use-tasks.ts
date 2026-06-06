"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { liveQuery } from "dexie";
import { db, type LocalTask } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

export type SyncState = "synced" | "syncing" | "error" | "offline" | "conflict";

export function useTasks(section: string) {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [syncState, setSyncState] = useState<SyncState>("syncing");
  const [syncError, setSyncError] = useState<string | null>(null);
  const nucleusId = useNucleusStore((s) => s.currentNucleusId);
  const supabase = createClient();
  const onlineRef = useRef(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    if (!nucleusId) return;

    db.tasks
      .where({ nuclei_id: nucleusId, section })
      .toArray()
      .then((result) => {
        setTasks(result.sort((a, b) => (a.position ?? 999) - (b.position ?? 999)));
      });

    const sub = liveQuery(() =>
      db.tasks
        .where({ nuclei_id: nucleusId, section })
        .toArray(),
    ).subscribe({
      next: (result) => {
        setTasks(result.sort((a, b) => (a.position ?? 999) - (b.position ?? 999)));
      },
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId, section]);

  useEffect(() => {
    if (!nucleusId) return;

    syncEngine.initialPull(nucleusId);

    const unsub = syncEngine.subscribe((event) => {
      switch (event.type) {
        case "syncing":
          setSyncState("syncing");
          break;
        case "synced":
          setSyncState("synced");
          setSyncError(null);
          break;
        case "error":
          setSyncState("error");
          setSyncError(event.message);
          break;
        case "conflict":
          setSyncState("conflict");
          break;
      }
    });

    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncEngine.pullRemote(nucleusId);
      }
    }, 30000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [nucleusId]);

  useEffect(() => {
    function handleOnline() {
      onlineRef.current = true;
      setSyncState("syncing");
      syncEngine.pushPending();
      if (nucleusId) syncEngine.pullRemote(nucleusId);
    }
    function handleOffline() {
      onlineRef.current = false;
      setSyncState("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
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
        position: tasks.length,
        created_at: now,
        updated_at: now,
        _sync: "pending",
        _local_mtime: Date.now(),
        _server_updated_at: now,
      };

      await db.tasks.add(task);
      await syncEngine.enqueue(task.id, "insert", {
        nuclei_id: nucleusId,
        created_by: profileId,
        title: data.title,
        description: data.description ?? null,
        section,
      });

      if (navigator.onLine) {
        syncEngine.pushPending();
      }
    },
    [nucleusId, section, tasks.length, getProfileId],
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

      await syncEngine.enqueue(id, "update", payload);

      if (navigator.onLine) {
        syncEngine.pushPending();
      }
    },
    [],
  );

  const removeTask = useCallback(async (id: string) => {
    await db.tasks.delete(id);
    await syncEngine.enqueue(id, "delete", {});

    if (navigator.onLine) {
      syncEngine.pushPending();
    }
  }, []);

  const reorderTasks = useCallback(
    async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, i) => ({ id, position: i }));
      for (const u of updates) {
        await db.tasks.update(u.id, {
          position: u.position,
          _sync: "pending",
          _local_mtime: Date.now(),
        });
        await syncEngine.enqueue(u.id, "update", { position: u.position });
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
    loading,
    syncState,
    syncError,
    addTask,
    updateTask,
    removeTask,
    reorderTasks,
    resolveConflict,
  };
}
