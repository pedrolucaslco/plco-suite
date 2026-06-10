"use client";

import { useState, useRef, useCallback } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { syncEngine } from "@/lib/sync/sync-engine";
import { useNucleusStore } from "@/stores/nucleus";

const THRESHOLD = 70;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
 const [state, setState] = useState<"idle" | "pulling" | "syncing">("idle");
 const [pullDistance, setPullDistance] = useState(0);
 const startY = useRef(0);
 const containerRef = useRef<HTMLDivElement>(null);
 const pullingRef = useRef(false);
 const nucleusId = useNucleusStore((s) => s.currentNucleusId);

 const handleTouchStart = useCallback((e: React.TouchEvent) => {
 const container = containerRef.current;
 if (!container || container.scrollTop > 0) return;
 startY.current = e.touches[0].clientY;
 pullingRef.current = true;
 setState("pulling");
 }, []);

 const handleTouchMove = useCallback((e: React.TouchEvent) => {
 if (!pullingRef.current) return;
 const diff = e.touches[0].clientY - startY.current;
 if (diff > 0) {
 setPullDistance(Math.min(diff * 0.4, 100));
 }
 }, []);

 const handleTouchEnd = useCallback(async () => {
 pullingRef.current = false;
 if (state === "syncing") return;

 if (pullDistance >= THRESHOLD && nucleusId) {
 setState("syncing");
 setPullDistance(0);
 await syncEngine.pushPending();
 await syncEngine.pullRemote(nucleusId);
 setTimeout(() => setState("idle"), 800);
 } else {
 setState("idle");
 setPullDistance(0);
 }
 }, [pullDistance, nucleusId, state]);

 return (
 <div
 ref={containerRef}
 className="relative flex-1 overflow-y-auto overscroll-none touch-pan-y"
 onTouchStart={handleTouchStart}
 onTouchMove={handleTouchMove}
 onTouchEnd={handleTouchEnd}
 >
 {state !== "idle" && (
 <div
 className="flex items-center justify-center overflow-hidden transition-[height] duration-100"
 style={{ height: pullDistance }}
 >
 {state === "syncing" ? (
 <IconRefresh size={20} className="animate-spin text-primary" />
 ) : (
 <div className="w-0.5 h-6 rounded-full bg-hairline" />
 )}
 </div>
 )}
 {children}
 </div>
 );
}
