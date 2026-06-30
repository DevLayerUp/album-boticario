"use client";

import Image from "next/image";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";
import { FlipBookLink } from "./flip-book-link";

export type PageSide = "left" | "right";

const FGB_URL = "https://fundacaogrupoboticario.org.br/";

/** Logos decorativos no rodapé — somente páginas esquerda. */
export function AlbumLeftPageLogos({ inFlipBook }: { inFlipBook?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        inFlipBook ? "gap-4 sm:gap-6" : "gap-5 sm:gap-7",
      )}
    >
      {inFlipBook ? (
        <FlipBookLink
          href={FGB_URL}
          ariaLabel="Fundação Grupo Boticário — site oficial"
          className="shrink-0"
        >
          <Image
            src={dashboardAssets.auth.logoFgb}
            alt="Fundação Grupo Boticário"
            width={125}
            height={27}
            className={cn(
              "h-auto w-auto object-contain",
              "max-h-[22px] max-w-[108px] sm:max-h-[27px] sm:max-w-[125px]",
            )}
          />
        </FlipBookLink>
      ) : (
        <a
          href={FGB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fundação Grupo Boticário — site oficial"
          className="shrink-0"
        >
          <Image
            src={dashboardAssets.auth.logoFgb}
            alt="Fundação Grupo Boticário"
            width={125}
            height={27}
            className={cn(
              "h-auto w-auto object-contain",
              "max-h-[27px] max-w-[125px]",
            )}
          />
        </a>
      )}
      <span
        aria-hidden
        className={cn("w-px shrink-0 bg-white/25", inFlipBook ? "h-4 sm:h-5" : "h-5")}
      />
      <Image
        src={dashboardAssets.auth.logoBranco}
        alt="Fãs da Natureza"
        width={66}
        height={33}
        className={cn(
          "h-auto w-auto object-contain",
          inFlipBook ? "max-h-[26px] max-w-[56px] sm:max-h-[33px] sm:max-w-[66px]" : "max-h-[33px] max-w-[66px]",
        )}
      />
    </div>
  );
}

/** Número da página — esquerda: canto inferior esquerdo · direita: canto inferior direito. */
export function AlbumPageNumber({
  pageNumber,
  inFlipBook,
}: {
  pageNumber: number;
  inFlipBook?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display font-bold leading-none tracking-wide text-white/60",
        inFlipBook ? "text-base sm:text-lg" : "text-lg sm:text-xl",
      )}
      aria-hidden
    >
      {String(pageNumber).padStart(2, "0")}
    </span>
  );
}

interface AlbumPageShellProps {
  side: PageSide;
  pageNumber: number;
  inFlipBook?: boolean;
  /** Permite rolar o conteúdo dentro da página (ex.: redes sociais no mobile). */
  scrollableContent?: boolean;
  children: React.ReactNode;
}

export function AlbumPageShell({
  side,
  pageNumber,
  inFlipBook = false,
  scrollableContent = false,
  children,
}: AlbumPageShellProps) {
  const decoration =
    side === "left" ? dashboardAssets.album.left : dashboardAssets.album.right;

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
          backgroundPosition: side === "left" ? "right bottom" : "left bottom",
          backgroundSize: "auto",
          filter: "brightness(0.8)",
        }}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            scrollableContent && inFlipBook
              ? "justify-start overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
              : "justify-center overflow-hidden",
          )}
        >
          <div
            className={cn(
              "min-h-0 w-full",
              scrollableContent && inFlipBook
                ? "overflow-visible py-1"
                : "max-h-full overflow-hidden",
            )}
          >
            {children}
          </div>
        </div>

        <div
          className={cn(
            "mt-auto shrink-0",
            inFlipBook ? "px-4 pb-4 pt-2 sm:px-[8%] sm:pb-5 sm:pt-3" : "px-6 pb-6 pt-3 sm:px-[8%]",
          )}
        >
          {side === "left" ? (
            <div className="relative flex items-end justify-center">
              <div
                className={cn(
                  "absolute bottom-0 left-0",
                )}
              >
                <AlbumPageNumber pageNumber={pageNumber} inFlipBook={inFlipBook} />
              </div>
              <AlbumLeftPageLogos inFlipBook={inFlipBook} />
            </div>
          ) : (
            <div className="flex justify-end">
              <AlbumPageNumber pageNumber={pageNumber} inFlipBook={inFlipBook} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
