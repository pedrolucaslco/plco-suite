"use client";

import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { setDraggedTaskId } from "@/lib/drag-state";
import type { LocalTask } from "@/lib/db/dexie";
import { Button } from "@/components/ui/button";

interface TaskRowProps {
 task: LocalTask;
 onToggle: (id: string, completed: boolean) => void;
 onSelect: (task: LocalTask) => void;
 onSectionChange?: (id: string, section: string) => void;
 currentSection?: string;
}

const SECTIONS = ["inbox", "today", "upcoming", "anytime", "someday"] as const;

const sectionLabel: Record<string, string> = {
 inbox: "Inbox",
 today: "Hoje",
 upcoming: "Em Breve",
 anytime: "Qlq Hora",
 someday: "Algum Dia",
};

export function TaskRow({ task, onToggle, onSelect, onSectionChange, currentSection }: TaskRowProps) {
 const showSection = currentSection !== task.section;

 const handleSectionClick = useCallback((e: React.MouseEvent) => {
 e.stopPropagation();
 if (!onSectionChange) return;
 const idx = SECTIONS.indexOf(task.section as typeof SECTIONS[number]);
 const next = SECTIONS[(idx + 1) % SECTIONS.length];
 onSectionChange(task.id, next);
 }, [task.id, task.section, onSectionChange]);

 const handleSectionDragStart = useCallback((e: React.DragEvent) => {
 e.dataTransfer.effectAllowed = "move";
 e.dataTransfer.setData("text/plain", task.id);
 setDraggedTaskId(task.id);
 }, [task.id]);

 const handleSectionDragEnd = useCallback(() => {
 setDraggedTaskId(null);
 }, []);

 return (
 <div
 className={cn(
 "group flex items-start gap-3 px-4 lg:px-6 py-3 transition-colors hover:bg-muted/30 cursor-pointer",
 task.is_completed && "opacity-50",
 task.section === "someday" && "opacity-60",
 )}
 onClick={() => onSelect(task)}
 >
 <label
 className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
 onClick={(e) => e.stopPropagation()}
 >
 <Checkbox
 checked={task.is_completed}
 onCheckedChange={(checked) =>
 onToggle(task.id, checked as boolean)
 }
 className="mt-0.5 shrink-0"
 />
 <span className="flex-1 min-w-0">
 <span className="flex items-baseline gap-2 overflow-hidden">
 <span
 className={cn(
 " text-foreground truncate",
 task.is_completed && "line-through text-muted-foreground",
 )}
 >
 {task.title}
 </span>
 {task.due_date && (
 <Button variant={"secondary"} disabled>
 {new Date(task.due_date).toLocaleDateString("pt-BR")}
 </Button>
 )}
 </span>
 {showSection && (
 <span
 className={cn(
 "block text-xs text-muted-foreground text-sm mt-0.5",
 onSectionChange && "cursor-grab active:cursor-grabbing",
 )}
 draggable={!!onSectionChange}
 onClick={handleSectionClick}
 onDragStart={handleSectionDragStart}
 onDragEnd={handleSectionDragEnd}
 >
 {sectionLabel[task.section]}
 </span>
 )}
 </span>
 </label>
 </div>
 );
}
