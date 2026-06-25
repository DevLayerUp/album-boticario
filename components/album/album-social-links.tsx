import Image from "next/image";
import type { AlbumSocialLink } from "@/lib/album-templates";
import { cn } from "@/lib/utils";

interface AlbumSocialLinksProps {
  links: AlbumSocialLink[];
  className?: string;
  size?: "sm" | "md";
}

export function AlbumSocialLinks({ links, className, size = "md" }: AlbumSocialLinksProps) {
  const visible = links.filter(
    (link) =>
      link.enabled !== false &&
      link.href.trim().length > 0 &&
      (link.icon_url?.trim().length ?? 0) > 0,
  );
  if (visible.length === 0) return null;

  const iconSize = size === "sm" ? 44 : 52;

  return (
    <nav
      aria-label="Redes sociais"
      className={cn("flex flex-wrap items-center justify-center gap-2.5 sm:gap-3", className)}
    >
      {visible.map((link, index) => (
        <a
          key={`${link.label}-${index}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="block shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-verde-escuro-500"
        >
          <Image
            src={link.icon_url!}
            alt=""
            width={iconSize}
            height={iconSize}
            className={cn(
              "h-auto w-auto object-contain",
              size === "sm" ? "max-h-10 max-w-10 sm:max-h-11 sm:max-w-11" : "max-h-11 max-w-11 sm:max-h-[52px] sm:max-w-[52px] 2xl:max-h-14 2xl:max-w-14",
            )}
          />
        </a>
      ))}
    </nav>
  );
}
