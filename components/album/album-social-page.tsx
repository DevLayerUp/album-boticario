"use client";

import Image from "next/image";
import { parseSocialPageData } from "@/lib/album-templates";
import { cn } from "@/lib/utils";
import type { AlbumPageProps } from "./album-page";
import { AlbumSocialLinks } from "./album-social-links";

function PageShell({
  side,
  children,
  inFlipBook = false,
  decoration,
}: {
  side: AlbumPageProps["side"];
  children: React.ReactNode;
  inFlipBook?: boolean;
  decoration: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden bg-verde-escuro-500",
        inFlipBook
          ? cn(
              "h-full",
              side === "left"
                ? "rounded-l-card rounded-r-none"
                : "rounded-r-card rounded-l-none",
            )
          : cn(
              "min-h-[480px]",
              side === "left"
                ? "rounded-card md:rounded-r-none"
                : "rounded-card md:rounded-l-none",
            ),
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${decoration})`,
          backgroundPosition: side === "left" ? "left bottom" : "right bottom",
          backgroundSize: "auto",
          filter: "brightness(0.8)",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

export function AlbumSocialPage({
  page,
  side,
  inFlipBook,
  decoration,
}: AlbumPageProps & { decoration: string }) {
  const data = parseSocialPageData(page.content);
  const imageUrl = data.image_url ?? page.background_url ?? null;
  const title = data.title ?? page.title;

  return (
    <PageShell side={side} inFlipBook={inFlipBook} decoration={decoration}>
      <div
        className={cn(
          "flex flex-1 flex-col",
          inFlipBook ? "px-4 py-5 sm:px-[10%] sm:py-8" : "px-6 py-8 sm:px-[10%]",
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6">
          {imageUrl ? (
            <div className="relative w-[min(88%,380px)]">
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
            <div
              className={cn(
                "max-w-[92%] text-center leading-[1.35] text-white **:text-white [&_a]:underline [&_p]:mb-2 [&_strong]:font-semibold",
                inFlipBook
                  ? "text-sm sm:text-base md:text-lg lg:text-xl"
                  : "text-base sm:text-lg md:text-xl",
              )}
              dangerouslySetInnerHTML={{ __html: data.text }}
            />
          ) : null}

          <AlbumSocialLinks
            links={data.social_links ?? []}
            size={inFlipBook ? "sm" : "md"}
            className="pt-0.5 sm:pt-1"
          />
        </div>

        <div
          className={cn(
            "mt-auto flex justify-end",
            inFlipBook ? "pt-3 sm:pt-4" : "pt-6",
          )}
        >
          <span
            className="font-display text-base font-bold text-white/60 sm:text-lg md:text-xl"
            aria-hidden
          >
            {String(page.page_number).padStart(2, "0")}
          </span>
        </div>
      </div>
    </PageShell>
  );
}
