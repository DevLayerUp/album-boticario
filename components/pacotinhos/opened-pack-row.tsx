"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { rarityColor } from "@/lib/rarity";
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
  const names = entries.map((ps) => ps.stickers.name).join(" • ");

  return (
    <div className="flex min-h-28 flex-col gap-4 rounded-[32px] border border-verde-400 bg-verde-100 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6 sm:pl-8 sm:pr-[51px]">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-11">
        <PackageOpen
          aria-hidden
          className="size-10 shrink-0 text-verde-400"
          strokeWidth={1.5}
        />

        <span className="w-fit rounded-pill border border-verde-400 px-[30px] py-2 text-xl font-medium text-verde-400">
          {SOURCE_LABEL[pack.source] ?? pack.source}
        </span>

        {preview.length > 0 && (
          <div className="flex items-center gap-4">
            {preview.map((ps) => {
              const sticker = ps.stickers;
              const slug = sticker.rarities?.slug ?? "common";
              const color = rarityColor(slug, sticker.rarities?.color_hex);
              return (
                <div
                  key={ps.position}
                  className="relative h-[68px] w-12 shrink-0 overflow-hidden rounded-lg border-2"
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
                    <div className="flex size-full items-center justify-center bg-verde-100 text-xs text-verde-400">
                      ?
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {names && (
          <p className="min-w-0 truncate text-xl font-medium text-verde-escuro-500 sm:max-w-md lg:max-w-xl">
            {names}
          </p>
        )}
      </div>

      <p className="shrink-0 text-xl font-medium text-verde-400 sm:text-right">
        {formatOpenedRelative(pack.opened_at)}
      </p>
    </div>
  );
}
