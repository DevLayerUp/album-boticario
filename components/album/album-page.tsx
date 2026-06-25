"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import {
  parseLayoutData,
  type Title3Data,
  type Grid6Data,
  type ProfileData,
} from "@/lib/album-templates";
import {
  AlbumGridFrame,
  AlbumGridSlotCell,
  AlbumStickerGrid,
} from "./album-grid-frame";
import { FigurinhaNameTag } from "@/components/sticker/figurinha-name-tag";
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
  userDisplayName?: string | null;
  /** When true, fills the fixed-height flipbook page (h-full + spine-straight borders) */
  inFlipBook?: boolean;
  /** Slot a destacar/abrir colagem (deep link do estoque). */
  focusSlotId?: number | null;
}

function PageShell({
  side,
  children,
  inFlipBook = false,
}: {
  side: PageSide;
  children: React.ReactNode;
  inFlipBook?: boolean;
}) {
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
          backgroundPosition: side === "left" ? "right" : "left",
          backgroundSize: "auto",
          filter: "brightness(0.8)",
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

function Title3Page({ page, side, pastedSlotIds, ownedMap, onPaste, inFlipBook, focusSlotId }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);

  const data  = parseLayoutData(page.content) as Title3Data;
  const title = data.title ?? page.title ?? null;
  const text  = data.text ?? null;

  return (
    <PageShell side={side} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex flex-1 flex-col",
          inFlipBook
            ? "px-4 pb-4 pt-5 sm:px-[10%] sm:pb-8 sm:pt-[14%]"
            : "px-6 pb-8 pt-10 sm:px-[10%] sm:pt-[14%]",
        )}
      >
        {title && (
          <h2
            className={cn(
              "font-display font-bold leading-[1.35] text-white",
              inFlipBook ? "text-xl sm:text-3xl md:text-5xl" : "text-3xl md:text-5xl",
            )}
          >
            {title}
          </h2>
        )}

        {text && (
          <div
            className={cn(
              "max-w-[450px] leading-[1.4] text-white **:text-white [&_p]:mb-3 [&_strong]:font-semibold",
              inFlipBook ? "mt-2 text-sm sm:mt-4 sm:text-base" : "mt-4 text-base",
            )}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}

        <div
          className={cn(
            "grid grid-cols-3",
            inFlipBook ? "mt-3 gap-2 sm:mt-8 sm:gap-4 md:gap-7" : "mt-8 gap-4 md:gap-7",
          )}
        >
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
                autoOpenPaste={focusSlotId === slot.id}
              />
            );
          })}
        </div>

        <div
          className={cn(
            "mt-auto flex justify-center",
            inFlipBook ? "pt-3 max-md:hidden sm:pt-10" : "pt-10",
          )}
        >
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

function ProfilePage({ page, side, userStickerUrl, userDisplayName, inFlipBook }: AlbumPageProps) {
  const data       = parseLayoutData(page.content) as ProfileData;
  const title      = data.title ?? page.title ?? "Minha Figurinha";
  const hasSticker = Boolean(userStickerUrl);

  return (
    <PageShell side={side} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex flex-1 flex-col items-center",
          inFlipBook
            ? "px-4 py-5 sm:px-[10%] sm:py-8"
            : "px-6 py-8 sm:px-[10%]",
        )}
      >
        {title && (
          <h2
            className={cn(
              "text-center font-display font-bold leading-[1.4] text-white",
              inFlipBook ? "mb-4 text-xl sm:mb-6 sm:text-2xl md:text-3xl" : "mb-8 text-2xl md:text-3xl",
            )}
          >
            {title}
          </h2>
        )}

        <div className="flex flex-1 flex-col items-center justify-center">
          {hasSticker ? (
            <div
              className="relative overflow-hidden shadow-2xl shadow-black/30"
              style={{
                width: "clamp(160px, 38vw, 280px)",
                aspectRatio: "352 / 503",
                borderRadius: 16,
              }}
            >
              <Image
                src={userStickerUrl!}
                alt="Sua figurinha personalizada"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 38vw, 280px"
                priority
              />
              {userDisplayName ? (
                <FigurinhaNameTag name={userDisplayName} overlay />
              ) : null}
            </div>
          ) : (
            <Link
              href="/figurinha"
              className="group flex flex-col items-center gap-4 transition-transform duration-200 hover:scale-[1.01]"
              aria-label="Criar figurinha personalizada"
            >
              <div
                className="relative flex items-center justify-center bg-white shadow-2xl shadow-black/25"
                style={{
                  width: "clamp(160px, 38vw, 280px)",
                  aspectRatio: "352 / 503",
                  borderRadius: 16,
                  border: "5px solid #98D622",
                }}
              >
                <div
                  className="flex flex-col items-center justify-center gap-3 border border-dashed border-neutral-300"
                  style={{
                    width: "calc(100% - 32px)",
                    height: "calc(100% - 80px)",
                    borderRadius: 12,
                  }}
                >
                  <Camera className="size-8 text-neutral-400" strokeWidth={1.5} aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-verde-500 sm:text-xs">
                    Carregar imagem
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div
          className={cn(
            "mt-auto flex justify-center",
            inFlipBook ? "pt-4 max-md:hidden sm:pt-8" : "pt-8",
          )}
        >
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

function renderGridSlots(
  slots: AlbumPageData["album_slots"],
  limit: number,
  pastedSlotIds: Set<number>,
  ownedMap: Map<number, number>,
  onPaste: AlbumPageProps["onPaste"],
  focusSlotId?: number | null,
) {
  return [...slots]
    .sort((a, b) => a.slot_number - b.slot_number)
    .slice(0, limit)
    .map((slot) => {
      const stickerId = slot.stickers?.id;
      return (
        <AlbumGridSlotCell key={slot.id}>
          <StickerSlot
            slotId={slot.id}
            slotNumber={slot.slot_number}
            sticker={slot.stickers}
            isPasted={pastedSlotIds.has(slot.id)}
            owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
            onPaste={onPaste}
            autoOpenPaste={focusSlotId === slot.id}
          />
        </AlbumGridSlotCell>
      );
    });
}

function Grid6Page({ page, side, pastedSlotIds, ownedMap, onPaste, inFlipBook, focusSlotId }: AlbumPageProps) {
  const data  = parseLayoutData(page.content) as Grid6Data;
  const title = data.title ?? page.title ?? null;
  const text  = data.text ?? null;

  const footerContent =
    title || text ? (
      <div className={cn(inFlipBook ? "mt-2 sm:mt-4" : "mt-4")}>
        {title ? (
          <h2
            className={cn(
              "font-display font-bold leading-[1.35] text-white",
              inFlipBook ? "text-lg sm:text-2xl" : "text-2xl md:text-3xl",
            )}
          >
            {title}
          </h2>
        ) : null}
        {text ? (
          <div
            className={cn(
              "max-w-[520px] leading-[1.45] text-white **:text-white [&_p]:mb-2.5 [&_strong]:font-semibold",
              inFlipBook ? "mt-2 text-xs sm:text-sm" : "mt-3 text-sm md:text-base",
            )}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ) : null}
      </div>
    ) : null;

  return (
    <PageShell side={side} inFlipBook={inFlipBook}>
      <AlbumGridFrame
        pageNumber={page.page_number}
        inFlipBook={inFlipBook}
        afterGrid={footerContent}
      >
        <AlbumStickerGrid cols={3} rows={2}>
          {renderGridSlots(page.album_slots, 6, pastedSlotIds, ownedMap, onPaste, focusSlotId)}
        </AlbumStickerGrid>
      </AlbumGridFrame>
    </PageShell>
  );
}

/** Slot 1 = left center · slots 2–3 = top/bottom right (199×284 cards) */
function Tri3Page({ page, side, pastedSlotIds, ownedMap, onPaste, inFlipBook, focusSlotId }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);
  const [left, topRight, bottomRight] = slots;

  const cellClass = "w-[clamp(112px,34vw,199px)] shrink-0";

  function renderSlot(slot: (typeof slots)[number] | undefined) {
    if (!slot) return null;
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
        size="large"
        autoOpenPaste={focusSlotId === slot.id}
      />
    );
  }

  return (
    <PageShell side={side} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex flex-1 flex-col",
          inFlipBook ? "px-4 py-5 sm:px-[8%] sm:py-[10%]" : "px-5 py-8 sm:px-[8%] sm:py-[10%]",
        )}
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
            <div className={cellClass}>{renderSlot(left)}</div>
            <div className="flex flex-col gap-5 sm:gap-6 md:gap-8">
              <div className={cellClass}>{renderSlot(topRight)}</div>
              <div className={cellClass}>{renderSlot(bottomRight)}</div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-auto flex justify-center",
            inFlipBook ? "pt-3 max-md:hidden sm:pt-6" : "pt-6",
          )}
        >
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

function Grid3x3Page({ page, side, pastedSlotIds, ownedMap, onPaste, inFlipBook, focusSlotId }: AlbumPageProps) {
  return (
    <PageShell side={side} inFlipBook={inFlipBook}>
      <AlbumGridFrame pageNumber={page.page_number} inFlipBook={inFlipBook}>
        <AlbumStickerGrid cols={3} rows={3}>
          {renderGridSlots(page.album_slots, 9, pastedSlotIds, ownedMap, onPaste, focusSlotId)}
        </AlbumStickerGrid>
      </AlbumGridFrame>
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
  if (props.page.layout_template === "grid6") {
    return <Grid6Page {...props} />;
  }
  if (props.page.layout_template === "tri3") {
    return <Tri3Page {...props} />;
  }
  if (props.page.layout_template === "3x3") {
    return <Grid3x3Page {...props} />;
  }
  return <Grid3x3Page {...props} />;
}
