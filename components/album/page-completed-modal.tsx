"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { dashboardAssets } from "@/lib/dashboard-assets";

interface PageCompletedModalProps {
  onClose: () => void;
}

export function PageCompletedModal({ onClose }: PageCompletedModalProps) {
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-completed-title"
    >
      <div className="absolute inset-0 bg-verde-escuro-500/30 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-[min(100%,741px)] overflow-hidden rounded-[24px] bg-verde-escuro-500 px-6 py-8 sm:px-8 sm:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-[22px] size-[46px] cursor-pointer transition-opacity hover:opacity-80 sm:right-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dashboardAssets.album.pageCompleteClose}
            alt=""
            width={46}
            height={46}
            className="size-full"
          />
        </button>

        <div className="flex flex-col items-center gap-5 text-center text-white">
          <h2
            id="page-completed-title"
            className="font-display text-[28px] font-bold leading-[1.4] sm:text-[32px] lg:text-[40px]"
          >
            <span aria-hidden>🚩 </span>
            Página completa!
          </h2>

          <p className="max-w-[674px] font-display text-lg font-bold leading-[1.4] sm:text-xl lg:text-2xl">
            Parabéns, você concluiu essa página, continue para você terminar o álbum!
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-10">
            <Link
              href="/trocas"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-amarelo px-10 py-2 text-center text-base font-medium text-verde-escuro-500 transition-all duration-200 hover:brightness-105 active:scale-[0.98] sm:text-xl"
            >
              Trocas
            </Link>
            <Link
              href="/ranking"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-pill border border-amarelo bg-amarelo/30 px-10 py-2 text-center text-base font-medium text-amarelo transition-all duration-200 hover:bg-amarelo/40 active:scale-[0.98] sm:text-xl"
            >
              Ver Ranking
            </Link>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dashboardAssets.album.pageCompleteLogos}
            alt="Fundação Grupo Boticário"
            width={86}
            height={43}
            className="h-[43px] w-[86px]"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
