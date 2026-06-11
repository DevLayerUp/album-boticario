"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
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
 * Card do grid de coleção.
 *
 * Estados visuais:
 *  - unowned  → silhueta escurecida com ícone de cadeado
 *  - owned    → imagem completa com borda colorida por raridade
 *  - quantity > 1 → badge de quantidade sobreposto
 *
 * Segue guia-visual.md: paleta verde-institucional, tipografia em caixa-alta,
 * cards editoriais limpos com profundidade discreta.
 */
export function CollectionStickerCard({
  sticker,
  quantity,
  index,
  onSelect,
}: CollectionStickerCardProps) {
  const owned = quantity > 0;
  const border = rarityColor(sticker.rarities?.slug, sticker.rarities?.color_hex);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={
        owned
          ? `Ver detalhes de ${sticker.name} (${quantity} cópia${quantity > 1 ? "s" : ""})`
          : `${sticker.name} — não descoberta`
      }
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.6) }}
      whileHover={owned ? { y: -3 } : undefined}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-card text-left",
        "transition-[shadow,opacity] duration-200",
        owned ? "shadow-sm hover:shadow-paper" : "opacity-55 hover:opacity-70",
      )}
      style={
        owned
          ? { border: `2px solid ${border}` }
          : { border: "2px solid #ccc" }
      }
    >
      {/* Imagem */}
      <div
        className={cn(
          "relative aspect-2/3 w-full overflow-hidden",
          !owned && "bg-verde-escuro-capa/10",
        )}
      >
        <Image
          src={sticker.image_url}
          alt={owned ? sticker.name : "Figurinha bloqueada"}
          fill
          sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className={cn(
            "object-cover transition-transform duration-300",
            !owned && "grayscale opacity-30",
            owned && "group-hover:scale-[1.03]",
          )}
        />

        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock
              size={22}
              strokeWidth={2}
              className="text-verde-escuro-400/50"
              aria-hidden
            />
          </div>
        )}

        {/* Glow de raridade ao fazer hover (owned only) */}
        {owned && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(ellipse at center, ${border}22 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Badge de quantidade (2+) */}
        {quantity > 1 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: border }}
            aria-label={`${quantity} cópias`}
          >
            {quantity}
          </span>
        )}
      </div>

      {/* Nome */}
      <div
        className={cn(
          "px-2 py-1.5 text-center",
          owned ? "bg-surface" : "bg-verde-escuro-100/30",
        )}
        style={owned ? { borderTop: `1.5px solid ${border}22` } : undefined}
      >
        <p
          className={cn(
            "truncate text-[10px] font-bold uppercase tracking-widest leading-tight",
            owned ? "text-verde-escuro-500" : "text-verde-escuro-300",
          )}
        >
          {sticker.name}
        </p>
      </div>
    </motion.button>
  );
}
