import { db, type EntityType, type SyncStatus } from "@/lib/db/dexie";
import { createClient } from "@/lib/db/client";

type SyncEvent =
  | { type: "syncing" }
  | { type: "synced" }
  | { type: "error"; message: string }
  | { type: "conflict"; entity: any; serverEntity: any };

type Listener = (event: SyncEvent) => void;

const TABLES: EntityType[] = ["task", "area", "project"];

function tableName(type: EntityType): "tasks" | "areas" | "projects" {
  if (type === "task") return "tasks";
  if (type === "area") return "areas";
  return "projects";
}

function dbTable(type: EntityType) {
  if (type === "task") return db.tasks;
  if (type === "area") return db.areas;
  return db.projects;
}

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

  private async syncTable(entityType: EntityType, nucleusId: string) {
    const table = tableName(entityType);
    const dexieTable = dbTable(entityType);

    const { data, error } = await this.supabase
      .from(table)
      .select("*")
      .eq("nuclei_id", nucleusId);

    if (error) throw error;

    const serverRows = (data ?? []) as any[];
    const localRows = await (dexieTable as any)
      .where({ nuclei_id: nucleusId })
      .toArray() as any[];

    const localMap = new Map(localRows.map((r: any) => [r.id, r]));
    const serverIds = new Set(serverRows.map((r: any) => r.id));

    for (const sr of serverRows) {
      const local = localMap.get(sr.id);

      if (!local) {
        await (dexieTable as any).put({
          ...sr,
          _sync: "synced",
          _local_mtime: 0,
          _server_updated_at: sr.updated_at,
        });
      } else if (local._sync === "synced" && sr.updated_at > local._server_updated_at) {
        await (dexieTable as any).put({
          ...sr,
          _sync: "synced",
          _local_mtime: 0,
          _server_updated_at: sr.updated_at,
        });
      } else if (local._sync === "pending" && sr.updated_at > local._server_updated_at) {
        await (dexieTable as any).update(sr.id, { _sync: "conflict" });
        this.emit({ type: "conflict", entity: local, serverEntity: sr });
      }
    }

    const toDelete = localRows.filter((r: any) => !serverIds.has(r.id));
    for (const r of toDelete) {
      if (r._sync !== "pending") {
        await (dexieTable as any).delete(r.id);
      }
    }
  }

  async initialPull(nucleusId: string) {
    this.emit({ type: "syncing" });
    try {
      await Promise.all(TABLES.map((t) => this.syncTable(t, nucleusId)));
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
        const table = tableName(item.entity_type);

        if (item.action === "insert") {
          const { data, error } = await this.supabase
            .from(table)
            .insert(item.payload as never)
            .select();
          if (error) throw error;
          const serverRow = data?.[0] as Record<string, unknown> | undefined;
          if (serverRow) {
            const serverTs = (serverRow.updated_at ?? serverRow.created_at) as string | undefined;
            if (serverTs) {
              await (dbTable(item.entity_type) as any).update(item.entity_id, {
                _server_updated_at: serverTs,
              });
            }
          }
        } else if (item.action === "update") {
          const { error } = await this.supabase
            .from(table)
            .update(item.payload as never)
            .eq("id", item.entity_id);
          if (error) throw error;
        } else if (item.action === "delete") {
          const { error } = await this.supabase
            .from(table)
            .delete()
            .eq("id", item.entity_id);
          if (error) throw error;
        }

        await db.sync_queue.delete(item.id!);
        await (dbTable(item.entity_type) as any).update(item.entity_id, { _sync: "synced" });
      } catch (err) {
        await db.sync_queue.update(item.id!, { retries: item.retries + 1 });

        const msg = (err as Error).message;
        this.emit({ type: "error", message: msg });

        const entity = await (dbTable(item.entity_type) as any).get(item.entity_id);
        if (entity) {
          const serverEntity = await this.fetchServerEntity(item.entity_id, item.entity_type);
          if (serverEntity) {
            await (dbTable(item.entity_type) as any).update(item.entity_id, { _sync: "conflict" });
            this.emit({ type: "conflict", entity, serverEntity });
          }
        }
        return;
      }
    }

    this.emit({ type: "synced" });
  }

  async pullRemote(nucleusId: string) {
    try {
      await Promise.all(TABLES.map((t) => this.syncTable(t, nucleusId)));
    } catch (err) {
      this.emit({ type: "error", message: (err as Error).message });
    }
  }

  async resolveConflict(entityId: string, keep: "local" | "server", entityType?: EntityType) {
    const type = entityType ?? ("task" as EntityType);

    if (keep === "server") {
      const serverEntity = await this.fetchServerEntity(entityId, type);
      if (serverEntity) {
        await (dbTable(type) as any).put({
          ...serverEntity,
          _sync: "synced",
          _local_mtime: 0,
          _server_updated_at: serverEntity.updated_at,
        });
        const queueItems = await db.sync_queue.where({ entity_id: entityId, entity_type: type }).toArray();
        for (const item of queueItems) {
          await db.sync_queue.delete(item.id!);
        }
      }
    } else {
      await (dbTable(type) as any).update(entityId, { _sync: "pending" });
      const queued = await db.sync_queue.where({ entity_id: entityId, entity_type: type }).last();
      if (queued) {
        await this.pushPending();
      }
    }
  }

  private async fetchServerEntity(entityId: string, entityType: EntityType) {
    const table = tableName(entityType);
    const { data } = await this.supabase
      .from(table)
      .select("*")
      .eq("id", entityId)
      .single();
    return (data ?? null) as any;
  }

  async enqueue(entityId: string, entityType: EntityType, action: "insert" | "update" | "delete", payload: Record<string, unknown>) {
    await db.sync_queue.add({
      entity_id: entityId,
      entity_type: entityType,
      action,
      payload,
      created_at: Date.now(),
      retries: 0,
    });
  }

  async getSyncStatus(entityId: string, entityType: EntityType): Promise<SyncStatus> {
    const entity = await (dbTable(entityType) as any).get(entityId);
    return entity?._sync ?? "synced";
  }
}

export const syncEngine = new SyncEngine();
