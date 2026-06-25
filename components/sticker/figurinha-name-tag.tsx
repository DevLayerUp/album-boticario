import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";

interface FigurinhaNameTagProps {
  name: string;
  bgColor?: string;
  fullWidth?: boolean;
  /** Texto menor para slots compactos (ex.: álbum). */
  compact?: boolean;
  /** Posiciona sobre a figurinha — o pai deve ser `relative` */
  overlay?: boolean;
  /** Cola na base do card (slots do álbum) — evita sobrepor ícone central. */
  pinBottom?: boolean;
  className?: string;
}

export function FigurinhaNameTag({
  name,
  bgColor,
  fullWidth,
  compact = false,
  overlay = false,
  pinBottom = false,
  className,
}: FigurinhaNameTagProps) {
  const label = name.trim();
  if (!label) return null;

  const isAlbumSlot = compact && pinBottom;

  const tag = (
    <span
      className={cn(
        "flex items-end justify-center text-center font-display font-bold uppercase text-white",
        isAlbumSlot
          ? "w-full line-clamp-2 rounded-none rounded-tl-input px-1.5 py-0.5 text-[7px] leading-[1.15] sm:px-2 sm:py-1 sm:text-[8px] md:text-[9px]"
          : compact
            ? "max-w-full line-clamp-2 rounded-card rounded-br-none px-1.5 py-0.5 text-[7px] leading-[1.15] sm:px-2 sm:py-1 sm:text-[8px] md:text-[9px] lg:text-[10px]"
            : "rounded-card rounded-br-none px-3 py-1.5 text-sm leading-tight sm:px-4 sm:py-2 sm:text-lg sm:leading-8",
        fullWidth && !isAlbumSlot && "w-full",
      )}
      style={{ backgroundColor: bgColor ?? rarityTheme("common").nameTag }}
    >
      {label}
    </span>
  );

  if (!overlay) return tag;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10 flex justify-center",
        isAlbumSlot
          ? "inset-x-0 bottom-0"
          : compact
            ? "inset-x-1 bottom-[6%] sm:inset-x-1.5 sm:bottom-[8%] md:bottom-[10%]"
            : "inset-x-2 bottom-[10%] sm:inset-x-3 sm:bottom-[12%] md:bottom-16",
        className,
      )}
    >
      {tag}
    </div>
  );
}
