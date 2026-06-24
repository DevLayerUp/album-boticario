"use client";

import { Binoculars } from "lucide-react";
import { LEVEL_NAME } from "@/lib/mission-theme";

interface MissionLevelProgressProps {
  completed: number;
  total: number;
}

export function MissionLevelProgress({ completed, total }: MissionLevelProgressProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-card bg-verde-100 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8 lg:px-8 2xl:gap-6 2xl:px-10 2xl:py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center lg:gap-6 2xl:gap-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 2xl:gap-10">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-verde-500 sm:size-20 lg:size-24 2xl:size-[120px]">
            <Binoculars className="size-8 text-white sm:size-10 lg:size-12 2xl:size-[70px]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="space-y-1.5 sm:space-y-2 2xl:space-y-3">
            <p className="text-xs text-verde-escuro-500 sm:text-sm 2xl:text-base">SEU NÍVEL</p>
            <p className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-[40px]">
              {LEVEL_NAME}
            </p>
            <div className="h-2.5 w-full max-w-[970px] overflow-hidden rounded-pill bg-white sm:h-3 2xl:h-3">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-verde-500 to-amarelo transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(percent, 4)}%` }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso do nível"
              />
            </div>
          </div>
        </div>
        <div className="text-left lg:text-right">
          <p className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-4xl lg:text-5xl 2xl:text-[60px]">
            {percent}%
          </p>
          <p className="text-sm text-verde-escuro-500 sm:text-base 2xl:text-xl">
            {completed}/{total} Missões concluídas
          </p>
        </div>
      </div>
    </div>
  );
}
