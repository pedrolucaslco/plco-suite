"use client";

import { useState, useEffect, useCallback } from "react";
import {
 Sheet,
 SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconReload, IconRefresh, IconLogout, IconCheckFilled, IconAlertCircleFilled } from "@tabler/icons-react";
import { createClient } from "@/lib/db/client";
import { useRouter } from "next/navigation";
import { useNucleusStore } from "@/stores/nucleus";
import { syncEngine } from "@/lib/sync/sync-engine";

const CACHE_VERSION_KEY = "plco-cache-version";
const APP_VERSION = "0.10.0";

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
 const [syncing, setSyncing] = useState(false);
 const [syncResult, setSyncResult] = useState<"success" | "error" | null>(null);
 const supabase = createClient();
 const router = useRouter();
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 if (open) setCacheVersion(getCacheVersion());
 if (open) setSyncResult(null);
 }, [open]);

 async function handleReload() {
 setReloading(true);

 const AUTH_PREFIX = "sb-";
 const authKeys: string[] = [];
 for (let i = 0; i < localStorage.length; i++) {
 const key = localStorage.key(i);
 if (key?.startsWith(AUTH_PREFIX)) authKeys.push(key);
 }
 const authEntries = authKeys.map((k) => [k, localStorage.getItem(k)] as const);
 const nucleusId = sessionStorage.getItem("plco_current_nucleus_id");

 if ("indexedDB" in window) {
 try {
 const databases = await indexedDB.databases();
 await Promise.all(
 databases.map((db) => {
 if (!db.name) return;
 return new Promise<void>((resolve) => {
 const req = indexedDB.deleteDatabase(db.name!);
 req.onsuccess = () => resolve();
 req.onerror = () => resolve();
 req.onblocked = () => resolve();
 });
 })
 );
 } catch {}
 }

 if ("caches" in window) {
 const keys = await caches.keys();
 await Promise.all(keys.map((k) => caches.delete(k)));
 }

 if ("serviceWorker" in navigator) {
 const registrations = await navigator.serviceWorker.getRegistrations();
 await Promise.all(registrations.map((r) => r.unregister()));
 }

 localStorage.clear();
 sessionStorage.clear();

 for (const [key, val] of authEntries) {
 if (val) localStorage.setItem(key, val);
 }
 if (nucleusId) sessionStorage.setItem("plco_current_nucleus_id", nucleusId);

 window.location.reload();
 }

 const handleSync = useCallback(async () => {
 if (!nucleusId) return;
 setSyncing(true);
 setSyncResult(null);

 await syncEngine.pushPending();
 await syncEngine.pullRemote(nucleusId);

 setTimeout(() => {
 setSyncing(false);
 setSyncResult("success");
 setTimeout(() => setSyncResult(null), 3000);
 }, 1000);
 }, [nucleusId]);

 async function handleLogout() {
 await supabase.auth.signOut();
 onOpenChange(false);
 router.push("/auth/login");
 }

 return (
 <Sheet open={open} onOpenChange={onOpenChange}>
 <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
 <div className="space-y-5 pt-2">
 <h2 className="font-bold text-foreground">Configurações</h2>

 <div className="space-y-1">
 <p className="text-xs text-muted-foreground">Versão do app</p>
 <p className=" text-foreground">{APP_VERSION}</p>
 </div>

 <div className="space-y-1">
 <p className="text-xs text-muted-foreground">Versão do cache</p>
 <p className=" text-foreground">{cacheVersion}</p>
 </div>

 <div className="space-y-3 pt-2">
 <Button
 onClick={handleSync}
 disabled={syncing || !nucleusId}
 className="w-full flex items-center gap-2"
 variant="outline"
 >
 {syncing ? (
 <IconRefresh size={16} className="animate-spin" />
 ) : syncResult === "success" ? (
 <IconCheckFilled size={16} className="text-green-600" />
 ) : syncResult === "error" ? (
 <IconAlertCircleFilled size={16} className="text-destructive" />
 ) : (
 <IconRefresh size={16} />
 )}
 {syncing
 ? "Sincronizando..."
 : syncResult === "success"
 ? "Sincronizado!"
 : syncResult === "error"
 ? "Erro ao sincronizar"
 : "Sincronizar dados"}
 </Button>

 <Button
 onClick={handleReload}
 disabled={reloading}
 className="w-full flex items-center gap-2"
 variant="outline"
 >
 <IconReload size={16} />
 {reloading ? "Limpando tudo..." : "Recarregar PWA (limpar cache)"}
 </Button>

 <Button
 onClick={handleLogout}
 className="w-full flex items-center gap-2 text-destructive"
 variant="outline"
 >
 <IconLogout size={16} />
 Sair
 </Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 );
}
