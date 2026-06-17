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
    <div className="flex flex-col gap-6 rounded-card bg-verde-100 px-6 py-10 sm:px-10 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-verde-500 sm:size-[120px]">
            <Binoculars className="size-12 text-white sm:size-[70px]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <p className="text-base text-verde-escuro-500">SEU NÍVEL</p>
            <p className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-[40px]">
              {LEVEL_NAME}
            </p>
            <div className="h-3 w-full max-w-[970px] overflow-hidden rounded-pill bg-white">
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
          <p className="font-display text-5xl font-bold text-verde-escuro-500 sm:text-[60px]">
            {percent}%
          </p>
          <p className="text-lg text-verde-escuro-500 sm:text-xl">
            {completed}/{total} Missões concluídas
          </p>
        </div>
      </div>
    </div>
  );
}
