"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

export interface LandingWelcomeProps {
  title?:      string;
  paragraph1?: string;
  paragraph2?: string;
  ctaLabel?:   string;
  ctaHref?:    string;
  videoUrl?:   string | null;
  posterUrl?:  string | null;
}

export function LandingWelcome({
  title      = "Seja bem-vindo Fã por natureza!",
  paragraph1 = "Se você ama descobrir curiosidades, completar coleções e explorar o mundo ao seu redor, este álbum foi feito para você.",
  paragraph2 = "Ao longo das páginas, você vai conhecer espécies fascinantes, biomas brasileiros, projetos de conservação e histórias que ajudam a proteger a natureza há mais de 35 anos.",
  ctaLabel   = "Comece a colecionar agora!",
  ctaHref    = "/register",
  videoUrl,
  posterUrl,
}: LandingWelcomeProps) {
  return (
    <section
      id="projeto"
      className="bg-surface py-16 md:py-24"
      aria-label="Boas-vindas"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="grid grid-cols-12">
          <div className="col-span-12 flex flex-col items-center gap-12 lg:col-span-9 lg:col-start-3 lg:flex-row lg:gap-20">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 flex-1 flex-col items-start gap-8 lg:gap-10"
            >
          <h2 className="font-display text-3xl font-bold leading-[1.14] text-verde-500 sm:text-4xl md:text-[40px] lg:text-[44px] xl:text-[58px] xl:leading-[66px]">
            {title}
          </h2>

          <div className="space-y-4 text-base leading-[1.6] text-black sm:text-lg md:text-lg lg:text-xl xl:text-[22px] xl:leading-[30px]">
            {paragraph1 && <p>{paragraph1}</p>}
            {paragraph2 && <p>{paragraph2}</p>}
          </div>

          <Link
            href={ctaHref}
            className="inline-flex rounded-pill bg-verde-500 px-8 py-3 text-base font-bold text-verde-100 transition-colors hover:bg-verde-400 sm:text-lg"
          >
            {ctaLabel}
          </Link>
        </motion.div>

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full shrink-0 lg:w-[399px]"
        >
          {videoUrl ? (
            <WelcomeVideo src={videoUrl} poster={posterUrl ?? undefined} />
          ) : (
            <div className="flex aspect-399/709 w-full items-center justify-center rounded-block bg-verde-100 text-sm text-verde-escuro-400">
              Vídeo em breve
            </div>
          )}
        </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WelcomeVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [muted, setMuted]       = useState(true);

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

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  return (
    <div className="relative aspect-399/709 w-full overflow-hidden rounded-block bg-black shadow-card">
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

      {/* Play overlay */}
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

      {/* Mute toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        aria-label={muted ? "Ativar som" : "Silenciar"}
        className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
