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
}

/**
 * Shows pages in pairs — left + right — like an open book.
 * spreadIndex 0 → pages[0] + pages[1]
 * spreadIndex 1 → pages[2] + pages[3]  …
 */
export function FlipBook({ pages, pastedSlotIds, ownedMap, onPaste }: FlipBookProps) {
  const totalSpreads = Math.ceil(pages.length / 2);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (pages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
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
        <span className="text-sm text-gray-500">
          Páginas{" "}
          <span className="font-semibold text-gb-ink">{spreadIndex * 2 + 1}</span>
          {rightPage && (
            <>–<span className="font-semibold text-gb-ink">{spreadIndex * 2 + 2}</span></>
          )}{" "}
          de <span className="font-semibold text-gb-ink">{pages.length}</span>
        </span>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === spreadIndex
                  ? "h-2 w-6 bg-gb-green"
                  : "h-2 w-2 bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label={`Spread ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Book spread stage */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spreadIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 gap-2 md:grid-cols-2"
          >
            {/* Left page */}
            {leftPage && (
              <div className="relative">
                {/* Page edge shadow (right side = spine) */}
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-4 bg-gradient-to-l from-black/10 to-transparent md:block" />
                <AlbumPage
                  page={leftPage}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                />
              </div>
            )}

            {/* Right page */}
            {rightPage ? (
              <div className="relative">
                {/* Page edge shadow (left side = spine) */}
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-4 bg-gradient-to-r from-black/10 to-transparent md:block" />
                <AlbumPage
                  page={rightPage}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                />
              </div>
            ) : (
              /* Empty right page placeholder */
              <div className="hidden rounded-2xl border border-dashed border-gray-100 bg-gray-50/60 md:flex md:items-center md:justify-center">
                <p className="text-sm text-gray-300">Última página</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Book spine shadow overlay (center) */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-3 -translate-x-1/2 bg-gradient-to-r from-black/8 via-black/15 to-black/8 md:block" />
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => goTo(spreadIndex - 1)}
          disabled={spreadIndex === 0}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <p className="text-xs text-gray-400">
          {leftPage?.title ?? `Página ${leftPage?.page_number ?? ""}`}
          {rightPage?.title ? ` · ${rightPage.title}` : rightPage ? ` · Pág. ${rightPage.page_number}` : ""}
        </p>

        <button
          onClick={() => goTo(spreadIndex + 1)}
          disabled={spreadIndex === totalSpreads - 1}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Próxima <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
