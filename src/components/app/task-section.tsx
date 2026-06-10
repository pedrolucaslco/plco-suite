"use client";

import { useState } from "react";
import {
 DndContext,
 closestCenter,
 type DragEndEvent,
 PointerSensor,
 TouchSensor,
 useSensor,
 useSensors,
} from "@dnd-kit/core";
import {
 SortableContext,
 verticalListSortingStrategy,
 useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { IconAlertCircleFilled, IconGripVertical, IconRefresh, IconWifiOff } from "@tabler/icons-react";
import { useTasks } from "@/hooks/use-tasks";
import { useNucleusStore } from "@/stores/nucleus";
import { TaskRow } from "./task-row";
import { CreateTaskTrigger } from "./create-task";
import { TaskDetail } from "./task-detail";
import { SyncConflictDialog } from "./sync-conflict-dialog";
import type { LocalTask } from "@/lib/db/dexie";

interface TaskSectionProps {
 section: "inbox" | "today" | "upcoming" | "anytime" | "someday";
}

interface SortableTaskRowProps {
 task: LocalTask;
 onToggle: (id: string, completed: boolean) => void;
 onSelect: (task: LocalTask) => void;
 onSectionChange: (id: string, section: string) => void;
 currentSection: string;
}

function SortableTaskRow({ task, onToggle, onSelect, onSectionChange, currentSection }: SortableTaskRowProps) {
 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 isDragging,
 } = useSortable({ id: task.id });

 const style = {
 transform: CSS.Transform.toString(transform),
 transition,
 };

 return (
 <div
 ref={setNodeRef}
 style={style}
 className={cn("group/sortable flex items-center", isDragging && "opacity-50")}
 >
 <button
 type="button"
 className="md:items-center hidden md:flex justify-center w-4 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover/sortable:opacity-100 transition-opacity"
 {...attributes}
 {...listeners}
 >
 <IconGripVertical size={16} />
 </button>
 <div className="flex-1 min-w-0">
 <TaskRow task={task} onToggle={onToggle} onSelect={onSelect} onSectionChange={onSectionChange} currentSection={currentSection} />
 </div>
 </div>
 );
}

export function TaskSection({ section }: TaskSectionProps) {
 const [selectedTask, setSelectedTask] = useState<LocalTask | null>(null);
 const [detailOpen, setDetailOpen] = useState(false);
 const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);
 const hydrated = useNucleusStore((s) => s.hydrated);

 const {
 tasks,
 syncState,
 syncError,
 updateTask,
 removeTask,
 reorderTasks,
 resolveConflict,
 } = useTasks(section);

 const sensors = useSensors(
 useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
 useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
 );

 async function handleToggle(id: string, completed: boolean) {
 await updateTask(id, {
 is_completed: completed,
 completed_at: completed ? new Date().toISOString() : null,
 });
 }

 function handleSelect(task: LocalTask) {
 setSelectedTask(task);
 setDetailOpen(true);
 }

 async function handleSectionChange(id: string, newSection: string) {
 await updateTask(id, { section: newSection as LocalTask["section"] });
 }

 async function handleDragEnd(event: DragEndEvent) {
 const { active, over } = event;
 if (!over || active.id === over.id) return;


 const activeTasks = tasks.filter((t) => !t.is_completed);
 const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
 const newIndex = activeTasks.findIndex((t) => t.id === over.id);
 if (oldIndex === -1 || newIndex === -1) return;

 const reordered = [...activeTasks];
 reordered.splice(oldIndex, 1);
 reordered.splice(newIndex, 0, activeTasks[oldIndex]);

 await reorderTasks(reordered.map((t) => t.id));
 }

 const activeTasks = tasks.filter((t) => !t.is_completed);
 const completedTasks = tasks.filter((t) => t.is_completed);

 return (
 <div className="flex flex-col">
 {syncState === "offline" && (
 <div className="px-4 lg:px-6 py-2 bg-amber-50/80 dark:bg-amber-950/20 border-b border flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
 <IconWifiOff size={14} />
 Offline — alterações serão sincronizadas quando você voltar online
 </div>
 )}

 {syncState === "syncing" && (
 <div className="px-4 lg:px-6 py-2 bg-sky-50/80 dark:bg-sky-950/20 border-b border flex items-center gap-2 text-xs text-sky-700 dark:text-sky-400">
 <IconRefresh size={14} className="animate-spin" />
 Sincronizando...
 </div>
 )}

 {syncState === "error" && syncError && (
 <div className="px-4 lg:px-6 py-3">
 <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 flex items-center gap-2">
 <IconAlertCircleFilled size={14} />
 {syncError}
 </p>
 </div>
 )}

 <div className="w-full max-w-[800px] mx-auto py-4 lg:py-32">
 {activeTasks.length === 0 && completedTasks.length === 0 && (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <p className=" text-muted-foreground">
 {!hydrated ? "Núcleo não selecionado" : nucleusId ? "Nenhuma tarefa aqui" : "Núcleo não selecionado"}
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 {!hydrated || !nucleusId ? (
 "Selecione ou crie um núcleo familiar"
 ) : (
 <CreateTaskTrigger section={section} onCreated={() => {}}>
 <span className="text-primary hover:underline">
 Adicionar primeira tarefa
 </span>
 </CreateTaskTrigger>
 )}
 </p>
 </div>
 )}

 <DndContext
 sensors={sensors}
 collisionDetection={closestCenter}
 onDragEnd={handleDragEnd}
 >
 <SortableContext
 items={activeTasks.map((t) => t.id)}
 strategy={verticalListSortingStrategy}
 >
 {activeTasks.map((task) => (
 <SortableTaskRow
 key={task.id}
 task={task}
 onToggle={handleToggle}
 onSelect={handleSelect}
 onSectionChange={handleSectionChange}
 currentSection={section}
 />
 ))}
 </SortableContext>
 </DndContext>

 {completedTasks.length > 0 && (
 <>
 <div className="px-4 lg:px-6 py-2 mt-4">
 <p className="text-xs text-muted-foreground">
 {completedTasks.length} concluída{completedTasks.length !== 1 ? "s" : ""}
 </p>
 </div>
 {completedTasks.map((task) => (
 <TaskRow
 key={task.id}
 task={task}
 onToggle={handleToggle}
 onSelect={handleSelect}
 currentSection={section}
 />
 ))}
 </>
 )}
 </div>

 <TaskDetail
 task={selectedTask}
 open={detailOpen}
 onOpenChange={(open) => {
 setDetailOpen(open);
 if (!open) setSelectedTask(null);
 }}
 onSave={updateTask}
 onDelete={removeTask}
 />

 <SyncConflictDialog
 open={conflictDialogOpen}
 onOpenChange={setConflictDialogOpen}
 onResolve={(keep) => {
 if (selectedTask) resolveConflict(selectedTask.id, keep);
 setConflictDialogOpen(false);
 }}
 localTask={selectedTask}
 serverTask={null}
 />
 </div>
 );
}
