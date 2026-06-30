"use client";

import dynamic from "next/dynamic";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlbumPage, type AlbumPageData, type PageSide } from "./album-page";
import { AlbumCover } from "./album-cover";

type BookOrientation = "portrait" | "landscape";

const MOBILE_MQ = "(max-width: 767px)";
const MOBILE_NAV_RESERVE_PX = 72;
const MOBILE_HEADER_RESERVE_PX = 200;

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

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="h-[min(58dvh,520px)] min-h-[380px] animate-pulse rounded-card bg-verde-escuro-500/10 max-md:h-[min(52dvh,480px)]" />
  ),
}) as HTMLFlipBookComponent;

interface FlipBookProps {
  pages: AlbumPageData[];
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
  userStickerUrl?: string | null;
  userDisplayName?: string | null;
  coverUrl?: string | null;
  focusSlotId?: number | null;
}

const navBtn = (disabled: boolean, overlay = false) =>
  cn(
    "flex shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 ease-out touch-manipulation",
    overlay
      ? "h-11 w-11 bg-verde-escuro-500/90 shadow-[0_4px_14px_rgba(13,102,50,0.45)] backdrop-blur-sm"
      : "h-14 w-14 bg-verde-escuro-500 shadow-[0_4px_16px_rgba(13,102,50,0.38)]",
    disabled
      ? "pointer-events-none opacity-20 shadow-none"
      : overlay
        ? "cursor-pointer active:scale-95 hover:bg-verde-500"
        : "cursor-pointer hover:scale-105 hover:bg-verde-500 hover:shadow-[0_6px_20px_rgba(66,165,42,0.45)]",
  );

function useFlipBookSize(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({
    height: 520,
    minHeight: 400,
    maxHeight: 640,
    isMobile: false,
  });

  const measure = useCallback(() => {
    const mobile = window.matchMedia(MOBILE_MQ).matches;

    if (!mobile) {
      setSize({
        height: 780,
        minHeight: 480,
        maxHeight: 920,
        isMobile: false,
      });
      return;
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    const chromeAbove = Math.max(containerTop, MOBILE_HEADER_RESERVE_PX * 0.45);
    const available =
      viewportHeight - chromeAbove - MOBILE_NAV_RESERVE_PX - 24;
    const height = Math.min(560, Math.max(360, Math.round(available)));

    setSize({
      height,
      minHeight: Math.round(height * 0.94),
      maxHeight: height,
      isMobile: true,
    });
  }, [containerRef]);

  useEffect(() => {
    measure();
    const mq = window.matchMedia(MOBILE_MQ);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [measure]);

  return size;
}

interface FlipNavControlProps {
  direction: "prev" | "next";
  disabled: boolean;
  label: string;
  className: string;
  overlay?: boolean;
  onFlip: (direction: "prev" | "next") => void;
  children: ReactNode;
}

function FlipNavControl({
  direction,
  disabled,
  label,
  className,
  overlay = false,
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

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onPointerDown={(e) => overlay && e.stopPropagation()}
      onClick={() => onFlip(direction)}
      onKeyDown={handleKeyDown}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLFlipBookHandle | null>(null);
  const { height, minHeight, maxHeight, isMobile } = useFlipBookSize(containerRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [bookOrientation, setBookOrientation] = useState<BookOrientation>("portrait");

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

  const flipPage = (direction: "prev" | "next") => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
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

  const totalChildren = 1 + pages.length;
  const isFirst = currentPage === 0;
  const isLast = currentPage + 2 >= totalChildren;
  const effectiveOrientation = isMobile ? "portrait" : bookOrientation;

  return (
    <div ref={containerRef} className="select-none max-md:pb-2">
      <div className="relative mx-auto flex w-full max-w-[1340px] items-center justify-center gap-3 max-md:gap-0">
        <FlipNavControl
          direction="prev"
          disabled={isFirst}
          label="Página anterior"
          onFlip={flipPage}
          className={cn(
            navBtn(isFirst),
            "max-md:absolute max-md:left-1 max-md:top-1/2 max-md:z-20 max-md:-translate-y-1/2 max-md:hidden",
          )}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </FlipNavControl>

        <FlipNavControl
          direction="prev"
          disabled={isFirst}
          label="Página anterior"
          overlay
          onFlip={flipPage}
          className={cn(
            "absolute left-1 top-1/2 z-20 -translate-y-1/2 md:hidden",
            navBtn(isFirst, true),
          )}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </FlipNavControl>

        <div className="relative flex w-full min-w-0 cursor-grab justify-center max-md:[overflow-anchor:none] active:cursor-grabbing md:min-w-[560px] md:flex-1">
          <div
            className={cn(
              "flex w-full justify-center transition-transform duration-700 ease-out",
              isFirst && !isMobile && "md:-translate-x-1/4",
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
              showCover
              mobileScrollSupport={false}
              clickEventForward
              useMouseEvents
              swipeDistance={80}
              showPageCorners={false}
              disableFlipByClick={false}
              startPage={0}
              className=""
              style={{}}
              onInit={(e: { data: { mode: BookOrientation } }) => {
                setBookOrientation(isMobile ? "portrait" : e.data.mode);
              }}
              onFlip={(e: { data: number }) => {
                setCurrentPage(e.data);
              }}
              onChangeOrientation={(e: { data: BookOrientation }) => {
                if (!isMobile) setBookOrientation(e.data);
              }}
            >
              <div key="cover" className="h-full overflow-hidden">
                <AlbumCover coverUrl={coverUrl} />
              </div>

              {pages.map((page, index) => (
                <div key={page.id} className="h-full overflow-hidden">
                  <AlbumPage
                    page={page}
                    side={getAlbumPageSide(index, pages.length, effectiveOrientation)}
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

        <FlipNavControl
          direction="next"
          disabled={isLast}
          label="Próxima página"
          onFlip={flipPage}
          className={cn(
            navBtn(isLast),
            "max-md:absolute max-md:right-1 max-md:top-1/2 max-md:z-20 max-md:-translate-y-1/2 max-md:hidden",
          )}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </FlipNavControl>

        <FlipNavControl
          direction="next"
          disabled={isLast}
          label="Próxima página"
          overlay
          onFlip={flipPage}
          className={cn(
            "absolute right-1 top-1/2 z-20 -translate-y-1/2 md:hidden",
            navBtn(isLast, true),
          )}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </FlipNavControl>
      </div>
    </div>
  );
}
