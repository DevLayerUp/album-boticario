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
        "flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:py-6",
        isCurrentUser && "bg-verde-100/60",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-6">
        <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-pill bg-verde-200 px-3 text-base font-semibold text-verde-escuro-500 sm:h-[47px] sm:min-w-[47px] sm:px-4 sm:text-xl">
          {entry.rank}
        </span>

        <RankingAvatar
          entry={entry}
          sizeClassName="size-14 shrink-0 sm:size-[88px]"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3 sm:block">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p
                className="truncate font-display text-lg font-bold text-verde-escuro-500 sm:text-2xl"
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
              <p className="font-display text-2xl font-bold leading-none text-verde-escuro-500">
                {formatRankingPoints(entry.score)}
              </p>
              <p className="text-[10px] tracking-[0.14em] text-verde-escuro-500">
                PONTOS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-verde-escuro-500 sm:flex sm:flex-wrap sm:gap-x-8 sm:text-base">
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="size-4 shrink-0 sm:size-5" aria-hidden />
              {entry.album_pct}% do álbum
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <Package className="size-4 shrink-0 sm:size-5" aria-hidden />
              {entry.packs_opened} pacotinho{entry.packs_opened !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <Flag className="size-4 shrink-0 sm:size-5" aria-hidden />
              {entry.missions_completed} missão{entry.missions_completed !== 1 ? "ões" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <ArrowLeftRight className="size-4 shrink-0 sm:size-5" aria-hidden />
              {entry.trades_accepted} troca{entry.trades_accepted !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 text-right sm:block sm:pl-4">
        <p className="font-display text-4xl font-bold leading-none text-verde-escuro-500 lg:text-5xl">
          {formatRankingPoints(entry.score)}
        </p>
        <p className="text-sm tracking-[0.16em] text-verde-escuro-500">PONTOS</p>
      </div>
    </div>
  );
}
