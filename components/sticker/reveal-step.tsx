"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";

interface RevealStepProps {
  stickerUrl: string;
  onRecreate?: () => void;
}

export function RevealStep({ stickerUrl, onRecreate }: RevealStepProps) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasLaunched = useRef(false);

  // Sequência: aguarda montagem → vira o card → lança confetti
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

    // Confetti em cores Grupo Boticário
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

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      {/* Título */}
      <div
        className="text-center"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gb-gold">
          Sua figurinha
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">
          Está pronta! ✨
        </h1>
      </div>

      {/* Card flip — 3D reveal */}
      <div
        className="relative"
        style={{ perspective: "900px" }}
        aria-live="polite"
        aria-label={flipped ? "Figurinha revelada" : "Revelando figurinha…"}
      >
        {/* Container com transformação */}
        <div
          style={{
            width: 200,
            height: 275,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Verso do card (visível antes do flip) */}
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

          {/* Frente do card (a figurinha) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-gb-gold/50 shadow-2xl shadow-gb-gold/20">
              <Image
                src={stickerUrl}
                alt="Sua figurinha personalizada"
                fill
                className="object-cover"
                sizes="200px"
                priority
              />
              {/* Brilho dourado ao redor */}
              {revealed && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-gb-gold/60" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div
        className="flex w-full flex-col gap-3"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
        }}
      >
        <Link
          href="/dashboard"
          className="w-full rounded-full bg-gb-gold px-6 py-3.5 text-center font-semibold text-gb-green-deep shadow-lg shadow-gb-gold/25 transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Entrar no álbum! 🚀
        </Link>

        {onRecreate && (
          <button
            type="button"
            onClick={onRecreate}
            className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/60 transition-all duration-200 hover:border-white/40 hover:text-white"
          >
            Recriar figurinha
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Verso do card ─────────────────────────────────────────────────── */

function CardBack() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-gb-green-deep shadow-xl shadow-black/40 border border-gb-gold/25">
      {/* Padrão de pontos */}
      <svg
        className="absolute inset-0 h-full w-full opacity-10"
        viewBox="0 0 200 275"
        aria-hidden
      >
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 26 + 8}
              cy={row * 30 + 10}
              r="3"
              fill="#D9A441"
            />
          )),
        )}
      </svg>

      {/* Logo central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {/* Losango GB */}
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
            <polygon
              points="26,3 49,26 26,49 3,26"
              fill="none"
              stroke="#D9A441"
              strokeWidth="1.5"
            />
            <polygon
              points="26,10 42,26 26,42 10,26"
              fill="#D9A441"
              fillOpacity="0.2"
              stroke="#D9A441"
              strokeWidth="1"
            />
            <text
              x="26"
              y="30"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#D9A441"
              fontFamily="serif"
            >
              GB
            </text>
          </svg>
          <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-gb-gold">
            Grupo Boticário
          </span>
          <span className="text-[8px] tracking-[0.1em] text-white/40 uppercase">
            Álbum de Figurinhas
          </span>
        </div>
      </div>

      {/* Borda decorativa interna */}
      <div className="absolute inset-2 rounded-xl border border-gb-gold/20" />
    </div>
  );
}
