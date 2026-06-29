"use client";

import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STICKER_CARD, STICKER_FRAME } from "@/lib/sticker-card";

interface StickerUploadCardProps {
  dragOver?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
}

export function StickerUploadCard({
  dragOver = false,
  loading = false,
  loadingMessage = "Removendo fundo…",
  className,
}: StickerUploadCardProps) {
  const { width, height, borderRadius } = STICKER_CARD;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-white shadow-2xl shadow-black/25 transition-transform duration-200",
        dragOver && "scale-[1.01]",
        className,
      )}
      style={{
        width,
        height,
        borderRadius,
        border: `${STICKER_FRAME.borderWidth}px solid ${STICKER_FRAME.color}`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-300"
        style={{
          width: width - 48,
          height: height - 120,
          borderRadius: borderRadius - 4,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="size-10 animate-spin text-verde-500" aria-hidden />
            <span className="text-sm font-medium text-verde-escuro-500">
              {loadingMessage}
            </span>
          </>
        ) : (
          <>
            <FileUp
              className={cn(
                "size-10 text-neutral-400 transition-colors duration-200",
                dragOver && "text-verde-500",
              )}
              strokeWidth={1.5}
              aria-hidden
            />
            <span
              className={cn(
                "text-sm font-bold uppercase tracking-wide text-verde-500",
                dragOver && "text-verde-600",
              )}
            >
              Carregar imagem
            </span>
          </>
        )}
      </div>
    </div>
  );
}
