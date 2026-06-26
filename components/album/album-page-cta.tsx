import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlbumPageCtaProps {
  label: string;
  href: string;
  inFlipBook?: boolean;
  className?: string;
}

/** CTA pill abaixo do grid — Figma 360:147 (251×48, amarelo, seta). */
export function AlbumPageCta({ label, href, inFlipBook, className }: AlbumPageCtaProps) {
  const isExternal = /^https?:\/\//i.test(href);

  const classes = cn(
    "inline-flex max-w-full items-center justify-center gap-2.5 rounded-pill bg-amarelo",
    "font-medium text-verde-escuro-500 transition-colors hover:brightness-95",
    inFlipBook ? "px-6 py-2 text-sm sm:px-8 sm:py-2 sm:text-base" : "px-10 py-2 text-xl",
    className,
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        <span className="truncate">{label}</span>
        <ArrowUpRight className={cn("shrink-0", inFlipBook ? "size-6" : "size-8")} aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      <span className="truncate">{label}</span>
      <ArrowUpRight className={cn("shrink-0", inFlipBook ? "size-6" : "size-8")} aria-hidden />
    </Link>
  );
}
