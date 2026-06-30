"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const STICKER_W = 352;
const STICKER_H = 503;

interface AlbumUserStickerImageProps {
  src: string;
  alt: string;
  /** Dentro do react-pageflip — <img> nativo evita bug de fill no mobile. */
  inFlipBook?: boolean;
  className?: string;
}

export function AlbumUserStickerImage({
  src,
  alt,
  inFlipBook = false,
  className,
}: AlbumUserStickerImageProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/30",
        inFlipBook ? "h-[286px] w-[200px]" : "aspect-[352/503] w-[min(100%,280px)]",
        className,
      )}
    >
      {inFlipBook ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={STICKER_W}
          height={STICKER_H}
          className="h-full w-full object-cover"
          decoding="async"
          draggable={false}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 200px, 280px"
          priority
        />
      )}
    </div>
  );
}
