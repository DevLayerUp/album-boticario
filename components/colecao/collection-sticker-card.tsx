"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { rarityColor, rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { CollectionSticker } from "./types";

interface CollectionStickerCardProps {
  sticker: CollectionSticker;
  quantity: number;
  index: number;
  onSelect: () => void;
}

/**
 * Card de figurinha na grade da coleção — Figma DS §4 Figurinha.
 * Borda 5px na cor da raridade; estado bloqueado para não possuídas.
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
  const theme    = rarityTheme(slug, sticker.rarities?.color_hex);
  const animType = sticker.rarities?.animation_type ?? "none";

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.45), ease: "easeOut" }}
      onClick={onSelect}
      className={cn(
        "group relative aspect-160/229 w-full cursor-pointer overflow-hidden rounded-block border-[5px] text-left",
        "transition-[transform,box-shadow] duration-200",
        owned
          ? "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
          : "opacity-90",
      )}
      style={{
        borderColor: owned ? color : "rgba(255,255,255,0.2)",
      }}
      aria-label={
        owned
          ? `${sticker.name}, ${quantity} na coleção`
          : `${sticker.name}, ainda não descoberta`
      }
    >
      {/* Imagem */}
      <Image
        src={sticker.image_url}
        alt=""
        fill
        className={cn(
          "object-cover transition-[filter,transform] duration-300",
          owned ? "group-hover:scale-[1.03]" : "scale-105 blur-[3px] grayscale brightness-[0.45]",
        )}
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
      />

      {/* Holográfico (super rara) */}
      {owned && animType === "holographic" && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-25"
          animate={{ backgroundPositionX: ["0%", "200%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.75) 45%, transparent 65%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}

      {/* Glow interno */}
      {owned && (animType === "glow" || animType === "holographic") && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 12px ${color}44` }}
        />
      )}

      {/* Estado bloqueado */}
      {!owned && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-verde-escuro-capa/55">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <Lock size={16} className="text-white/80" aria-hidden />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
            Não descoberta
          </span>
        </div>
      )}

      {/* Quantidade */}
      {owned && quantity > 1 && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-pill bg-amarelo px-1.5 py-0.5 text-[10px] font-bold text-verde-escuro-500 shadow-sm">
          {quantity}×
        </span>
      )}

      {/* Super rara — sparkle */}
      {owned && slug === "super_rare" && (
        <Sparkles
          size={14}
          className="absolute left-1.5 top-1.5 z-10 text-gold-500 drop-shadow-sm"
          aria-hidden
        />
      )}

      {/* Nome (possuídas) */}
      {owned && (
        <div className="absolute inset-x-1 bottom-2 z-10 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span
            className="max-w-full truncate rounded-card rounded-br-none px-2.5 py-1 text-center font-display text-[10px] font-bold uppercase leading-tight text-white sm:text-xs"
            style={{ backgroundColor: theme.nameTag }}
          >
            {sticker.name}
          </span>
        </div>
      )}
    </motion.button>
  );
}
