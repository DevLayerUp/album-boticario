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
const DESKTOP_BOOK = { width: 560, height: 780, minHeight: 480, maxHeight: 920 };
/** Altura reservada para a barra de navegação no mobile (botão 30px + espaçamento). */
const MOBILE_CONTROLS_H = 42;

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
    <div className="h-full min-h-[280px] w-full animate-pulse rounded-card bg-verde-escuro-500/10" />
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

interface BookDimensions {
  width: number;
  height: number;
  minHeight: number;
  maxHeight: number;
  isMobile: boolean;
}

function readMobileNavHeight(): number {
  const nav = document.querySelector<HTMLElement>("[data-mobile-nav]");
  return nav?.getBoundingClientRect().height ?? 72;
}

function measureMobileBook(host: HTMLElement): { width: number; height: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const width = Math.min(560, Math.max(260, Math.floor(viewportWidth - 36)));

  const top = host.getBoundingClientRect().top;
  const navHeight = readMobileNavHeight();
  const height = Math.floor(viewportHeight - top - navHeight - MOBILE_CONTROLS_H - 4);

  return {
    width,
    height: Math.max(320, height),
  };
}

function useBookDimensions(hostRef: React.RefObject<HTMLElement | null>): BookDimensions {
  const [dims, setDims] = useState<BookDimensions>({
    width: DESKTOP_BOOK.width,
    height: DESKTOP_BOOK.height,
    minHeight: DESKTOP_BOOK.minHeight,
    maxHeight: DESKTOP_BOOK.maxHeight,
    isMobile: false,
  });

  const measure = useCallback(() => {
    const mobile = window.matchMedia(MOBILE_MQ).matches;
    const host = hostRef.current;

    if (!mobile) {
      setDims({
        width: DESKTOP_BOOK.width,
        height: DESKTOP_BOOK.height,
        minHeight: DESKTOP_BOOK.minHeight,
        maxHeight: DESKTOP_BOOK.maxHeight,
        isMobile: false,
      });
      return;
    }

    if (!host) return;

    const { width, height } = measureMobileBook(host);
    setDims({
      width,
      height,
      minHeight: height,
      maxHeight: height,
      isMobile: true,
    });
  }, [hostRef]);

  useEffect(() => {
    measure();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    const host = hostRef.current;
    if (!host) return () => cancelAnimationFrame(raf);

    const mq = window.matchMedia(MOBILE_MQ);
    const onMqChange = () => measure();

    mq.addEventListener("change", onMqChange);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(measure);
    });
    ro.observe(host);

    const outer = host.parentElement;
    if (outer) ro.observe(outer);

    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure, hostRef]);

  return dims;
}

type NavBtnVariant = "default" | "overlay" | "compact";

const navBtn = (disabled: boolean, variant: NavBtnVariant = "default") =>
  cn(
    "flex shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 ease-out touch-manipulation",
    variant === "overlay" &&
      "h-11 w-11 bg-verde-escuro-500/90 shadow-[0_4px_14px_rgba(13,102,50,0.45)] backdrop-blur-sm",
    variant === "compact" &&
      "h-[30px] w-[30px] bg-verde-escuro-500 shadow-[0_2px_8px_rgba(13,102,50,0.35)]",
    variant === "default" &&
      "h-14 w-14 bg-verde-escuro-500 shadow-[0_4px_16px_rgba(13,102,50,0.38)]",
    disabled
      ? "pointer-events-none opacity-20 shadow-none"
      : variant === "default"
        ? "cursor-pointer hover:scale-105 hover:bg-verde-500 hover:shadow-[0_6px_20px_rgba(66,165,42,0.45)]"
        : "cursor-pointer active:scale-95 hover:bg-verde-500",
  );

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
  const hostRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLFlipBookHandle | null>(null);
  const { width, height, minHeight, maxHeight, isMobile } = useBookDimensions(hostRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [bookOrientation, setBookOrientation] = useState<BookOrientation>("portrait");

  const firstPageId = pages[0]?.id;
  const stickerKey = userStickerUrl ? userStickerUrl.slice(-32) : "none";
  const sizeKey = isMobile
    ? `${Math.round(width / 12)}x${Math.round(height / 12)}`
    : "desktop";

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
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div
        ref={hostRef}
        className="relative mx-auto flex w-full max-w-[1340px] items-stretch justify-center md:min-h-0 md:flex-1 md:items-center md:gap-3"
        style={
          isMobile
            ? { height, minHeight: height, maxHeight: height, width: "100%" }
            : undefined
        }
      >
        <FlipNavControl
          direction="prev"
          disabled={isFirst}
          label="Página anterior"
          onFlip={flipPage}
          className={cn(navBtn(isFirst), "max-md:hidden")}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </FlipNavControl>

        <div className="relative flex h-full min-h-0 w-full min-w-0 cursor-grab justify-center max-md:[overflow-anchor:none] active:cursor-grabbing md:min-w-[560px] md:flex-1">
          <div
            className={cn(
              "flex h-full w-full justify-center",
              !isMobile && "transition-transform duration-700 ease-out",
              isFirst && !isMobile && "md:-translate-x-1/4",
            )}
            style={
              isMobile
                ? { width: "100%", height: "100%", maxWidth: width, maxHeight: height }
                : undefined
            }
          >
            <HTMLFlipBook
              ref={bookRef}
              key={`${firstPageId ?? "empty"}-${sizeKey}-${stickerKey}`}
              width={width}
              height={height}
              size={isMobile ? "fixed" : "stretch"}
              minWidth={isMobile ? width : 280}
              maxWidth={isMobile ? width : 560}
              minHeight={minHeight}
              maxHeight={maxHeight}
              drawShadow
              flippingTime={700}
              usePortrait
              startZIndex={0}
              autoSize={!isMobile}
              maxShadowOpacity={0.4}
              showCover
              mobileScrollSupport={false}
              clickEventForward
              useMouseEvents
              swipeDistance={80}
              showPageCorners={false}
              disableFlipByClick={false}
              startPage={0}
              className="album-flipbook h-full w-full"
              style={isMobile ? { width: "100%", height: "100%" } : {}}
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
          className={cn(navBtn(isLast), "max-md:hidden")}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </FlipNavControl>

      </div>

      {/* Navegação — mobile: barra abaixo do álbum, sem sobrepor o conteúdo */}
      <div className="mt-1.5 flex shrink-0 items-center justify-center gap-4 md:hidden">
        <FlipNavControl
          direction="prev"
          disabled={isFirst}
          label="Página anterior"
          onFlip={flipPage}
          className={navBtn(isFirst, "compact")}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </FlipNavControl>

        <span
          className="min-w-[56px] text-center text-sm font-semibold text-verde-escuro-500"
          aria-live="polite"
        >
          {Math.min(currentPage + 1, totalChildren)} / {totalChildren}
        </span>

        <FlipNavControl
          direction="next"
          disabled={isLast}
          label="Próxima página"
          onFlip={flipPage}
          className={navBtn(isLast, "compact")}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </FlipNavControl>
      </div>
    </div>
  );
}
