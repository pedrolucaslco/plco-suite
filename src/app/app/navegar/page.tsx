"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Star,
  Calendar,
  Circle,
  Diamond,
  Layers2,
  FolderClosed,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  GripVertical,
} from "lucide-react";
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
  { label: "Hoje", href: "/app/today", icon: Star, description: "Tarefas para hoje" },
  { label: "Em Breve", href: "/app/upcoming", icon: Calendar, description: "Tarefas com data futura" },
  { label: "Qualquer Hora", href: "/app/anytime", icon: Circle, description: "Tarefas sem data definida" },
  { label: "Algum Dia", href: "/app/someday", icon: Diamond, description: "Ideias e planos futuros" },
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
        <div className="px-4 lg:px-6 py-3 border-b border-hairline bg-surface flex items-center justify-between">
          <h1 className="text-subheading text-ink">Navegar</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center size-8 rounded-md text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="px-4 lg:px-6 py-2 bg-muted/30">
          <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
            Seções
          </p>
        </div>

        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-hairline hover:bg-muted/30 transition-colors active:bg-muted/50"
            >
              <Icon size={22} className="text-ink-mid shrink-0" />
              <div>
                <p className="text-body text-ink">{item.label}</p>
                <p className="text-caption text-ink-muted">{item.description}</p>
              </div>
            </Link>
          );
        })}

        {areas.length > 0 && (
          <>
            <div className="px-4 lg:px-6 py-2 bg-muted/30">
              <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
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
                      "flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-hairline",
                      draggedProjectId && "bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleArea(area.id); }}
                      className="p-1 rounded text-ink-mid hover:text-ink shrink-0"
                    >
                      {areaProjects.length > 0 ? (
                        isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      ) : (
                        <span className="w-4" />
                      )}
                    </button>
                    <Link
                      href={`/app/areas/${area.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Layers2 size={20} className="shrink-0 text-ink-mid" />
                      <span className="text-body text-ink flex-1 truncate">{area.name}</span>
                      {areaProjects.length > 0 && (
                        <span className="text-caption text-ink-muted">{areaProjects.length}</span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit("area", area.id, area.name)}
                      className="p-1 rounded text-ink-mid hover:text-ink shrink-0"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-5 border-l border-hairline pl-2 mb-1 space-y-0.5">
                      {areaProjects.map((p) => (
                        <div
                          key={p.id}
                          className="group flex items-center gap-1 rounded-md"
                          draggable
                          onDragStart={() => { draggedProjectId = p.id; }}
                        >
                          <Link
                            href={`/app/projects/${p.id}`}
                            className={cn(
                              "flex items-center gap-2 px-2 py-2 rounded-md text-body transition-colors flex-1 min-w-0",
                              pathname === `/app/projects/${p.id}`
                                ? "bg-muted text-ink font-medium"
                                : "text-ink-mid hover:text-ink hover:bg-muted/50",
                            )}
                          >
                            <GripVertical size={14} className="shrink-0 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                            <FolderClosed size={16} className="shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit("project", p.id, p.name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-mid hover:text-ink shrink-0"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {standaloneProjects.length > 0 && (
          <>
            <div className="px-4 lg:px-6 py-2 bg-muted/30">
              <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
                Projetos
              </p>
            </div>
            {standaloneProjects.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-1 px-4 lg:px-6 py-2 border-b border-hairline rounded-md"
                draggable
                onDragStart={() => { draggedProjectId = p.id; }}
              >
                <GripVertical size={14} className="shrink-0 text-ink-muted opacity-50 group-hover:opacity-100 transition-opacity" />
                <Link
                  href={`/app/projects/${p.id}`}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-md text-body transition-colors flex-1 min-w-0",
                    pathname === `/app/projects/${p.id}`
                      ? "bg-muted text-ink font-medium"
                      : "text-ink-mid hover:text-ink hover:bg-muted/50",
                  )}
                >
                  <FolderClosed size={16} className="shrink-0" />
                  <span className="truncate">{p.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleEdit("project", p.id, p.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-mid hover:text-ink shrink-0"
                >
                  <Pencil size={15} />
                </button>
              </div>
            ))}
          </>
        )}

        <div className="relative px-4 lg:px-6 py-3 border-b border-hairline">
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
              className="flex items-center gap-3 text-ink-mid hover:text-ink transition-colors"
            >
              <Plus size={18} />
              <span className="text-body">Nova lista</span>
            </button>
          )}

          {showNewMenu && !newType && (
            <div className="absolute left-4 right-4 bottom-full mb-1 bg-surface border border-hairline rounded-lg shadow-lg overflow-hidden z-10">
              <button
                type="button"
                onClick={() => { setNewType("area"); setShowNewMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-body text-ink hover:bg-muted/30 transition-colors text-left border-b border-hairline"
              >
                <Layers2 size={18} />
                Nova área
              </button>
              <button
                type="button"
                onClick={() => { setNewType("project"); setShowNewMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-body text-ink hover:bg-muted/30 transition-colors text-left"
              >
                <FolderClosed size={18} />
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
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-body font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
