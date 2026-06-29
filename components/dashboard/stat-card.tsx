import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  href: string;
  icon: LucideIcon;
  /** album — verde escuro + barra de progresso (Figma 396:361) */
  variant?: "album" | "soft";
  /** 0–100; exibido apenas em `variant="album"`. */
  progress?: number;
}

function StatProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="relative h-[22px] w-full shrink-0" aria-hidden>
      <div className="absolute top-1/2 right-1.5 left-1.5 h-[3px] -translate-y-1/2 rounded-full bg-verde-100/35" />
      <div
        className="absolute top-1/2 left-1.5 h-[3px] -translate-y-1/2 rounded-full bg-verde-genz transition-[width] duration-300"
        style={{ width: `calc((100% - 12px) * ${clamped / 100})` }}
      />
    </div>
  );
}

/**
 * Cards de estatística da dashboard — layout Figma node 396:336.
 * Cards soft: verde-100 no repouso; hover com verde-200 + borda (Figma 396:337).
 */
export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  variant = "soft",
  progress,
}: StatCardProps) {
  const isAlbum = variant === "album";

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-40 cursor-pointer flex-col justify-between rounded-block border p-4",
        "transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5",
        isAlbum
          ? "border-transparent bg-verde-escuro-500 text-verde-100 hover:bg-verde-escuro-400"
          : [
              "border-transparent bg-verde-100 text-verde-escuro-500",
              "hover:border-verde-escuro-500 hover:bg-verde-200",
            ],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-4">
          <Icon
            aria-hidden
            className="size-[30px] shrink-0"
            strokeWidth={isAlbum ? 1.75 : 2}
          />
          <span className="truncate text-xl font-medium uppercase leading-7">
            {label}
          </span>
        </span>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-chip border p-1",
            "transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            isAlbum ? "border-verde-100" : "border-verde-escuro-500",
          )}
        >
          <ArrowUpRight
            aria-hidden
            className={cn("size-8", isAlbum ? "text-verde-100" : "text-verde-escuro-500")}
            strokeWidth={2}
          />
        </span>
      </div>

      {isAlbum && progress !== undefined ? (
        <StatProgressBar percent={progress} />
      ) : null}

      <p className="font-display text-5xl font-bold leading-[1.4]">{value}</p>
    </Link>
  );
}
