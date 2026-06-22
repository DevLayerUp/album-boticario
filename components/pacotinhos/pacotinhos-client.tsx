"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gift } from "lucide-react";
import { PackOpener } from "@/components/pack/pack-opener";
import { PackStatCards } from "./pack-stat-cards";
import { AvailablePacksCarousel } from "./available-packs-carousel";
import { OpenedPackRow } from "./opened-pack-row";
import { OPENED_HISTORY_PAGE_SIZE } from "@/lib/pack-opened-history";
import type { OpenedPackHistory, Pack, PackSticker, PackVisualSettings, PacotinhosStats } from "./types";

interface PacotinhosClientProps {
  initialPacks: Pack[];
  openedHistory: OpenedPackHistory[];
  stats: PacotinhosStats;
  visual: PackVisualSettings;
}

export function PacotinhosClient({
  initialPacks,
  openedHistory: initialHistory,
  stats: initialStats,
  visual,
}: PacotinhosClientProps) {
  const [packs, setPacks] = useState(initialPacks);
  const [history, setHistory] = useState(initialHistory);
  const [stats, setStats] = useState(initialStats);
  const [activePack, setActivePack] = useState<Pack | null>(null);
  const [openQueue, setOpenQueue] = useState<Pack[]>([]);
  const [portalReady, setPortalReady] = useState(false);
  const [historyVisibleCount, setHistoryVisibleCount] = useState(OPENED_HISTORY_PAGE_SIZE);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  const available = packs.filter((p) => !p.opened_at);
  const visibleHistory = history.slice(0, historyVisibleCount);
  const canLoadMoreHistory = historyVisibleCount < stats.opened;

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!activePack) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activePack]);

  const openPack = useCallback((pack: Pack) => {
    setActivePack(pack);
    setOpenQueue([]);
  }, []);

  const openAllInSequence = useCallback(() => {
    if (available.length === 0) return;
    setOpenQueue(available.slice(1));
    setActivePack(available[0]);
  }, [available]);

  const handleComplete = useCallback(
    (revealed: PackSticker[]) => {
      if (!activePack) return;

      const openedAt = new Date().toISOString();

      setPacks((prev) =>
        prev.map((p) =>
          p.id === activePack.id ? { ...p, opened_at: openedAt } : p,
        ),
      );

      setHistory((prev) => [
        {
          id: activePack.id,
          source: activePack.source,
          opened_at: openedAt,
          stickers: revealed,
        },
        ...prev,
      ]);

      setStats((prev) => ({
        available: Math.max(0, prev.available - 1),
        opened: prev.opened + 1,
        totalStickers: prev.totalStickers + revealed.length,
      }));

      setActivePack(null);

      if (openQueue.length > 0) {
        const [next, ...rest] = openQueue;
        setOpenQueue(rest);
        setTimeout(() => setActivePack(next), 300);
      }
    },
    [activePack, openQueue],
  );

  const loadMoreHistory = useCallback(async () => {
    if (!canLoadMoreHistory || loadingMoreHistory) return;

    const nextVisible = historyVisibleCount + OPENED_HISTORY_PAGE_SIZE;

    if (nextVisible > history.length && history.length < stats.opened) {
      setLoadingMoreHistory(true);
      try {
        const res = await fetch(
          `/api/pack/opened?offset=${history.length}&limit=${OPENED_HISTORY_PAGE_SIZE}`,
        );
        const data: OpenedPackHistory[] = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setHistory((prev) => [...prev, ...data]);
        }
      } catch {
        return;
      } finally {
        setLoadingMoreHistory(false);
      }
    }

    setHistoryVisibleCount((count) =>
      Math.min(count + OPENED_HISTORY_PAGE_SIZE, stats.opened),
    );
  }, [
    canLoadMoreHistory,
    history.length,
    historyVisibleCount,
    loadingMoreHistory,
    stats.opened,
  ]);

  return (
    <div className="relative mx-auto w-full max-w-[1672px] space-y-10 pb-16 lg:space-y-14">
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-12">
        <div className="space-y-6">
          <h1 className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-4xl lg:text-[48px] lg:leading-tight">
            Meus Pacotinhos
          </h1>
          <p className="max-w-[562px] text-lg leading-relaxed text-black sm:text-xl lg:text-[26px] lg:leading-snug">
            {available.length > 0 ? (
              <>
                Você tem{" "}
                <span className="font-bold text-verde-400">{available.length}</span>{" "}
                {available.length === 1 ? "pacote pronto" : "pacotes prontos"} para abrir!
              </>
            ) : (
              "Abra, descubra figurinhas raras da natureza e complete sua coleção."
            )}
          </p>
        </div>
        <PackStatCards
          available={stats.available}
          opened={stats.opened}
          totalStickers={stats.totalStickers}
        />
      </header>

      {portalReady &&
        createPortal(
          <AnimatePresence>
            {activePack && (
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex min-h-dvh items-center justify-center p-4"
              >
                <div
                  className="absolute inset-0 min-h-dvh bg-verde-500/35 backdrop-blur-[2px]"
                  aria-hidden
                  onClick={() => setActivePack(null)}
                />
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  className="relative z-10 mx-auto flex max-h-[min(92dvh,840px)] w-full max-w-[897px] flex-col overflow-hidden rounded-[40px] bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10 lg:px-16 lg:py-12"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                    <PackOpener
                      packId={activePack.id}
                      source={activePack.source}
                      stickerCount={activePack.sticker_count}
                      packImageUrl={visual.packImageUrl}
                      openingGifUrl={visual.openingGifUrl}
                      onComplete={handleComplete}
                      onClose={() => setActivePack(null)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {available.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-[34px]">
              Disponíveis ({available.length})
            </h2>
            {available.length > 1 && (
              <button
                type="button"
                onClick={openAllInSequence}
                className="rounded-lg px-1 py-0.5 text-left text-sm font-medium uppercase tracking-[0.12em] text-verde-escuro-500 transition-all duration-200 hover:bg-verde-500/10 hover:text-verde-500 sm:px-2 sm:text-2xl sm:tracking-[1.92px] hidden"
              >
                Abrir todas em sequência
              </button>
            )}
          </div>

          <AvailablePacksCarousel
            packs={available}
            packImageUrl={visual.packImageUrl}
            onOpen={openPack}
          />
        </section>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-[32px] border border-dashed border-verde-400/40 bg-verde-100/50 py-16 text-center">
          <Gift className="text-verde-300" size={48} />
          <div>
            <p className="text-lg font-medium text-verde-escuro-500">
              Sem pacotinhos disponíveis
            </p>
            <p className="mt-1 text-base text-verde-escuro-300">
              Responda o quiz diário ou conclua missões para ganhar pacotinhos
            </p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-[34px]">
            Já abertos ({stats.opened})
          </h2>
          <div className="space-y-3">
            {visibleHistory.map((pack) => (
              <OpenedPackRow key={pack.id} pack={pack} />
            ))}
          </div>
          {canLoadMoreHistory && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => void loadMoreHistory()}
                disabled={loadingMoreHistory}
                className="rounded-pill border border-verde-400 px-8 py-2.5 text-base font-medium text-verde-escuro-500 transition-all duration-200 hover:border-verde-500 hover:bg-verde-500/10 hover:text-verde-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-verde-400 disabled:hover:bg-transparent disabled:hover:text-verde-escuro-500"
              >
                {loadingMoreHistory ? "Carregando…" : "Carregar mais"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
