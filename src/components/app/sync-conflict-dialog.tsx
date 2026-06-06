"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { LocalTask } from "@/lib/db/dexie";

interface SyncConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (keep: "local" | "server") => void;
  localTask: LocalTask | null;
  serverTask: LocalTask | null;
}

export function SyncConflictDialog({
  open,
  onOpenChange,
  onResolve,
  localTask,
  serverTask,
}: SyncConflictDialogProps) {
  if (!localTask && !serverTask) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conflito de sincronização</AlertDialogTitle>
          <AlertDialogDescription>
            Esta tarefa foi modificada tanto localmente quanto por outro
            dispositivo. Escolha qual versão manter:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-2">
          <div className="rounded-lg border border-hairline p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Local
              </Badge>
              <span className="text-body-bold text-ink text-sm">
                {localTask?.title ?? "(excluída)"}
              </span>
            </div>
            {localTask && (
              <p className="text-caption text-ink-muted pl-1">
                {localTask.is_completed ? "Concluída" : "Pendente"} &middot;{" "}
                {localTask.section}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-hairline p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted text-ink-mid">
                Nuvem
              </Badge>
              <span className="text-body-bold text-ink text-sm">
                {serverTask?.title ?? "(excluída)"}
              </span>
            </div>
            {serverTask && (
              <p className="text-caption text-ink-muted pl-1">
                {serverTask.is_completed ? "Concluída" : "Pendente"} &middot;{" "}
                {serverTask.section}
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={() => onResolve("local")}>
            Manter local
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onResolve("server")}>
            Manter nuvem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
