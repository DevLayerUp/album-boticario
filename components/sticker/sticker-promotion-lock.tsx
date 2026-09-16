"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PROMOTION_CALENDAR_TITLE,
  buildPromotionGoogleCalendarUrl,
  downloadPromotionIcs,
  resolvePromotionMessage,
  type StickerPromotionFields,
} from "@/lib/sticker-promotion";

export const STICKER_PROMOTION_PLACEHOLDER = "/images/hover-promocao.png";

export function StickerPromotionArt({
  sizes = "(max-width: 768px) 40vw, 200px",
}: {
  /** Mantido por compatibilidade — o visual bloqueado usa o placeholder do Figma. */
  imageUrl?: string;
  sizes?: string;
  lockSize?: "sm" | "md" | "lg";
}) {
  return (
    <Image
      src={STICKER_PROMOTION_PLACEHOLDER}
      alt=""
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

export function StickerPromotionHoverCopy({
  sticker,
  className,
}: {
  sticker: StickerPromotionFields;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[3] flex items-center justify-center bg-verde-escuro-capa/88 p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
        className,
      )}
    >
      <p className="line-clamp-6 text-center text-[10px] font-medium leading-snug text-white sm:text-[11px]">
        {resolvePromotionMessage(sticker)}
      </p>
    </div>
  );
}

export function StickerPromotionCalendarButton({
  sticker,
  className,
}: {
  sticker: StickerPromotionFields;
  className?: string;
}) {
  const message = resolvePromotionMessage(sticker);
  const googleUrl = buildPromotionGoogleCalendarUrl({
    title: PROMOTION_CALENDAR_TITLE,
    details: message,
    unlocksAt: sticker.promotion_unlocks_at,
  });

  function handleClick() {
    if (sticker.promotion_unlocks_at) {
      downloadPromotionIcs({
        title: PROMOTION_CALENDAR_TITLE,
        details: message,
        unlocksAt: sticker.promotion_unlocks_at,
      });
    }
  }

  if (googleUrl) {
    return (
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-verde-genz px-5 text-sm font-bold text-verde-escuro-capa transition-colors hover:bg-amarelo",
          className,
        )}
      >
        <CalendarPlus size={16} aria-hidden />
        Salvar na agenda
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-verde-genz px-5 text-sm font-bold text-verde-escuro-capa transition-colors hover:bg-amarelo",
        className,
      )}
    >
      <CalendarPlus size={16} aria-hidden />
      Salvar na agenda
    </button>
  );
}

export function StickerPromotionModal({
  sticker,
  onClose,
}: {
  sticker: StickerPromotionFields;
  onClose: () => void;
}) {
  const message = resolvePromotionMessage(sticker);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sticker-promo-title"
    >
      <div className="absolute inset-0 bg-verde-escuro-500/25 backdrop-blur-[10px]" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-sm rounded-card bg-[#ebffe6] p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-verde-escuro-400 hover:text-verde-escuro-500"
        >
          <X size={22} strokeWidth={2.4} />
        </button>
        <p
          id="sticker-promo-title"
          className="pr-8 text-[11px] font-bold uppercase tracking-[0.18em] text-verde-escuro-400"
        >
          Figurinha promocional
        </p>
        <p className="mt-3 text-sm leading-relaxed text-verde-escuro-500">{message}</p>
        <StickerPromotionCalendarButton sticker={sticker} className="mt-5 w-full" />
      </motion.div>
    </motion.div>
  );
}

export function StickerPromotionModalHost({
  open,
  sticker,
  onClose,
}: {
  open: boolean;
  sticker: StickerPromotionFields;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <AnimatePresence>
      {open ? <StickerPromotionModal sticker={sticker} onClose={onClose} /> : null}
    </AnimatePresence>
  );
}
