"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  STICKER_PHOTO,
  getInitialPhotoTransform,
  type StickerPhotoTransform,
} from "@/lib/sticker-card";
import {
  FigurinhaOutlineButton,
  FigurinhaPrimaryButton,
} from "./figurinha-actions";
import { FigurinhaCardScaler } from "./figurinha-card-scaler";
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
      <div className="flex w-full flex-col items-center gap-8">
        <FigurinhaCardScaler>
          <StickerCard />
        </FigurinhaCardScaler>
        <p className="text-sm text-white/70">Preparando o recorte…</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <FigurinhaCardScaler>
        <StickerCard
          photoSrc={cutoutSrc}
          photoTransform={transform}
          photoAlt="Ajuste da figurinha"
          photoInteractive
          onPhotoPointerDown={handlePointerDown}
          onPhotoPointerMove={handlePointerMove}
          onPhotoPointerUp={handlePointerUp}
        />
      </FigurinhaCardScaler>

      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateScale(-0.1)}
            disabled={confirming || transform.scale <= STICKER_PHOTO.minScale}
            aria-label="Diminuir foto"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden />
          </button>

          <div className="flex-1 space-y-1">
            <label
              htmlFor="photo-scale"
              className="text-xs font-medium uppercase tracking-wide text-white/80"
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
              className="h-2 w-full cursor-pointer accent-amarelo"
            />
          </div>

          <button
            type="button"
            onClick={() => updateScale(0.1)}
            disabled={confirming || transform.scale >= STICKER_PHOTO.maxScale}
            aria-label="Aumentar foto"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-white/70">
          <span>{Math.round(transform.scale * 100)}%</span>
          <button
            type="button"
            onClick={() => {
              if (initialTransformRef.current) {
                setTransform(initialTransformRef.current);
              }
            }}
            disabled={confirming}
            className="inline-flex cursor-pointer items-center gap-1.5 text-white/90 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Redefinir
          </button>
        </div>
      </div>

      <p className="max-w-sm text-center text-xs text-white/60">
        Arraste a foto no card para reposicionar.
      </p>

      {error ? (
        <p role="alert" className="text-center text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex w-full max-w-sm flex-col gap-3">
        <FigurinhaPrimaryButton
          onClick={() => onConfirm(transform)}
          disabled={confirming}
          className="w-full"
        >
          {confirming ? "Gerando…" : "Gerar figurinha"}
        </FigurinhaPrimaryButton>
        <FigurinhaOutlineButton onClick={onBack} disabled={confirming}>
          Escolher outra
        </FigurinhaOutlineButton>
      </div>
    </div>
  );
}
