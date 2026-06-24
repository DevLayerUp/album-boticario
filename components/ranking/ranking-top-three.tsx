"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/lib/ranking";
import { RankingAvatar } from "./ranking-avatar";
import { formatRankingPoints, rankingDisplayName } from "./ranking-utils";

interface RankingTopThreeProps {
  entries: RankingEntry[];
  updatedLabel: string;
}

const PLACE_STYLES = {
  1: {
    order: "md:order-2",
    badge: "bg-amarelo text-verde-escuro-500",
    label: "1º LUGAR",
    glowClass:
      "@lg:before:pointer-events-none @lg:before:absolute @lg:before:-inset-[35%] @lg:before:rounded-full @lg:before:bg-amarelo/25 @lg:before:blur-2xl",
    ring: "ring-[4px] ring-amarelo @md:ring-[5px] @2xl:ring-[6px]",
    avatar:
      "size-[80px] @md:size-[100px] @lg:size-[120px] @xl:size-[160px] @2xl:size-[257px]",
  },
  2: {
    order: "md:order-1",
    badge: "bg-[#b8b8b8] text-[#090909]",
    label: "2º LUGAR",
    glowClass: "",
    ring: "ring-[3px] ring-[#b8b8b8] @md:ring-4 @2xl:ring-[5px]",
    avatar:
      "size-[72px] @md:size-[88px] @lg:size-[104px] @xl:size-[140px] @2xl:size-[218px]",
  },
  3: {
    order: "md:order-3",
    badge: "bg-gold-700 text-white",
    label: "3º LUGAR",
    glowClass: "",
    ring: "ring-[3px] ring-gold-700 @md:ring-4 @2xl:ring-[5px]",
    avatar:
      "size-[72px] @md:size-[88px] @lg:size-[104px] @xl:size-[140px] @2xl:size-[218px]",
  },
} as const;

function PodiumPlace({
  entry,
  place,
  variant = "podium",
}: {
  entry: RankingEntry;
  place: 1 | 2 | 3;
  variant?: "podium" | "mobile-featured" | "mobile-compact";
}) {
  const config = PLACE_STYLES[place];
  const name = rankingDisplayName(entry);
  const isMobile = variant !== "podium";

  if (isMobile) {
    const isFeatured = variant === "mobile-featured";
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: place * 0.06 }}
        className={cn(
          "flex flex-col items-center gap-3",
          isFeatured ? "mx-auto w-full max-w-sm" : "min-w-0 w-full",
        )}
      >
        <div className={cn("relative pb-4", place === 1 && config.glowClass)}>
          <RankingAvatar
            entry={entry}
            sizeClassName={isFeatured ? "size-[96px]" : "size-[72px]"}
            ringClassName={cn("relative z-10", config.ring)}
          />
          <span
            className={cn(
              "absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-pill font-medium",
              config.badge,
              isFeatured ? "px-4 py-1 text-[11px]" : "px-2.5 py-0.5 text-[9px]",
            )}
          >
            {config.label}
          </span>
        </div>
        <div className="w-full min-w-0 space-y-0 text-center leading-[1.4]">
          <p
            className={cn(
              "font-display font-bold text-white",
              isFeatured ? "text-lg" : "truncate px-1 text-sm",
            )}
            title={name}
          >
            {name}
          </p>
          <p className={cn("font-semibold text-amarelo", isFeatured ? "text-sm" : "text-xs")}>
            {formatRankingPoints(entry.score)} pts
          </p>
          <p className={cn("font-medium text-verde-300", isFeatured ? "text-sm" : "text-xs")}>
            {entry.album_pct}% do álbum
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.06 }}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-2 @md:gap-3 @xl:gap-4 @2xl:gap-[19px]",
        config.order,
      )}
    >
      <div className={cn("relative w-full max-w-[257px] pb-4 @xl:pb-5", config.glowClass)}>
        <div className="flex justify-center">
          <RankingAvatar
            entry={entry}
            sizeClassName={config.avatar}
            ringClassName={cn("relative z-10 shrink-0", config.ring)}
          />
        </div>
        <span
          className={cn(
            "absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-pill px-5 py-1.5 text-xs font-medium @md:px-8 @md:py-2 @md:text-sm @2xl:h-10 @2xl:px-10 @2xl:text-base",
            config.badge,
          )}
        >
          {config.label}
        </span>
      </div>

      <div className="w-full min-w-0 max-w-39 space-y-0 px-1 text-center leading-[1.4] @md:max-w-42 @xl:max-w-39">
        <p
          className="truncate font-display text-sm font-bold text-white @md:text-base @lg:text-lg @xl:text-xl @2xl:text-[34px]"
          title={name}
        >
          {name}
        </p>
        <p className="truncate text-xs font-semibold text-amarelo @md:text-sm @lg:text-base @2xl:text-xl">
          {formatRankingPoints(entry.score)} pts
        </p>
        <p className="truncate text-[10px] font-medium text-verde-300 @md:text-xs @lg:text-sm @2xl:text-base">
          {entry.album_pct}% do álbum
        </p>
      </div>
    </motion.div>
  );
}

export function RankingTopThree({ entries, updatedLabel }: RankingTopThreeProps) {
  const [first, second, third] = entries;

  return (
    <section className="@container/top3 relative overflow-hidden rounded-card bg-verde-escuro-500 @2xl:h-[612px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={dashboardAssets.quiz.background}
          alt=""
          fill
          className="object-cover opacity-70"
          unoptimized
        />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col px-4 pt-4 sm:px-5 sm:pt-5 @lg:px-6 @lg:pt-6 @2xl:px-10 @2xl:pt-10">
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-verde-300 @md:text-sm @lg:text-base @2xl:text-xl">
            TOP 3
          </p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-verde-300 sm:text-xs sm:tracking-[0.12em] @lg:text-sm @2xl:text-xl">
            {updatedLabel}
          </p>
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 pb-4 md:hidden">
          {first ? <PodiumPlace entry={first} place={1} variant="mobile-featured" /> : null}
          {second || third ? (
            <div className="grid grid-cols-2 gap-3 px-1">
              {second ? (
                <PodiumPlace entry={second} place={2} variant="mobile-compact" />
              ) : (
                <div aria-hidden />
              )}
              {third ? (
                <PodiumPlace entry={third} place={3} variant="mobile-compact" />
              ) : (
                <div aria-hidden />
              )}
            </div>
          ) : null}
        </div>

        {/* Tablet/desktop — escala com a largura do card (@container) */}
        <div className="hidden min-h-0 flex-1 flex-col justify-end pb-4 pt-4 md:flex @lg:pb-6 @lg:pt-5 @2xl:pb-10 @2xl:pt-8">
          <div className="flex w-full items-end justify-center gap-2 px-1 @md:gap-3 @lg:gap-5 @xl:gap-8 @2xl:gap-[49px] @2xl:px-[75px]">
            {second ? <PodiumPlace entry={second} place={2} /> : null}
            {first ? <PodiumPlace entry={first} place={1} /> : null}
            {third ? <PodiumPlace entry={third} place={3} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
