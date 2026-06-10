"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { db, type LocalTask } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";
import { useTaskStore } from "@/stores/tasks";
import { TaskRow } from "./task-row";
import { TaskDetail } from "./task-detail";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

export function CalendarView() {
  const allTasks = useTaskStore((s) => s.tasks);
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTask, setSelectedTask] = useState<LocalTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const tasksByDate = useMemo(() => {
    const map: Record<string, LocalTask[]> = {};
    for (const task of allTasks) {
      if (!task.due_date || task.is_completed) continue;
      const key = task.due_date.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(task);
    }
    return map;
  }, [allTasks]);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate[key] ?? [];
  }, [selectedDate, tasksByDate]);

  const taskDateStrings = useMemo(
    () => Array.from(new Set(Object.keys(tasksByDate)).values()).sort(),
    [tasksByDate],
  );

  const modifiers = useMemo(
    () => ({
      hasTasks: taskDateStrings.map((d) => new Date(d + "T00:00:00")),
    }),
    [taskDateStrings],
  );

  async function handleToggle(id: string, completed: boolean) {
    const now = new Date().toISOString();
    await db.tasks.update(id, {
      is_completed: completed,
      completed_at: completed ? now : null,
      updated_at: now,
      _sync: "pending",
      _local_mtime: Date.now(),
    });
    await syncEngine.enqueue(id, "task", "update", {
      is_completed: completed,
      completed_at: completed ? now : null,
      updated_at: now,
    });
    if (navigator.onLine) syncEngine.pushPending();
  }

  async function handleSave(id: string, data: Partial<LocalTask>) {
    const now = new Date().toISOString();
    const payload: Record<string, unknown> = { ...data, updated_at: now };
    await db.tasks.update(id, {
      ...data,
      updated_at: now,
      _sync: "pending",
      _local_mtime: Date.now(),
    });
    await syncEngine.enqueue(id, "task", "update", payload);
    if (navigator.onLine) syncEngine.pushPending();
  }

  async function handleDelete(id: string) {
    await db.tasks.delete(id);
    await syncEngine.enqueue(id, "task", "delete", {});
    if (navigator.onLine) syncEngine.pushPending();
  }

  const DayButton = useCallback(
    ({ day, modifiers: dayMods, children, ...rest }: React.ComponentProps<typeof CalendarDayButton>) => {
      const dateStr = format(day.date, "yyyy-MM-dd");
      const dayTasks = tasksByDate[dateStr] ?? [];
      return (
        <CalendarDayButton day={day} modifiers={dayMods} {...rest}>
          {children}
          {dayTasks.length > 0 && (
            <span
              aria-hidden
              className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
            />
          )}
        </CalendarDayButton>
      );
    },
    [tasksByDate],
  );

  const isToday = useCallback(
    (d: Date) => format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
    [today],
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-4 lg:px-6 pt-4 pb-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          locale={ptBR}
          modifiers={modifiers}
          components={{
            DayButton,
          }}
        />
      </div>

      <div className="border-t border-hairline flex-1">
        <div className="px-4 lg:px-6 py-3 bg-muted/30">
          <h2 className="text-caption font-medium text-ink-mid uppercase tracking-wider">
            {selectedDate
              ? isToday(selectedDate)
                ? "Hoje"
                : format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
              : "Selecione uma data"}
          </h2>
        </div>
        {selectedTasks.length === 0 ? (
          <div className="px-4 lg:px-6 py-12 text-center">
            <p className="text-body text-ink-muted">Nenhuma tarefa para este dia</p>
          </div>
        ) : (
          selectedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onSelect={(t) => {
                setSelectedTask(t);
                setDetailOpen(true);
              }}
              onSectionChange={(id, section) => handleSave(id, { section: section as LocalTask["section"] })}
            />
          ))
        )}
      </div>

      <TaskDetail
        task={selectedTask}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTask(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
