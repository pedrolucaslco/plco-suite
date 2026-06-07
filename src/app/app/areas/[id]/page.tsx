"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Hash } from "lucide-react";
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

    db.areas.get(areaId).then((a) => setArea(a ?? null));

    const sub = liveQuery(() =>
      db.tasks
        .where("nuclei_id")
        .equals(nucleusId)
        .filter((t) => t.area_id === areaId && !t.is_completed)
        .toArray(),
    ).subscribe({
      next: (result) =>
        setTasks(result.sort((a, b) => (a.position ?? 999) - (b.position ?? 999))),
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId, areaId]);

  return (
    <>
      <div className="flex flex-col">
        <div className="px-4 lg:px-6 py-3 border-b border-hairline bg-surface flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center size-8 rounded-md text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <Hash size={20} className="text-ink-mid shrink-0" />
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
