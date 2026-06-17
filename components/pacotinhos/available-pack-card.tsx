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
      className="mx-auto flex w-full max-w-[min(100%,400px)] flex-col items-center gap-4 rounded-[24px] border border-verde-400 bg-verde-100 px-5 pb-6 pt-5 sm:max-w-[440px] sm:gap-5 sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-6 lg:max-w-[484px] lg:gap-6 lg:rounded-[32px] lg:px-10 lg:pb-9 lg:pt-7"
    >
      <div className="relative aspect-[392/560] w-full max-w-[min(88vw,280px)] overflow-hidden rounded-2xl border-[5px] border-white shadow-sm xs:max-w-[300px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[360px] xl:max-w-[392px]">
        <Image
          src={packImageUrl}
          alt="Pacotinho"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 320px, 392px"
          priority={index === 0}
          unoptimized={packImageUrl.endsWith(".gif")}
        />
      </div>

      <span className="rounded-pill border border-verde-400 px-5 py-1.5 text-base font-medium text-verde-400 sm:px-6 sm:py-2 sm:text-lg lg:px-[30px] lg:text-xl">
        {SOURCE_LABEL[pack.source] ?? pack.source}
      </span>

      <p className="text-center text-base leading-snug text-verde-escuro-500 sm:text-lg lg:text-[22px]">
        Recebida em {formatPackDate(pack.created_at)}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="w-full max-w-[min(88vw,280px)] rounded-pill bg-verde-500 px-8 py-2 text-base font-medium text-white transition-colors hover:bg-verde-600 sm:max-w-[320px] sm:px-10 sm:py-2.5 sm:text-lg lg:max-w-[392px] lg:text-xl"
      >
        Abrir pacotinho
      </button>
    </motion.article>
  );
}
