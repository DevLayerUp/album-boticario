"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, BookmarkCheck, ArrowLeftRight, Lock, Plus } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { NO_DUPLICATES_TRADE_MESSAGE } from "@/lib/trade-duplicates";
import { RarityBadge } from "./rarity-badge";
import type { Sticker } from "./types";

export type StockCardState = "missing" | "owned" | "pasted";

interface StockStickerCardProps {
  sticker: Sticker;
  quantity: number;
  isPasted?: boolean;
  blocked?: boolean;
  hasOpenWish?: boolean;
  index?: number;
  onRequestTrade?: () => void;
  pasteHref?: string | null;
  tradeBlockedNoDuplicates?: boolean;
}

function resolveState(quantity: number, isPasted: boolean): StockCardState {
  if (isPasted) return "pasted";
  if (quantity <= 0) return "missing";
  return "owned";
}

export function StockStickerCard({
  sticker,
  quantity,
  isPasted = false,
  blocked = false,
  hasOpenWish = false,
  index = 0,
  onRequestTrade,
  pasteHref = null,
  tradeBlockedNoDuplicates = false,
}: StockStickerCardProps) {
  const state = resolveState(quantity, isPasted);
  const slug = sticker.rarities?.slug ?? "common";
  const borderColor = rarityColor(slug, sticker.rarities?.color_hex);
  const nameColor =
    slug === "super_rare"
      ? "#b57d02"
      : slug === "rare"
        ? "#09357a"
        : "var(--color-verde-escuro-500)";
  const animType = sticker.rarities?.animation_type;
  const canRequestTrade = state === "missing" && !hasOpenWish && onRequestTrade;
  const canPaste = state === "owned" && Boolean(pasteHref);

  const cardImage = (
    <div className="relative w-full">
      <div
        className={cn(
          "relative aspect-160/229 w-full overflow-hidden rounded-block border-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-200",
          state === "missing" && "border-dashed bg-verde-escuro-capa/[0.04]",
          state === "owned" && "border-dashed",
          blocked && state !== "missing" && "opacity-80",
          canRequestTrade && "group-hover:border-verde-500 group-hover:shadow-md",
          canPaste && "group-hover:border-verde-500 group-hover:shadow-md",
        )}
        style={{
          borderColor:
            state === "missing"
              ? `${borderColor}55`
              : state === "owned"
                ? `${borderColor}b3`
                : borderColor,
        }}
      >
        <Image
          src={sticker.image_url}
          alt=""
          fill
          className={cn(
            "object-cover transition-[filter,opacity] duration-300",
            state === "missing" && "grayscale opacity-35 group-hover:opacity-45",
            state === "owned" && "opacity-50",
            state === "pasted" && "opacity-100",
          )}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 160px"
        />

        {state === "missing" && hasOpenWish && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-verde-escuro-capa/15">
            <span className="flex items-center gap-1 rounded-pill bg-verde-escuro-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
              <BookmarkCheck size={11} aria-hidden />
              Pedido aberto
            </span>
          </div>
        )}

        {canRequestTrade && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-capa/20 transition-colors group-hover:bg-verde-escuro-500/25">
              <span className="flex size-9 items-center justify-center rounded-full bg-surface/90 shadow-sm transition-colors group-hover:bg-verde-500 group-hover:text-white sm:size-10">
                <Lock
                  size={16}
                  className="text-verde-escuro-300 transition-opacity group-hover:opacity-0"
                  aria-hidden
                />
                <ArrowLeftRight
                  size={18}
                  className="absolute text-verde-escuro-500 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-white"
                  aria-hidden
                />
              </span>
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-verde-escuro-capa/80 to-transparent px-2 pb-2 pt-6 text-center text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 sm:text-[11px]">
              Solicitar troca
            </span>
          </>
        )}

        {state === "missing" && !hasOpenWish && !onRequestTrade && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-verde-escuro-capa/20 px-2"
            title={tradeBlockedNoDuplicates ? NO_DUPLICATES_TRADE_MESSAGE : undefined}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-surface/90 shadow-sm sm:size-10">
              <Lock size={16} className="text-verde-escuro-300" aria-hidden />
            </span>
            {tradeBlockedNoDuplicates ? (
              <span className="pointer-events-none text-center text-[9px] font-semibold leading-tight text-verde-escuro-400 sm:text-[10px]">
                Sem repetidas
              </span>
            ) : null}
          </div>
        )}

          {state === "owned" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-verde-escuro-500/25 transition-colors group-hover:bg-verde-escuro-500/35">
              <span className="flex size-9 items-center justify-center rounded-full bg-verde-500 shadow-lg shadow-verde-escuro-500/30 transition-transform group-hover:scale-105 sm:size-10">
                <Plus size={18} className="text-white" aria-hidden />
              </span>
              {canPaste ? (
                <span className="pointer-events-none px-2 text-center text-[9px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 sm:text-[10px]">
                  Colar no álbum
                </span>
              ) : null}
            </div>
          )}

          {state === "pasted" && animType === "holographic" && (
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-25"
              animate={{ backgroundPositionX: ["0%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.7) 45%, transparent 65%)",
                backgroundSize: "200% 100%",
              }}
            />
          )}

          {state === "pasted" && (
            <span className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-pill bg-verde-escuro-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
              <BookOpen size={10} aria-hidden />
              No álbum
            </span>
          )}

          {blocked && state !== "missing" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-verde-escuro-capa/35">
              <span className="flex items-center gap-1.5 rounded-pill bg-surface/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-verde-escuro-500 shadow-sm">
                <Lock size={12} aria-hidden />
                Bloqueada
              </span>
            </div>
          )}
        </div>

        {quantity > 1 && (
          <span
            className="absolute -right-0.5 -top-1.5 z-30 flex size-7 min-w-7 items-center justify-center rounded-full bg-amarelo px-1 text-[10px] font-bold text-verde-escuro-500 shadow-md sm:-top-2 sm:size-8 sm:text-xs"
            aria-label={`${quantity} cópias`}
          >
            {quantity}×
          </span>
        )}
      </div>
  );

  const cardMeta = (
    <>
      <RarityBadge
        name={sticker.rarities?.name ?? "Comum"}
        slug={slug}
        colorHex={sticker.rarities?.color_hex}
        className={cn(
          "mt-1.5 px-3 py-1 text-[10px] font-medium normal-case tracking-normal sm:mt-2 sm:px-4 sm:text-xs 2xl:mt-2.5 2xl:px-5 2xl:py-1.5 2xl:text-sm",
          state === "missing" && "opacity-60",
        )}
      />

      <p
        className={cn(
          "mt-1.5 w-full truncate font-display text-sm font-bold leading-tight sm:mt-2 sm:text-base 2xl:text-xl",
          state === "missing" && !hasOpenWish && "text-verde-escuro-300",
          hasOpenWish && "text-verde-escuro-400",
        )}
        style={state !== "missing" || hasOpenWish ? { color: hasOpenWish ? undefined : nameColor } : undefined}
      >
        {sticker.name}
      </p>

      {canRequestTrade ? (
        <p className="mt-1 text-[10px] font-semibold text-verde-500 sm:text-xs">
          Toque para solicitar
        </p>
      ) : canPaste ? (
        <p className="mt-1 text-[10px] font-semibold text-verde-500 sm:text-xs">
          Toque para colar
        </p>
      ) : null}
    </>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.35) }}
      className="flex flex-col items-start gap-0"
    >
      {canRequestTrade ? (
        <button
          type="button"
          onClick={onRequestTrade}
          className="group w-full cursor-pointer text-left"
          aria-label={`Solicitar troca de ${sticker.name}`}
        >
          {cardImage}
          {cardMeta}
        </button>
      ) : canPaste ? (
        <Link
          href={pasteHref!}
          className="group w-full cursor-pointer text-left"
          aria-label={`Colar ${sticker.name} no álbum`}
        >
          {cardImage}
          {cardMeta}
        </Link>
      ) : tradeBlockedNoDuplicates ? (
        <div
          className="w-full text-left"
          title={NO_DUPLICATES_TRADE_MESSAGE}
        >
          {cardImage}
          {cardMeta}
        </div>
      ) : (
        <>
          {cardImage}
          {cardMeta}
        </>
      )}
    </motion.div>
  );
}

export type StockFilter =
  | "all"
  | "common"
  | "rare"
  | "super_rare"
  | "blocked"
  | "repetidas"
  | "faltando"
  | "no_album";

interface StockFilterBarProps {
  active: StockFilter;
  onChange: (filter: StockFilter) => void;
  counts: Record<StockFilter, number>;
}

const FILTER_LABELS: Record<StockFilter, string> = {
  all: "Todas",
  common: "Comum",
  rare: "Rara",
  super_rare: "Super rara",
  repetidas: "Repetidas",
  faltando: "Faltando",
  no_album: "No álbum",
  blocked: "Bloqueadas",
};

export function StockFilterBar({ active, onChange, counts }: StockFilterBarProps) {
  const filters: StockFilter[] = [
    "all",
    "faltando",
    "no_album",
    "repetidas",
    "common",
    "rare",
    "super_rare",
    "blocked",
  ];

  return (
    <div
      className="flex max-w-full flex-wrap gap-1.5 rounded-pill bg-white p-1 sm:gap-2 sm:p-1.5 2xl:gap-2.5 2xl:p-2"
      role="tablist"
      aria-label="Filtrar estoque"
    >
      {filters.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-pill py-1.5 pl-4 pr-2 text-xs font-medium transition-colors sm:gap-2.5 sm:py-2 sm:pl-6 sm:pr-2.5 sm:text-sm 2xl:pl-8 2xl:text-base",
              isActive
                ? "bg-verde-escuro-500 text-white"
                : "border border-verde-300 text-verde-300 hover:border-verde-400 hover:text-verde-400",
            )}
          >
            {FILTER_LABELS[filter]}
            <span
              className={cn(
                "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-bold sm:h-7 sm:min-w-7 sm:text-xs",
                isActive ? "bg-amarelo text-verde-escuro-500" : "bg-verde-100 text-verde-500",
              )}
            >
              {counts[filter]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
