"use client";

import { Sidebar } from "@/components/app/sidebar";
import { BottomDock } from "@/components/app/bottom-dock";
import { NucleusSelector } from "@/components/app/nucleus-selector";
import { CreateTaskFab, type Section } from "@/components/app/create-task";
import { PullToRefresh } from "@/components/app/pull-to-refresh";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScrollInputIntoView } from "@/hooks/use-scroll-input-into-view";
import { useNucleusStore } from "@/stores/nucleus";
import { useTaskSubscription } from "@/hooks/use-task-subscription";

const sectionLabels: Record<string, string> = {
  inbox: "Inbox",
  today: "Hoje",
  upcoming: "Em Breve",
  calendar: "Calendário",
  anytime: "Qualquer Hora",
  someday: "Algum Dia",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sectionSlug = pathname.split("/").pop() ?? "inbox";
  const title = sectionLabels[sectionSlug] ?? "PLCO";
  const isOnboarding = pathname.includes("onboarding");
  const isNavegar = pathname === "/app/navegar";
  const isEntityView = pathname.startsWith("/app/areas/") || pathname.startsWith("/app/projects/");
  const areaMatch = pathname.match(/^\/app\/areas\/([^/]+)/);
  const projectMatch = pathname.match(/^\/app\/projects\/([^/]+)/);
  const contextAreaId = areaMatch?.[1] ?? null;
  const contextProjectId = projectMatch?.[1] ?? null;

  useScrollInputIntoView();

  useRealtimeSync(useNucleusStore((s) => s.currentNucleusId));
  useTaskSubscription();

  useEffect(() => {
    useNucleusStore.getState().hydrate();
  }, []);

  return (
    <div className="flex flex-1 h-full pb-14 lg:pb-0">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {!isOnboarding && !isNavegar && !isEntityView && (
          <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-hairline bg-canvas/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-subheading text-ink">{title}</h1>
              <NucleusSelector />
            </div>
          </header>
        )}
        <PullToRefresh>
          {children}
        </PullToRefresh>
      </main>
      {!isOnboarding && (
        <>
          <BottomDock />
          <CreateTaskFab
            section={sectionSlug as Section}
            areaId={contextAreaId}
            projectId={contextProjectId}
            onCreated={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}
