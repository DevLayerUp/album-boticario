"use client";

import Image from "next/image";
import { RarityBadge } from "@/components/trocas/rarity-badge";
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
        "flex shrink-0 flex-col items-center gap-1.5 sm:gap-2 2xl:gap-3",
        compact
          ? "w-[min(36vw,120px)] sm:w-[130px] lg:w-[150px] 2xl:w-[200px]"
          : "w-[min(36vw,140px)] sm:w-[160px] lg:w-[180px] 2xl:w-[228px]",
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
      </div>

      <RarityBadge
        name={sticker.rarities?.name ?? "Comum"}
        slug={slug}
        colorHex={sticker.rarities?.color_hex}
        className="normal-case text-[10px] sm:text-xs 2xl:text-sm"
      />

      <p
        className={cn(
          "text-center font-bold leading-tight",
          compact ? "text-xs sm:text-sm 2xl:text-base" : "text-sm sm:text-base 2xl:text-lg",
        )}
        style={{ color: theme.nameTag }}
      >
        {sticker.name}
      </p>
    </div>
  );
}
