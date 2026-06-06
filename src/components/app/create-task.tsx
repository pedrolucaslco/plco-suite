"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";
import { db } from "@/lib/db/dexie";
import { syncEngine } from "@/lib/sync/sync-engine";

export type Section = "inbox" | "today" | "upcoming" | "anytime" | "someday";

interface CreateTaskFormProps {
  section: Section;
  onCreated: () => void;
  onClose: () => void;
}

function CreateTaskForm({ section, onCreated, onClose }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const nucleusId = useNucleusStore((s) => s.currentNucleusId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !nucleusId) return;

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    const taskId = crypto.randomUUID();
    await db.tasks.add({
      id: taskId,
      nuclei_id: nucleusId,
      created_by: profile.id,
      title: title.trim(),
      description: description || null,
      section,
      due_date: null,
      project_id: null,
      area_id: null,
      is_completed: false,
      completed_at: null,
      position: null,
      created_at: now,
      updated_at: now,
      _sync: "pending",
      _local_mtime: Date.now(),
      _server_updated_at: now,
    });

    await syncEngine.enqueue(taskId, "insert", {
      nuclei_id: nucleusId,
      created_by: profile.id,
      title: title.trim(),
      description: description || null,
      section,
    });

    if (typeof navigator !== "undefined" && navigator.onLine) {
      syncEngine.pushPending();
    }

    setTitle("");
    setDescription("");
    setSaving(false);
    onClose();
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="O que precisa ser feito?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Textarea
        placeholder="Notas (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !title.trim()}>
          Adicionar
        </Button>
      </div>
    </form>
  );
}

// Dialog + trigger as inline text link (used in empty states)
export function CreateTaskTrigger({
  section,
  onCreated,
  children,
}: {
  section: Section;
  onCreated: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <CreateTaskForm
          section={section}
          onCreated={onCreated}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Floating Action Button
export function CreateTaskFab({
  section,
  onCreated,
}: {
  section: Section;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
          </DialogHeader>
          <CreateTaskForm
            section={section}
            onCreated={onCreated}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
