import Dexie, { type EntityTable } from "dexie";

export type SyncStatus = "synced" | "pending" | "conflict";

export type EntityType = "task" | "area" | "project";

export interface LocalTask {
  id: string;
  nuclei_id: string;
  created_by: string;
  title: string;
  description: string | null;
  section: string;
  due_date: string | null;
  project_id: string | null;
  area_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
  _sync: SyncStatus;
  _local_mtime: number;
  _server_updated_at: string;
}

export interface LocalArea {
  id: string;
  nuclei_id: string;
  name: string;
  position: number | null;
  created_at: string;
  _sync: SyncStatus;
  _local_mtime: number;
  _server_updated_at: string;
}

export interface LocalProject {
  id: string;
  nuclei_id: string;
  name: string;
  area_id: string | null;
  position: number | null;
  created_at: string;
  _sync: SyncStatus;
  _local_mtime: number;
  _server_updated_at: string;
}

export interface SyncQueueItem {
  id?: number;
  entity_id: string;
  entity_type: EntityType;
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  created_at: number;
  retries: number;
}

const db = new Dexie("plco") as Dexie & {
  tasks: EntityTable<LocalTask, "id">;
  areas: EntityTable<LocalArea, "id">;
  projects: EntityTable<LocalProject, "id">;
  sync_queue: EntityTable<SyncQueueItem, "id">;
};

db.version(2).stores({
  tasks: "id, nuclei_id, section, due_date, _sync, _local_mtime",
  sync_queue: "++id, task_id, created_at",
});

db.version(3).stores({
  tasks: "id, nuclei_id, section, due_date, _sync, _local_mtime",
  areas: "id, nuclei_id, _sync, _local_mtime",
  projects: "id, nuclei_id, area_id, _sync, _local_mtime",
  sync_queue: "++id, entity_id, entity_type, created_at",
}).upgrade((tx) =>
  tx.table("sync_queue").toCollection().modify((item) => {
    item.entity_id ??= item.task_id;
    item.entity_type ??= "task";
  }),
);

export { db };
