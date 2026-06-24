"use client";

import { cn } from "@/lib/utils";
import type { TrocasSection } from "./types";

const SECTIONS: { id: TrocasSection; title: string }[] = [
  { id: "solicitar", title: "Solicitar Troca" },
  { id: "negociacao", title: "Em negociação" },
  { id: "estoque", title: "Meu estoque" },
];

interface SectionTabsProps {
  active: TrocasSection;
  onChange: (section: TrocasSection) => void;
  pendingCount: number;
}

export function SectionTabs({ active, onChange, pendingCount }: SectionTabsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 2xl:gap-6">
      {SECTIONS.map(({ id, title }) => {
        const isActive = active === id;
        const showBadge = id === "negociacao" && pendingCount > 0;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={isActive}
            className={cn(
              "group relative flex min-h-[80px] cursor-pointer items-center justify-between overflow-hidden rounded-card px-4 py-5 text-left transition-all duration-200 sm:min-h-[96px] sm:px-5 sm:py-6 lg:min-h-[110px] lg:px-5 2xl:min-h-[132px] 2xl:px-6 2xl:py-8",
              isActive
                ? "bg-verde-escuro-500 text-white shadow-[0_4px_20px_rgba(13,102,50,0.25)]"
                : "bg-verde-100 text-verde-escuro-500 hover:bg-verde-200/80",
            )}
          >
            {/* Decorative blobs */}
            <div
              className={cn(
                "pointer-events-none absolute -right-8 -top-8 size-32 rounded-full opacity-20",
                isActive ? "bg-white" : "bg-verde-500",
              )}
              aria-hidden
            />
            <div
              className={cn(
                "pointer-events-none absolute -bottom-6 right-12 size-20 rounded-full opacity-10",
                isActive ? "bg-white" : "bg-verde-escuro-500",
              )}
              aria-hidden
            />

            <div className="relative flex min-w-0 flex-1 items-center gap-3">
              <p className="font-display text-lg font-bold leading-tight sm:text-xl lg:text-2xl 2xl:text-[40px]">
                {title}
              </p>
            </div>

            {showBadge && (
              <span
                className={cn(
                  "relative flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold sm:size-11 sm:text-lg 2xl:size-14 2xl:text-xl",
                  isActive ? "bg-amarelo text-verde-escuro-500" : "bg-amarelo text-verde-escuro-500",
                )}
              >
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
