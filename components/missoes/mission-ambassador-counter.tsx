"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionAmbassadorCounterProps {
  count: number;
  className?: string;
}

/** Contagem visual de cadastros via convite no Desafio GB. */
export function MissionAmbassadorCounter({
  count,
  className,
}: MissionAmbassadorCounterProps) {
  const label = count === 1 ? "cadastro via convite" : "cadastros via convite";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-block border border-[#c9a227]/35 bg-white/55 px-3 py-2.5 backdrop-blur-[2px] sm:gap-4 sm:px-4 sm:py-3",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe07a] via-[#d2a309] to-[#8a5a08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:size-11">
        <Users className="size-5" strokeWidth={1.8} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-none text-[#71410a] sm:text-3xl">
          {count}
        </p>
        <p className="mt-0.5 text-xs font-medium text-[#8a5a08] sm:text-sm">
          {label}
        </p>
      </div>
    </div>
  );
}
