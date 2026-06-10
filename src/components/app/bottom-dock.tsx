"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 IconInbox,
 IconStarFilled,
 IconCalendarFilled,
 IconCalendarMonthFilled,
 IconCompassFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const items = [
 { label: "Inbox", href: "/app/inbox", icon: IconInbox },
 { label: "Hoje", href: "/app/today", icon: IconStarFilled },
 { label: "Breve", href: "/app/upcoming", icon: IconCalendarFilled },
 { label: "Calendário", href: "/app/calendar", icon: IconCalendarMonthFilled },
 { label: "Navegar", href: "/app/navegar", icon: IconCompassFilled },
];

export function BottomDock() {
 const pathname = usePathname();

 return (
 <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border pb-safe">
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
 : "text-muted-foreground hover:text-foreground",
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
