import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/lib/ranking";
import { rankingDisplayName } from "./ranking-utils";

interface RankingAvatarProps {
  entry: RankingEntry;
  size?: number;
  sizeClassName?: string;
  ringClassName?: string;
  className?: string;
}

export function RankingAvatar({
  entry,
  size,
  sizeClassName,
  ringClassName,
  className,
}: RankingAvatarProps) {
  const src = entry.sticker_url || entry.avatar_url;
  const initials = rankingDisplayName(entry).slice(0, 1).toUpperCase();
  const dimensionStyle = sizeClassName ? undefined : { width: size, height: size };

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-verde-100",
        sizeClassName,
        ringClassName,
        className,
      )}
      style={dimensionStyle}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={size ? `${size}px` : "257px"}
        />
      ) : (
        <span
          className="flex size-full items-center justify-center bg-verde-500 font-bold text-white"
          style={size ? { fontSize: size * 0.36 } : undefined}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
