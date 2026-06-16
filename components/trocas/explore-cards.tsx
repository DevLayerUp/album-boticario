"use client";

import { ArrowLeftRight } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { Avatar, StickerThumb } from "./shared";
import { RarityBadge } from "./rarity-badge";
import type { Sticker, Wish } from "./types";

const EXPLORE_THEMES: Record<
  string,
  { surface: string; accent: string; cta: string; ctaHover: string; divider: string }
> = {
  common: {
    surface: "bg-surface-green",
    accent: "text-verde-escuro-500",
    cta: "bg-verde-500",
    ctaHover: "hover:bg-verde-400",
    divider: "border-verde-200",
  },
  rare: {
    surface: "bg-[#e3f6fb]",
    accent: "text-[#09357a]",
    cta: "bg-azul-500",
    ctaHover: "hover:bg-[#33bee2]",
    divider: "border-[#cceff8]",
  },
  super_rare: {
    surface: "bg-[#f6ead1]",
    accent: "text-[#71410a]",
    cta: "bg-gradient-to-r from-[#deaa00] to-[#ffe07a]",
    ctaHover: "hover:opacity-90",
    divider: "border-[#e3b316]/30",
  },
};

function getTheme(slug?: string | null) {
  return EXPLORE_THEMES[slug ?? "common"] ?? EXPLORE_THEMES.common;
}

interface ExploreUserCardProps {
  wish: Wish;
  eligible: boolean;
  onOffer: () => void;
}

export function ExploreUserCard({ wish, eligible, onOffer }: ExploreUserCardProps) {
  if (!wish.user || !wish.sticker) return null;

  const slug = wish.sticker.rarities?.slug ?? "common";
  const theme = getTheme(slug);
  const displayName = wish.user.display_name.startsWith("@")
    ? wish.user.display_name
    : `@${wish.user.display_name.replace(/\s+/g, "").toLowerCase()}`;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
        theme.surface,
      )}
    >
      <div className="flex flex-col items-center px-5 pb-4 pt-6">
        <Avatar profile={wish.user} size={88} />
        <p className={cn("mt-3 font-display text-lg font-bold", theme.accent)}>{displayName}</p>
        <div className="mt-3">
          <RarityBadge
            name={wish.sticker.rarities?.name ?? "Comum"}
            slug={slug}
            colorHex={wish.sticker.rarities?.color_hex}
          />
        </div>
      </div>

      <div className={cn("mx-5 border-t", theme.divider)} />

      <div className="flex flex-1 flex-col items-center gap-3 px-5 py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-verde-escuro-300">
          Está procurando
        </p>
        <StickerThumb sticker={wish.sticker} width={72} height={103} />
        <p
          className="line-clamp-2 text-center font-display text-base font-bold leading-tight text-verde-escuro-capa sm:text-lg"
          style={{ color: rarityColor(slug, wish.sticker.rarities?.color_hex) }}
        >
          {wish.sticker.name}
        </p>
      </div>

      <div className="px-5 pb-5">
        {eligible ? (
          <button
            type="button"
            onClick={onOffer}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill py-3 text-sm font-bold text-white transition-colors",
              theme.cta,
              theme.ctaHover,
              slug === "super_rare" && "text-[#71410a]",
              slug === "rare" && "text-white",
            )}
          >
            <ArrowLeftRight size={16} aria-hidden />
            Eu tenho essa
          </button>
        ) : (
          <div className="flex items-center justify-center rounded-pill border border-dashed border-verde-200 bg-white/50 py-3 text-xs text-verde-escuro-300">
            Você não possui esta figurinha
          </div>
        )}
      </div>
    </article>
  );
}

interface WishRequestCardProps {
  sticker: Sticker | null;
  offerCount: number;
  onCancel?: () => void;
  cancelBusy?: boolean;
}

export function WishRequestCard({
  sticker,
  offerCount,
  onCancel,
  cancelBusy,
}: WishRequestCardProps) {
  if (!sticker) return null;

  const slug = sticker.rarities?.slug ?? "common";
  const borderColor = rarityColor(slug, sticker.rarities?.color_hex);

  return (
    <div className="flex items-center gap-4 rounded-[32px] border border-verde-200 bg-[#f7f9f7] p-4 sm:gap-5 sm:p-5">
      <StickerThumb sticker={sticker} width={88} height={126} className="hidden xs:block sm:w-[104px] sm:h-[149px]" />
      <StickerThumb sticker={sticker} width={72} height={103} className="xs:hidden" />

      <div className="min-w-0 flex-1">
        {offerCount > 0 ? (
          <span className="inline-flex rounded-pill bg-verde-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-verde-escuro-500">
            {offerCount} {offerCount === 1 ? "oferta" : "ofertas"}
          </span>
        ) : (
          <span className="inline-flex rounded-pill border border-verde-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-verde-escuro-400">
            Aguardando oferta
          </span>
        )}
        <p
          className="mt-2 font-display text-xl font-bold leading-tight text-verde-escuro-capa sm:text-2xl lg:text-[32px]"
          style={{ color: borderColor }}
        >
          {sticker.name}
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelBusy}
            className="mt-3 text-xs font-medium text-red-500 underline-offset-2 hover:underline disabled:opacity-50"
          >
            {cancelBusy ? "Cancelando…" : "Cancelar pedido"}
          </button>
        )}
      </div>
    </div>
  );
}
