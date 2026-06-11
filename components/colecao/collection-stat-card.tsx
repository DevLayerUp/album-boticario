import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Cor de destaque (ícone e valor) — tokens CSS ou hex */
  accent: string;
  hint?: string;
  href?: string;
}

/**
 * Stat card da coleção — tema gold, hierarquia editorial (DS-2 §8–9).
 */
export function CollectionStatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
  href,
}: CollectionStatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2} style={{ color: accent }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-verde-escuro-400">
            {label}
          </span>
        </span>
        {href && (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-chip border transition-[transform,border-color] duration-200",
              "border-gold-500/30 group-hover:border-gold-500/50",
              "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            )}
          >
            <ArrowUpRight aria-hidden className="size-4 text-gold-700" strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-4xl font-bold leading-none" style={{ color: accent }}>
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-xs text-verde-escuro-capa/55">{hint}</p>
        )}
      </div>
    </>
  );

  const className = cn(
    "group flex min-h-[120px] flex-col justify-between rounded-block border border-gold-500/20 p-4",
    "bg-surface-gold/80 shadow-paper transition-[transform,background-color] duration-200",
    href && "cursor-pointer hover:-translate-y-0.5 hover:bg-surface-gold hover:border-gold-500/35",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
