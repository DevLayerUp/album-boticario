"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import { LandingImage } from "@/components/landing/landing-image";
import { getYoutubeEmbedUrl } from "@/lib/youtube-embed";

/** Vídeo Somos Fãs no YouTube — exibido no lugar do upload; o MP4 do admin permanece oculto. */
const MANIFEST_YOUTUBE_EMBED_SRC =
  "https://www.youtube.com/embed/gmqSARA8Svo?si=ucEFfIJv-uMGalUQ";

export interface LandingManifestProps {
  titleRegular?: string;
  titleBold?: string;
  videoUrl?:   string | null;
  posterUrl?:  string | null;
  /** Se definido (ou padrão Somos Fãs), exibe embed do YouTube em vez do player de upload. */
  youtubeUrl?: string | null;
}

export function LandingManifest({
  titleRegular = "O mundo tem sede",
  titleBold    = "de mudança",
  videoUrl,
  posterUrl,
  youtubeUrl = MANIFEST_YOUTUBE_EMBED_SRC,
}: LandingManifestProps) {
  const youtubeEmbed =
    getYoutubeEmbedUrl(youtubeUrl ?? "") ?? MANIFEST_YOUTUBE_EMBED_SRC;
  return (
    <section
      id="manifesto"
      className="bg-verde-100 py-16 md:py-20 lg:py-[109px] lg:pb-20"
      aria-label="Vídeo manifesto"
    >
      <div className="mx-auto flex max-w-[1680px] flex-col items-center gap-7 px-6 md:gap-8 md:px-12 2xl:px-[120px] lg:gap-[30px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-display text-3xl leading-[1.14] text-verde-escuro-500 sm:text-4xl md:text-5xl lg:text-[58px] lg:leading-[66px]"
        >
          <span className="font-normal">{titleRegular} </span>
          <span className="font-bold">{titleBold}</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[1116px]"
        >
          {youtubeEmbed ? (
            <>
              <ManifestYoutube src={youtubeEmbed} />
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={posterUrl ?? undefined}
                  className="hidden"
                  aria-hidden
                  preload="none"
                  muted
                  playsInline
                />
              ) : null}
            </>
          ) : videoUrl ? (
            <ManifestVideo src={videoUrl} poster={posterUrl ?? undefined} />
          ) : posterUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-verde-escuro-500/10 sm:rounded-[30px]">
              <LandingImage
                src={posterUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 92vw, 1116px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="flex h-12 w-[68px] items-center justify-center rounded-lg bg-[#212121]/80 shadow-lg">
                  <Play size={22} className="ml-0.5 text-white" fill="currentColor" aria-hidden />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-[24px] border border-dashed border-verde-escuro-500/25 bg-verde-escuro-500/5 text-sm text-verde-escuro-400 sm:rounded-[30px]">
              Vídeo em breve
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function ManifestYoutube({ src }: { src: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-black shadow-[0_4px_24px_rgba(13,102,50,0.12)] sm:rounded-[30px]">
      <iframe
        width={560}
        height={315}
        src={src}
        title="YouTube video player"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}

function ManifestVideo({ src, poster }: { src: string; poster?: string }) {
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
    <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-black shadow-[0_4px_24px_rgba(13,102,50,0.12)] sm:rounded-[30px]">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="size-full object-cover"
        playsInline
        muted={muted}
        controls={playing}
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
          <span className="flex h-12 w-[68px] items-center justify-center rounded-lg bg-[#212121]/80 shadow-lg">
            <Play size={22} className="ml-0.5 text-white" fill="currentColor" />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Ativar som" : "Silenciar"}
        className="absolute bottom-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
