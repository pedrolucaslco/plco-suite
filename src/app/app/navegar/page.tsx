"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Circle, Diamond, FolderKanban, Briefcase, Plus, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSheet } from "@/components/app/settings-sheet";
import { useAreas } from "@/hooks/use-areas";
import { useProjects } from "@/hooks/use-projects";

const sections = [
  {
    label: "Qualquer Hora",
    href: "/app/anytime",
    icon: Circle,
    description: "Tarefas sem data definida",
  },
  {
    label: "Algum Dia",
    href: "/app/someday",
    icon: Diamond,
    description: "Ideias e planos futuros",
  },
];

export default function NavegarPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [newProject, setNewProject] = useState("");
  const [showNewArea, setShowNewArea] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const { areas, addArea, removeArea } = useAreas();
  const { projects, addProject, removeProject } = useProjects();

  async function handleAddArea() {
    if (!newArea.trim()) return;
    await addArea(newArea.trim());
    setNewArea("");
    setShowNewArea(false);
  }

  async function handleAddProject() {
    if (!newProject.trim()) return;
    await addProject(newProject.trim());
    setNewProject("");
    setShowNewProject(false);
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

        <div className="px-4 lg:px-6 py-2 bg-muted/30 flex items-center justify-between">
          <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
            Áreas
          </p>
        </div>

        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/app/areas/${area.id}`}
            className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-hairline hover:bg-muted/30 transition-colors active:bg-muted/50"
          >
            <Hash size={22} className="text-ink-mid shrink-0" />
            <p className="text-body text-ink flex-1">{area.name}</p>
          </Link>
        ))}

        {showNewArea ? (
          <div className="px-4 lg:px-6 py-3 border-b border-hairline">
            <Input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddArea();
                if (e.key === "Escape") { setShowNewArea(false); setNewArea(""); }
              }}
              placeholder="Nome da área"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewArea(true)}
            className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-hairline text-ink-mid hover:text-ink hover:bg-muted/30 transition-colors active:bg-muted/50"
          >
            <Plus size={18} />
            <span className="text-body">Nova área</span>
          </button>
        )}

        <div className="px-4 lg:px-6 py-2 bg-muted/30 flex items-center justify-between">
          <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
            Projetos
          </p>
        </div>

        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/app/projects/${project.id}`}
            className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-hairline hover:bg-muted/30 transition-colors active:bg-muted/50"
          >
            <Briefcase size={22} className="text-ink-mid shrink-0" />
            <p className="text-body text-ink flex-1">{project.name}</p>
          </Link>
        ))}

        {showNewProject ? (
          <div className="px-4 lg:px-6 py-3 border-b border-hairline">
            <Input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddProject();
                if (e.key === "Escape") { setShowNewProject(false); setNewProject(""); }
              }}
              placeholder="Nome do projeto"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-hairline text-ink-mid hover:text-ink hover:bg-muted/30 transition-colors active:bg-muted/50"
          >
            <Plus size={18} />
            <span className="text-body">Novo projeto</span>
          </button>
        )}
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
