"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { RarityBadge } from "./rarity-badge";
import type { Sticker } from "./types";

interface StockStickerCardProps {
  sticker: Sticker;
  quantity: number;
  blocked?: boolean;
  index?: number;
}

export function StockStickerCard({
  sticker,
  quantity,
  blocked = false,
  index = 0,
}: StockStickerCardProps) {
  const slug = sticker.rarities?.slug ?? "common";
  const borderColor = rarityColor(slug, sticker.rarities?.color_hex);
  const nameColor =
    slug === "super_rare"
      ? "#b57d02"
      : slug === "rare"
        ? "#09357a"
        : "var(--color-verde-escuro-500)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="flex flex-col items-start gap-0"
    >
      <div className="relative w-full">
        <div
          className={cn(
            "relative aspect-160/229 w-full overflow-hidden rounded-block border-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:border-4 2xl:border-[5px]",
            blocked && "opacity-75",
          )}
          style={{ borderColor }}
        >
          <Image
            src={sticker.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 242px"
          />
          {blocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-capa/35">
              <span className="flex items-center gap-1.5 rounded-pill bg-surface/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-verde-escuro-500 shadow-sm">
                <Lock size={12} aria-hidden />
                Bloqueada
              </span>
            </div>
          )}
        </div>

        {quantity > 1 && (
          <span className="absolute -right-0.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-verde-500 text-[10px] font-bold text-white shadow-sm sm:-top-2 sm:size-7 sm:text-xs">
            {quantity}x
          </span>
        )}
      </div>

      <RarityBadge
        name={sticker.rarities?.name ?? "Comum"}
        slug={slug}
        colorHex={sticker.rarities?.color_hex}
        className="mt-1.5 px-3 py-1 text-[10px] font-medium normal-case tracking-normal sm:mt-2 sm:px-4 sm:text-xs 2xl:mt-2.5 2xl:px-5 2xl:py-1.5 2xl:text-sm"
      />

      <p
        className="mt-1.5 w-full truncate font-display text-sm font-bold leading-tight sm:mt-2 sm:text-base 2xl:text-xl"
        style={{ color: nameColor }}
      >
        {sticker.name}
      </p>
    </motion.div>
  );
}

export type StockFilter = "all" | "common" | "rare" | "super_rare" | "blocked";

interface StockFilterBarProps {
  active: StockFilter;
  onChange: (filter: StockFilter) => void;
  counts: Record<StockFilter, number>;
}

const FILTER_LABELS: Record<StockFilter, string> = {
  all: "Todas",
  common: "Comum",
  rare: "Rara",
  super_rare: "Super rara",
  blocked: "Bloqueadas",
};

export function StockFilterBar({ active, onChange, counts }: StockFilterBarProps) {
  const filters: StockFilter[] = ["all", "common", "rare", "super_rare", "blocked"];

  return (
    <div
      className="flex max-w-full flex-wrap gap-1.5 rounded-pill bg-white p-1 sm:gap-2 sm:p-1.5 2xl:gap-2.5 2xl:p-2"
      role="tablist"
      aria-label="Filtrar estoque"
    >
      {filters.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-pill py-1.5 pl-4 pr-2 text-xs font-medium transition-colors sm:gap-2.5 sm:py-2 sm:pl-6 sm:pr-2.5 sm:text-sm 2xl:pl-8 2xl:text-base",
              isActive
                ? "bg-verde-escuro-500 text-white"
                : "border border-verde-300 text-verde-300 hover:border-verde-400 hover:text-verde-400",
            )}
          >
            {FILTER_LABELS[filter]}
            <span
              className={cn(
                "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-bold sm:h-7 sm:min-w-7 sm:text-xs",
                isActive ? "bg-amarelo text-verde-escuro-500" : "bg-verde-100 text-verde-500",
              )}
            >
              {counts[filter]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
