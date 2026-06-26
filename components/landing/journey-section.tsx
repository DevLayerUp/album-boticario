"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import { LandingImage } from "@/components/landing/landing-image";

export interface LandingJourneyProps {
  titleRegular?: string;
  titleBold?:    string;
  paragraph1?:   string;
  paragraph2?:   string;
  ctaLabel?:     string;
  ctaHref?:      string;
  videoUrl?:     string | null;
  posterUrl?:    string | null;
  /** Campo legado — usado como poster quando não houver vídeo. */
  imageUrl?:     string | null;
}

export function LandingJourney({
  titleRegular = "Uma jornada pela",
  titleBold    = "nossa biodiversidade",
  paragraph1   = "Se você ama descobrir curiosidades, completar coleções e explorar o mundo ao seu redor, este álbum foi feito para você.",
  paragraph2   = "Ao longo das páginas, você vai conhecer espécies fascinantes, biomas brasileiros, projetos de conservação e histórias que ajudam a proteger a natureza há mais de 35 anos.",
  ctaLabel     = "Comece a colecionar agora!",
  ctaHref      = "/register",
  videoUrl,
  posterUrl,
  imageUrl,
}: LandingJourneyProps) {
  const displayPoster = posterUrl ?? imageUrl ?? undefined;

  return (
    <section
      id="jornada"
      className="bg-surface py-16 md:py-20 lg:py-24"
      aria-label="Jornada pela biodiversidade"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-8 sm:gap-10 xl:flex-row xl:items-center xl:justify-center xl:gap-12 2xl:gap-[88px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[280px] shrink-0 sm:max-w-[320px] md:max-w-[360px] xl:max-w-[399px]"
          >
            {videoUrl ? (
              <JourneyVideo src={videoUrl} poster={displayPoster} />
            ) : displayPoster ? (
              <div className="relative aspect-399/709 w-full overflow-hidden rounded-[16px] bg-black">
                <LandingImage
                  src={displayPoster}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 399px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg md:size-20">
                    <Play size={32} className="ml-1 text-verde-escuro-500" fill="currentColor" aria-hidden />
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex aspect-399/709 w-full items-center justify-center rounded-[16px] border border-dashed border-verde-300 bg-verde-100/50 text-sm text-verde-escuro-400">
                Vídeo em breve
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full min-w-0 flex-col items-center gap-6 text-center sm:gap-7 xl:max-w-[633px] xl:items-start xl:gap-9 xl:text-left"
          >
            <h2 className="max-w-[18ch] font-display text-[1.75rem] leading-[1.14] text-verde-500 sm:max-w-none sm:text-3xl md:text-4xl lg:text-5xl xl:text-[58px] xl:leading-[66px]">
              <span className="font-normal">{titleRegular}</span>
              <span className="font-bold"> {titleBold}</span>
            </h2>

            <div className="max-w-[36rem] space-y-4 text-base leading-[1.36] text-black sm:text-lg md:text-xl xl:max-w-none xl:text-[22px] xl:leading-[30px]">
              {paragraph1 ? <p>{paragraph1}</p> : null}
              {paragraph2 ? <p>{paragraph2}</p> : null}
            </div>

            <Link
              href={ctaHref}
              className="inline-flex rounded-pill bg-verde-500 px-6 py-2.5 text-sm font-bold text-verde-100 transition-colors hover:bg-verde-400 sm:px-8 sm:py-3 sm:text-base md:text-lg xl:px-[34px] xl:py-3.5 xl:text-2xl xl:leading-[1.4]"
            >
              {ctaLabel}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function JourneyVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(true);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  return (
    <div className="relative aspect-399/709 w-full overflow-hidden rounded-[16px] bg-black shadow-card">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="size-full object-cover"
        playsInline
        muted={muted}
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg md:size-20">
            <Play size={32} className="ml-1 text-verde-escuro-500" fill="currentColor" />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Ativar som" : "Silenciar"}
        className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
