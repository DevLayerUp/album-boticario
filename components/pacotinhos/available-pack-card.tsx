"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SOURCE_LABEL, formatPackDate } from "./shared";
import type { Pack } from "./types";

interface AvailablePackCardProps {
  pack: Pack;
  packImageUrl: string;
  index: number;
  onOpen: () => void;
  layout?: "carousel" | "grid";
}

export function AvailablePackCard({
  pack,
  packImageUrl,
  index,
  onOpen,
  layout = "grid",
}: AvailablePackCardProps) {
  const inCarousel = layout === "carousel";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={
        inCarousel
          ? "flex w-full flex-col items-center gap-2 rounded-[16px] border border-verde-400 bg-verde-100 px-2.5 pb-2.5 pt-2 sm:gap-2.5 sm:rounded-[18px] sm:px-3 sm:pb-3 sm:pt-2.5 2xl:gap-3.5 2xl:rounded-[24px] 2xl:px-6 2xl:pb-5 2xl:pt-4"
          : "mx-auto flex w-full max-w-[min(100%,200px)] flex-col items-center gap-2 rounded-[16px] border border-verde-400 bg-verde-100 px-3 pb-3 pt-2.5 sm:max-w-[220px] sm:gap-2.5 sm:rounded-[18px] sm:px-4 sm:pb-4 sm:pt-3 lg:max-w-[240px] 2xl:max-w-[315px] 2xl:gap-3.5 2xl:rounded-[24px] 2xl:px-6 2xl:pb-5 2xl:pt-4"
      }
    >
      <div
        className={
          inCarousel
            ? "relative aspect-[392/560] w-full overflow-hidden rounded-lg border-2 border-white shadow-sm 2xl:rounded-xl 2xl:border-4"
            : "relative aspect-[392/560] w-full max-w-[min(60vw,120px)] overflow-hidden rounded-lg border-2 border-white shadow-sm sm:max-w-[130px] md:max-w-[140px] lg:max-w-[150px] 2xl:max-w-[255px] 2xl:rounded-xl 2xl:border-4"
        }
      >
        <Image
          src={packImageUrl}
          alt="Pacotinho"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 140px, 255px"
          priority={index === 0}
          unoptimized={packImageUrl.endsWith(".gif")}
        />
      </div>

      <span className="rounded-pill border border-verde-400 px-3 py-0.5 text-xs font-medium text-verde-400 sm:px-4 sm:py-1 sm:text-sm lg:text-base 2xl:px-6 2xl:text-lg">
        {SOURCE_LABEL[pack.source] ?? pack.source}
      </span>

      <p className="text-center text-xs leading-snug text-verde-escuro-500 sm:text-sm 2xl:text-lg">
        Recebida em {formatPackDate(pack.created_at)}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className={
          inCarousel
            ? "w-full rounded-pill bg-verde-500 px-3 py-1.5 text-xs font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 hover:shadow-md hover:shadow-verde-500/20 active:scale-[0.98] sm:text-sm 2xl:px-8 2xl:py-2 2xl:text-lg"
            : "w-full max-w-[min(60vw,120px)] rounded-pill bg-verde-500 px-4 py-1.5 text-xs font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 hover:shadow-md hover:shadow-verde-500/20 active:scale-[0.98] sm:max-w-[130px] sm:px-5 sm:text-sm lg:max-w-[150px] 2xl:max-w-[255px] 2xl:px-8 2xl:py-2 2xl:text-lg"
        }
      >
        Abrir pacotinho
      </button>
    </motion.article>
  );
}
