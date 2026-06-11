import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  hint?: string;
  href?: string;
}

/**
 * Card de estatística da coleção (Descobertas / Repetidas / Faltam).
 * Tema gold — fundo surface-gold, acento configurável por prop.
 */
export function CollectionStatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
  href,
}: CollectionStatCardProps) {
  const inner = (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-block border border-gold-500/20 bg-surface-gold px-5 py-4",
        "transition-[transform,box-shadow] duration-200",
        href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-paper",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700/70">
          {label}
        </span>
        <span
          className="flex size-8 items-center justify-center rounded-chip bg-verde-100"
          style={{ color: accent }}
          aria-hidden
        >
          <Icon size={15} strokeWidth={2.2} />
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span
          className="font-display text-4xl font-bold leading-none"
          style={{ color: accent }}
        >
          {value.toLocaleString("pt-BR")}
        </span>
      </div>

      {hint && (
        <p className="text-[11px] leading-snug text-verde-escuro-400/70">{hint}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
