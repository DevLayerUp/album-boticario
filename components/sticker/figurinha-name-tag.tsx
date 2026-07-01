import { rarityTheme } from "@/lib/rarity";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import { cn } from "@/lib/utils";
import { StickerFormattedNameTag } from "@/components/sticker/sticker-formatted-text";

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
  /** Tag da figurinha personalizada do usuário (template "Minha Figurinha"). */
  profile?: boolean;
  className?: string;
}

export function FigurinhaNameTag({
  name,
  bgColor,
  fullWidth,
  compact = false,
  overlay = false,
  pinBottom = false,
  profile = false,
  className,
}: FigurinhaNameTagProps) {
  const label = stickerTextToPlain(name);
  if (!label) return null;

  const isAlbumSlot = compact && pinBottom;

  const tag = (
    <span
      className={cn(
        "flex items-end justify-center text-center font-display font-bold uppercase text-white",
        profile
          ? "max-w-full min-h-0 line-clamp-2 overflow-hidden rounded-card rounded-br-none px-1.5 py-0.5 text-[8px] leading-[1.1] sm:px-2 sm:py-1 sm:text-[9px] sm:leading-[1.12] md:px-2.5 md:py-1 md:text-[10px] [&_em]:text-[0.92em] [&_em]:leading-[1.05]"
          : isAlbumSlot
            ? "w-full line-clamp-2 rounded-none rounded-tl-input px-1.5 py-0.5 text-[7px] leading-[1.15] sm:px-2 sm:py-1 sm:text-[8px] md:text-[9px]"
            : compact
              ? "max-w-full line-clamp-2 rounded-card rounded-br-none px-1.5 py-0.5 text-[7px] leading-[1.15] sm:px-2 sm:py-1 sm:text-[8px] md:text-[9px] lg:text-[10px]"
              : "rounded-card rounded-br-none px-3 py-1.5 text-sm leading-tight sm:px-4 sm:py-2 sm:text-lg sm:leading-8",
        fullWidth && !isAlbumSlot && !profile && "w-full",
      )}
      style={{ backgroundColor: bgColor ?? rarityTheme("common").nameTag }}
    >
      <StickerFormattedNameTag text={name} uppercasePlain />
    </span>
  );

  if (!overlay) return tag;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10 flex justify-center",
        profile
          ? "inset-x-2 bottom-0 translate-y-1 items-end sm:inset-x-3 sm:translate-y-1.5"
          : isAlbumSlot
            ? "inset-x-0 bottom-0"
            : compact
              ? "inset-x-1 bottom-[4%] sm:inset-x-1.5 sm:bottom-[6%] md:bottom-[8%]"
              : "inset-x-2 bottom-[7%] sm:inset-x-3 sm:bottom-[9%] md:bottom-12",
        className,
      )}
    >
      {tag}
    </div>
  );
}
