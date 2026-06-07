"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { createClient } from "@/lib/db/client";
import { useRouter } from "next/navigation";

const CACHE_VERSION_KEY = "plco-cache-version";
const APP_VERSION = "0.3.0";

function getCacheVersion(): string {
  if (typeof window === "undefined") return APP_VERSION;
  return localStorage.getItem(CACHE_VERSION_KEY) ?? APP_VERSION;
}

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [cacheVersion, setCacheVersion] = useState(getCacheVersion());
  const [reloading, setReloading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setCacheVersion(getCacheVersion());
  }, [open]);

  async function handleReload() {
    setReloading(true);
    const newVersion = (parseInt(cacheVersion, 10) || 0) + 1;
    localStorage.setItem(CACHE_VERSION_KEY, String(newVersion));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.unregister();
    }

    window.location.reload();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onOpenChange(false);
    router.push("/auth/login");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
        <div className="space-y-5 pt-2">
          <h2 className="text-body-bold text-ink">Configurações</h2>

          <div className="space-y-1">
            <p className="text-caption text-ink-muted">Versão do app</p>
            <p className="text-body text-ink">{APP_VERSION}</p>
          </div>

          <div className="space-y-1">
            <p className="text-caption text-ink-muted">Versão do cache</p>
            <p className="text-body text-ink">{cacheVersion}</p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleReload}
              disabled={reloading}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <RotateCcw size={16} />
              {reloading ? "Recarregando..." : "Recarregar PWA"}
            </Button>

            <Button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-deadline"
              variant="outline"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
