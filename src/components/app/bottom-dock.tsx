"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Star,
  Calendar,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Hoje", href: "/app/today", icon: Star },
  { label: "Breve", href: "/app/upcoming", icon: Calendar },
  { label: "Navegar", href: "/app/navegar", icon: Compass },
];

export function BottomDock() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-hairline safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-full rounded-md transition-colors",
                isActive
                  ? "text-primary"
                  : "text-ink-mid hover:text-ink",
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
