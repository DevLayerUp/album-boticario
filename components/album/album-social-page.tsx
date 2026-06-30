"use client";

import Image from "next/image";
import { parseSocialPageData } from "@/lib/album-templates";
import { cn } from "@/lib/utils";
import type { AlbumPageProps } from "./album-page";
import { AlbumPageShell } from "./album-page-chrome";
import { AlbumSocialLinks } from "./album-social-links";
import { AlbumShareSection } from "./album-share-section";
import { FlipBookHtmlContent } from "./flip-book-link";

export function AlbumSocialPage({
  page,
  side,
  inFlipBook,
}: AlbumPageProps) {
  const data = parseSocialPageData(page.content);
  const imageUrl = data.image_url ?? page.background_url ?? null;
  const title = data.title ?? page.title;

  return (
    <AlbumPageShell
      side={side}
      pageNumber={page.page_number}
      inFlipBook={inFlipBook}
    >
      <div
        className={cn(
          "flex w-full flex-col",
          inFlipBook
            ? "min-h-full justify-center px-3 py-2 sm:px-[8%] sm:py-4"
            : "justify-center px-6 py-6 sm:px-[10%]",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            inFlipBook ? "gap-2.5 sm:gap-4" : "gap-4 sm:gap-5 md:gap-6",
          )}
        >
          {imageUrl ? (
            <div
              className={cn(
                "relative shrink-0",
                inFlipBook ? "w-[min(68%,220px)]" : "w-[min(88%,380px)]",
              )}
            >
              <Image
                src={imageUrl}
                alt={title ?? "Imagem da página"}
                width={800}
                height={800}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 88vw, 380px"
                priority={inFlipBook}
              />
            </div>
          ) : (
            <div className="flex min-h-[200px] w-[min(88%,380px)] items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5 text-sm text-white/50">
              Imagem não configurada
            </div>
          )}

          {data.text ? (
            inFlipBook ? (
              <FlipBookHtmlContent
                html={data.text}
                className={cn(
                  "max-w-[92%] text-center leading-[1.3] text-white **:text-white [&_a]:underline [&_p]:mb-1.5 [&_strong]:font-semibold",
                  inFlipBook
                    ? "text-xs sm:text-sm md:text-base"
                    : "text-base sm:text-lg md:text-xl",
                )}
              />
            ) : (
              <div
                className={cn(
                  "max-w-[92%] text-center leading-[1.35] text-white **:text-white [&_a]:underline [&_p]:mb-2 [&_strong]:font-semibold",
                  "text-base sm:text-lg md:text-xl",
                )}
                dangerouslySetInnerHTML={{ __html: data.text }}
              />
            )
          ) : null}

          <AlbumSocialLinks
            links={data.social_links ?? []}
            size={inFlipBook ? "sm" : "md"}
            inFlipBook={inFlipBook}
            className={cn(
              "shrink-0",
              inFlipBook ? "pb-1 pt-0.5" : "pt-0.5 sm:pt-1",
            )}
          />

          <AlbumShareSection inFlipBook={inFlipBook} />
        </div>
      </div>
    </AlbumPageShell>
  );
}
