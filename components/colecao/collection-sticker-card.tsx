"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { CollectionSticker } from "./types";

interface CollectionStickerCardProps {
  sticker: CollectionSticker;
  quantity: number;
  index: number;
  onSelect: () => void;
}

/**
 * Card de figurinha na grade da coleção — moldura por raridade, estados
 * obtida / faltante / repetida (DS-2 §7–8, FGB §4 Figurinha).
 */
export function CollectionStickerCard({
  sticker,
  quantity,
  index,
  onSelect,
}: CollectionStickerCardProps) {
  const owned    = quantity > 0;
  const slug     = sticker.rarities?.slug ?? "common";
  const color    = rarityColor(slug, sticker.rarities?.color_hex);
  const animType = sticker.rarities?.animation_type ?? "none";
  const isSuper  = slug === "super_rare";

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.35), ease: "easeOut" }}
      onClick={onSelect}
      aria-label={
        owned
          ? `${sticker.name}, ${quantity > 1 ? `${quantity} cópias` : "obtida"}`
          : `${sticker.name}, ainda não obtida`
      }
      className="group flex w-full cursor-pointer flex-col gap-1.5 text-left"
    >
      <div
        className={cn(
          "relative aspect-160/229 w-full overflow-hidden rounded-block border-[5px] transition-shadow duration-200",
          owned
            ? "shadow-[0_2px_6px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] group-hover:shadow-[0_6px_16px_rgba(0,0,0,0.14)]"
            : "border-dashed bg-verde-escuro-capa/[0.04]",
        )}
        style={{
          borderColor: owned ? color : `${color}55`,
        }}
      >
        <Image
          src={sticker.image_url}
          alt=""
          fill
          className={cn(
            "object-cover transition-[filter,transform] duration-300",
            owned ? "group-hover:scale-[1.03]" : "grayscale opacity-35",
          )}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
        />

        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-capa/25">
            <span className="flex size-9 items-center justify-center rounded-full bg-surface/90 shadow-sm">
              <Lock size={16} className="text-verde-escuro-300" aria-hidden />
            </span>
          </div>
        )}

        {owned && animType === "holographic" && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-25"
            animate={{ backgroundPositionX: ["0%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.65) 45%, transparent 65%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}

        {owned && isSuper && (
          <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-pill bg-gold-700/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            <Sparkles size={9} aria-hidden />
            Rara
          </span>
        )}

        {quantity > 1 && (
          <span className="absolute right-1.5 top-1.5 rounded-pill bg-amarelo px-1.5 py-0.5 text-[10px] font-bold text-verde-escuro-500">
            {quantity}×
          </span>
        )}

        {owned && quantity === 1 && sticker.is_user_type && (
          <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-verde-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            Sua
          </span>
        )}
      </div>

      <p
        className={cn(
          "truncate px-0.5 text-center font-display text-[11px] font-bold uppercase leading-tight tracking-wide",
          owned ? "text-verde-escuro-500" : "text-verde-escuro-300",
        )}
      >
        {sticker.name}
      </p>
    </motion.button>
  );
}
