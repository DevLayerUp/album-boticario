import Image from "next/image";
import type { AlbumSocialLink } from "@/lib/album-templates";
import { cn } from "@/lib/utils";
import { FlipBookLink } from "./flip-book-link";

interface AlbumSocialLinksProps {
  links: AlbumSocialLink[];
  className?: string;
  size?: "sm" | "md";
  /** When true, links use touch-safe handlers for react-pageflip. */
  inFlipBook?: boolean;
}

export function AlbumSocialLinks({
  links,
  className,
  size = "md",
  inFlipBook = false,
}: AlbumSocialLinksProps) {
  const visible = links.filter(
    (link) =>
      link.enabled !== false &&
      link.href.trim().length > 0 &&
      (link.icon_url?.trim().length ?? 0) > 0,
  );
  if (visible.length === 0) return null;

  const iconSize = size === "sm" ? 44 : 52;
  const iconClassName = cn(
    "h-auto w-auto object-contain",
    size === "sm" ? "max-h-10 max-w-10 sm:max-h-11 sm:max-w-11" : "max-h-11 max-w-11 sm:max-h-[52px] sm:max-w-[52px] 2xl:max-h-14 2xl:max-w-14",
  );
  const linkClassName =
    "block shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-verde-escuro-500";

  return (
    <nav
      aria-label="Redes sociais"
      className={cn("flex flex-wrap items-center justify-center gap-2.5 sm:gap-3", className)}
    >
      {visible.map((link, index) => {
        const image = (
          <Image
            src={link.icon_url!}
            alt=""
            width={iconSize}
            height={iconSize}
            className={iconClassName}
          />
        );

        if (inFlipBook) {
          return (
            <FlipBookLink
              key={`${link.label}-${index}`}
              href={link.href}
              ariaLabel={link.label}
              className={linkClassName}
            >
              {image}
            </FlipBookLink>
          );
        }

        return (
          <a
            key={`${link.label}-${index}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={linkClassName}
          >
            {image}
          </a>
        );
      })}
    </nav>
  );
}
