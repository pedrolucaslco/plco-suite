import { db, type LocalTask, type SyncStatus } from "@/lib/db/dexie";
import { createClient } from "@/lib/db/client";

type SyncEvent =
  | { type: "syncing" }
  | { type: "synced" }
  | { type: "error"; message: string }
  | { type: "conflict"; task: LocalTask; serverTask: LocalTask };

type Listener = (event: SyncEvent) => void;

class SyncEngine {
  private listeners: Set<Listener> = new Set();
  private syncing = false;
  private supabase = createClient();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(event: SyncEvent) {
    this.listeners.forEach((fn) => fn(event));
  }

  async initialPull(nucleusId: string) {
    this.emit({ type: "syncing" });
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select("*")
        .eq("nuclei_id", nucleusId);

      if (error) throw error;

      const serverTasks = (data ?? []) as LocalTask[];
      const localTasks = await db.tasks
        .where({ nuclei_id: nucleusId })
        .toArray();

      const localMap = new Map(localTasks.map((t) => [t.id, t]));

      for (const st of serverTasks) {
        const local = localMap.get(st.id);
        if (!local) {
          await db.tasks.put({ ...st, _sync: "synced", _local_mtime: 0, _server_updated_at: st.updated_at });
        }
      }

      this.emit({ type: "synced" });
    } catch (err) {
      this.emit({ type: "error", message: (err as Error).message });
    }
  }

  async pushPending() {
    const queue = await db.sync_queue.toArray();
    if (queue.length === 0) return;

    this.emit({ type: "syncing" });

    for (const item of queue) {
      try {
        if (item.action === "insert") {
          const { error } = await this.supabase.from("tasks").insert(item.payload as never);
          if (error) throw error;
        } else if (item.action === "update") {
          const { error } = await this.supabase
            .from("tasks")
            .update(item.payload as never)
            .eq("id", item.task_id);
          if (error) throw error;
        } else if (item.action === "delete") {
          const { error } = await this.supabase
            .from("tasks")
            .delete()
            .eq("id", item.task_id);
          if (error) throw error;
        }

        await db.sync_queue.delete(item.id!);
        await db.tasks.update(item.task_id, { _sync: "synced" });
      } catch (err) {
        await db.sync_queue.update(item.id!, { retries: item.retries + 1 });

        const msg = (err as Error).message;
        this.emit({ type: "error", message: msg });

        const task = await db.tasks.get(item.task_id);
        if (task) {
          const serverTask = await this.fetchServerTask(item.task_id);
          if (serverTask) {
            await db.tasks.update(item.task_id, { _sync: "conflict" });
            this.emit({ type: "conflict", task, serverTask });
          }
        }
        return;
      }
    }

    this.emit({ type: "synced" });
  }

  async pullRemote(nucleusId: string) {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select("*")
        .eq("nuclei_id", nucleusId);

      if (error) throw error;

      const serverTasks = (data ?? []) as LocalTask[];
      const localTasks = await db.tasks
        .where({ nuclei_id: nucleusId })
        .toArray();

      const localMap = new Map(localTasks.map((t) => [t.id, t]));

      for (const st of serverTasks) {
        const local = localMap.get(st.id);
        if (!local) {
          await db.tasks.put({ ...st, _sync: "synced", _local_mtime: 0, _server_updated_at: st.updated_at });
        } else if (local._sync === "synced" && st.updated_at > local._server_updated_at) {
          await db.tasks.put({ ...st, _sync: "synced", _local_mtime: 0, _server_updated_at: st.updated_at });
        } else if (local._sync === "pending" && st.updated_at > local._server_updated_at) {
          await db.tasks.update(st.id, { _sync: "conflict" });
          this.emit({ type: "conflict", task: local, serverTask: st as unknown as LocalTask });
        }
      }

      const serverIds = new Set(serverTasks.map((t) => t.id));
      for (const local of localTasks) {
        if (!serverIds.has(local.id)) {
          await db.tasks.delete(local.id);
        }
      }
    } catch (err) {
      this.emit({ type: "error", message: (err as Error).message });
    }
  }

  async resolveConflict(taskId: string, keep: "local" | "server") {
    if (keep === "server") {
      const serverTask = await this.fetchServerTask(taskId);
      if (serverTask) {
        await db.tasks.put({ ...serverTask, _sync: "synced", _local_mtime: 0, _server_updated_at: serverTask.updated_at });
        const queueItems = await db.sync_queue.where({ task_id: taskId }).toArray();
        for (const item of queueItems) {
          await db.sync_queue.delete(item.id!);
        }
      }
    } else {
      await db.tasks.update(taskId, { _sync: "pending" });
      const queued = await db.sync_queue.where({ task_id: taskId }).last();
      if (queued) {
        await this.pushPending();
      }
    }
  }

  private async fetchServerTask(taskId: string) {
    const { data } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();
    return data as unknown as LocalTask | null;
  }

  async enqueue(taskId: string, action: "insert" | "update" | "delete", payload: Record<string, unknown>) {
    await db.sync_queue.add({
      task_id: taskId,
      action,
      payload,
      created_at: Date.now(),
      retries: 0,
    });
  }

  async getSyncStatus(taskId: string): Promise<SyncStatus> {
    const task = await db.tasks.get(taskId);
    return task?._sync ?? "synced";
  }
}

export const syncEngine = new SyncEngine();
