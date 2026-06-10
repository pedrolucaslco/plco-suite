"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { liveQuery } from "dexie"
import {
  IconStarFilled,
  IconCalendarFilled,
  IconCalendarMonthFilled,
  IconCircleFilled,
  IconDiamondFilled,
  IconInbox,
  IconStack2Filled,
  IconFolderFilled,
  IconChevronDownFilled,
  IconChevronRightFilled,
  IconPlusFilled,
  IconPencilFilled,
  IconGripVertical,
  IconRefresh,
  IconCheckFilled,
  IconSettingsFilled,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useNucleusStore } from "@/stores/nucleus"
import { db, type LocalArea, type LocalProject, type LocalTask } from "@/lib/db/dexie"
import { useAreas } from "@/hooks/use-areas"
import { useProjects } from "@/hooks/use-projects"
import { syncEngine } from "@/lib/sync/sync-engine"
import { draggedTaskId } from "@/lib/drag-state"
import { NucleusSelector } from "@/components/app/nucleus-selector"
import { SettingsSheet } from "@/components/app/settings-sheet"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const sections: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Inbox", href: "/app/inbox", icon: <IconInbox size={18} /> },
  { label: "Hoje", href: "/app/today", icon: <IconStarFilled size={18} /> },
  { label: "Em Breve", href: "/app/upcoming", icon: <IconCalendarFilled size={18} /> },
  { label: "Calendário", href: "/app/calendar", icon: <IconCalendarMonthFilled size={18} /> },
  { label: "Qualquer Hora", href: "/app/anytime", icon: <IconCircleFilled size={18} /> },
  { label: "Algum Dia", href: "/app/someday", icon: <IconDiamondFilled size={18} /> },
]

let draggedProjectId: string | null = null

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const nucleusId = useNucleusStore((s) => s.currentNucleusId)
  const [areas, setAreas] = useState<LocalArea[]>([])
  const [standaloneProjects, setStandaloneProjects] = useState<LocalProject[]>([])
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [newType, setNewType] = useState<"area" | "project" | null>(null)
  const [newName, setNewName] = useState("")
  const [editTarget, setEditTarget] = useState<{ type: "area" | "project"; id: string; name: string } | null>(null)
  const [editName, setEditName] = useState("")
  const { addArea, updateArea } = useAreas()
  const { addProject, updateProject } = useProjects()
  const [syncing, setSyncing] = useState(false)
  const [syncOk, setSyncOk] = useState(false)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!nucleusId) return
    const sub = liveQuery(() =>
      db.areas.where("nuclei_id").equals(nucleusId).toArray()
    ).subscribe({
      next: setAreas,
      error: () => {},
    })
    return () => sub.unsubscribe()
  }, [nucleusId])

  useEffect(() => {
    if (!nucleusId) return
    const sub = liveQuery(() =>
      db.projects
        .where("nuclei_id")
        .equals(nucleusId)
        .filter((p) => p.area_id === null)
        .toArray()
    ).subscribe({
      next: setStandaloneProjects,
      error: () => {},
    })
    return () => sub.unsubscribe()
  }, [nucleusId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false)
        setNewType(null)
        setNewName("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (newType && inputRef.current) inputRef.current.focus()
  }, [newType])

  const handleSectionDragOver = useCallback(
    (e: React.DragEvent, section: string) => {
      if (!draggedTaskId) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDragOverSection(section)
    },
    []
  )

  const handleSectionDragLeave = useCallback(() => {
    setDragOverSection(null)
  }, [])

  const handleSectionDrop = useCallback(
    async (e: React.DragEvent, section: string) => {
      e.preventDefault()
      setDragOverSection(null)
      const taskId = draggedTaskId ?? e.dataTransfer.getData("text/plain")
      if (!taskId || !nucleusId) return
      const task = await db.tasks.get(taskId)
      if (!task || task.section === section) return
      const mtime = Date.now()
      await db.tasks.update(taskId, {
        section: section as LocalTask["section"],
        _sync: "pending",
        _local_mtime: mtime,
      })
      await syncEngine.enqueue(taskId, "task", "update", { section })
      if (navigator.onLine) syncEngine.pushPending()
    },
    [nucleusId]
  )

  const handleSync = useCallback(async () => {
    if (!nucleusId || syncing) return
    setSyncing(true)
    setSyncOk(false)
    await syncEngine.pushPending()
    await syncEngine.pullRemote(nucleusId)
    setSyncing(false)
    setSyncOk(true)
    setTimeout(() => setSyncOk(false), 3000)
  }, [nucleusId, syncing])

  async function handleCreate() {
    if (!newName.trim()) return
    if (newType === "area") await addArea(newName.trim())
    else await addProject(newName.trim())
    setNewName("")
    setNewType(null)
    setShowNewMenu(false)
  }

  function handleEdit(type: "area" | "project", id: string, name: string) {
    setEditTarget({ type, id, name })
    setEditName(name)
  }

  async function handleSaveEdit() {
    if (!editTarget || !editName.trim()) return
    if (editTarget.type === "area") {
      await updateArea(editTarget.id, { name: editName.trim() })
    } else {
      await updateProject(editTarget.id, { name: editName.trim() })
    }
    setEditTarget(null)
    setEditName("")
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="px-4 py-3 space-y-2">
        <Link href="/app/today" className="font-bold text-foreground block">
          PLCO
        </Link>
        <NucleusSelector />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((s) => {
                const sectionName = s.href.split("/").pop() ?? "today"
                return (
                  <div
                    key={s.href}
                    onDragOver={(e) => handleSectionDragOver(e, sectionName)}
                    onDragLeave={handleSectionDragLeave}
                    onDrop={(e) => handleSectionDrop(e, sectionName)}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href={s.href} />}
                        isActive={pathname.startsWith(s.href)}
                        className={dragOverSection === sectionName ? "ring-1 ring-primary/40 bg-primary/5" : ""}
                      >
                        {s.icon}
                        <span>{s.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {areas.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Áreas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {areas.map((area) => (
                  <AreaListItem key={area.id} area={area} pathname={pathname} onEdit={handleEdit} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {standaloneProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projetos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {standaloneProjects.map((p) => (
                  <SidebarMenuItem key={p.id}>
                    <div className="group flex items-center w-full">
                      <SidebarMenuButton
                        render={<Link href={`/app/projects/${p.id}`} />}
                        isActive={pathname === `/app/projects/${p.id}`}
                        draggable
                        onDragStart={() => {
                          draggedProjectId = p.id
                        }}
                      >
                        <IconGripVertical
                          size={14}
                          className="shrink-0 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <IconFolderFilled size={18} className="shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => handleEdit("project", p.id, p.name)}
                      >
                        <IconPencilFilled size={13} />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="relative" ref={menuRef}>
                  {newType ? (
                    <div className="px-1 py-1">
                      <Input
                        ref={inputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreate()
                          if (e.key === "Escape") {
                            setNewType(null)
                            setNewName("")
                          }
                        }}
                        placeholder={newType === "area" ? "Nome da área" : "Nome do projeto"}
                      />
                    </div>
                  ) : (
                    <SidebarMenuButton onClick={() => setShowNewMenu(!showNewMenu)}>
                      <IconPlusFilled size={16} />
                      <span>Nova lista</span>
                    </SidebarMenuButton>
                  )}
                  {showNewMenu && !newType && (
                    <div className="absolute left-1 right-1 bottom-full mb-1 bg-sidebar border border rounded-lg shadow-lg overflow-hidden z-10">
                      <SidebarMenuButton
                        onClick={() => {
                          setNewType("area")
                          setShowNewMenu(false)
                        }}
                      >
                        <IconStack2Filled size={16} />
                        <span>Nova área</span>
                      </SidebarMenuButton>
                      <SidebarMenuButton
                        onClick={() => {
                          setNewType("project")
                          setShowNewMenu(false)
                        }}
                      >
                        <IconFolderFilled size={16} />
                        <span>Novo projeto</span>
                      </SidebarMenuButton>
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSync} disabled={syncing}>
                  {syncing ? (
                    <IconRefresh size={16} className="animate-spin" />
                  ) : syncOk ? (
                    <IconCheckFilled size={16} className="text-green-600" />
                  ) : (
                    <IconRefresh size={16} />
                  )}
                  <span>{syncing ? "Sincronizando..." : syncOk ? "Sincronizado!" : "Sincronizar"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                  <IconSettingsFilled size={16} />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) {
            setEditTarget(null)
            setEditName("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {editTarget?.type === "area" ? "área" : "projeto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit()
                if (e.key === "Escape") {
                  setEditTarget(null)
                  setEditName("")
                }
              }}
              placeholder="Nome"
              autoFocus
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}

function AreaListItem({
  area,
  pathname,
  onEdit,
}: {
  area: LocalArea
  pathname: string
  onEdit: (type: "area" | "project", id: string, name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<LocalProject[]>([])
  const { updateProject } = useProjects()

  useEffect(() => {
    if (!open) return
    const sub = liveQuery(() =>
      db.projects.where("area_id").equals(area.id).toArray()
    ).subscribe({
      next: setProjects,
      error: () => {},
    })
    return () => sub.unsubscribe()
  }, [open, area.id])

  function handleDragOver(e: React.DragEvent) {
    if (draggedProjectId) e.preventDefault()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (draggedProjectId && draggedProjectId !== area.id) {
      updateProject(draggedProjectId, { area_id: area.id }).then(() => setOpen(true))
    }
    draggedProjectId = null
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "rounded-md transition-colors w-full",
            draggedProjectId && "ring-1 ring-primary/40 bg-primary/5"
          )}
        >
          <div className="group flex items-center w-full">
            <CollapsibleTrigger render={<SidebarMenuButton className="w-fit px-1" />}>
              {open ? <IconChevronDownFilled size={14} /> : <IconChevronRightFilled size={14} />}
            </CollapsibleTrigger>
            <SidebarMenuButton
              render={<Link href={`/app/areas/${area.id}`} />}
              isActive={pathname === `/app/areas/${area.id}`}
              className="flex-1"
            >
              <IconStack2Filled size={16} className="shrink-0" />
              <span className="truncate">{area.name}</span>
            </SidebarMenuButton>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onEdit("area", area.id, area.name)
              }}
            >
              <IconPencilFilled size={13} />
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {projects.map((p) => (
              <SidebarMenuSubItem key={p.id}>
                <div className="group flex items-center w-full">
                  <SidebarMenuSubButton
                    render={<Link href={`/app/projects/${p.id}`} />}
                    isActive={pathname === `/app/projects/${p.id}`}
                  >
                    <IconFolderFilled size={14} className="shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </SidebarMenuSubButton>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => onEdit("project", p.id, p.name)}
                  >
                    <IconPencilFilled size={12} />
                  </Button>
                </div>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
