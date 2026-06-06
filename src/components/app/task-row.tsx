"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LocalTask } from "@/lib/db/dexie";

interface TaskRowProps {
  task: LocalTask;
  onToggle: (id: string, completed: boolean) => void;
  onSelect: (task: LocalTask) => void;
}

const sectionBadge: Record<string, { label: string; class: string }> = {
  inbox: { label: "Inbox", class: "bg-muted text-ink-mid" },
  today: { label: "Hoje", class: "bg-today/15 text-today" },
  upcoming: { label: "Em Breve", class: "bg-primary/10 text-primary" },
  anytime: { label: "Qlq Hora", class: "bg-muted text-ink-mid" },
  someday: { label: "Algum Dia", class: "bg-muted text-ink-muted" },
};

export function TaskRow({ task, onToggle, onSelect }: TaskRowProps) {
  const badge = sectionBadge[task.section];

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
            <Badge variant="outline" className={badge.class}>
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
