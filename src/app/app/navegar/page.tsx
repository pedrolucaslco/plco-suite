"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 IconSettingsFilled,
 IconStarFilled,
 IconCalendarFilled,
 IconCircleFilled,
 IconDiamondFilled,
 IconStack2Filled,
 IconFolderFilled,
 IconPlusFilled,
 IconChevronDownFilled,
 IconChevronRightFilled,
 IconPencilFilled,
 IconGripVertical,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { SettingsSheet } from "@/components/app/settings-sheet";
import { useAreas } from "@/hooks/use-areas";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

let draggedProjectId: string | null = null;

const sections = [
 { label: "Hoje", href: "/app/today", icon: IconStarFilled, description: "Tarefas para hoje" },
 { label: "Em Breve", href: "/app/upcoming", icon: IconCalendarFilled, description: "Tarefas com data futura" },
 { label: "Qualquer Hora", href: "/app/anytime", icon: IconCircleFilled, description: "Tarefas sem data definida" },
 { label: "Algum Dia", href: "/app/someday", icon: IconDiamondFilled, description: "Ideias e planos futuros" },
];

export default function NavegarPage() {
 const pathname = usePathname();
 const [settingsOpen, setSettingsOpen] = useState(false);
 const [newType, setNewType] = useState<"area" | "project" | null>(null);
 const [newName, setNewName] = useState("");
 const [showNewMenu, setShowNewMenu] = useState(false);
 const [editTarget, setEditTarget] = useState<{
 type: "area" | "project";
 id: string;
 name: string;
 } | null>(null);
 const [editName, setEditName] = useState("");
 const { areas, addArea, updateArea } = useAreas();
 const { projects, addProject, updateProject } = useProjects();
 const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

 async function handleCreate() {
 if (!newName.trim() || !newType) return;
 if (newType === "area") await addArea(newName.trim());
 else await addProject(newName.trim());
 setNewName("");
 setNewType(null);
 setShowNewMenu(false);
 }

 const standaloneProjects = projects.filter((p) => p.area_id === null);

 function toggleArea(areaId: string) {
 setExpandedAreas((prev) => {
 const next = new Set(prev);
 if (next.has(areaId)) next.delete(areaId);
 else next.add(areaId);
 return next;
 });
 }

 function handleEdit(type: "area" | "project", id: string, name: string) {
 setEditTarget({ type, id, name });
 setEditName(name);
 }

 async function handleSaveEdit() {
 if (!editTarget || !editName.trim()) return;
 if (editTarget.type === "area") {
 await updateArea(editTarget.id, { name: editName.trim() });
 } else {
 await updateProject(editTarget.id, { name: editName.trim() });
 }
 setEditTarget(null);
 setEditName("");
 }

 function handleDragOver(e: React.DragEvent) {
 if (draggedProjectId) e.preventDefault();
 }

 function handleDropOnArea(areaId: string) {
 return async (e: React.DragEvent) => {
 e.preventDefault();
 if (draggedProjectId && draggedProjectId !== areaId) {
 await updateProject(draggedProjectId, { area_id: areaId });
 setExpandedAreas((prev) => { const n = new Set(prev); n.add(areaId); return n; });
 }
 draggedProjectId = null;
 };
 }

 return (
 <>
 <div className="flex flex-col">
 <div className="px-4 lg:px-6 py-3 border-b border bg-background flex items-center justify-between">
 <h1 className=" text-foreground">Navegar</h1>
 <button
 type="button"
 onClick={() => setSettingsOpen(true)}
 className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
 >
 <IconSettingsFilled size={18} />
 </button>
 </div>

 <div className="px-4 lg:px-6 py-2 bg-muted/30">
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-xs">
 Seções
 </p>
 </div>

 {sections.map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={item.href}
 href={item.href}
 className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border hover:bg-muted/30 transition-colors active:bg-muted/50"
 >
 <Icon size={22} className="text-muted-foreground shrink-0" />
 <div>
 <p className=" text-foreground">{item.label}</p>
 <p className="text-xs text-muted-foreground">{item.description}</p>
 </div>
 </Link>
 );
 })}

 {areas.length > 0 && (
 <>
 <div className="px-4 lg:px-6 py-2 bg-muted/30">
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-xs">
 Áreas
 </p>
 </div>
 {areas.map((area) => {
 const areaProjects = projects.filter((p) => p.area_id === area.id);
 const isExpanded = expandedAreas.has(area.id);
 return (
 <div key={area.id}>
 <div
 onDragOver={handleDragOver}
 onDrop={handleDropOnArea(area.id)}
 className={cn(
 "flex items-center gap-2 px-4 lg:px-6 py-3 border-b border",
 draggedProjectId && "bg-primary/5",
 )}
 >
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); toggleArea(area.id); }}
 className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
 >
 {areaProjects.length > 0 ? (
 isExpanded ? <IconChevronDownFilled size={16} /> : <IconChevronRightFilled size={16} />
 ) : (
 <span className="w-4" />
 )}
 </button>
 <Link
 href={`/app/areas/${area.id}`}
 className="flex items-center gap-3 flex-1 min-w-0"
 >
 <IconStack2Filled size={20} className="shrink-0 text-muted-foreground" />
 <span className=" text-foreground flex-1 truncate">{area.name}</span>
 {areaProjects.length > 0 && (
 <span className="text-xs text-muted-foreground">{areaProjects.length}</span>
 )}
 </Link>
 <button
 type="button"
 onClick={() => handleEdit("area", area.id, area.name)}
 className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
 >
 <IconPencilFilled size={15} />
 </button>
 </div>
 {isExpanded && areaProjects.map((p) => (
 <Link
 key={p.id}
 href={`/app/projects/${p.id}`}
 className={cn(
 "flex items-center gap-3 pl-12 pr-4 lg:pr-6 py-3 border-b border transition-colors",
 pathname === `/app/projects/${p.id}`
 ? "bg-muted/50 text-foreground font-medium"
 : "text-muted-foreground hover:text-foreground hover:bg-muted/30 active:bg-muted/50",
 )}
 >
 <IconFolderFilled size={18} className="shrink-0" />
 <span className="">{p.name}</span>
 </Link>
 ))}
 </div>
 );
 })}
 </>
 )}

 {standaloneProjects.length > 0 && (
 <>
 <div className="px-4 lg:px-6 py-2 bg-muted/30">
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-xs">
 Projetos
 </p>
 </div>
 {standaloneProjects.map((p) => (
 <div
 key={p.id}
 className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border"
 draggable
 onDragStart={() => { draggedProjectId = p.id; }}
 >
 <IconGripVertical size={16} className="shrink-0 text-muted-foreground" />
 <Link
 href={`/app/projects/${p.id}`}
 className={cn(
 "flex items-center gap-3 flex-1 min-w-0 transition-colors",
 pathname === `/app/projects/${p.id}`
 ? "text-foreground font-medium"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 <IconFolderFilled size={20} className="shrink-0" />
 <span className=" text-foreground flex-1 truncate">{p.name}</span>
 </Link>
 <button
 type="button"
 onClick={() => handleEdit("project", p.id, p.name)}
 className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
 >
 <IconPencilFilled size={15} />
 </button>
 </div>
 ))}
 </>
 )}

 <div className="relative px-4 lg:px-6 py-3 border-b border">
 {newType ? (
 <Input
 value={newName}
 onChange={(e) => setNewName(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter") handleCreate();
 if (e.key === "Escape") { setNewType(null); setNewName(""); }
 }}
 placeholder={newType === "area" ? "Nome da área" : "Nome do projeto"}
 autoFocus
 />
 ) : (
 <button
 type="button"
 onClick={() => setShowNewMenu(!showNewMenu)}
 className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
 >
 <IconPlusFilled size={18} />
 <span className="">Nova lista</span>
 </button>
 )}

 {showNewMenu && !newType && (
 <div className="absolute left-4 right-4 bottom-full mb-1 bg-background border border rounded-lg shadow-lg overflow-hidden z-10">
 <button
 type="button"
 onClick={() => { setNewType("area"); setShowNewMenu(false); }}
 className="flex items-center gap-3 w-full px-4 py-3 text-foreground hover:bg-muted/30 transition-colors text-left border-b border"
 >
 <IconStack2Filled size={18} />
 Nova área
 </button>
 <button
 type="button"
 onClick={() => { setNewType("project"); setShowNewMenu(false); }}
 className="flex items-center gap-3 w-full px-4 py-3 text-foreground hover:bg-muted/30 transition-colors text-left"
 >
 <IconFolderFilled size={18} />
 Novo projeto
 </button>
 </div>
 )}
 </div>
 </div>

 <Dialog
 open={!!editTarget}
 onOpenChange={(o) => { if (!o) { setEditTarget(null); setEditName(""); } }}
 >
 <DialogContent>
 <DialogHeader>
 <DialogTitle>
 Editar {editTarget?.type === "area" ? "área" : "projeto"}
 </DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <Input
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter") handleSaveEdit();
 if (e.key === "Escape") { setEditTarget(null); setEditName(""); }
 }}
 placeholder="Nome"
 autoFocus
 />
 <div className="flex justify-end">
 <button
 type="button"
 onClick={handleSaveEdit}
 disabled={!editName.trim()}
 className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
 >
 Salvar
 </button>
 </div>
 </div>
 </DialogContent>
 </Dialog>

 <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
 </>
 );
}
