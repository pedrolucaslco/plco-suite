"use client";

import { useEffect } from "react";
import { liveQuery } from "dexie";
import { db } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { useNucleusStore } from "@/stores/nucleus";
import { useTaskStore } from "@/stores/tasks";

export function useTaskSubscription() {
  const nucleusId = useNucleusStore((s) => s.currentNucleusId);
  const setTasks = useTaskStore((s) => s.setTasks);
  const setSyncState = useTaskStore((s) => s.setSyncState);

  useEffect(() => {
    if (!nucleusId) return;

    const sub = liveQuery(() =>
      db.tasks.where("nuclei_id").equals(nucleusId).toArray(),
    ).subscribe({
      next: setTasks,
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId, setTasks]);

  useEffect(() => {
    if (!nucleusId) return;

    syncEngine.initialPull(nucleusId);

    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncEngine.pullRemote(nucleusId);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [nucleusId]);

  useEffect(() => {
    const unsub = syncEngine.subscribe((event) => {
      switch (event.type) {
        case "syncing":
          setSyncState("syncing");
          break;
        case "synced":
          setSyncState("synced");
          break;
        case "error":
          setSyncState("error", event.message);
          break;
        case "conflict":
          setSyncState("conflict");
          break;
      }
    });

    return () => { unsub(); };
  }, [setSyncState]);

  useEffect(() => {
    function handleOnline() {
      setSyncState("syncing");
      syncEngine.pushPending();
      if (nucleusId) syncEngine.pullRemote(nucleusId);
    }
    function handleOffline() {
      setSyncState("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [nucleusId, setSyncState]);
}
