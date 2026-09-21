"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PartyPopper } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ConcursoPageConfig } from "@/lib/concurso-page";

export function ConcursoConfirmCard({
  className = "",
  config,
}: {
  className?: string;
  config: ConcursoPageConfig;
}) {
  return (
    <div
      className={`w-full rounded-[40px] bg-white px-6 py-10 shadow-paper sm:px-10 sm:py-12 md:px-16 md:py-16 ${className}`}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="relative isolate flex size-[72px] shrink-0 items-center justify-center sm:size-[88px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.images.successBadge}
            alt=""
            width={91}
            height={88}
            className="absolute inset-0 size-full object-contain"
          />
          <PartyPopper
            aria-hidden
            className="relative z-10 size-8 text-white sm:size-10"
            strokeWidth={1.8}
          />
        </span>
        <h2
          id="concurso-confirm-title"
          className="font-display text-xl font-bold leading-tight text-verde-escuro-500 sm:text-2xl md:text-4xl md:leading-[44px]"
        >
          {config.confirmTitle}
        </h2>
      </div>

      <div className="mt-8 h-px w-full bg-verde-escuro-500 sm:mt-12" />

      <div className="mt-8 flex flex-col gap-8 text-base leading-relaxed text-verde-escuro-500 sm:mt-12 sm:gap-10 sm:text-xl sm:leading-8 md:text-[30px] md:leading-[34px]">
        {config.confirmParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <Link
        href="/album"
        className="mt-8 inline-flex min-h-12 w-full max-w-[478px] cursor-pointer items-center justify-center gap-3 rounded-pill bg-amarelo px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-verde-escuro-500 shadow-paper transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 sm:mt-12 sm:min-h-[68px] sm:text-xl"
      >
        <ArrowLeft aria-hidden className="size-5 shrink-0 sm:size-6" strokeWidth={2.5} />
        {config.confirmButtonLabel}
      </Link>
    </div>
  );
}

export function ConcursoConfirmModal({
  onClose,
  config,
}: {
  onClose: () => void;
  config: ConcursoPageConfig;
}) {
  const reduceMotion = useReducedMotion();

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
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concurso-confirm-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-pointer bg-[#f3fff0]/90 backdrop-blur-[6px]"
        onClick={onClose}
      />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 320, damping: 28 }
        }
        className="relative my-auto w-full max-w-[1200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <ConcursoConfirmCard config={config} />
      </motion.div>
    </motion.div>
  );
}
