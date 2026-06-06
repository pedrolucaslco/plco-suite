"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JumpStartProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function JumpStart({ value, onChange }: JumpStartProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(date: Date | undefined) {
    onChange(date ?? null);
    setOpen(false);
  }

  function handleShortcut(label: string) {
    switch (label) {
      case "today":
        onChange(new Date());
        break;
      case "tonight":
        onChange(new Date());
        break;
      case "someday":
        onChange(new Date("2099-12-31"));
        break;
      case "clear":
        onChange(null);
        break;
    }
    setOpen(false);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-full h-9 rounded-md border border-hairline bg-surface text-body px-3 text-left",
          value ? "text-ink" : "text-ink-muted",
        )}
      >
        {value
          ? format(value, "d 'de' MMM", { locale: ptBR })
          : "Definir data"}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                value && value.toDateString() === today.toDateString() && "border-primary",
              )}
              onClick={() => handleShortcut("today")}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShortcut("tonight")}
            >
              Esta Noite
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShortcut("someday")}
            >
              Algum Dia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShortcut("clear")}
            >
              Limpar
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            locale={ptBR}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
