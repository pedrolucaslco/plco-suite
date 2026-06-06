"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Circle, Diamond } from "lucide-react";
import { SettingsSheet } from "@/components/app/settings-sheet";

const menuItems = [
  {
    label: "Qualquer Hora",
    href: "/app/anytime",
    icon: Circle,
    description: "Tarefas sem data definida",
  },
  {
    label: "Algum Dia",
    href: "/app/someday",
    icon: Diamond,
    description: "Ideias e planos futuros",
  },
];

export default function NavegarPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        <div className="px-4 lg:px-6 py-3 border-b border-hairline bg-surface flex items-center justify-between">
          <h1 className="text-subheading text-ink">Navegar</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center size-8 rounded-md text-ink-mid hover:text-ink hover:bg-muted/50 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="px-4 lg:px-6 py-2 bg-muted/30">
          <p className="text-caption font-medium text-ink-mid uppercase tracking-wider text-xs">
            Seções
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-hairline hover:bg-muted/30 transition-colors active:bg-muted/50"
            >
              <Icon size={22} className="text-ink-mid shrink-0" />
              <div>
                <p className="text-body text-ink">{item.label}</p>
                <p className="text-caption text-ink-muted">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
