"use client";

import { useEffect, useState } from "react";
import {
  getPhotoDisplayDimensions,
  type StickerPhotoTransform,
} from "@/lib/sticker-card";

interface StickerPhotoLayerProps {
  src: string;
  transform: StickerPhotoTransform;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function StickerPhotoLayer({
  src,
  transform,
  interactive = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: StickerPhotoLayerProps) {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const { width, height } = getPhotoDisplayDimensions(
        img.naturalWidth,
        img.naturalHeight,
        transform.scale,
      );
      setDims({ width, height });
    };
    img.src = src;
  }, [src, transform.scale]);

  return (
    <div
      className={[
        "relative h-full w-full",
        interactive ? "cursor-grab active:cursor-grabbing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: dims.width || undefined,
          height: dims.height || undefined,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px))`,
        }}
      />
    </div>
  );
}
