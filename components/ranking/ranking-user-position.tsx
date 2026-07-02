"use client";

import type { RankingEntry } from "@/lib/ranking";
import { formatRankingPoints, rankingDisplayName } from "./ranking-utils";

interface RankingUserPositionProps {
  entry: RankingEntry;
}

export function RankingUserPosition({ entry }: RankingUserPositionProps) {
  const albumProgress = entry.total_slots > 0
    ? Math.round((entry.filled_slots / entry.total_slots) * 100)
    : 0;

  return (
    <section className="flex flex-col rounded-card border border-verde-400 bg-verde-100 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 2xl:h-[248px] 2xl:justify-between 2xl:px-8 2xl:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-verde-escuro-500 sm:text-sm lg:text-base 2xl:text-xl">
        SUA POSIÇÃO
      </p>

      <div className="mt-3 flex items-start gap-3 sm:mt-4 sm:gap-4 2xl:mt-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amarelo sm:size-16 lg:size-[72px] 2xl:size-[88px]">
          <span className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-[50px]">
            {entry.rank}º
          </span>
        </div>

        <div className="min-w-0 space-y-0.5 pt-0.5">
          <p className="truncate font-display text-lg font-bold text-verde-escuro-500 sm:text-xl lg:text-2xl 2xl:text-[34px]">
            {rankingDisplayName(entry)}
          </p>
          <p className="text-sm text-verde-500 sm:text-base 2xl:text-xl">
            {formatRankingPoints(entry.score)} pts
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 2xl:mt-0 2xl:space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-verde-escuro-500 sm:gap-3">
          <p className="text-sm font-medium sm:text-base 2xl:text-lg">Progresso do álbum</p>
          <p className="text-base font-bold sm:text-lg 2xl:text-xl">{albumProgress}%</p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-pill bg-white sm:h-3 2xl:h-[15px]">
          <div
            className="h-full rounded-pill bg-gradient-to-r from-verde-500 to-amarelo transition-[width] duration-700"
            style={{ width: `${albumProgress}%` }}
            role="progressbar"
            aria-valuenow={albumProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${albumProgress}% do álbum completo`}
          />
        </div>
      </div>
    </section>
  );
}
