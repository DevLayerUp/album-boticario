"use client";

import { useEffect, useRef, useState } from "react";
import { ALBUM_DUO2_DESIGN, ALBUM_GRID_CARD, getAlbumGridDimensions } from "@/lib/album-templates";
import { cn } from "@/lib/utils";

type GridCardMetrics = {
  width: number;
  height: number;
  gapX: number;
  gapY: number;
};

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
        "flex max-h-full min-h-0 w-full flex-col overflow-hidden",
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
  card?: GridCardMetrics;
  /** Usa mais linhas virtuais só no cálculo de escala (ex.: duo2 → mesma escala que 2×2). */
  scaleReferenceRows?: number;
  children: React.ReactNode;
}

export function AlbumStickerGrid({
  cols,
  rows,
  card = ALBUM_GRID_CARD,
  scaleReferenceRows,
  children,
}: AlbumStickerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { width: gridW, height: gridH, gapX, gapY, cardW, cardH } = getAlbumGridDimensions(
    cols,
    rows,
    card,
  );
  const refRows = scaleReferenceRows ?? rows;
  const refGridH =
    refRows * card.height + (refRows - 1) * card.gapY;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const scaleW = el.clientWidth / gridW;
      const scaleH = el.clientHeight / refGridH;
      setScale(Math.min(1, scaleW, scaleH));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gridW, refGridH]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 max-h-full w-full flex-1 items-center justify-center py-3 sm:py-4"
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

export function AlbumGridSlotCell({
  children,
  card = ALBUM_GRID_CARD,
}: {
  children: React.ReactNode;
  card?: GridCardMetrics;
}) {
  return (
    <div className="overflow-hidden" style={{ width: card.width, height: card.height }}>
      {children}
    </div>
  );
}

interface AlbumDuo2ScalerProps {
  inFlipBook?: boolean;
  children: React.ReactNode;
}

/** Escala o bloco texto + 2 cards duo2 para caber na página (dimensões Figma 334:2607). */
export function AlbumDuo2Scaler({ inFlipBook = false, children }: AlbumDuo2ScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentSize, setContentSize] = useState<{ w: number; h: number }>({
    w: ALBUM_DUO2_DESIGN.rowWidth,
    h: ALBUM_DUO2_DESIGN.cardHeight,
  });

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => {
      const w = content.scrollWidth;
      const h = content.scrollHeight;
      if (w > 0 && h > 0) {
        setContentSize({ w, h });
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { w, h } = contentSize;
      const containerW = el.clientWidth;
      const containerH = el.clientHeight;
      if (w <= 0 || h <= 0 || containerW <= 0 || containerH <= 0) return;

      const next = Math.min(1, containerW / w, containerH / h);
      if (Number.isFinite(next) && next > 0) {
        setScale(next);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [contentSize]);

  const layoutW = contentSize.w * scale;
  const layoutH = contentSize.h * scale;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-0 max-h-full w-full flex-1 items-center justify-center",
        inFlipBook ? "py-1 sm:py-2" : "py-4",
      )}
    >
      <div
        style={{
          width: Number.isFinite(layoutW) ? layoutW : ALBUM_DUO2_DESIGN.rowWidth,
          height: Number.isFinite(layoutH) ? layoutH : ALBUM_DUO2_DESIGN.cardHeight,
        }}
      >
        <div
          ref={contentRef}
          className="inline-flex flex-col items-center"
          style={{
            transform: `scale(${Number.isFinite(scale) ? scale : 1})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
