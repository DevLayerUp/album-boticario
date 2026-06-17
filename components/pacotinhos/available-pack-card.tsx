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
}

export function AvailablePackCard({
  pack,
  packImageUrl,
  index,
  onOpen,
}: AvailablePackCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="mx-auto flex w-full max-w-[min(100%,260px)] flex-col items-center gap-2.5 rounded-[20px] border border-verde-400 bg-verde-100 px-4 pb-4 pt-3.5 sm:max-w-[285px] sm:gap-3 sm:rounded-[22px] sm:px-5 sm:pb-5 sm:pt-4 lg:max-w-[315px] lg:gap-3.5 lg:rounded-[24px] lg:px-6 lg:pb-5 lg:pt-4"
    >
      <div className="relative aspect-[392/560] w-full max-w-[min(72vw,180px)] overflow-hidden rounded-xl border-4 border-white shadow-sm xs:max-w-[195px] sm:max-w-[210px] md:max-w-[220px] lg:max-w-[235px] xl:max-w-[255px]">
        <Image
          src={packImageUrl}
          alt="Pacotinho"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 210px, 255px"
          priority={index === 0}
          unoptimized={packImageUrl.endsWith(".gif")}
        />
      </div>

      <span className="rounded-pill border border-verde-400 px-4 py-1 text-sm font-medium text-verde-400 sm:px-5 sm:py-1.5 sm:text-base lg:px-6 lg:text-lg">
        {SOURCE_LABEL[pack.source] ?? pack.source}
      </span>

      <p className="text-center text-sm leading-snug text-verde-escuro-500 sm:text-base lg:text-lg">
        Recebida em {formatPackDate(pack.created_at)}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="w-full max-w-[min(72vw,180px)] rounded-pill bg-verde-500 px-6 py-1.5 text-sm font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 hover:shadow-md hover:shadow-verde-500/20 active:scale-[0.98] sm:max-w-[210px] sm:px-8 sm:py-2 sm:text-base lg:max-w-[255px] lg:text-lg"
      >
        Abrir pacotinho
      </button>
    </motion.article>
  );
}
