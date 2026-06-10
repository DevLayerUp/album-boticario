import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  href: string;
  icon: LucideIcon;
}

/**
 * Card de estatística da dashboard (figurinhas, pacotinhos, álbum, trocas).
 * Estado padrão "soft" (verde-claro) que vira "solid" (verde-escuro) no hover.
 */
export function StatCard({ label, value, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[120px] cursor-pointer flex-col justify-between rounded-block p-4",
        "bg-verde-100 text-verde-escuro-500",
        "transition-[transform,background-color,color] duration-200",
        "hover:-translate-y-0.5 hover:bg-verde-escuro-500 hover:text-verde-100",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Icon aria-hidden className="size-5" strokeWidth={2} />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {label}
          </span>
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-chip border transition-[transform,border-color] duration-200",
            "border-verde-escuro-500/25 group-hover:border-verde-100/30",
            "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          )}
        >
          <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.2} />
        </span>
      </div>
      <p className="font-display text-4xl font-bold leading-none">{value}</p>
    </Link>
  );
}
