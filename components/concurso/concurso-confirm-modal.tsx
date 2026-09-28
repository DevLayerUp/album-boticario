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
      className={`w-full rounded-3xl bg-white px-5 py-5 shadow-paper sm:px-7 sm:py-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="relative isolate flex size-12 shrink-0 items-center justify-center">
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
            className="relative z-10 size-5 text-white"
            strokeWidth={1.8}
          />
        </span>
        <h2
          id="concurso-confirm-title"
          className="font-display text-base font-bold leading-snug text-verde-escuro-500 sm:text-lg"
        >
          {config.confirmTitle}
        </h2>
      </div>

      <div className="mt-4 h-px w-full bg-verde-escuro-500" />

      <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-verde-escuro-500 sm:text-[15px] sm:leading-6">
        {config.confirmParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <Link
        href="/album"
        className="mt-5 inline-flex min-h-11 w-auto max-w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-amarelo px-5 py-2 text-center text-xs font-bold uppercase tracking-wide text-verde-escuro-500 shadow-paper transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 sm:min-h-12 sm:text-sm"
      >
        <ArrowLeft aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
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
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4"
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
        className="relative my-auto w-full max-w-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        <ConcursoConfirmCard config={config} />
      </motion.div>
    </motion.div>
  );
}
