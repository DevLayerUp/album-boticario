import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";

interface FigurinhaNameTagProps {
  name: string;
  bgColor?: string;
  fullWidth?: boolean;
  /** Posiciona sobre a figurinha — o pai deve ser `relative` */
  overlay?: boolean;
  className?: string;
}

export function FigurinhaNameTag({
  name,
  bgColor,
  fullWidth,
  overlay = false,
  className,
}: FigurinhaNameTagProps) {
  const label = name.trim();
  if (!label) return null;

  const tag = (
    <span
      className={cn(
        "flex items-end justify-center rounded-card rounded-br-none px-3 py-1.5 text-center font-display text-sm font-bold uppercase leading-tight text-white sm:px-4 sm:py-2 sm:text-lg sm:leading-8",
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
        "pointer-events-none absolute inset-x-2 bottom-[10%] z-10 flex justify-center sm:inset-x-3 sm:bottom-[12%] md:bottom-16",
        className,
      )}
    >
      {tag}
    </div>
  );
}
