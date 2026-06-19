"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  STICKER_PHOTO,
  getInitialPhotoTransform,
  type StickerPhotoTransform,
} from "@/lib/sticker-card";
import { FigurinhaPanel } from "./figurinha-panel";
import { StickerCard } from "./sticker-card";

interface PhotoEditorProps {
  cutoutSrc: string;
  onConfirm: (transform: StickerPhotoTransform) => void;
  onBack: () => void;
  confirming?: boolean;
  error?: string | null;
}

export function PhotoEditor({
  cutoutSrc,
  onConfirm,
  onBack,
  confirming = false,
  error = null,
}: PhotoEditorProps) {
  const [transform, setTransform] = useState<StickerPhotoTransform | null>(null);
  const initialTransformRef = useRef<StickerPhotoTransform | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const initial = getInitialPhotoTransform(
        img.naturalWidth,
        img.naturalHeight,
      );
      initialTransformRef.current = initial;
      setTransform(initial);
    };
    img.src = cutoutSrc;
  }, [cutoutSrc]);

  const updateScale = useCallback((delta: number) => {
    setTransform((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scale: Math.min(
          STICKER_PHOTO.maxScale,
          Math.max(STICKER_PHOTO.minScale, +(prev.scale + delta).toFixed(2)),
        ),
      };
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (confirming || !transform) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.offsetX,
      originY: transform.offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    setTransform((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        offsetX: drag.originX + (e.clientX - drag.startX),
        offsetY: drag.originY + (e.clientY - drag.startY),
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  if (!transform) {
    return (
      <FigurinhaPanel
        title="Ajuste sua foto"
        description="Preparando o recorte transparente…"
      >
        <StickerCard />
      </FigurinhaPanel>
    );
  }

  return (
    <FigurinhaPanel
      title="Ajuste sua foto"
      description="Recorte sem fundo sobre o card. Arraste e redimensione. A figurinha final só é criada ao clicar em “Gerar figurinha”."
    >
      <StickerCard
        photoSrc={cutoutSrc}
        photoTransform={transform}
        photoAlt="Ajuste da figurinha"
        photoInteractive
        onPhotoPointerDown={handlePointerDown}
        onPhotoPointerMove={handlePointerMove}
        onPhotoPointerUp={handlePointerUp}
      />

      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateScale(-0.1)}
            disabled={confirming || transform.scale <= STICKER_PHOTO.minScale}
            aria-label="Diminuir foto"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-verde-500 text-verde-500 transition-colors hover:bg-verde-500/10 disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden />
          </button>

          <div className="flex-1 space-y-1">
            <label
              htmlFor="photo-scale"
              className="text-xs font-medium uppercase tracking-wide text-verde-escuro-500"
            >
              Tamanho
            </label>
            <input
              id="photo-scale"
              type="range"
              min={STICKER_PHOTO.minScale}
              max={STICKER_PHOTO.maxScale}
              step={0.05}
              value={transform.scale}
              disabled={confirming}
              onChange={(e) =>
                setTransform((prev) =>
                  prev
                    ? {
                        ...prev,
                        scale: Number(e.target.value),
                      }
                    : prev,
                )
              }
              className="h-2 w-full cursor-pointer accent-verde-500"
            />
          </div>

          <button
            type="button"
            onClick={() => updateScale(0.1)}
            disabled={confirming || transform.scale >= STICKER_PHOTO.maxScale}
            aria-label="Aumentar foto"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-verde-500 text-verde-500 transition-colors hover:bg-verde-500/10 disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-verde-escuro-500/70">
          <span>{Math.round(transform.scale * 100)}%</span>
          <button
            type="button"
            onClick={() => {
              if (initialTransformRef.current) {
                setTransform(initialTransformRef.current);
              }
            }}
            disabled={confirming}
            className="inline-flex items-center gap-1.5 text-verde-500 transition-colors hover:text-verde-600 disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Redefinir
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-verde-escuro-500/60">
        Dica: arraste diretamente sobre a foto no card para reposicionar.
      </p>

      {error ? (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onConfirm(transform)}
          disabled={confirming}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-pill bg-amarelo px-6 font-medium text-verde-escuro-500 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
        >
          {confirming ? "Gerando…" : "Gerar figurinha"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={confirming}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-pill border border-verde-500 px-6 font-medium text-verde-500 transition-colors hover:bg-verde-500/10 active:scale-[0.98] disabled:opacity-40"
        >
          Escolher outra
        </button>
      </div>
    </FigurinhaPanel>
  );
}
