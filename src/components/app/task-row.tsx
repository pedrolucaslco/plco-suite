"use client";

import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { setDraggedTaskId } from "@/lib/drag-state";
import type { LocalTask } from "@/lib/db/dexie";

interface TaskRowProps {
  task: LocalTask;
  onToggle: (id: string, completed: boolean) => void;
  onSelect: (task: LocalTask) => void;
  onSectionChange?: (id: string, section: string) => void;
}

const SECTIONS = ["inbox", "today", "upcoming", "anytime", "someday"] as const;

const sectionBadge: Record<string, { label: string; class: string }> = {
  inbox: { label: "Inbox", class: "bg-muted text-ink-mid" },
  today: { label: "Hoje", class: "bg-today/15 text-today" },
  upcoming: { label: "Em Breve", class: "bg-primary/10 text-primary" },
  anytime: { label: "Qlq Hora", class: "bg-muted text-ink-mid" },
  someday: { label: "Algum Dia", class: "bg-muted text-ink-muted" },
};

export function TaskRow({ task, onToggle, onSelect, onSectionChange }: TaskRowProps) {
  const badge = sectionBadge[task.section];

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSectionChange) return;
    const idx = SECTIONS.indexOf(task.section as typeof SECTIONS[number]);
    const next = SECTIONS[(idx + 1) % SECTIONS.length];
    onSectionChange(task.id, next);
  }, [task.id, task.section, onSectionChange]);

  const handleBadgeDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    setDraggedTaskId(task.id);
  }, [task.id]);

  const handleBadgeDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 lg:px-6 py-3 border-b border-hairline transition-colors hover:bg-muted/30 cursor-pointer",
        task.is_completed && "opacity-50",
        task.section === "someday" && "opacity-60",
      )}
      onClick={() => onSelect(task)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={(checked) =>
            onToggle(task.id, checked as boolean)
          }
          className="mt-0.5"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={cn(
            "text-body text-ink truncate",
            task.is_completed && "line-through text-ink-muted",
          )}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 text-caption text-ink-muted">
          {badge && (
            <Badge
              variant="outline"
              className={cn(badge.class, onSectionChange && "cursor-grab active:cursor-grabbing")}
              draggable={!!onSectionChange}
              onClick={handleBadgeClick}
              onDragStart={handleBadgeDragStart}
              onDragEnd={handleBadgeDragEnd}
            >
              {badge.label}
            </Badge>
          )}
          {task.due_date && (
            <span>{new Date(task.due_date).toLocaleDateString("pt-BR")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
