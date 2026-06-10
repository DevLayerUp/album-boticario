"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AlbumPage, type AlbumPageData } from "./album-page";

interface FlipBookProps {
  pages: AlbumPageData[];
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
  userStickerUrl?: string | null;
}

/**
 * Shows pages in pairs — left + right — like an open book.
 * spreadIndex 0 → pages[0] + pages[1]
 * spreadIndex 1 → pages[2] + pages[3]  …
 */
export function FlipBook({
  pages,
  pastedSlotIds,
  ownedMap,
  onPaste,
  userStickerUrl,
}: FlipBookProps) {
  const totalSpreads = Math.ceil(pages.length / 2);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (pages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-verde-300 text-center text-sm text-verde-escuro-300">
        Nenhuma página cadastrada nesta categoria.
        <br />
        Crie páginas no painel admin → Páginas do Álbum.
      </div>
    );
  }

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(totalSpreads - 1, index));
    setDirection(clamped > spreadIndex ? 1 : -1);
    setSpreadIndex(clamped);
  }

  const leftPage  = pages[spreadIndex * 2] ?? null;
  const rightPage = pages[spreadIndex * 2 + 1] ?? null;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 280, damping: 30 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-50%" : "50%",
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <div className="select-none">
      {/* Spread counter + dot pagination */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-sm text-verde-escuro-300">
          Páginas{" "}
          <span className="font-bold text-verde-escuro-500">{spreadIndex * 2 + 1}</span>
          {rightPage && (
            <>–<span className="font-bold text-verde-escuro-500">{spreadIndex * 2 + 2}</span></>
          )}{" "}
          de <span className="font-bold text-verde-escuro-500">{pages.length}</span>
        </span>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`cursor-pointer rounded-pill transition-all duration-200 ${
                i === spreadIndex
                  ? "h-2 w-6 bg-verde-500"
                  : "h-2 w-2 bg-verde-100 hover:bg-verde-200"
              }`}
              aria-label={`Spread ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Book spread stage */}
      <div className="relative mx-auto w-full max-w-[1396px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spreadIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-0"
          >
            {/* Left page */}
            {leftPage && (
<<<<<<< Updated upstream
              <AlbumPage
                page={leftPage}
                side="left"
                pastedSlotIds={pastedSlotIds}
                ownedMap={ownedMap}
                onPaste={onPaste}
              />
=======
              <div className="relative">
                {/* Page edge shadow (right side = spine) */}
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-4 bg-gradient-to-l from-black/10 to-transparent md:block" />
                <AlbumPage
                  page={leftPage}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                  userStickerUrl={userStickerUrl}
                />
              </div>
>>>>>>> Stashed changes
            )}

            {/* Right page */}
            {rightPage ? (
<<<<<<< Updated upstream
              <AlbumPage
                page={rightPage}
                side="right"
                pastedSlotIds={pastedSlotIds}
                ownedMap={ownedMap}
                onPaste={onPaste}
              />
=======
              <div className="relative">
                {/* Page edge shadow (left side = spine) */}
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-4 bg-gradient-to-r from-black/10 to-transparent md:block" />
                <AlbumPage
                  page={rightPage}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                  userStickerUrl={userStickerUrl}
                />
              </div>
>>>>>>> Stashed changes
            ) : (
              /* Empty right page placeholder */
              <div className="hidden rounded-r-card bg-verde-escuro-500/95 md:flex md:items-center md:justify-center">
                <p className="text-sm text-verde-100/60">Última página</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => goTo(spreadIndex - 1)}
          disabled={spreadIndex === 0}
          className="flex cursor-pointer items-center gap-1.5 rounded-pill border border-verde-500 px-6 py-2.5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-verde-500/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <p className="hidden text-xs text-verde-escuro-300 sm:block">
          {leftPage?.title ?? `Página ${leftPage?.page_number ?? ""}`}
          {rightPage?.title ? ` · ${rightPage.title}` : rightPage ? ` · Pág. ${rightPage.page_number}` : ""}
        </p>

        <button
          onClick={() => goTo(spreadIndex + 1)}
          disabled={spreadIndex === totalSpreads - 1}
          className="flex cursor-pointer items-center gap-1.5 rounded-pill border border-verde-500 px-6 py-2.5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-verde-500/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Próxima <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
