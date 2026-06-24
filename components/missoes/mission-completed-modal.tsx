"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface MissionCompletedModalProps {
  packsEarned: number;
  pointsEarned: number;
  packImageUrl: string;
  onClose: () => void;
}

export function MissionCompletedModal({
  packsEarned,
  pointsEarned,
  packImageUrl,
  onClose,
}: MissionCompletedModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-completed-title"
    >
      <div className="absolute inset-0 bg-verde-escuro-500/30 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[min(100%,520px)] overflow-x-hidden overflow-y-auto rounded-card bg-verde-escuro-500 px-5 py-6 sm:max-w-[580px] sm:px-6 sm:py-7 md:max-w-[640px] lg:max-w-[700px] lg:py-8 xl:max-w-[900px] xl:px-8 xl:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={dashboardAssets.quiz.background}
            alt=""
            fill
            className="object-cover opacity-60"
            unoptimized
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 xl:gap-16">
          <div className="space-y-1.5 text-center text-white sm:space-y-2">
            <h2
              id="mission-completed-title"
              className="font-display text-xl font-bold sm:text-2xl md:text-[28px] lg:text-[32px] xl:text-[40px]"
            >
              <span aria-hidden>🚩 </span>
              Missão Cumprida
            </h2>
            <p className="text-sm leading-snug sm:text-base md:text-lg lg:text-xl xl:text-[32px] xl:leading-normal">
              Você ganhou{" "}
              <span className="font-bold">
                {packsEarned} pacotinho{packsEarned !== 1 ? "s" : ""} + {pointsEarned} pontos!
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 lg:gap-10 xl:gap-16">
            <div className="relative aspect-[392/560] w-[min(52vw,160px)] shrink-0 sm:w-[min(36vw,180px)] md:w-[200px] lg:w-[220px] xl:w-[266px]">
              <Image
                src={packImageUrl}
                alt="Pacotinho conquistado"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 266px"
                unoptimized={packImageUrl.endsWith(".gif")}
              />
            </div>
            <div className="text-center text-white">
              <p className="font-display text-4xl font-bold leading-none sm:text-5xl md:text-6xl lg:text-7xl xl:text-[120px]">
                + {pointsEarned}
              </p>
              <p className="font-display text-lg font-bold sm:text-xl md:text-2xl xl:text-[40px]">
                Pontos
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4 lg:gap-6 xl:gap-10">
            <Link
              href="/pacotinhos"
              onClick={onClose}
              className="rounded-pill bg-amarelo px-6 py-2 text-center text-sm font-medium text-verde-escuro-500 transition-all duration-200 hover:brightness-105 active:scale-[0.98] sm:px-7 sm:text-base md:text-lg xl:px-10 xl:text-2xl"
            >
              Ver meus Pacotinhos
            </Link>
            <Link
              href="/ranking"
              onClick={onClose}
              className="rounded-pill border border-amarelo bg-amarelo/30 px-6 py-2 text-center text-sm font-medium text-amarelo transition-all duration-200 hover:bg-amarelo/40 active:scale-[0.98] sm:px-7 sm:text-base md:text-lg xl:px-10 xl:text-2xl"
            >
              Ver Ranking
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
