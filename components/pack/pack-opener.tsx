"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PackResultSticker } from "@/components/pacotinhos/pack-result-sticker";
import { SOURCE_LABEL } from "@/components/pacotinhos/shared";
import {
  playPackOpeningGifSound,
  playPackPopupSound,
  playPackRevealSound,
  preloadPackOpeningGifSound,
  stopPackOpeningGifSound,
  unlockPackOpeningGifSound,
} from "@/lib/play-pack-open-sound";
import type { PackSticker } from "@/components/pacotinhos/types";
import { STICKERS_PER_PACK } from "@/lib/pack-settings";
import {
  isPackOpeningGifPreloaded,
  preloadPackOpeningGif,
} from "@/lib/preload-pack-opening-gif";

type Phase = "ready" | "opening" | "results";

interface PackOpenerProps {
  packId: number;
  source: string;
  stickerCount: number;
  packImageUrl: string;
  openingGifUrl: string | null;
  onComplete: (stickers: PackSticker[]) => void;
  /** Chamado assim que o servidor confirma a abertura — remove o pacote da lista disponível. */
  onOpened: (packId: number, openedAt: string) => void;
  onOpeningChange?: (isOpening: boolean) => void;
  onClose: () => void;
}

const OPENING_MIN_MS = 2200;
/** Never block results longer than this if the GIF fails to load. */
const OPENING_MAX_WAIT_MS = 12000;
/** Small buffer after the GIF is on screen so audio matches the first visible frame. */
const OPENING_GIF_SOUND_DELAY_MS = 40;

/** Scales with viewport height — mesma área na tela "Pacotinho pronto!" e na abertura (GIF). */
const PACK_MEDIA_CLASS_READY =
  "relative h-[min(38dvh,200px)] w-[min(26.6dvh,140px)] shrink-0 sm:h-[min(40dvh,224px)] sm:w-[min(28dvh,157px)] lg:h-[min(42dvh,250px)] lg:w-[min(30dvh,175px)] 2xl:h-[min(46dvh,312px)] 2xl:w-[min(32dvh,218px)] [@media(max-height:800px)]:h-[min(34dvh,168px)] [@media(max-height:800px)]:w-[min(24dvh,118px)]";

export function PackOpener({
  packId,
  source,
  stickerCount,
  packImageUrl,
  openingGifUrl,
  onComplete,
  onOpened,
  onOpeningChange,
  onClose,
}: PackOpenerProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [stickers, setStickers] = useState<PackSticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openingDone, setOpeningDone] = useState(false);
  const openingStartedAt = useRef<number | null>(null);
  const openingSoundPlayed = useRef(false);
  const openingSync = useRef({ entered: false, mediaReady: false });
  const openingEnterAnimationDone = useRef(false);
  const openingGifRef = useRef<HTMLImageElement>(null);

  function tryPlayOpeningGifSound() {
    if (phase !== "opening" || openingSoundPlayed.current) return;
    if (!openingSync.current.entered || !openingSync.current.mediaReady) return;
    openingSoundPlayed.current = true;
    playPackOpeningGifSound(0.85, OPENING_GIF_SOUND_DELAY_MS);
  }

  useEffect(() => {
    if (phase !== "opening") {
      openingSoundPlayed.current = false;
      openingEnterAnimationDone.current = false;
      openingSync.current = { entered: false, mediaReady: false };
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;
    if (!openingGifUrl) {
      openingSync.current.mediaReady = true;
      tryPlayOpeningGifSound();
      return;
    }
    if (isPackOpeningGifPreloaded(openingGifUrl)) {
      openingSync.current.mediaReady = true;
      tryPlayOpeningGifSound();
      return;
    }
    const img = openingGifRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      openingSync.current.mediaReady = true;
      tryPlayOpeningGifSound();
    }
  }, [phase, openingGifUrl]);

  useEffect(() => {
    playPackPopupSound();
    preloadPackOpeningGifSound();
    void preloadPackOpeningGif(openingGifUrl);
    return () => {
      stopPackOpeningGifSound();
    };
  }, [openingGifUrl]);

  useEffect(() => {
    if (phase !== "opening" || !openingDone) return;

    let cancelled = false;

    async function showResults() {
      const started = openingStartedAt.current ?? Date.now();

      while (!cancelled) {
        const elapsed = Date.now() - started;
        const minTimeMet = elapsed >= OPENING_MIN_MS;
        const gifReady =
          !openingGifUrl ||
          openingSync.current.mediaReady ||
          isPackOpeningGifPreloaded(openingGifUrl);

        if (minTimeMet && gifReady) break;
        if (elapsed >= OPENING_MAX_WAIT_MS) break;

        await new Promise((r) => setTimeout(r, 50));
      }

      if (!cancelled) {
        stopPackOpeningGifSound();
        playPackRevealSound();
        onOpeningChange?.(false);
        setPhase("results");
      }
    }

    void showResults();
    return () => {
      cancelled = true;
    };
  }, [phase, openingDone, openingGifUrl]);

  function resetOpeningSoundSync() {
    openingSoundPlayed.current = false;
    openingEnterAnimationDone.current = false;
    openingSync.current = {
      entered: false,
      mediaReady:
        !openingGifUrl || isPackOpeningGifPreloaded(openingGifUrl),
    };
  }

  async function handleOpen() {
    if (loading) return;
    unlockPackOpeningGifSound();
    setLoading(true);
    setError("");
    setOpeningDone(false);
    resetOpeningSoundSync();
    openingStartedAt.current = Date.now();
    onOpeningChange?.(true);
    setPhase("opening");

    try {
      const res = await fetch("/api/pack/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
      const data = await res.json();

      if (!res.ok) {
        stopPackOpeningGifSound();
        onOpeningChange?.(false);
        setError(data.error ?? "Erro ao abrir pacotinho");
        setPhase("ready");
        return;
      }

      onOpened(packId, new Date().toISOString());

      const list: PackSticker[] = (data.stickers ?? []).map(
        (ps: Record<string, unknown>) => ({
          position: ps.position as number,
          stickers: Array.isArray(ps.stickers)
            ? (ps.stickers[0] ?? null)
            : (ps.stickers ?? null),
        }),
      );
      setStickers(list);
      setOpeningDone(true);
    } catch {
      stopPackOpeningGifSound();
      onOpeningChange?.(false);
      setError("Falha na conexão. Tente novamente.");
      setPhase("ready");
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = SOURCE_LABEL[source] ?? source;
  const count = stickerCount || stickers.length || STICKERS_PER_PACK;
  const canClose = phase !== "opening";
  const compactResults = stickers.length !== 1;

  return (
    <div className="relative flex max-h-full min-h-0 w-full flex-col pt-5 pr-1">
      <button
        type="button"
        onClick={canClose ? onClose : undefined}
        disabled={!canClose}
        className="absolute -right-1 -top-1 z-10 flex size-7 items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500 disabled:pointer-events-none sm:size-8"
        aria-label="Fechar"
      >
        <X className="size-4 sm:size-5" />
      </button>

      <AnimatePresence mode="wait">
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-2.5 pt-0.5 sm:max-w-[360px] sm:gap-3 lg:gap-3.5 2xl:max-w-[420px] 2xl:gap-4"
          >
            <span className="rounded-pill border border-verde-400 px-3 py-0.5 text-xs font-medium text-verde-400 sm:px-3.5 sm:py-1 sm:text-sm 2xl:px-4 2xl:text-base">
              {sourceLabel}
            </span>

            <div className="text-center">
              <h2 className="font-display text-lg font-bold leading-tight text-verde-escuro-500 sm:text-xl lg:text-2xl 2xl:text-3xl">
                Pacotinho pronto!
              </h2>
              <p className="mt-1 text-xs text-verde-escuro-500 sm:text-sm lg:text-base 2xl:mt-1.5 2xl:text-lg">
                {count} figurinha{count !== 1 ? "s" : ""} esperando por você.
              </p>
            </div>

            <div
              className={`${PACK_MEDIA_CLASS_READY} overflow-hidden rounded-xl border-2 border-white shadow-md sm:border-[3px] 2xl:rounded-2xl`}
            >
              <Image
                src={packImageUrl}
                alt="Pacotinho"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 133px, 168px"
                priority
                unoptimized={packImageUrl.endsWith(".gif")}
              />
            </div>

            {error && (
              <p className="w-full rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleOpen}
              disabled={loading}
              className="h-9 w-full rounded-pill bg-verde-escuro-500 px-5 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-600 disabled:opacity-60 sm:h-10 sm:px-6 2xl:h-11 2xl:text-base"
            >
              {loading ? "Abrindo…" : "Abrir pacotinho"}
            </button>
          </motion.div>
        )}

        {phase === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={(definition) => {
              if (definition === "exit" || openingEnterAnimationDone.current) return;
              openingEnterAnimationDone.current = true;
              openingSync.current.entered = true;
              tryPlayOpeningGifSound();
            }}
            className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-2 py-1 sm:max-w-[360px] sm:gap-2.5 2xl:max-w-[420px] 2xl:gap-3"
          >
            <p className="font-display text-base font-bold text-verde-escuro-500 sm:text-lg lg:text-xl 2xl:text-2xl">
              Abrindo pacotinho…
            </p>
            <div
              className={`${PACK_MEDIA_CLASS_READY} overflow-hidden rounded-xl border-2 border-white shadow-md sm:border-[3px] 2xl:rounded-2xl`}
            >
              {openingGifUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={openingGifRef}
                  src={openingGifUrl}
                  alt="Animação de abertura do pacotinho"
                  className="size-full object-cover"
                  onLoad={() => {
                    openingSync.current.mediaReady = true;
                    tryPlayOpeningGifSound();
                  }}
                />
              ) : (
                <div className="relative size-full overflow-hidden">
                  <Image
                    src={packImageUrl}
                    alt="Pacotinho"
                    fill
                    className="animate-pulse object-cover"
                    sizes="(max-width: 1024px) 140px, 218px"
                    unoptimized={packImageUrl.endsWith(".gif")}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 pt-0.5 sm:gap-2.5 2xl:gap-3"
          >
            <span className="rounded-pill border border-verde-400 px-3 py-0.5 text-xs font-medium text-verde-400 sm:px-3.5 sm:py-1 sm:text-sm 2xl:text-base">
              {sourceLabel}
            </span>

            <h2 className="text-center font-display text-base font-bold leading-tight text-verde-escuro-500 sm:text-lg lg:text-xl 2xl:text-2xl">
              {stickers.length} nova{stickers.length !== 1 ? "s" : ""} figurinha
              {stickers.length !== 1 ? "s" : ""}
            </h2>

            <div className="flex w-full max-w-[520px] flex-wrap justify-center gap-x-2 gap-y-2 sm:max-w-[560px] sm:gap-x-2.5 sm:gap-y-2.5 lg:max-w-[600px] 2xl:max-w-[680px] 2xl:gap-x-3">
              {stickers.map((item) => (
                <PackResultSticker
                  key={item.position}
                  item={item}
                  compact={compactResults}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => onComplete(stickers)}
              className="mt-0.5 h-9 w-full max-w-[320px] rounded-pill border border-verde-300 px-5 text-sm font-medium text-verde-300 transition-colors hover:border-verde-400 hover:text-verde-400 sm:h-10 sm:max-w-[360px] sm:px-6 2xl:max-w-[420px]"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
