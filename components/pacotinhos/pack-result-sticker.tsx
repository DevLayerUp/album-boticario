"use client";

import Image from "next/image";
import { RarityBadge } from "@/components/trocas/rarity-badge";
import { StickerRarityEffects } from "@/components/sticker/sticker-rarity-effects";
import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { PackSticker } from "./types";

interface PackResultStickerProps {
  item: PackSticker;
  compact?: boolean;
}

export function PackResultSticker({ item, compact = false }: PackResultStickerProps) {
  const sticker = item.stickers;
  if (!sticker) return null;

  const slug = sticker.rarities?.slug ?? "common";
  const theme = rarityTheme(slug, sticker.rarities?.color_hex);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center",
        compact
          ? "w-[min(26vw,88px)] gap-0.5 sm:w-[96px] sm:gap-1 lg:w-[104px] 2xl:w-[128px] 2xl:gap-1.5"
          : "w-[min(30vw,110px)] gap-1 sm:w-[120px] sm:gap-1.5 lg:w-[132px] 2xl:w-[160px] 2xl:gap-2",
      )}
    >
      <div
        className="relative aspect-[228/326] w-full overflow-hidden rounded-lg border-2"
        style={{ borderColor: theme.border }}
      >
        {sticker.image_url ? (
          <Image
            src={sticker.image_url}
            alt={sticker.name}
            fill
            className="object-cover"
            sizes="228px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-verde-100 text-verde-400">
            ?
          </div>
        )}
        <StickerRarityEffects
          slug={slug}
          animationType={sticker.rarities?.animation_type}
          color={theme.border}
          intensity={compact ? "normal" : "strong"}
        />
      </div>

      <RarityBadge
        name={sticker.rarities?.name ?? "Comum"}
        slug={slug}
        colorHex={sticker.rarities?.color_hex}
        className="normal-case text-[9px] sm:text-[10px] 2xl:text-xs"
      />

      <p
        className={cn(
          "line-clamp-2 text-center font-bold leading-tight",
          compact
            ? "text-[10px] sm:text-xs 2xl:text-sm"
            : "text-xs sm:text-sm 2xl:text-base",
        )}
        style={{ color: theme.nameTag }}
      >
        {sticker.name}
      </p>
    </div>
  );
}
