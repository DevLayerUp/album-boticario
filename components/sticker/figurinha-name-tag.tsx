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
  className?: string;
}

export function FigurinhaNameTag({
  name,
  bgColor,
  fullWidth,
  compact = false,
  overlay = false,
  className,
}: FigurinhaNameTagProps) {
  const label = name.trim();
  if (!label) return null;

  const tag = (
    <span
      className={cn(
        "flex items-end justify-center rounded-card rounded-br-none text-center font-display font-bold uppercase text-white",
        compact
          ? "max-w-full px-1.5 py-0.5 text-[7px] leading-[1.1] sm:px-2 sm:py-1 sm:text-[8px] md:text-[9px] lg:text-[10px]"
          : "px-3 py-1.5 text-sm leading-tight sm:px-4 sm:py-2 sm:text-lg sm:leading-8",
        fullWidth && "w-full",
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
        compact
          ? "inset-x-1 bottom-[6%] sm:inset-x-1.5 sm:bottom-[8%] md:bottom-[10%]"
          : "inset-x-2 bottom-[10%] sm:inset-x-3 sm:bottom-[12%] md:bottom-16",
        className,
      )}
    >
      {tag}
    </div>
  );
}
