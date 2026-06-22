"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { StickerCard } from "./sticker-card";
import { STICKER_CARD } from "@/lib/sticker-card";

interface RevealStepProps {
  stickerUrl: string;
  onRecreate?: () => void;
}

export function RevealStep({ stickerUrl, onRecreate }: RevealStepProps) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasLaunched = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 600);
    const t2 = setTimeout(() => setRevealed(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!revealed || hasLaunched.current) return;
    hasLaunched.current = true;

    const colors = ["#00A859", "#D9A441", "#006341", "#FFFFFF"];
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        colors,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [revealed]);

  const { width, height } = STICKER_CARD;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
      <div
        className="w-full space-y-2 text-center sm:text-left"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
          Figurinha pronta!
        </h2>
        <p className="text-sm text-verde-escuro-500/80 sm:text-base">
          Sua figurinha personalizada foi criada com sucesso.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-8 rounded-block bg-verde-100 p-6 sm:p-10">
        <div
          className="relative"
          style={{ perspective: "900px" }}
          aria-live="polite"
          aria-label={flipped ? "Figurinha revelada" : "Revelando figurinha…"}
        >
          <div
            style={{
              width,
              height,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <CardBack />
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <StickerCard
                stickerSrc={stickerUrl}
                photoAlt="Sua figurinha personalizada"
                className={revealed ? "ring-2 ring-verde-500/40" : undefined}
              />
            </div>
          </div>
        </div>

        <div
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
          }}
        >
          <Link
            href="/album"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-pill bg-amarelo px-6 font-medium text-verde-escuro-500 transition-all hover:brightness-95 active:scale-[0.98]"
          >
            Entrar no álbum
          </Link>

          {onRecreate ? (
            <button
              type="button"
              onClick={onRecreate}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-pill border border-verde-500 px-6 font-medium text-verde-500 transition-colors hover:bg-verde-500/10 active:scale-[0.98]"
            >
              Recriar figurinha
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  const { width, height, borderRadius } = STICKER_CARD;

  return (
    <div
      className="relative flex flex-col overflow-hidden border border-verde-500/20 bg-verde-escuro-500 shadow-lg"
      style={{ width, height, borderRadius }}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-10"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
      >
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 36 + 8}
              cy={row * 42 + 10}
              r="3"
              fill="#D9A441"
            />
          )),
        )}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-sm font-bold uppercase tracking-[0.25em] text-amarelo">
            Grupo Boticário
          </span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-white/50">
            Álbum de Figurinhas
          </span>
        </div>
      </div>

      <div
        className="absolute inset-2 border border-amarelo/20"
        style={{ borderRadius: borderRadius - 4 }}
      />
    </div>
  );
}
