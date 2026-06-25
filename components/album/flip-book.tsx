"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlbumPage, type AlbumPageData, type PageSide } from "./album-page";
import { AlbumCover } from "./album-cover";

type BookOrientation = "portrait" | "landscape";

/**
 * Maps content page index to physical left/right in the flipbook.
 * With showCover, flipbook index 0 is the cover; content starts at index 1.
 * In portrait mode the library renders every page on the right except the last,
 * which is shown on the left — so index % 2 is wrong there.
 */
function getAlbumPageSide(
  contentIndex: number,
  totalContentPages: number,
  orientation: BookOrientation,
): PageSide {
  const flipIndex = contentIndex + 1;
  if (orientation === "landscape") {
    return flipIndex % 2 === 1 ? "left" : "right";
  }
  return flipIndex === totalContentPages ? "left" : "right";
}

type HTMLFlipBookComponent = typeof import("react-pageflip").default;

interface PageFlipApi {
  flipPrev: (corner?: "top" | "bottom") => void;
  flipNext: (corner?: "top" | "bottom") => void;
  flip: (pageNum: number, corner?: "top" | "bottom") => void;
  turnToPage: (pageNum: number) => void;
}

interface HTMLFlipBookHandle {
  pageFlip: () => PageFlipApi;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * react-pageflip uses browser-only APIs at initialisation time.
 * Dynamic import with ssr: false keeps it out of the server render pass.
 * ───────────────────────────────────────────────────────────────────────── */
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] animate-pulse rounded-card bg-verde-escuro-500/10" />
  ),
}) as HTMLFlipBookComponent;

/* ─── Public props ───────────────────────────────────────────────────────── */
interface FlipBookProps {
  pages: AlbumPageData[];
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
  userStickerUrl?: string | null;
  userDisplayName?: string | null;
  /** URL of the album cover image from Supabase storage (uploaded by admin) */
  coverUrl?: string | null;
  /** Abre a página do slot e destaca para colagem (vindo do estoque). */
  focusSlotId?: number | null;
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
function useFlipBookSize() {
  const [size, setSize] = useState({
    height: 780,
    minHeight: 480,
    maxHeight: 920,
    isMobile: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const mobile = mq.matches;
      setSize(
        mobile
          ? { height: 900, minHeight: 520, maxHeight: 980, isMobile: true }
          : { height: 780, minHeight: 480, maxHeight: 920, isMobile: false },
      );
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return size;
}

/** Freeze document scroll during page-flip on mobile only. */
function useScrollLock() {
  const lockedY = useRef(0);
  const isLocked = useRef(false);

  const lock = () => {
    if (isLocked.current) return;
    isLocked.current = true;
    lockedY.current = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${lockedY.current}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
  };

  const forceUnlock = () => {
    if (!isLocked.current) return;
    isLocked.current = false;
    const y = lockedY.current;
    const { style } = document.body;
    style.position = "";
    style.top = "";
    style.left = "";
    style.right = "";
    style.width = "";
    style.overflow = "";
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    return () => {
      isLocked.current = false;
      const { style } = document.body;
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      style.overflow = "";
    };
  }, []);

  return { lock, forceUnlock };
}

const FLIP_DURATION_MS = 720;

interface FlipNavControlProps {
  direction: "prev" | "next";
  disabled: boolean;
  label: string;
  className: string;
  isMobile: boolean;
  onFlip: (direction: "prev" | "next") => void;
  children: ReactNode;
}

function FlipNavControl({
  direction,
  disabled,
  label,
  className,
  isMobile,
  onFlip,
  children,
}: FlipNavControlProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip(direction);
    }
  };

  if (isMobile) {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={label}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => !disabled && onFlip(direction)}
        onKeyDown={handleKeyDown}
        className={cn(className, "touch-manipulation")}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={() => onFlip(direction)}
      className={className}
    >
      {children}
    </button>
  );
}

export function FlipBook({
  pages,
  pastedSlotIds,
  ownedMap,
  onPaste,
  userStickerUrl,
  userDisplayName,
  coverUrl,
  focusSlotId = null,
}: FlipBookProps) {
  const bookRef = useRef<HTMLFlipBookHandle | null>(null);
  const unlockFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { height, minHeight, maxHeight, isMobile } = useFlipBookSize();
  const { lock: lockScroll, forceUnlock } = useScrollLock();

  // currentPage = index of the currently visible page (0 = cover, 1+ = content)
  const [currentPage, setCurrentPage] = useState(0);
  const [bookOrientation, setBookOrientation] = useState<BookOrientation>("landscape");

  // Reset when category changes (pages[0] id changes)
  const firstPageId = pages[0]?.id;
  useEffect(() => {
    setCurrentPage(0);
  }, [firstPageId]);

  useEffect(() => {
    if (!focusSlotId || pages.length === 0) return;

    const contentPageIndex = pages.findIndex((page) =>
      page.album_slots.some((slot) => slot.id === focusSlotId),
    );
    if (contentPageIndex < 0) return;

    const flipBookPage = contentPageIndex + 1;

    const navigate = () => {
      const api = bookRef.current?.pageFlip();
      if (!api) return false;
      api.flip(flipBookPage, "top");
      setCurrentPage(flipBookPage);
      return true;
    };

    const timeout = window.setTimeout(() => {
      if (!navigate()) {
        window.setTimeout(navigate, 400);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [focusSlotId, firstPageId, pages]);

  const clearUnlockFallback = () => {
    if (unlockFallbackRef.current) {
      clearTimeout(unlockFallbackRef.current);
      unlockFallbackRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (unlockFallbackRef.current) clearTimeout(unlockFallbackRef.current);
    },
    [],
  );

  const releaseMobileScroll = () => {
    if (!isMobile) return;
    clearUnlockFallback();
    forceUnlock();
  };

  const flipPage = (direction: "prev" | "next") => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;

    if (isMobile) {
      lockScroll();
      clearUnlockFallback();
      // Safety net if onFlip never fires (e.g. interrupted animation).
      unlockFallbackRef.current = setTimeout(releaseMobileScroll, FLIP_DURATION_MS + 150);
    }

    if (direction === "prev") api.flipPrev();
    else api.flipNext();
  };

  if (pages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-verde-300 text-center text-sm text-verde-escuro-300">
        Nenhuma página cadastrada nesta categoria.
        <br />
        Crie páginas no painel admin → Páginas do Álbum.
      </div>
    );
  }

  // With showCover=true: page 0 is the cover; content starts at page 1.
  // Total children = 1 (cover) + pages.length (content pages).
  const totalChildren = 1 + pages.length;
  const isFirst = currentPage === 0;
  // On the last spread: current page is the second-to-last or last content page
  const isLast = currentPage + 2 >= totalChildren;

  return (
    <div className="select-none">
      {/* ── Layout ──────────────────────────────────────────────────────────
           Mobile  : book full-width on row 1, both buttons centred on row 2.
           Desktop : [◀]  [book]  [▶]  — arrows flanking the album.
           flex-wrap + CSS order achieves this without duplicating the book.
       ──────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1340px] flex-wrap items-center justify-center gap-4 md:flex-nowrap md:gap-3">

        {/* ← Previous — row 2 on mobile (below book), left column on desktop */}
        <FlipNavControl
          direction="prev"
          disabled={isFirst}
          label="Página anterior"
          isMobile={isMobile}
          onFlip={flipPage}
          className={cn("order-2 md:order-1", navBtn(isFirst))}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </FlipNavControl>

        {/* Book — w-full is required so page-flip measures a wide enough block
            for landscape (two-page) mode. Without it the wrapper shrink-wraps
            and the library falls back to portrait (single tiny page).
            On desktop with showCover, the closed cover sits on the RIGHT half;
            -translate-x-1/4 centres that single visible page. */}
        <div className="order-1 flex w-full min-w-0 cursor-grab justify-center max-md:[overflow-anchor:none] active:cursor-grabbing md:order-2 md:min-w-[560px] md:flex-1">
          <div
            className={cn(
              "flex w-full justify-center transition-transform duration-700 ease-out",
              isFirst && "md:-translate-x-1/4",
            )}
          >
          <HTMLFlipBook
            ref={bookRef}
            key={firstPageId ?? "empty"}
            width={560}
            height={height}
            size="stretch"
            minWidth={280}
            maxWidth={560}
            minHeight={minHeight}
            maxHeight={maxHeight}
            drawShadow
            flippingTime={700}
            usePortrait
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.4}
            /* showCover=true renders page 0 as a hard single-page cover */
            showCover
            /* mobileScrollSupport=false lets the library own horizontal swipes
               so they drive the page flip instead of scrolling the page. */
            mobileScrollSupport={false}
            /* clickEventForward makes the library ignore taps on <a>/<button>
               targets — sticker slots are buttons, so tapping them opens the
               modal and never flips. Empty page areas still flip on tap/swipe. */
            clickEventForward
            useMouseEvents
            /* 80 px drag required — prevents accidental flips from short nudges */
            swipeDistance={80}
            showPageCorners={false}
            /* disableFlipByClick=false: when true the library cannot flip
               BACKWARD in portrait/mobile. Sticker slots are <button> elements
               so taps on them are ignored by clickEventForward. */
            disableFlipByClick={false}
            startPage={0}
            className=""
            style={{}}
            onInit={(e: { data: { mode: BookOrientation } }) => {
              setBookOrientation(e.data.mode);
            }}
            onFlip={(e: { data: number }) => {
              setCurrentPage(e.data);
              releaseMobileScroll();
            }}
            onChangeOrientation={(e: { data: BookOrientation }) => {
              setBookOrientation(e.data);
            }}
          >
            {/* ── Cover page (index 0) — hard page shown alone ── */}
            <div key="cover" className="h-full overflow-hidden">
              <AlbumCover coverUrl={coverUrl} />
            </div>

            {/* ── Content pages (index 1+) ── */}
            {pages.map((page, index) => (
              <div key={page.id} className="h-full overflow-hidden">
                <AlbumPage
                  page={page}
                  side={getAlbumPageSide(index, pages.length, bookOrientation)}
                  pastedSlotIds={pastedSlotIds}
                  ownedMap={ownedMap}
                  onPaste={onPaste}
                  userStickerUrl={userStickerUrl}
                  userDisplayName={userDisplayName}
                  inFlipBook
                  focusSlotId={focusSlotId}
                />
              </div>
            ))}
          </HTMLFlipBook>
          </div>
        </div>

        {/* → Next — always order-3 (right of prev on mobile, right column on desktop) */}
        <FlipNavControl
          direction="next"
          disabled={isLast}
          label="Próxima página"
          isMobile={isMobile}
          onFlip={flipPage}
          className={cn("order-3", navBtn(isLast))}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </FlipNavControl>
      </div>
    </div>
  );
}
