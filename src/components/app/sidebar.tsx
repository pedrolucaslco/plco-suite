"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  Calendar,
  Circle,
  Diamond,
  Inbox,
  Layers2,
  FolderClosed,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  GripVertical,
  RefreshCw,
  Check,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NucleusSelector } from "./nucleus-selector";
import { useNucleusStore } from "@/stores/nucleus";
import { db, type LocalArea, type LocalProject, type LocalTask } from "@/lib/db/dexie";
import { liveQuery } from "dexie";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAreas } from "@/hooks/use-areas";
import { useProjects } from "@/hooks/use-projects";
import { syncEngine } from "@/lib/sync/sync-engine";
import { draggedTaskId } from "@/lib/drag-state";
import { SettingsSheet } from "./settings-sheet";

const sections: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Hoje", href: "/app/today", icon: Star },
  { label: "Em Breve", href: "/app/upcoming", icon: Calendar },
  { label: "Qualquer Hora", href: "/app/anytime", icon: Circle },
  { label: "Algum Dia", href: "/app/someday", icon: Diamond },
];

let draggedProjectId: string | null = null;

function AreaList({
  area,
  onEdit,
}: {
  area: LocalArea;
  onEdit: (type: "area" | "project", id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const pathname = usePathname();
  const { updateProject } = useProjects();

  useEffect(() => {
    if (!open) return;
    const sub = liveQuery(() =>
      db.projects.where("area_id").equals(area.id).toArray()
    ).subscribe({
      next: setProjects,
      error: () => {},
    });
    return () => sub.unsubscribe();
  }, [open, area.id]);

  function handleDragOver(e: React.DragEvent) {
    if (draggedProjectId) {
      e.preventDefault();
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (draggedProjectId && draggedProjectId !== area.id) {
      updateProject(draggedProjectId, { area_id: area.id }).then(() => {
        setOpen(true);
      });
    }
    draggedProjectId = null;
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "rounded-md transition-colors",
          draggedProjectId && "ring-1 ring-primary/40 bg-primary/5",
        )}
      >
        <div className="group flex items-center gap-1 w-full px-1 py-1.5 rounded-md text-body text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            className="p-1 rounded text-ink-mid hover:text-ink shrink-0"
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Link
            href={`/app/areas/${area.id}`}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <Layers2 size={16} className="shrink-0" />
            <span className="truncate">{area.name}</span>
          </Link>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit("area", area.id, area.name); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-mid hover:text-ink shrink-0"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
      {open && (
        <div className="ml-5 border-l border-hairline pl-2 mt-0.5 space-y-0.5">
          {projects.map((p) => (
            <div key={p.id} className="group flex items-center gap-1 rounded-md">
              <Link
                href={`/app/projects/${p.id}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-body transition-colors flex-1 min-w-0",
                  pathname === `/app/projects/${p.id}`
                    ? "bg-muted text-ink font-medium"
                    : "text-ink-mid hover:text-ink hover:bg-muted/50",
                )}
              >
                <FolderClosed size={14} className="shrink-0" />
                <span className="truncate">{p.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => onEdit("project", p.id, p.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-ink-mid hover:text-ink shrink-0"
              >
                <Pencil size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const nucleusId = useNucleusStore((s) => s.currentNucleusId);
  const [areas, setAreas] = useState<LocalArea[]>([]);
  const [standaloneProjects, setStandaloneProjects] = useState<LocalProject[]>([]);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newType, setNewType] = useState<"area" | "project" | null>(null);
  const [newName, setNewName] = useState("");
  const [editTarget, setEditTarget] = useState<{
    type: "area" | "project";
    id: string;
    name: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const { addArea, updateArea } = useAreas();
  const { addProject, updateProject } = useProjects();
  const [syncing, setSyncing] = useState(false);
  const [syncOk, setSyncOk] = useState(false);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSectionDragOver = useCallback((e: React.DragEvent, section: string) => {
    if (!draggedTaskId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSection(section);
  }, []);

  const handleSectionDragLeave = useCallback(() => {
    setDragOverSection(null);
  }, []);

  const handleSectionDrop = useCallback(async (e: React.DragEvent, section: string) => {
    e.preventDefault();
    setDragOverSection(null);
    const taskId = draggedTaskId ?? e.dataTransfer.getData("text/plain");
    if (!taskId || !nucleusId) return;
    const task = await db.tasks.get(taskId);
    if (!task || task.section === section) return;
    const mtime = Date.now();
    await db.tasks.update(taskId, {
      section: section as LocalTask["section"],
      _sync: "pending",
      _local_mtime: mtime,
    });
    await syncEngine.enqueue(taskId, "task", "update", { section });
    if (navigator.onLine) syncEngine.pushPending();
  }, [nucleusId]);

  const handleSync = useCallback(async () => {
    if (!nucleusId || syncing) return;
    setSyncing(true);
    setSyncOk(false);
    await syncEngine.pushPending();
    await syncEngine.pullRemote(nucleusId);
    setSyncing(false);
    setSyncOk(true);
    setTimeout(() => setSyncOk(false), 3000);
  }, [nucleusId, syncing]);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
        setNewType(null);
        setNewName("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (newType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newType]);

  async function handleCreate() {
    if (!newName.trim()) return;
    if (newType === "area") await addArea(newName.trim());
    else await addProject(newName.trim());
    setNewName("");
    setNewType(null);
    setShowNewMenu(false);
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

  function handleDragStart(_e: React.DragEvent, projectId: string) {
    draggedProjectId = projectId;
  }

  useEffect(() => {
    if (!nucleusId) return;

    const sub = liveQuery(() =>
      db.areas.where("nuclei_id").equals(nucleusId).toArray()
    ).subscribe({
      next: setAreas,
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId]);

  useEffect(() => {
    if (!nucleusId) return;

    const sub = liveQuery(() =>
      db.projects
        .where("nuclei_id")
        .equals(nucleusId)
        .filter((p) => p.area_id === null)
        .toArray()
    ).subscribe({
      next: setStandaloneProjects,
      error: () => {},
    });

    return () => sub.unsubscribe();
  }, [nucleusId]);

  const currentSection = useMemo(() => {
    return sections.find((s) => pathname.startsWith(s.href)) ?? sections[0];
  }, [pathname]);

  return (
    <aside className="w-56 shrink-0 border-r border-hairline bg-surface hidden lg:flex flex-col">
      <div className="px-4 py-5 space-y-1">
        <Link href="/app/today" className="text-heading font-bold text-ink block">
          PLCO
        </Link>
        <NucleusSelector />
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
          Seções
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          const sectionName = s.href.split("/").pop() ?? "today";
          return (
            <div
              key={s.href}
              onDragOver={(e) => handleSectionDragOver(e, sectionName)}
              onDragLeave={handleSectionDragLeave}
              onDrop={(e) => handleSectionDrop(e, sectionName)}
            >
              <Link
                href={s.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-body transition-colors",
                  pathname.startsWith(s.href)
                    ? "bg-muted text-ink font-medium"
                    : "text-ink-mid hover:text-ink hover:bg-muted/50",
                  dragOverSection === sectionName && "ring-1 ring-primary/40 bg-primary/5",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {s.label}
              </Link>
            </div>
          );
        })}

        {areas.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-2 text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
              Áreas
            </div>
            {areas.map((area) => (
              <AreaList key={area.id} area={area} onEdit={handleEdit} />
            ))}
          </>
        )}

        {standaloneProjects.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-2 text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
              Projetos
            </div>
            {standaloneProjects.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-1 rounded-md"
                draggable
                onDragStart={(e) => handleDragStart(e, p.id)}
              >
                <Link
                  href={`/app/projects/${p.id}`}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-md text-body transition-colors flex-1 min-w-0",
                    pathname === `/app/projects/${p.id}`
                      ? "bg-muted text-ink font-medium"
                      : "text-ink-mid hover:text-ink hover:bg-muted/50",
                  )}
                >
                  <GripVertical size={14} className="shrink-0 text-ink-muted opacity-50 group-hover:opacity-100 transition-opacity" />
                  <FolderClosed size={18} className="shrink-0" />
                  <span className="truncate">{p.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleEdit("project", p.id, p.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-mid hover:text-ink shrink-0"
                >
                  <Pencil size={13} />
                </button>
              </div>
            ))}
          </>
        )}

        <div className="relative" ref={menuRef}>
          {newType ? (
            <div className="px-3 pt-2">
              <Input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setNewType(null); setNewName(""); }
                }}
                placeholder={newType === "area" ? "Nome da área" : "Nome do projeto"}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-body text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors mt-2"
            >
              <Plus size={16} />
              Nova lista
            </button>
          )}

          {showNewMenu && !newType && (
            <div className="absolute left-3 right-3 bottom-full mb-1 bg-surface border border-hairline rounded-lg shadow-lg overflow-hidden z-10">
              <button
                type="button"
                onClick={() => { setNewType("area"); setShowNewMenu(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-body text-ink hover:bg-muted/50 transition-colors text-left"
              >
                <Layers2 size={16} />
                Nova área
              </button>
              <button
                type="button"
                onClick={() => { setNewType("project"); setShowNewMenu(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-body text-ink hover:bg-muted/50 transition-colors text-left"
              >
                <FolderClosed size={16} />
                Novo projeto
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="px-2 pb-3 pt-1 border-t border-hairline space-y-0.5">
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-body text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          {syncing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : syncOk ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <RefreshCw size={16} />
          )}
          {syncing ? "Sincronizando..." : syncOk ? "Sincronizado!" : "Sincronizar"}
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-body text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors"
        >
          <Settings size={16} />
          Configurações
        </button>
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

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
    </aside>
  );
}
