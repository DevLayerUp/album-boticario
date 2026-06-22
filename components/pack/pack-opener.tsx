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
        className="absolute right-0 top-0 z-10 flex size-10 items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500 disabled:pointer-events-none"
        aria-label="Fechar"
      >
        <X size={22} />
      </button>

      <AnimatePresence mode="wait">
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto flex max-w-[387px] flex-col items-center gap-10 pt-2"
          >
            <span className="rounded-pill border border-verde-400 px-[30px] py-2 text-xl font-medium text-verde-400">
              {sourceLabel}
            </span>

            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-[48px] sm:leading-tight">
                Pacotinho pronto!
              </h2>
              <p className="mt-3 text-[22px] text-verde-escuro-500">
                {count} figurinha{count !== 1 ? "s" : ""} esperando por você.
              </p>
            </div>

            <div className="relative h-[390px] w-[273px] shrink-0 overflow-hidden rounded-2xl border-[5px] border-white shadow-md">
              <Image
                src={packImageUrl}
                alt="Pacotinho"
                fill
                className="object-cover"
                sizes="273px"
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
              className="h-11 w-full rounded-pill bg-verde-escuro-500 px-10 text-xl font-medium text-white transition-colors hover:bg-verde-escuro-600 disabled:opacity-60"
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
            className="mx-auto flex max-w-[387px] flex-col items-center gap-8 py-4"
          >
            <p className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl">
              Abrindo pacotinho…
            </p>
            <div className="relative h-[390px] w-[273px]">
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
                <div className="relative size-full overflow-hidden rounded-2xl border-[5px] border-white">
                  <Image
                    src={packImageUrl}
                    alt="Pacotinho"
                    fill
                    className="animate-pulse object-cover"
                    sizes="273px"
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
            className="flex flex-col items-center gap-5 pt-2 sm:gap-6"
          >
            <span className="rounded-pill border border-verde-400 px-[30px] py-2 text-xl font-medium text-verde-400">
              {sourceLabel}
            </span>

            <h2 className="text-center font-display text-2xl font-bold text-verde-escuro-500 sm:text-4xl lg:text-[48px] lg:leading-tight">
              {stickers.length} nova{stickers.length !== 1 ? "s" : ""} figurinha
              {stickers.length !== 1 ? "s" : ""}
            </h2>

            <div className="flex w-full max-w-[744px] flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-[30px] sm:gap-y-8">
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
              className="h-11 w-full max-w-[387px] rounded-pill border border-verde-300 px-10 text-xl font-medium text-verde-300 transition-colors hover:border-verde-400 hover:text-verde-400"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
