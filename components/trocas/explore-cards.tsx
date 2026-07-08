"use client";

import { ArrowLeftRight } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { StickerFormattedText } from "@/components/sticker/sticker-formatted-text";
import { NO_DUPLICATES_TRADE_MESSAGE } from "@/lib/trade-duplicates";
import { DAILY_TRADE_LIMIT } from "@/lib/trade-daily-limit";
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
  hasSticker: boolean;
  noDuplicates: boolean;
  proposalLimitReached?: boolean;
  onOffer: () => void;
}

export function ExploreUserCard({
  wish,
  eligible,
  hasSticker,
  noDuplicates,
  proposalLimitReached = false,
  onOffer,
}: ExploreUserCardProps) {
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
      <div className="flex flex-col items-center px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5 2xl:px-5 2xl:pb-4 2xl:pt-6">
        <Avatar profile={wish.user} size={72} className="2xl:!w-[88px] 2xl:!h-[88px]" />
        <p className={cn("mt-2 font-display text-base font-bold sm:mt-2.5 2xl:mt-3 2xl:text-lg", theme.accent)}>{displayName}</p>
        <div className="mt-2 2xl:mt-3">
          <RarityBadge
            name={wish.sticker.rarities?.name ?? "Comum"}
            slug={slug}
            colorHex={wish.sticker.rarities?.color_hex}
          />
        </div>
      </div>

      <div className={cn("mx-3 border-t sm:mx-4 2xl:mx-5", theme.divider)} />

      <div className="flex flex-1 flex-col items-center gap-2 px-3 py-3 sm:gap-2.5 sm:px-4 sm:py-4 2xl:gap-3 2xl:px-5 2xl:py-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-verde-escuro-300 sm:text-[10px] sm:tracking-[0.2em]">
          Está procurando
        </p>
        <StickerThumb sticker={wish.sticker} width={60} height={86} className="sm:w-[68px] sm:h-[97px] 2xl:!w-[72px] 2xl:!h-[103px]" />
        <p
          className="line-clamp-2 text-center font-display text-sm font-bold leading-tight text-verde-escuro-capa sm:text-base 2xl:text-lg"
          style={{ color: rarityColor(slug, wish.sticker.rarities?.color_hex) }}
        >
          <StickerFormattedText text={wish.sticker.name} />
        </p>
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4 2xl:px-5 2xl:pb-5">
        {eligible ? (
          <button
            type="button"
            onClick={onOffer}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill py-2.5 text-xs font-bold text-white transition-colors sm:py-3 sm:text-sm",
              theme.cta,
              theme.ctaHover,
              slug === "super_rare" && "text-[#71410a]",
              slug === "rare" && "text-white",
            )}
          >
            <ArrowLeftRight size={16} aria-hidden />
            Eu tenho essa
          </button>
        ) : hasSticker && proposalLimitReached ? (
          <div
            className="flex items-center justify-center rounded-pill border border-dashed border-verde-200 bg-white/50 px-3 py-2.5 text-center text-[11px] leading-snug text-verde-escuro-300 sm:py-3 sm:text-xs"
            title={`Você já enviou ${DAILY_TRADE_LIMIT} propostas de troca hoje. Tente novamente amanhã.`}
          >
            Limite diário de propostas atingido
          </div>
        ) : hasSticker && noDuplicates ? (
          <div
            className="flex items-center justify-center rounded-pill border border-dashed border-verde-200 bg-white/50 px-3 py-2.5 text-center text-[11px] leading-snug text-verde-escuro-300 sm:py-3 sm:text-xs"
            title={NO_DUPLICATES_TRADE_MESSAGE}
          >
            Conquiste repetidas para ofertar
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-pill border border-dashed border-verde-200 bg-white/50 py-2.5 text-[11px] text-verde-escuro-300 sm:py-3 sm:text-xs">
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
    <div className="flex items-center gap-3 rounded-[20px] border border-verde-200 bg-[#f7f9f7] p-3 sm:gap-4 sm:rounded-[24px] sm:p-4 2xl:gap-5 2xl:rounded-[32px] 2xl:p-5">
      <StickerThumb sticker={sticker} width={72} height={103} className="hidden xs:block sm:w-[88px] sm:h-[126px] 2xl:!w-[104px] 2xl:!h-[149px]" />
      <StickerThumb sticker={sticker} width={60} height={86} className="xs:hidden" />

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
          className="mt-1.5 font-display text-lg font-bold leading-tight text-verde-escuro-capa sm:mt-2 sm:text-xl lg:text-2xl 2xl:text-[32px]"
          style={{ color: borderColor }}
        >
          <StickerFormattedText text={sticker.name} />
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
