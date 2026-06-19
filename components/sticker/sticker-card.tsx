import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STICKER_PHOTO_TRANSFORM,
  STICKER_CARD,
  STICKER_CARD_BG,
  STICKER_UPLOAD_ZONE,
  type StickerPhotoTransform,
} from "@/lib/sticker-card";
import { StickerPhotoLayer } from "./sticker-photo-layer";
import { StickerFrameOverlay } from "./sticker-frame-overlay";

interface StickerCardProps {
  photoSrc?: string | null;
  photoTransform?: StickerPhotoTransform;
  stickerSrc?: string | null;
  photoAlt?: string;
  className?: string;
  photoInteractive?: boolean;
  onPhotoPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPhotoPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPhotoPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export function StickerCard({
  photoSrc,
  photoTransform = DEFAULT_STICKER_PHOTO_TRANSFORM,
  stickerSrc,
  photoAlt = "Sua foto",
  className,
  photoInteractive = false,
  onPhotoPointerDown,
  onPhotoPointerMove,
  onPhotoPointerUp,
  children,
}: StickerCardProps) {
  const { width, height, borderRadius } = STICKER_CARD;

  const cardStyle = {
    width,
    height,
    borderRadius,
    aspectRatio: "345 / 493",
  } as const;

  if (stickerSrc) {
    return (
      <div
        className={cn("relative overflow-hidden shadow-2xl shadow-black/30", className)}
        style={cardStyle}
      >
        <Image
          src={stickerSrc}
          alt={photoAlt}
          fill
          className="object-cover"
          sizes={`${width * 2}px`}
          quality={100}
          unoptimized={stickerSrc.startsWith("blob:") || stickerSrc.includes("supabase")}
          priority
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden shadow-2xl shadow-black/30", className)}
      style={cardStyle}
    >
      <Image
        src={STICKER_CARD_BG}
        alt=""
        fill
        className="object-cover object-center"
        sizes={`${width * 2}px`}
        quality={100}
        unoptimized
        priority
        aria-hidden
      />

      {photoSrc ? (
        <div className="absolute inset-0 z-10">
          {photoInteractive ? (
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #9ca3af 25%, transparent 25%), linear-gradient(-45deg, #9ca3af 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #9ca3af 75%), linear-gradient(-45deg, transparent 75%, #9ca3af 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
              }}
            />
          ) : null}
          <StickerPhotoLayer
            src={photoSrc}
            transform={photoTransform}
            interactive={photoInteractive}
            onPointerDown={onPhotoPointerDown}
            onPointerMove={onPhotoPointerMove}
            onPointerUp={onPhotoPointerUp}
          />
          <StickerFrameOverlay />
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function stickerUploadZonePosition() {
  return {
    top: STICKER_UPLOAD_ZONE.top,
    left: STICKER_UPLOAD_ZONE.left,
  };
}
