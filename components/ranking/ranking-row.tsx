import {
  ArrowLeftRight,
  BookOpen,
  Flag,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/lib/ranking";
import { RankingAvatar } from "./ranking-avatar";
import { formatRankingPoints, rankingDisplayName } from "./ranking-utils";

interface RankingRowProps {
  entry: RankingEntry;
  isCurrentUser?: boolean;
  className?: string;
}

export function RankingRow({ entry, isCurrentUser, className }: RankingRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:py-4 lg:gap-5 2xl:gap-6 2xl:py-6",
        isCurrentUser && "bg-verde-100/60",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-4 lg:gap-5 2xl:gap-6">
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-pill bg-verde-200 px-2 text-sm font-semibold text-verde-escuro-500 sm:h-9 sm:min-w-9 sm:px-2.5 sm:text-base lg:h-10 lg:min-w-10 2xl:h-[47px] 2xl:min-w-[47px] 2xl:px-4 2xl:text-xl">
          {entry.rank}
        </span>

        <RankingAvatar
          entry={entry}
          sizeClassName="size-12 shrink-0 sm:size-14 lg:size-16 2xl:size-[88px]"
        />

        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2 sm:block sm:gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
              <p
                className="truncate font-display text-base font-bold text-verde-escuro-500 sm:text-lg lg:text-xl 2xl:text-2xl"
                title={rankingDisplayName(entry)}
              >
                {rankingDisplayName(entry)}
              </p>
              {isCurrentUser ? (
                <span className="shrink-0 rounded-pill bg-verde-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white sm:px-3 sm:text-xs">
                  Você
                </span>
              ) : null}
            </div>

            <div className="shrink-0 text-right sm:hidden">
              <p className="font-display text-xl font-bold leading-none text-verde-escuro-500 sm:text-2xl">
                {formatRankingPoints(entry.score)}
              </p>
              <p className="text-[10px] tracking-[0.14em] text-verde-escuro-500">
                PONTOS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-verde-escuro-500 sm:flex sm:flex-wrap sm:gap-x-5 sm:text-xs lg:gap-x-6 lg:text-sm 2xl:gap-x-8 2xl:text-base">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 2xl:gap-2">
              <BookOpen className="size-3.5 shrink-0 sm:size-4 2xl:size-5" aria-hidden />
              {entry.album_pct}% do álbum
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 2xl:gap-2">
              <Package className="size-3.5 shrink-0 sm:size-4 2xl:size-5" aria-hidden />
              {entry.packs_opened} pacotinho{entry.packs_opened !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 2xl:gap-2">
              <Flag className="size-3.5 shrink-0 sm:size-4 2xl:size-5" aria-hidden />
              {entry.missions_completed}{" "}
              {entry.missions_completed === 1 ? "missão" : "missões"}
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 2xl:gap-2">
              <ArrowLeftRight className="size-3.5 shrink-0 sm:size-4 2xl:size-5" aria-hidden />
              {entry.trades_accepted} troca{entry.trades_accepted !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 text-right sm:block sm:pl-2 lg:pl-3 2xl:pl-4">
        <p className="font-display text-2xl font-bold leading-none text-verde-escuro-500 lg:text-3xl 2xl:text-5xl">
          {formatRankingPoints(entry.score)}
        </p>
        <p className="text-[10px] tracking-[0.14em] text-verde-escuro-500 sm:text-xs 2xl:text-sm 2xl:tracking-[0.16em]">PONTOS</p>
      </div>
    </div>
  );
}
