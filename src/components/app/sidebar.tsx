"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Inbox,
  Star,
  Calendar,
  Circle,
  Diamond,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NucleusSelector } from "./nucleus-selector";

const sections: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Hoje", href: "/app/today", icon: Star },
  { label: "Em Breve", href: "/app/upcoming", icon: Calendar },
  { label: "Navegar", href: "/app/navegar", icon: Compass },
  { label: "Qualquer Hora", href: "/app/anytime", icon: Circle },
  { label: "Algum Dia", href: "/app/someday", icon: Diamond },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentSection = useMemo(() => {
    return sections.find((s) => pathname.startsWith(s.href)) ?? sections[0];
  }, [pathname]);

  return (
    <aside className="w-56 shrink-0 border-r border-hairline bg-surface hidden lg:flex flex-col">
      <div className="px-4 py-5 space-y-1">
        <Link href="/app/inbox" className="text-heading font-bold text-ink block">
          PLCO
        </Link>
        <NucleusSelector />
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-body transition-colors",
                s.href === currentSection.href
                  ? "bg-muted text-ink font-medium"
                  : "text-ink-mid hover:text-ink hover:bg-muted/50",
              )}
            >
              <Icon size={18} className="shrink-0" />
              {s.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
