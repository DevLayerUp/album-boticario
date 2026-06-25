"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ALBUM_GRID_CARD, getAlbumGridDimensions } from "@/lib/album-templates";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";

function LogoBadge() {
  return (
    <div className="flex h-[53px] w-[98px] items-center justify-center rounded-input bg-white">
      <div className="relative h-10 w-20">
        <Image
          src={dashboardAssets.logo}
          alt="Fãs da Natureza"
          fill
          className="object-contain"
          sizes="80px"
        />
      </div>
    </div>
  );
}

interface AlbumGridFrameProps {
  pageNumber: number;
  inFlipBook?: boolean;
  afterGrid?: React.ReactNode;
  children: React.ReactNode;
}

/** Chrome Figma 360:147 — logo topo, grid central, número da página embaixo. */
export function AlbumGridFrame({
  pageNumber,
  inFlipBook = false,
  afterGrid,
  children,
}: AlbumGridFrameProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col",
        inFlipBook ? "px-[6%] py-4 sm:px-[8%] sm:py-5" : "px-[8%] py-6 sm:py-8",
      )}
    >
      <div className="shrink-0">
        <LogoBadge />
      </div>

      {children}

      {afterGrid ? <div className="shrink-0">{afterGrid}</div> : null}

      <div className="mt-auto flex shrink-0 justify-end pt-2 sm:pt-3">
        <span
          className={cn(
            "font-display font-bold leading-none text-white/25",
            inFlipBook ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
          )}
          aria-hidden
        >
          {String(pageNumber).padStart(2, "0")}
        </span>
      </div>
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
