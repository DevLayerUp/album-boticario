"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { ExploreUserCard, WishRequestCard } from "./explore-cards";
import {
  AddWishModal,
  EmptyState,
  FulfillWishModal,
  Toast,
} from "./shared";
import type { MyWish, Trade, TradeableEntry, Wish } from "./types";

interface SolicitarViewProps {
  onTradeActivity?: () => void;
}

export function SolicitarView({ onTradeActivity }: SolicitarViewProps) {
  const [wishes, setWishes] = useState<MyWish[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Trade[]>([]);
  const [exploreWishes, setExploreWishes] = useState<Wish[]>([]);
  const [myAvailable, setMyAvailable] = useState<TradeableEntry[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [adding, setAdding] = useState(false);
  const [fulfill, setFulfill] = useState<Wish | null>(null);
  const [busyWishId, setBusyWishId] = useState<number | null>(null);
  const [wishSearch, setWishSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const loadWishes = useCallback(async () => {
    setLoadingWishes(true);
    try {
      const [wishesRes, receivedRes] = await Promise.all([
        fetch("/api/trades/wishes/mine").then((r) => r.json()),
        fetch("/api/trades?tab=received").then((r) => r.json()),
      ]);
      setWishes(Array.isArray(wishesRes) ? wishesRes : []);
      setReceivedOffers(Array.isArray(receivedRes) ? receivedRes : []);
    } finally {
      setLoadingWishes(false);
    }
  }, []);

  const loadExplore = useCallback(async () => {
    setLoadingExplore(true);
    try {
      const [w, a] = await Promise.all([
        fetch("/api/trades/wishes").then((r) => r.json()).catch(() => []),
        fetch("/api/trades/available").then((r) => r.json()).catch(() => []),
      ]);
      setExploreWishes(Array.isArray(w) ? w : []);
      setMyAvailable(Array.isArray(a) ? a : []);
    } finally {
      setLoadingExplore(false);
    }
  }, []);

  useEffect(() => {
    loadWishes();
    loadExplore();
  }, [loadWishes, loadExplore]);

  const offerCounts = receivedOffers.reduce<Record<number, number>>((acc, trade) => {
    const stickerId = trade.offered_sticker?.id;
    if (stickerId && trade.status === "pending") {
      acc[stickerId] = (acc[stickerId] ?? 0) + 1;
    }
    return acc;
  }, {});

  const filteredWishes = wishes.filter((w) =>
    (w.stickers?.name ?? "").toLowerCase().includes(wishSearch.toLowerCase()),
  );

  async function cancelWish(id: number) {
    setBusyWishId(id);
    try {
      await fetch(`/api/trades/wishes/${id}`, { method: "DELETE" });
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setBusyWishId(null);
    }
  }

  function canOffer(wantedId: number) {
    return myAvailable.some((m) => m.sticker?.id === wantedId);
  }

  return (
    <div className="space-y-10 lg:space-y-14">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      {/* Painel Solicitar Troca — Figma 381:303 */}
      <section
        aria-labelledby="solicitar-troca-heading"
        className="rounded-[32px] border border-verde-400 bg-verde-100 p-5 sm:p-6 lg:p-8"
      >
        <div className="max-w-3xl">
          <h2
            id="solicitar-troca-heading"
            className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl"
          >
            Seus pedidos
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-verde-escuro-400 sm:text-base">
            Cadastre as figurinhas que você ainda precisa. Outros colecionadores verão seus pedidos
            e poderão oferecer trocas com repetidas.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-verde-escuro-300"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar nos seus pedidos…"
              value={wishSearch}
              onChange={(e) => setWishSearch(e.target.value)}
              className="w-full rounded-pill border border-verde-200 bg-surface py-3 pl-11 pr-4 text-sm text-verde-escuro-capa outline-none transition-colors focus:border-verde-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-verde-escuro-400"
          >
            <Plus size={16} aria-hidden />
            Adicionar pedido
          </button>
        </div>

        <div className="mt-6 max-h-[520px] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {loadingWishes ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-verde-300" />
            </div>
          ) : filteredWishes.length === 0 ? (
            <EmptyState message="Nenhum pedido criado ainda. Clique em Adicionar pedido para buscar figurinhas." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence>
                {filteredWishes.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <WishRequestCard
                      sticker={w.stickers}
                      offerCount={w.stickers ? (offerCounts[w.stickers.id] ?? 0) : 0}
                      onCancel={() => cancelWish(w.id)}
                      cancelBusy={busyWishId === w.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Explorar — Figma 381:303 */}
      <section aria-labelledby="explorar-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="explorar-heading"
              className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl lg:text-4xl"
            >
              Explorar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-verde-escuro-400 sm:text-base">
              Veja o que outros colecionadores estão procurando. Se você tiver a figurinha, ofereça
              e escolha qualquer repetida deles em troca.
            </p>
          </div>
          <button
            type="button"
            onClick={loadExplore}
            disabled={loadingExplore}
            className="flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-pill border border-verde-200 bg-surface px-5 py-2.5 text-sm font-semibold text-verde-escuro-500 transition-colors hover:bg-verde-100 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loadingExplore ? "animate-spin" : ""} aria-hidden />
            Atualizar explorar
          </button>
        </div>

        <div className="mt-8">
          {loadingExplore ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-verde-300" />
            </div>
          ) : exploreWishes.length === 0 ? (
            <EmptyState
              message="Nenhum pedido aberto no momento. Volte mais tarde!"
              icon={Compass}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {exploreWishes.map((w) => {
                if (!w.sticker) return null;
                return (
                  <ExploreUserCard
                    key={w.id}
                    wish={w}
                    eligible={canOffer(w.sticker.id)}
                    onOffer={() => setFulfill(w)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {adding && (
          <AddWishModal
            onClose={() => setAdding(false)}
            onSuccess={() => {
              loadWishes();
              showToast("Pedido criado! Outros colecionadores já podem ver.");
            }}
          />
        )}
        {fulfill && (
          <FulfillWishModal
            wish={fulfill}
            myAvailable={myAvailable}
            onClose={() => setFulfill(null)}
            onSuccess={() => {
              showToast("Oferta enviada! Aguardando resposta.");
              setFulfill(null);
              onTradeActivity?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
