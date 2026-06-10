"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconArrowLeft, IconHash } from "@tabler/icons-react";
import { useNucleusStore } from "@/stores/nucleus";
import { db, type LocalArea, type LocalTask } from "@/lib/db/dexie";
import { TaskRow } from "@/components/app/task-row";
import { TaskDetail } from "@/components/app/task-detail";
import { useTasks } from "@/hooks/use-tasks";
import { liveQuery } from "dexie";

export default function AreaPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.id as string;
  const nucleusId = useNucleusStore((s) => s.currentNucleusId);
  const [area, setArea] = useState<LocalArea | null>(null);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<LocalTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { updateTask, removeTask } = useTasks("inbox");

  useEffect(() => {
    if (!nucleusId) return;
    const nid: string = nucleusId;

    db.areas.get(areaId).then((a) => setArea(a ?? null));

    async function loadTasks() {
      const projectsInArea = await db.projects
        .where("area_id")
        .equals(areaId)
        .toArray();
      const projectIds = new Set(projectsInArea.map((p) => p.id));

      const allTasks = await db.tasks
        .where("nuclei_id")
        .equals(nid)
        .filter((t) =>
          !t.is_completed && (
            t.area_id === areaId ||
            projectIds.has(t.project_id ?? "")
          )
        )
        .toArray();

      setTasks(allTasks.sort((a, b) => (a.position ?? 999) - (b.position ?? 999)));
    }

    loadTasks();

    const sub = liveQuery(() =>
      Promise.all([
        db.projects.where("area_id").equals(areaId).toArray(),
        db.tasks.where("nuclei_id").equals(nid).toArray(),
      ]).then(([projectsInArea, allTasks]) => {
        const projectIds = new Set(projectsInArea.map((p) => p.id));
        return allTasks
          .filter((t) =>
            !t.is_completed && (
              t.area_id === areaId ||
              projectIds.has(t.project_id ?? "")
            )
          )
          .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
      }),
    ).subscribe({
      next: setTasks,
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId, areaId]);

  return (
    <>
      <div className="flex flex-col bg-white">
        <div className="px-4 lg:px-6 py-3 border-b border-hairline bg-canvas flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center size-8 rounded-md text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors"
          >
            <IconArrowLeft size={20} />
          </button>
            <IconHash size={20} className="text-ink-mid shrink-0" />
          <h1 className="text-subheading text-ink">
            {area?.name ?? "Carregando..."}
          </h1>
        </div>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-body text-ink-muted">Nenhuma tarefa nesta área</p>
          </div>
        )}

        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={async (id, completed) => {
              await updateTask(id, {
                is_completed: completed,
                completed_at: completed ? new Date().toISOString() : null,
              });
            }}
            onSelect={(task) => {
              setSelectedTask(task);
              setDetailOpen(true);
            }}
          />
        ))}
      </div>

      <TaskDetail
        task={selectedTask}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTask(null);
        }}
        onSave={async (id, data) => {
          await updateTask(id, data);
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        onDelete={async (id) => {
          await removeTask(id);
          setDetailOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
