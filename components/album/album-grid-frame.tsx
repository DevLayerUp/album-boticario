"use client";

import { useEffect, useRef, useState } from "react";
import { ALBUM_GRID_CARD, getAlbumGridDimensions } from "@/lib/album-templates";
import { cn } from "@/lib/utils";

interface AlbumGridFrameProps {
  inFlipBook?: boolean;
  afterGrid?: React.ReactNode;
  children: React.ReactNode;
}

/** Área central do grid — logos e numeração ficam no AlbumPageShell. */
export function AlbumGridFrame({
  inFlipBook = false,
  afterGrid,
  children,
}: AlbumGridFrameProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col",
        inFlipBook ? "px-[6%] py-2 sm:px-[8%] sm:py-3" : "px-[8%] py-4 sm:py-6",
      )}
    >
      {children}

      {afterGrid ? <div className="shrink-0">{afterGrid}</div> : null}
    </div>
  );
}

interface AlbumStickerGridProps {
  cols: number;
  rows: number;
  children: React.ReactNode;
}

export function AlbumStickerGrid({ cols, rows, children }: AlbumStickerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { width: gridW, height: gridH, gapX, gapY } = getAlbumGridDimensions(cols, rows);
  const { width: cardW, height: cardH } = ALBUM_GRID_CARD;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const scaleW = el.clientWidth / gridW;
      const scaleH = el.clientHeight / gridH;
      setScale(Math.min(1, scaleW, scaleH));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gridW, gridH]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full flex-1 items-center justify-center py-3 sm:py-4"
    >
      <div
        className="relative"
        style={{
          width: gridW * scale,
          height: gridH * scale,
        }}
      >
        <div
          className="grid"
          style={{
            width: gridW,
            height: gridH,
            gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
            gridTemplateRows: `repeat(${rows}, ${cardH}px)`,
            columnGap: gapX,
            rowGap: gapY,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AlbumGridSlotCell({ children }: { children: React.ReactNode }) {
  const { width, height } = ALBUM_GRID_CARD;
  return (
    <div className="overflow-hidden" style={{ width, height }}>
      {children}
    </div>
  );
}
