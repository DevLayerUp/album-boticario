"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import type { Sticker } from "./types";

export function StickerThumb({
  sticker,
  width = 104,
  height = 149,
  selected = false,
  badge,
  className,
}: {
  sticker: Sticker | null;
  width?: number;
  height?: number;
  selected?: boolean;
  badge?: string | number;
  className?: string;
}) {
  if (!sticker) {
    return (
      <div
        className={`shrink-0 rounded-block bg-verde-100 ${className ?? ""}`}
        style={{ width, height }}
      />
    );
  }
  const borderColor = rarityColor(sticker.rarities?.slug, sticker.rarities?.color_hex);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-block border-[3px] transition-all duration-200 sm:border-4 2xl:border-[5px] ${className ?? ""}`}
      style={{
        width,
        height,
        borderColor: selected ? "var(--color-verde-escuro-500)" : borderColor,
        boxShadow: selected ? "0 0 0 3px rgba(13, 102, 50, 0.25)" : undefined,
      }}
    >
      <Image
        src={sticker.image_url}
        alt={sticker.name}
        fill
        className="object-cover"
        sizes={`${width}px`}
      />
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-500/25">
          <CheckCircle2 size={width * 0.28} className="text-white drop-shadow" />
        </div>
      )}
      {badge !== undefined && (
        <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-verde-escuro-500 px-1 text-[9px] font-black text-white shadow">
          {badge}×
        </div>
      )}
    </div>
  );
}
