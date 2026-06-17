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
        "flex shrink-0 flex-col items-center gap-2 sm:gap-3",
        compact ? "w-[min(42vw,168px)] sm:w-[180px] lg:w-[200px]" : "w-[min(42vw,228px)]",
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
        className="normal-case text-sm"
      />

      <p
        className={cn(
          "text-center font-bold leading-tight",
          compact ? "text-sm sm:text-base" : "text-lg",
        )}
        style={{ color: theme.nameTag }}
      >
        {sticker.name}
      </p>
    </div>
  );
}
