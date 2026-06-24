"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";
import { EmptyState } from "./shared";
import {
  StockFilterBar,
  StockStickerCard,
  type StockFilter,
} from "./stock-sticker-card";
import type { Trade, TradeableEntry } from "./types";

export function EstoqueView() {
  const [available, setAvailable] = useState<TradeableEntry[]>([]);
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StockFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, sent, received] = await Promise.all([
        fetch("/api/trades/available").then((r) => r.json()).catch(() => []),
        fetch("/api/trades?tab=sent").then((r) => r.json()).catch(() => []),
        fetch("/api/trades?tab=received").then((r) => r.json()).catch(() => []),
      ]);
      setAvailable(Array.isArray(a) ? a : []);
      setPendingTrades([
        ...(Array.isArray(sent) ? sent : []),
        ...(Array.isArray(received) ? received : []),
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const inNegotiationIds = useMemo(() => {
    const ids = new Set<number>();
    for (const trade of pendingTrades) {
      if (trade.offered_sticker?.id) ids.add(trade.offered_sticker.id);
      if (trade.requested_sticker?.id) ids.add(trade.requested_sticker.id);
    }
    return ids;
  }, [pendingTrades]);

  const duplicates = useMemo(
    () =>
      available.filter(
        (e): e is TradeableEntry & { sticker: NonNullable<TradeableEntry["sticker"]> } =>
          Boolean(e.sticker && e.quantity >= 2),
      ),
    [available],
  );

  const counts = useMemo(() => {
    const base: Record<StockFilter, number> = {
      all: duplicates.length,
      common: 0,
      rare: 0,
      super_rare: 0,
      blocked: 0,
    };
    for (const { sticker } of duplicates) {
      const slug = sticker.rarities?.slug ?? "common";
      if (slug === "common") base.common += 1;
      else if (slug === "rare") base.rare += 1;
      else if (slug === "super_rare") base.super_rare += 1;
      if (inNegotiationIds.has(sticker.id)) base.blocked += 1;
    }
    return base;
  }, [duplicates, inNegotiationIds]);

  const filtered = useMemo(() => {
    return duplicates.filter(({ sticker }) => {
      const slug = sticker.rarities?.slug ?? "common";
      const blocked = inNegotiationIds.has(sticker.id);
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
          return blocked;
        default:
          return true;
      }
    });
  }, [duplicates, filter, inNegotiationIds]);

  return (
    <section
      aria-labelledby="estoque-heading"
      className="rounded-[20px] border border-verde-400 bg-verde-100 p-4 sm:rounded-[24px] sm:p-5 lg:p-6 2xl:rounded-[32px] 2xl:p-8"
    >
      <p
        id="estoque-heading"
        className="max-w-4xl text-sm leading-relaxed text-verde-escuro-500 sm:text-base lg:text-base lg:leading-relaxed 2xl:text-xl 2xl:leading-[33px]"
      >
        Visualize suas figurinhas repetidas disponíveis para troca. As bloqueadas estão em
        negociações ativas.
      </p>

      <div className="mt-4 overflow-x-auto pb-1 sm:mt-5 2xl:mt-6">
        <StockFilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="mt-5 sm:mt-6 2xl:mt-8">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-verde-300" />
          </div>
        ) : duplicates.length === 0 ? (
          <div>
            <EmptyState
              message="Você ainda não tem repetidas. Abra pacotes, complete missões ou responda quizzes para conseguir figurinhas extras."
              icon={Layers}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/album"
                className="rounded-pill bg-verde-escuro-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-verde-escuro-400"
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
              {filtered.map(({ sticker, quantity }, index) => (
                <StockStickerCard
                  key={sticker.id}
                  sticker={sticker}
                  quantity={quantity}
                  blocked={inNegotiationIds.has(sticker.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
