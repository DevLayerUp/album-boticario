import Image from "next/image";
import { STICKER_AVATAR_CROP } from "@/lib/sticker-card";
import type { ProfileAvatarVariant } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface ProfileAvatarImageProps {
  src: string;
  variant?: ProfileAvatarVariant;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Preenche avatares circulares; figurinhas recebem zoom no rosto para evitar margens laterais. */
export function ProfileAvatarImage({
  src,
  variant = "photo",
  alt = "",
  sizes,
  priority,
  className,
}: ProfileAvatarImageProps) {
  const isSticker = variant === "sticker";

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      style={
        isSticker
          ? {
              objectPosition: STICKER_AVATAR_CROP.objectPosition,
              transform: `scale(${STICKER_AVATAR_CROP.scale})`,
            }
          : undefined
      }
    />
  );
}
