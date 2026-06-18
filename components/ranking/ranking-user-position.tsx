"use client";

import type { RankingEntry } from "@/lib/ranking";
import { formatRankingPoints, rankingDisplayName } from "./ranking-utils";

interface RankingUserPositionProps {
  entry: RankingEntry;
}

export function RankingUserPosition({ entry }: RankingUserPositionProps) {
  const progressWidth = Math.max(entry.album_pct, 4);

  return (
    <section className="flex flex-col rounded-card border border-verde-400 bg-verde-100 px-4 py-6 sm:px-8 sm:py-8 xl:h-[248px] xl:justify-between">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-verde-escuro-500 sm:text-base xl:text-xl">
        SUA POSIÇÃO
      </p>

      <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:gap-5 xl:mt-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-amarelo sm:size-20 xl:size-[88px]">
          <span className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-4xl xl:text-[50px]">
            {entry.rank}º
          </span>
        </div>

        <div className="min-w-0 space-y-0.5 pt-0.5">
          <p className="truncate font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl xl:text-[34px]">
            {rankingDisplayName(entry)}
          </p>
          <p className="text-lg text-verde-500 xl:text-xl">
            {formatRankingPoints(entry.score)} pts
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 xl:mt-0">
        <div className="flex items-center justify-between gap-3 text-verde-escuro-500">
          <p className="text-base font-medium xl:text-lg">Progresso do álbum</p>
          <p className="text-lg font-bold xl:text-xl">{entry.album_pct}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-pill bg-white xl:h-[15px]">
          <div
            className="h-full rounded-pill bg-gradient-to-r from-verde-500 to-amarelo transition-[width] duration-700"
            style={{ width: `${progressWidth}%` }}
            role="progressbar"
            aria-valuenow={entry.album_pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do álbum"
          />
        </div>
      </div>
    </section>
  );
}
