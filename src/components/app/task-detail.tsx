"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { JumpStart } from "@/components/app/jump-start";
import type { LocalTask } from "@/lib/db/dexie";

interface TaskDetailProps {
  task: LocalTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<LocalTask>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SECTIONS = [
  { value: "inbox", label: "Inbox" },
  { value: "today", label: "Hoje" },
  { value: "upcoming", label: "Em Breve" },
  { value: "anytime", label: "Qualquer Hora" },
  { value: "someday", label: "Algum Dia" },
] as const;

export function TaskDetail({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: TaskDetailProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [completed, setCompleted] = useState(task?.is_completed ?? false);
  const [section, setSection] = useState<string>(task?.section ?? "inbox");
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.due_date ? new Date(task.due_date) : null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setCompleted(task?.is_completed ?? false);
    setSection(task?.section ?? "inbox");
    setDueDate(task?.due_date ? new Date(task.due_date) : null);
  }, [task]);

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    await onSave(task.id, {
      title: title.trim() || task.title,
      description: description || null,
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
      section,
    });
    setSaving(false);
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!task) return;
    await onDelete(task.id);
    onOpenChange(false);
  }

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
        <div className="space-y-5 pt-2">
          <div className="flex items-start gap-3">
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={completed}
                onCheckedChange={(c) => setCompleted(c as boolean)}
                className="mt-1"
              />
            </div>
            <div className="flex-1 space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-body-bold border-0 px-0 h-auto focus-visible:ring-0"
              />

              <div>
                <label className="text-caption text-ink-muted block mb-1">
                  Notas
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Adicionar notas..."
                />
              </div>

              <div>
                <label className="text-caption text-ink-muted block mb-1">
                  Data
                </label>
                <JumpStart
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>

              <div>
                <label className="text-caption text-ink-muted block mb-1">
                  Lista
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full h-9 rounded-md border border-hairline bg-surface text-ink text-body px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-deadline"
            >
              Excluir
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
