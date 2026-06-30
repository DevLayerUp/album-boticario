"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { BookOpen, Layers, Loader2 } from "lucide-react";
import { CreateTradeEventModal, EmptyState } from "./shared";
import {
  StockFilterBar,
  StockStickerCard,
  type StockFilter,
} from "./stock-sticker-card";
import { useTradeToast } from "./trade-toast";
import { NO_DUPLICATES_TRADE_MESSAGE } from "@/lib/trade-duplicates";
import type { Sticker, StockItem } from "./types";

interface EstoqueViewProps {
  onTradeActivity?: () => void;
}

export function EstoqueView({ onTradeActivity }: EstoqueViewProps) {
  const { showToast } = useTradeToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const [hasTradeableDuplicates, setHasTradeableDuplicates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StockFilter>("all");
  const [tradeModalSticker, setTradeModalSticker] = useState<Sticker | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trades/stock");
      const data = await res.json().catch(() => ({}));
      setItems(Array.isArray(data?.items) ? data.items : []);
      setHasTradeableDuplicates(Boolean(data?.hasTradeableDuplicates));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<StockFilter, number> = {
      all: items.length,
      common: 0,
      rare: 0,
      super_rare: 0,
      blocked: 0,
      repetidas: 0,
      faltando: 0,
      no_album: 0,
    };
    for (const item of items) {
      const slug = item.sticker.rarities?.slug ?? "common";
      if (slug === "common") base.common += 1;
      else if (slug === "rare") base.rare += 1;
      else if (slug === "super_rare") base.super_rare += 1;
      if (item.blocked && item.quantity > 0) base.blocked += 1;
      if ((item.spareQuantity ?? 0) > 0) base.repetidas += 1;
      if (item.quantity === 0 && !item.isPasted) base.faltando += 1;
      if (item.isPasted) base.no_album += 1;
    }
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const slug = item.sticker.rarities?.slug ?? "common";
      switch (filter) {
        case "all":
          return true;
        case "common":
          return slug === "common";
        case "rare":
          return slug === "rare";
        case "super_rare":
          return slug === "super_rare";
        case "blocked":
          return item.blocked && item.quantity > 0;
        case "repetidas":
          return (item.spareQuantity ?? 0) > 0;
        case "faltando":
          return item.quantity === 0 && !item.isPasted;
        case "no_album":
          return item.isPasted;
        default:
          return true;
      }
    });
  }, [items, filter]);

  const pastedCount = items.filter((i) => i.isPasted).length;
  const duplicateCopies = items.reduce(
    (acc, i) => acc + (i.spareQuantity ?? 0),
    0,
  );
  const openWishCount = items.filter((i) => i.hasOpenWish).length;

  const hasTradeableDuplicatesFromItems = useMemo(
    () => items.some((item) => (item.spareQuantity ?? 0) > 0),
    [items],
  );

  const canTrade = hasTradeableDuplicates && hasTradeableDuplicatesFromItems;

  useEffect(() => {
    if (tradeModalSticker && !loading && !canTrade) {
      setTradeModalSticker(null);
    }
  }, [tradeModalSticker, loading, canTrade]);

  function isRequestable(item: StockItem) {
    return (
      !loading &&
      canTrade &&
      item.quantity === 0 &&
      !item.isPasted &&
      !item.hasOpenWish
    );
  }

  function handleRequestTrade(sticker: Sticker) {
    if (!canTrade) {
      showToast({
        message: NO_DUPLICATES_TRADE_MESSAGE,
        variant: "warning",
      });
      return;
    }
    setTradeModalSticker(sticker);
  }

  function isMissingWithoutDuplicates(item: StockItem) {
    return (
      !loading &&
      !canTrade &&
      item.quantity === 0 &&
      !item.isPasted &&
      !item.hasOpenWish
    );
  }

  function pasteHrefFor(item: StockItem) {
    if (item.quantity <= 0 || item.isPasted || !item.pasteTarget) return null;
    const { slotId, categoryId } = item.pasteTarget;
    return `/album?slot=${slotId}&category=${categoryId}`;
  }

  return (
    <section
      aria-labelledby="estoque-heading"
      className="rounded-[20px] border border-verde-400 bg-verde-100 p-4 sm:rounded-[24px] sm:p-5 lg:p-6 2xl:rounded-[32px] 2xl:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p
          id="estoque-heading"
          className="max-w-3xl text-sm leading-relaxed text-verde-escuro-500 sm:text-base lg:leading-relaxed 2xl:text-xl 2xl:leading-[33px]"
        >
          Todas as figurinhas do álbum em um só lugar. Toque nas faltantes para solicitar troca
          {!loading && !canTrade
            ? " (você precisa de repetidas para solicitar)"
            : ""}
          , nas que você já tem (com +) para ir colar no álbum, e veja repetidas com a quantidade.
        </p>

        {!loading && items.length > 0 ? (
          <div className="flex shrink-0 flex-wrap gap-2 text-xs font-semibold text-verde-escuro-400 sm:text-sm">
            <span className="flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 ring-1 ring-verde-200">
              <BookOpen size={14} className="text-verde-escuro-500" aria-hidden />
              {pastedCount} no álbum
            </span>
            <span className="flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 ring-1 ring-verde-200">
              <Layers size={14} className="text-verde-escuro-500" aria-hidden />
              {duplicateCopies} repetidas
            </span>
            {openWishCount > 0 ? (
              <span className="flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 ring-1 ring-verde-200">
                {openWishCount} pedidos abertos
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto pb-1 sm:mt-5 2xl:mt-6">
        <StockFilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="mt-5 sm:mt-6 2xl:mt-8">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-verde-300" />
          </div>
        ) : items.length === 0 ? (
          <div>
            <EmptyState
              message="Nenhuma figurinha cadastrada no catálogo ainda."
              icon={Layers}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/album"
                className="cursor-pointer rounded-pill bg-verde-escuro-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-verde-escuro-400"
              >
                Ver meu álbum
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-card border border-dashed border-verde-300 bg-[#f7f9f7]/60 py-12 text-center text-sm text-verde-escuro-300">
            Nenhuma figurinha neste filtro.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5 lg:gap-3.5 xl:grid-cols-6 2xl:gap-4">
            <AnimatePresence>
              {filtered.map((item, index) => (
                <StockStickerCard
                  key={item.sticker.id}
                  sticker={item.sticker}
                  quantity={item.quantity}
                  spareQuantity={item.spareQuantity ?? 0}
                  isPasted={item.isPasted}
                  blocked={item.blocked}
                  hasOpenWish={item.hasOpenWish}
                  index={index}
                  canRequestTrade={isRequestable(item)}
                  onRequestTrade={() => handleRequestTrade(item.sticker)}
                  tradeBlockedNoDuplicates={isMissingWithoutDuplicates(item)}
                  pasteHref={pasteHrefFor(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {tradeModalSticker ? (
          <CreateTradeEventModal
            initialSticker={tradeModalSticker}
            onClose={() => setTradeModalSticker(null)}
            onSuccess={() => {
              load();
              setTradeModalSticker(null);
              onTradeActivity?.();
              showToast({
                message: "Pedido publicado! Outros colecionadores já podem ver em Explorar.",
                variant: "success",
              });
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
