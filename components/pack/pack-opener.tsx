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

type Phase = "ready" | "opening" | "results";

interface PackOpenerProps {
  packId: number;
  source: string;
  stickerCount: number;
  packImageUrl: string;
  openingGifUrl: string | null;
  onComplete: (stickers: PackSticker[]) => void;
  onClose: () => void;
}

const OPENING_MIN_MS = 2200;
/** Small buffer after the GIF is on screen so audio matches the first visible frame. */
const OPENING_GIF_SOUND_DELAY_MS = 40;

export function PackOpener({
  packId,
  source,
  stickerCount,
  packImageUrl,
  openingGifUrl,
  onComplete,
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
    const img = openingGifRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      openingSync.current.mediaReady = true;
      tryPlayOpeningGifSound();
    }
  }, [phase, openingGifUrl]);

  useEffect(() => {
    playPackPopupSound();
    preloadPackOpeningGifSound();
    return () => {
      stopPackOpeningGifSound();
    };
  }, []);

  useEffect(() => {
    if (phase !== "opening" || !openingDone) return;

    let cancelled = false;

    async function showResults() {
      const started = openingStartedAt.current ?? Date.now();
      const elapsed = Date.now() - started;
      const wait = Math.max(0, OPENING_MIN_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      if (!cancelled) {
        stopPackOpeningGifSound();
        playPackRevealSound();
        setPhase("results");
      }
    }

    void showResults();
    return () => {
      cancelled = true;
    };
  }, [phase, openingDone]);

  function resetOpeningSoundSync() {
    openingSoundPlayed.current = false;
    openingEnterAnimationDone.current = false;
    openingSync.current = {
      entered: false,
      mediaReady: !openingGifUrl,
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
        setError(data.error ?? "Erro ao abrir pacotinho");
        setPhase("ready");
        return;
      }

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
      setError("Falha na conexão. Tente novamente.");
      setPhase("ready");
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = SOURCE_LABEL[source] ?? source;
  const count = stickerCount || stickers.length || STICKERS_PER_PACK;
  const canClose = phase !== "opening";
  const compactResults = stickers.length > 3;

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={canClose ? onClose : undefined}
        disabled={!canClose}
        className="absolute right-0 top-0 z-10 flex size-8 items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500 disabled:pointer-events-none 2xl:size-10"
        aria-label="Fechar"
      >
        <X className="size-5 2xl:size-[22px]" />
      </button>

      <AnimatePresence mode="wait">
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto flex max-w-[320px] flex-col items-center gap-5 pt-1 sm:max-w-[340px] sm:gap-6 2xl:max-w-[387px] 2xl:gap-10 2xl:pt-2"
          >
            <span className="rounded-pill border border-verde-400 px-4 py-1 text-sm font-medium text-verde-400 sm:text-base 2xl:px-[30px] 2xl:py-2 2xl:text-xl">
              {sourceLabel}
            </span>

            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-[48px] 2xl:leading-tight">
                Pacotinho pronto!
              </h2>
              <p className="mt-2 text-sm text-verde-escuro-500 sm:text-base lg:text-lg 2xl:mt-3 2xl:text-[22px]">
                {count} figurinha{count !== 1 ? "s" : ""} esperando por você.
              </p>
            </div>

            <div className="relative h-[200px] w-[140px] shrink-0 overflow-hidden rounded-xl border-[3px] border-white shadow-md sm:h-[240px] sm:w-[168px] lg:h-[280px] lg:w-[196px] 2xl:h-[390px] 2xl:w-[273px] 2xl:rounded-2xl 2xl:border-[5px]">
              <Image
                src={packImageUrl}
                alt="Pacotinho"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 196px, 273px"
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
              className="h-10 w-full rounded-pill bg-verde-escuro-500 px-6 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-600 disabled:opacity-60 sm:text-base 2xl:h-11 2xl:px-10 2xl:text-xl"
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
            className="mx-auto flex max-w-[320px] flex-col items-center gap-4 py-2 sm:max-w-[340px] sm:gap-5 2xl:max-w-[387px] 2xl:gap-8 2xl:py-4"
          >
            <p className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl lg:text-2xl 2xl:text-3xl">
              Abrindo pacotinho…
            </p>
            <div className="relative h-[200px] w-[140px] sm:h-[240px] sm:w-[168px] lg:h-[280px] lg:w-[196px] 2xl:h-[390px] 2xl:w-[273px]">
              {openingGifUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={openingGifRef}
                  src={openingGifUrl}
                  alt="Animação de abertura do pacotinho"
                  className="size-full object-contain"
                  onLoad={() => {
                    openingSync.current.mediaReady = true;
                    tryPlayOpeningGifSound();
                  }}
                />
              ) : (
                <div className="relative size-full overflow-hidden rounded-xl border-[3px] border-white 2xl:rounded-2xl 2xl:border-[5px]">
                  <Image
                    src={packImageUrl}
                    alt="Pacotinho"
                    fill
                    className="animate-pulse object-cover"
                    sizes="(max-width: 1024px) 196px, 273px"
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
            className="flex flex-col items-center gap-3 pt-1 sm:gap-4 2xl:gap-6 2xl:pt-2"
          >
            <span className="rounded-pill border border-verde-400 px-4 py-1 text-sm font-medium text-verde-400 sm:text-base 2xl:px-[30px] 2xl:py-2 2xl:text-xl">
              {sourceLabel}
            </span>

            <h2 className="text-center font-display text-lg font-bold text-verde-escuro-500 sm:text-xl lg:text-2xl 2xl:text-[48px] 2xl:leading-tight">
              {stickers.length} nova{stickers.length !== 1 ? "s" : ""} figurinha
              {stickers.length !== 1 ? "s" : ""}
            </h2>

            <div className="flex w-full max-w-[744px] flex-wrap justify-center gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 2xl:gap-x-[30px] 2xl:gap-y-8">
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
              className="h-10 w-full max-w-[320px] rounded-pill border border-verde-300 px-6 text-sm font-medium text-verde-300 transition-colors hover:border-verde-400 hover:text-verde-400 sm:max-w-[340px] sm:text-base 2xl:h-11 2xl:max-w-[387px] 2xl:px-10 2xl:text-xl"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
