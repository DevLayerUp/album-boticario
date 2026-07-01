"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Compass, Loader2, RefreshCw, Search } from "lucide-react";
import { ExploreUserCard, WishRequestCard } from "./explore-cards";
import {
  CreateTradeEventModal,
  EmptyState,
  FulfillWishModal,
} from "./shared";
import { parseTradeApiError, useTradeToast } from "./trade-toast";
import { NO_DUPLICATES_TRADE_MESSAGE } from "@/lib/trade-duplicates";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import type { MyWish, Trade, TradeableEntry, Wish } from "./types";

interface SolicitarViewProps {
  hasDuplicates: boolean;
  metaLoaded: boolean;
  onTradeActivity?: () => void;
}

export function SolicitarView({
  hasDuplicates,
  metaLoaded,
  onTradeActivity,
}: SolicitarViewProps) {
  const { showToast } = useTradeToast();
  const [wishes, setWishes] = useState<MyWish[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Trade[]>([]);
  const [exploreWishes, setExploreWishes] = useState<Wish[]>([]);
  const [myAvailable, setMyAvailable] = useState<TradeableEntry[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [fulfill, setFulfill] = useState<Wish | null>(null);
  const [busyWishId, setBusyWishId] = useState<number | null>(null);
  const [wishSearch, setWishSearch] = useState("");

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
    stickerTextToPlain(w.stickers?.name ?? "")
      .toLowerCase()
      .includes(wishSearch.toLowerCase()),
  );

  const emptyListMessage =
    wishes.length === 0
      ? "Nenhum pedido criado ainda. Clique em Criar evento de troca para publicar o que você precisa."
      : wishSearch.trim()
        ? "Nenhum pedido corresponde ao filtro."
        : "Nenhum pedido criado ainda.";

  async function cancelWish(id: number) {
    setBusyWishId(id);
    try {
      const res = await fetch(`/api/trades/wishes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast({
          message: await parseTradeApiError(res, "Não foi possível cancelar o pedido."),
          variant: "error",
        });
        return;
      }
      setWishes((prev) => prev.filter((w) => w.id !== id));
      showToast({
        message: "Pedido cancelado com sucesso.",
        variant: "info",
      });
    } finally {
      setBusyWishId(null);
    }
  }

  async function handleRefreshExplore() {
    await loadExplore();
    showToast({
      message: "Lista de pedidos atualizada.",
      variant: "info",
    });
  }

  function canOffer(wantedId: number) {
    return (
      hasDuplicates &&
      myAvailable.some((m) => m.sticker?.id === wantedId && (m.spareQuantity ?? m.tradeable ?? 0) > 0)
    );
  }

  const canCreateEvent = metaLoaded && hasDuplicates;

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 2xl:space-y-14">
      <section
        aria-labelledby="solicitar-troca-heading"
        className="rounded-[20px] border border-verde-400 bg-verde-100 p-4 sm:rounded-[24px] sm:p-5 lg:p-6 2xl:rounded-[32px] 2xl:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="max-w-3xl">
            <h2
              id="solicitar-troca-heading"
              className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl 2xl:text-2xl"
            >
              Seus pedidos
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-verde-escuro-400 sm:text-base">
              Cadastre as figurinhas que você ainda precisa. Outros colecionadores verão seus pedidos
              e poderão oferecer trocas com repetidas.
            </p>
          </div>

          <span
            className="w-full shrink-0 sm:w-auto"
            title={!canCreateEvent ? NO_DUPLICATES_TRADE_MESSAGE : undefined}
          >
            <button
              type="button"
              onClick={() => canCreateEvent && setCreatingEvent(true)}
              disabled={!canCreateEvent}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-verde-escuro-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-verde-escuro-500/20 transition-colors hover:bg-verde-escuro-400 disabled:cursor-not-allowed disabled:bg-verde-escuro-300 disabled:shadow-none disabled:hover:bg-verde-escuro-300 sm:px-6 sm:py-3"
            >
              <ArrowLeftRight size={16} aria-hidden />
              Criar evento de troca
            </button>
          </span>
        </div>

        {wishes.length > 0 ? (
          <div className="relative mt-4 sm:mt-5 2xl:mt-6">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-verde-escuro-300"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Filtrar seus pedidos…"
              value={wishSearch}
              onChange={(e) => setWishSearch(e.target.value)}
              aria-label="Filtrar seus pedidos"
              className="w-full rounded-pill border border-verde-200 bg-surface py-2.5 pl-10 pr-4 text-sm text-verde-escuro-capa outline-none transition-colors focus:border-verde-500 focus:ring-2 focus:ring-verde-500/20 sm:py-3 sm:pl-11"
            />
          </div>
        ) : null}

        <div className="mt-4 max-h-[min(42vh,400px)] overflow-y-auto pr-1 [scrollbar-width:thin] sm:mt-5 lg:max-h-[min(46vh,460px)] 2xl:mt-6 2xl:max-h-[520px]">
          {loadingWishes ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-verde-300" />
            </div>
          ) : filteredWishes.length === 0 ? (
            <EmptyState message={emptyListMessage} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:gap-4">
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

      <section aria-labelledby="explorar-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="max-w-2xl">
            <h2
              id="explorar-heading"
              className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-4xl"
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
            onClick={() => void handleRefreshExplore()}
            disabled={loadingExplore}
            className="flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-pill border border-verde-200 bg-surface px-4 py-2 text-sm font-semibold text-verde-escuro-500 transition-colors hover:bg-verde-100 disabled:opacity-60 sm:px-5 sm:py-2.5"
          >
            <RefreshCw size={16} className={loadingExplore ? "animate-spin" : ""} aria-hidden />
            Atualizar explorar
          </button>
        </div>

        <div className="mt-5 sm:mt-6 2xl:mt-8">
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
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:gap-5 2xl:gap-6">
              {exploreWishes.map((w) => {
                if (!w.sticker) return null;
                return (
                  <ExploreUserCard
                    key={w.id}
                    wish={w}
                    eligible={canOffer(w.sticker.id)}
                    hasSticker={myAvailable.some((m) => m.sticker?.id === w.sticker!.id)}
                    noDuplicates={metaLoaded && !hasDuplicates}
                    onOffer={() => setFulfill(w)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {creatingEvent ? (
          <CreateTradeEventModal
            onClose={() => setCreatingEvent(false)}
            onSuccess={() => {
              loadWishes();
              loadExplore();
              onTradeActivity?.();
              showToast({
                message: "Evento de troca publicado! Outros colecionadores já podem ver.",
                variant: "success",
              });
            }}
          />
        ) : null}
        {fulfill ? (
          <FulfillWishModal
            wish={fulfill}
            myAvailable={myAvailable}
            onClose={() => setFulfill(null)}
            onSuccess={() => {
              showToast({
                message: "Oferta enviada! Aguardando resposta do colecionador.",
                variant: "success",
              });
              setFulfill(null);
              onTradeActivity?.();
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
