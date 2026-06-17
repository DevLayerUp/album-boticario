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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
        className="relative w-full max-w-[900px] overflow-hidden rounded-card bg-verde-escuro-500 px-6 py-8 sm:px-8 sm:py-10"
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

        <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-16">
          <div className="space-y-2 text-center text-white">
            <h2 id="mission-completed-title" className="font-display text-2xl font-bold sm:text-[40px]">
              <span aria-hidden>🚩 </span>
              Missão Cumprida
            </h2>
            <p className="text-xl sm:text-[32px]">
              Você ganhou{" "}
              <span className="font-bold">
                {packsEarned} pacotinho{packsEarned !== 1 ? "s" : ""} + {pointsEarned} pontos!
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16">
            <div className="relative h-[min(42vh,320px)] w-[min(70vw,266px)] overflow-hidden rounded-2xl border-[5px] border-white shadow-md">
              <Image
                src={packImageUrl}
                alt="Pacotinho conquistado"
                fill
                className="object-cover"
                sizes="266px"
                unoptimized={packImageUrl.endsWith(".gif")}
              />
            </div>
            <div className="text-center text-white">
              <p className="font-display text-6xl font-bold leading-none sm:text-[120px]">
                + {pointsEarned}
              </p>
              <p className="font-display text-2xl font-bold sm:text-[40px]">Pontos</p>
            </div>
          </div>

          <div className="flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row sm:gap-10">
            <Link
              href="/pacotinhos"
              onClick={onClose}
              className="rounded-pill bg-amarelo px-8 py-2 text-lg font-medium text-verde-escuro-500 transition-all duration-200 hover:brightness-105 active:scale-[0.98] sm:px-10 sm:text-2xl"
            >
              Ver meus Pacotinhos
            </Link>
            <Link
              href="/ranking"
              onClick={onClose}
              className="rounded-pill border border-amarelo bg-amarelo/30 px-8 py-2 text-lg font-medium text-amarelo transition-all duration-200 hover:bg-amarelo/40 active:scale-[0.98] sm:px-10 sm:text-2xl"
            >
              Ver Ranking
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
