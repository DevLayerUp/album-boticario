"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { Sticker } from "./types";

function thumbFrameClass(width: number) {
  if (width <= 48) {
    return "rounded-[8px] border shadow-sm";
  }
  if (width <= 72) {
    return "rounded-block border-2 shadow-[0_1px_4px_rgba(0,0,0,0.08)]";
  }
  if (width <= 120) {
    return "rounded-block border-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)] sm:border-[3px] 2xl:border-4";
  }
  return "rounded-block border-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] sm:border-4 2xl:border-[5px]";
}

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
        className={cn("shrink-0 rounded-block bg-verde-100", className)}
        style={{ width, height }}
      />
    );
  }
  const borderColor = rarityColor(sticker.rarities?.slug, sticker.rarities?.color_hex);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden transition-all duration-200",
        thumbFrameClass(width),
        className,
      )}
      style={{
        width,
        height,
        borderColor: selected ? "var(--color-verde-escuro-500)" : borderColor,
        boxShadow: selected ? "0 0 0 3px rgba(13, 102, 50, 0.22)" : undefined,
      }}
    >
      <Image
        src={sticker.image_url}
        alt={sticker.name}
        fill
        className="object-cover"
        sizes={`${width}px`}
      />
      {selected ? (
        <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-500/20">
          <CheckCircle2
            size={Math.max(16, width * 0.26)}
            className="text-white drop-shadow-md"
            aria-hidden
          />
        </div>
      ) : null}
      {badge !== undefined ? (
        <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-verde-escuro-500 px-1 text-[9px] font-black text-white shadow">
          {badge}×
        </div>
      ) : null}
    </div>
  );
}
