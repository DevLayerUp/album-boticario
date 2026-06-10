"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlbumPage, type AlbumPageData } from "./album-page";

/* ─────────────────────────────────────────────────────────────────────────────
 * react-pageflip uses browser-only APIs at initialisation time.
 * Dynamic import with ssr: false keeps it out of the server render pass.
 * ───────────────────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] animate-pulse rounded-card bg-verde-escuro-500/10" />
  ),
}) as React.ComponentType<React.ComponentProps<"div"> & FlipBookLibProps>;

/* Minimal typing for the subset of props we actually use */
interface FlipBookLibProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
  width: number;
  height: number;
  size?: "fixed" | "stretch";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  startPage?: number;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  onFlip?: (e: { data: number }) => void;
}

/* ─── Public props ───────────────────────────────────────────────────────── */
interface FlipBookProps {
  pages: AlbumPageData[];
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
  userStickerUrl?: string | null;
}

/* Shared style for the circular nav buttons */
const navBtn = (disabled: boolean) =>
  cn(
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
    "bg-verde-escuro-500 text-white",
    "shadow-[0_4px_16px_rgba(13,102,50,0.38)]",
    "transition-all duration-200 ease-out",
    disabled
      ? "cursor-not-allowed opacity-20 shadow-none"
      : "cursor-pointer hover:scale-105 hover:bg-verde-500 hover:shadow-[0_6px_20px_rgba(66,165,42,0.45)]",
  );

/**
 * Renders all album pages as a realistic page-flip book.
 *
 * Gesture strategy:
 *  - The library owns all gesture/touch detection (useMouseEvents defaults to true).
 *    This is the only way the native "finger-follows-page" animation works on mobile.
 *  - disableFlipByClick prevents zero-movement taps from flipping pages.
 *  - swipeDistance={80} requires an intentional 80px drag — accidental short nudges
 *    won't flip.
 *  - Sticker slots add onPointerDown/onTouchStart stopPropagation so interactions
 *    with figurinhas near the page edges never reach the flip engine.
 *  - Arrow buttons call flipPrev/flipNext programmatically.
 */
export function FlipBook({
  pages,
  pastedSlotIds,
  ownedMap,
  onPaste,
  userStickerUrl,
}: FlipBookProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  // currentPage = left-page index of the currently visible spread (0, 2, 4 …)
  const [currentPage, setCurrentPage] = useState(0);

  // Reset when category changes (pages[0] id changes)
  const firstPageId = pages[0]?.id;
  useEffect(() => {
    setCurrentPage(0);
  }, [firstPageId]);

  if (pages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-verde-300 text-center text-sm text-verde-escuro-300">
        Nenhuma página cadastrada nesta categoria.
        <br />
        Crie páginas no painel admin → Páginas do Álbum.
      </div>
    );
  }

  const isFirst = currentPage === 0;
  const isLast  = currentPage + 2 >= pages.length;

  return (
    <div className="select-none">
      {/* ── Layout ──────────────────────────────────────────────────────────
           Mobile  : book full-width on row 1, both buttons centred on row 2.
           Desktop : [◀]  [book]  [▶]  — arrows flanking the album.
           flex-wrap + CSS order achieves this without duplicating the book.
       ──────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1340px] flex-wrap items-center justify-center gap-4 md:flex-nowrap md:gap-3">

        {/* ← Previous — row 2 on mobile (below book), left column on desktop */}
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          disabled={isFirst}
          aria-label="Página anterior"
          className={cn("order-2 md:order-1", navBtn(isFirst))}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Book — full-width row 1 on mobile, flex-1 middle column on desktop.
            flex justify-center keeps the book centred within the column. */}
        <div className="order-1 flex w-full cursor-grab justify-center active:cursor-grabbing md:order-2 md:w-auto md:flex-1">
          <HTMLFlipBook
            ref={bookRef}
            key={firstPageId ?? "empty"}
            width={560}
            height={780}
            size="stretch"
            minWidth={280}
            maxWidth={560}
            minHeight={480}
            maxHeight={920}
            drawShadow
            flippingTime={700}
            usePortrait
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.4}
            showCover={false}
            /* mobileScrollSupport=false lets the library own horizontal swipes
               so they drive the page flip instead of scrolling the page. */
            mobileScrollSupport={false}
            /* clickEventForward makes the library ignore taps on <a>/<button>
               targets — sticker slots are buttons, so tapping them opens the
               modal and never flips. Empty page areas still flip on tap/swipe. */
            clickEventForward
            /* 80 px drag required — prevents accidental flips from short nudges */
            swipeDistance={80}
            showPageCorners={false}
            /* disableFlipByClick is intentionally OFF: when true the library
               cannot flip BACKWARD in portrait/mobile (its hardcoded prev-corner
               point lands off-screen and fails the corner test). Tap-protection
               for interactive elements is handled by rendering them as buttons. */
            startPage={0}
            className=""
            style={{}}
            onFlip={(e: { data: number }) => setCurrentPage(e.data)}
          >
            {pages.map((page, index) => (
              <div key={page.id} className="h-full overflow-hidden">
                <AlbumPage
                  page={page}
                  side={index % 2 === 0 ? "left" : "right"}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                  userStickerUrl={userStickerUrl}
                  inFlipBook
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {/* → Next — always order-3 (right of prev on mobile, right column on desktop) */}
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          disabled={isLast}
          aria-label="Próxima página"
          className={cn("order-3", navBtn(isLast))}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
