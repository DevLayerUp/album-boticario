"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import { StickerRarityEffects } from "@/components/sticker/sticker-rarity-effects";
import { SOURCE_LABEL, formatOpenedRelative } from "./shared";
import type { OpenedPackHistory, PackSticker } from "./types";

type PackStickerEntry = PackSticker & {
  stickers: NonNullable<PackSticker["stickers"]>;
};

interface OpenedPackRowProps {
  pack: OpenedPackHistory;
}

export function OpenedPackRow({ pack }: OpenedPackRowProps) {
  const entries = pack.stickers.filter(
    (ps): ps is PackStickerEntry => Boolean(ps.stickers),
  );
  const preview = entries.slice(0, 3);
  const names = entries.map((ps) => stickerTextToPlain(ps.stickers.name)).join(" • ");

  return (
    <div className="flex min-h-0 flex-col gap-3 rounded-[20px] border border-verde-400 bg-verde-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-[24px] sm:px-5 sm:py-3.5 lg:px-6 2xl:min-h-28 2xl:gap-6 2xl:rounded-[32px] 2xl:py-6 2xl:pl-8 2xl:pr-[51px]">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6 2xl:gap-11">
        <PackageOpen
          aria-hidden
          className="size-7 shrink-0 text-verde-400 sm:size-8 2xl:size-10"
          strokeWidth={1.5}
        />

        <span className="w-fit rounded-pill border border-verde-400 px-3 py-1 text-xs font-medium text-verde-400 sm:px-4 sm:text-sm lg:text-base 2xl:px-[30px] 2xl:py-2 2xl:text-xl">
          {SOURCE_LABEL[pack.source] ?? pack.source}
        </span>

        {preview.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4">
            {preview.map((ps) => {
              const sticker = ps.stickers;
              const slug = sticker.rarities?.slug ?? "common";
              const color = rarityColor(slug, sticker.rarities?.color_hex);
              return (
                <div
                  key={ps.position}
                  className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md border-2 sm:h-14 sm:w-10 2xl:h-[68px] 2xl:w-12 2xl:rounded-lg"
                  style={{ borderColor: color }}
                >
                  {sticker.image_url ? (
                    <Image
                      src={sticker.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-verde-100 text-[10px] text-verde-400 sm:text-xs">
                      ?
                    </div>
                  )}
                  <StickerRarityEffects
                    slug={slug}
                    animationType={sticker.rarities?.animation_type}
                    color={color}
                    intensity="subtle"
                  />
                </div>
              );
            })}
          </div>
        )}

        {names && (
          <p className="min-w-0 truncate text-sm font-medium text-verde-escuro-500 sm:max-w-md sm:text-base lg:max-w-lg 2xl:max-w-xl 2xl:text-xl">
            {names}
          </p>
        )}
      </div>

      <p className="shrink-0 text-sm font-medium text-verde-400 sm:text-right sm:text-base 2xl:text-xl">
        {formatOpenedRelative(pack.opened_at)}
      </p>
    </div>
  );
}
