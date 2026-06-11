import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionStatCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
  href?: string;
}

/**
 * Stat card tema gold — Design System FGB §4 (Stat card, variante soft).
 */
export function CollectionStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "var(--color-verde-escuro-500)",
  href,
}: CollectionStatCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-gold-700/80">
          <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2} />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {label}
          </span>
        </span>
        {href && (
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-chip border border-gold-500/30",
              "transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            )}
          >
            <ArrowUpRight aria-hidden className="size-4 text-gold-700" strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div>
        <p
          className="font-display text-4xl font-bold leading-none"
          style={{ color: accent }}
        >
          {value}
        </p>
        {hint && (
          <span className="mt-1 block text-[10px] text-gold-700/60">{hint}</span>
        )}
      </div>
    </>
  );

  const className = cn(
    "group flex min-h-[120px] flex-col justify-between rounded-block border border-gold-500/25 bg-surface-gold p-4",
    href && "cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
