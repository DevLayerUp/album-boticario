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
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-3 lg:p-4"
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
        className="relative w-full max-w-[min(100%,400px)] overflow-hidden rounded-card px-4 py-3 sm:max-w-[440px] sm:px-4 sm:py-4 md:max-w-[460px] lg:max-w-[480px] 2xl:max-w-[900px] 2xl:px-8 2xl:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-verde-escuro-500 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${dashboardAssets.missoes.modalBackground})`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-3 lg:gap-4 2xl:gap-12">
          <div className="space-y-0.5 text-center text-white 2xl:space-y-2">
            <h2
              id="mission-completed-title"
              className="font-display text-base font-bold leading-tight sm:text-lg md:text-xl lg:text-xl 2xl:text-[40px]"
            >
              <span aria-hidden>🚩 </span>
              Missão Cumprida
            </h2>
            <p className="text-[11px] leading-snug sm:text-xs md:text-sm 2xl:text-[32px]">
              Você ganhou{" "}
              <span className="font-bold">
                {packsEarned} pacotinho{packsEarned !== 1 ? "s" : ""} + {pointsEarned} pts no ranking!
              </span>
            </p>
          </div>

          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 md:gap-4 2xl:gap-16">
            <div className="relative aspect-[392/560] w-[72px] shrink-0 sm:w-[84px] md:w-[92px] lg:w-[100px] 2xl:w-[266px]">
              <Image
                src={packImageUrl}
                alt="Pacotinho conquistado"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 120px, (max-width: 1536px) 130px, 266px"
                unoptimized={packImageUrl.endsWith(".gif")}
              />
            </div>
            <div className="text-center text-white">
              <p className="font-display text-xl font-bold leading-none sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-[120px]">
                + {pointsEarned}
              </p>
              <p className="font-display text-xs font-bold sm:text-sm md:text-base 2xl:text-[40px]">
                pts no ranking
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5 2xl:gap-10">
            <Link
              href="/pacotinhos"
              onClick={onClose}
              className="rounded-pill bg-amarelo px-3 py-1.5 text-center text-[11px] font-medium text-verde-escuro-500 transition-all duration-200 hover:brightness-105 active:scale-[0.98] sm:px-4 sm:py-1.5 sm:text-xs md:text-sm 2xl:px-10 2xl:py-2 2xl:text-2xl"
            >
              Ver meus Pacotinhos
            </Link>
            <Link
              href="/ranking"
              onClick={onClose}
              className="rounded-pill border border-amarelo bg-amarelo/30 px-3 py-1.5 text-center text-[11px] font-medium text-amarelo transition-all duration-200 hover:bg-amarelo/40 active:scale-[0.98] sm:px-4 sm:py-1.5 sm:text-xs md:text-sm 2xl:px-10 2xl:py-2 2xl:text-2xl"
            >
              Ver Ranking
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
