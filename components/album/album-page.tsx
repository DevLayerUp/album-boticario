"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import {
  parseLayoutData,
  type Title3Data,
  type ProfileData,
} from "@/lib/album-templates";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";

export type PageSide = "left" | "right";

export interface AlbumPageData {
  id: number;
  page_number: number;
  title: string | null;
  background_url: string | null;
  layout_template: string;
  category_id: number;
  page_type?: "sticker" | "info" | string;
  /** For sticker pages: JSON string (LayoutData). For info pages: raw HTML. */
  content?: string | null;
  album_slots: Array<{
    id: number;
    slot_number: number;
    position_x: number | null;
    position_y: number | null;
    stickers: SlotSticker | null;
  }>;
}

interface AlbumPageProps {
  page: AlbumPageData;
  side: PageSide;
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
  /** User's personalized sticker from photo upload (profiles.sticker_url) */
  userStickerUrl?: string | null;
}

function PageShell({
  side,
  children,
}: {
  side: PageSide;
  children: React.ReactNode;
}) {
  const decoration =
    side === "left" ? dashboardAssets.album.left : dashboardAssets.album.right;

  return (
    <div
      className={cn(
        "relative flex min-h-[480px] flex-col overflow-hidden bg-verde-escuro-500",
        side === "left"
          ? "rounded-card md:rounded-r-none"
          : "rounded-card md:rounded-l-none",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${decoration})`,
          backgroundPosition: side === "left" ? "right" : "left",
          backgroundSize: "auto",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function LogoBadge() {
  return (
    <div className="flex h-[53px] w-[98px] items-center justify-center rounded-input bg-white">
      <div className="relative h-10 w-20">
        <Image
          src={dashboardAssets.logo}
          alt="Fãs da Natureza"
          fill
          className="object-contain"
          sizes="80px"
        />
      </div>
    </div>
  );
}

function Title3Page({ page, side, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);

  const data  = parseLayoutData(page.content) as Title3Data;
  const title = data.title ?? page.title ?? null;
  const text  = data.text ?? null;

  return (
    <PageShell side={side}>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-10 sm:px-[10%] sm:pt-[14%]">
        {title && (
          <h2 className="font-display text-3xl font-bold leading-[1.4] text-white md:text-5xl">
            {title}
          </h2>
        )}

        {text && (
          <div
            className="mt-4 max-w-[450px] text-base leading-[1.4] text-white **:text-white [&_p]:mb-3 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 md:gap-7">
          {slots.slice(0, 3).map((slot) => {
            const stickerId = slot.stickers?.id;
            return (
              <StickerSlot
                key={slot.id}
                slotId={slot.id}
                slotNumber={slot.slot_number}
                sticker={slot.stickers}
                isPasted={pastedSlotIds.has(slot.id)}
                owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
                onPaste={onPaste}
              />
            );
          })}
        </div>

        <div className="mt-auto flex justify-center pt-10">
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

function ProfilePage({ page, side, userStickerUrl }: AlbumPageProps) {
  const data       = parseLayoutData(page.content) as ProfileData;
  const title      = data.title ?? page.title ?? "Minha Figurinha";
  const hasSticker = Boolean(userStickerUrl);

  return (
    <PageShell side={side}>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-[10%]">
        {title && (
          <h2 className="mb-8 text-center font-display text-3xl font-bold leading-[1.4] text-white md:text-4xl">
            {title}
          </h2>
        )}

        {hasSticker ? (
          <div
            className="relative overflow-hidden rounded-card shadow-2xl shadow-black/30"
            style={{ width: 200, aspectRatio: "400/550" }}
          >
            <Image
              src={userStickerUrl!}
              alt="Sua figurinha personalizada"
              fill
              className="object-cover"
              sizes="200px"
              priority
            />
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed border-white/25 bg-white/5 p-8 text-center"
            style={{ width: 200, aspectRatio: "400/550" }}
          >
            <Camera className="size-10 text-white/40" strokeWidth={1.5} />
            <p className="text-sm leading-relaxed text-white/70">
              Crie sua figurinha com sua foto para aparecer aqui.
            </p>
            <Link
              href="/figurinha"
              className="rounded-pill bg-amarelo px-5 py-2 text-sm font-semibold text-verde-escuro-500 transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95"
            >
              Criar figurinha
            </Link>
          </div>
        )}

        <div className="mt-auto flex justify-center pt-10">
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

function Grid3x3Page({ page, side, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);

  return (
    <PageShell side={side}>
      <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-[12%] sm:py-[7.5%]">
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 md:gap-x-6 md:gap-y-8">
          {slots.map((slot) => {
            const stickerId = slot.stickers?.id;
            return (
              <StickerSlot
                key={slot.id}
                slotId={slot.id}
                slotNumber={slot.slot_number}
                sticker={slot.stickers}
                isPasted={pastedSlotIds.has(slot.id)}
                owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
                onPaste={onPaste}
              />
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

export function AlbumPage(props: AlbumPageProps) {
  if (props.page.layout_template === "profile") {
    return <ProfilePage {...props} />;
  }
  if (props.page.layout_template === "title3") {
    return <Title3Page {...props} />;
  }
  return <Grid3x3Page {...props} />;
}
