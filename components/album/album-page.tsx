"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Camera } from "lucide-react";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import {
  parseLayoutData,
  type Title3Data,
  type Grid6Data,
  type Grid6CtaData,
  ALBUM_GRID6_CTA_CARD,
  type Duo2Data,
  type ProfileData,
  ALBUM_DUO2_CARD,
  ALBUM_DUO2_DESIGN,
  ALBUM_GRID_CARD,
} from "@/lib/album-templates";
import {
  AlbumDuo2Scaler,
  AlbumGridFrame,
  AlbumGridSlotCell,
  AlbumStickerGrid,
} from "./album-grid-frame";
import { FigurinhaNameTag } from "@/components/sticker/figurinha-name-tag";
import { cn } from "@/lib/utils";
import { AlbumPageShell, type PageSide } from "./album-page-chrome";
import { AlbumSocialPage } from "./album-social-page";
import { AlbumPageCta } from "./album-page-cta";
import { FlipBookLink, FlipBookHtmlContent } from "./flip-book-link";

export type { PageSide };

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

export interface AlbumPageProps {
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

type AlbumSlotEntry = AlbumPageData["album_slots"][number];

/** Slot com figurinha cadastrada no admin (sem sticker → não renderiza no álbum). */
function isAssignedAlbumSlot(slot: AlbumSlotEntry) {
  return slot.stickers != null;
}

function getAssignedAlbumSlots(slots: AlbumSlotEntry[], limit?: number) {
  const sorted = [...slots].sort((a, b) => a.slot_number - b.slot_number);
  const assigned = sorted.filter(isAssignedAlbumSlot);
  return limit != null ? assigned.slice(0, limit) : assigned;
}

function albumGridRows(slotCount: number, cols: number) {
  if (slotCount <= 0) return 0;
  return Math.ceil(slotCount / cols);
}

function PageShell({
  side,
  pageNumber,
  children,
  inFlipBook = false,
}: {
  side: PageSide;
  pageNumber: number;
  children: React.ReactNode;
  inFlipBook?: boolean;
}) {
  return (
    <AlbumPageShell side={side} pageNumber={pageNumber} inFlipBook={inFlipBook}>
      {children}
    </AlbumPageShell>
  );
}

function Title3Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const assignedSlots = getAssignedAlbumSlots(page.album_slots, 3);

  const data  = parseLayoutData(page.content) as Title3Data;
  const title = data.title ?? page.title ?? null;
  const text  = data.text ?? null;

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex w-full flex-col",
          inFlipBook
            ? "px-4 pb-2 pt-3 sm:px-[10%] sm:pb-4 sm:pt-4"
            : "px-6 pb-4 pt-6 sm:px-[10%]",
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
          inFlipBook ? (
            <FlipBookHtmlContent
              html={text}
              className={cn(
                "max-w-[450px] leading-[1.4] text-white **:text-white [&_p]:mb-3 [&_strong]:font-semibold",
                "mt-2 text-sm sm:mt-4 sm:text-base",
              )}
            />
          ) : (
            <div
              className={cn(
                "max-w-[450px] leading-[1.4] text-white **:text-white [&_p]:mb-3 [&_strong]:font-semibold",
                "mt-4 text-base",
              )}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          )
        )}

        {assignedSlots.length > 0 ? (
          <div
            className={cn(
              "grid grid-cols-3",
              inFlipBook ? "mt-3 gap-2 sm:mt-8 sm:gap-4 md:gap-7" : "mt-8 gap-4 md:gap-7",
            )}
          >
            {assignedSlots.map((slot) => {
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
                  userStickerUrl={userStickerUrl}
                  autoOpenPaste={focusSlotId === slot.id}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}

function ProfilePage({ page, side, userStickerUrl, userDisplayName, inFlipBook }: AlbumPageProps) {
  const data       = parseLayoutData(page.content) as ProfileData;
  const title      = data.title ?? page.title ?? "Minha Figurinha";
  const hasSticker = Boolean(userStickerUrl);

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex w-full flex-col items-center",
          inFlipBook
            ? "px-4 py-3 sm:px-[10%] sm:py-5"
            : "px-6 py-6 sm:px-[10%]",
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

        <div className="flex flex-col items-center justify-center">
          {hasSticker ? (
            inFlipBook ? (
              <FlipBookLink
                href="/figurinha"
                className="group flex flex-col items-center gap-2 transition-transform duration-200 active:scale-[0.99]"
                ariaLabel="Alterar figurinha personalizada"
              >
                <div
                  className="relative overflow-hidden shadow-2xl shadow-black/30"
                  style={{
                    width: "clamp(160px, 38vw, 280px)",
                    aspectRatio: "352 / 503",
                    borderRadius: 16,
                  }}
                >
                  <Image
                    key={userStickerUrl}
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
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-verde-escuro-capa/90 to-transparent px-3 pb-3 pt-8 text-center text-[10px] font-bold uppercase tracking-wide text-white opacity-90 sm:text-xs">
                    Toque para alterar
                  </span>
                </div>
              </FlipBookLink>
            ) : (
              <Link
                href="/figurinha"
                className="group flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-[1.01]"
                aria-label="Alterar figurinha personalizada"
              >
                <div
                  className="relative overflow-hidden shadow-2xl shadow-black/30"
                  style={{
                    width: "clamp(160px, 38vw, 280px)",
                    aspectRatio: "352 / 503",
                    borderRadius: 16,
                  }}
                >
                  <Image
                    key={userStickerUrl}
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
              </Link>
            )
          ) : inFlipBook ? (
            <FlipBookLink
              href="/figurinha"
              className="group flex flex-col items-center gap-4 transition-transform duration-200 hover:scale-[1.01]"
              ariaLabel="Criar figurinha personalizada"
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
            </FlipBookLink>
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
  userStickerUrl?: string | null,
  options?: {
    card?: typeof ALBUM_DUO2_CARD | typeof ALBUM_GRID6_CTA_CARD;
    slotSize?: "default" | "large" | "duo" | "cta";
  },
) {
  const card = options?.card ?? ALBUM_GRID_CARD;
  return [...slots]
    .sort((a, b) => a.slot_number - b.slot_number)
    .filter(isAssignedAlbumSlot)
    .slice(0, limit)
    .map((slot) => {
      const stickerId = slot.stickers?.id;
      return (
        <AlbumGridSlotCell key={slot.id} card={card}>
          <StickerSlot
            slotId={slot.id}
            slotNumber={slot.slot_number}
            sticker={slot.stickers}
            isPasted={pastedSlotIds.has(slot.id)}
            owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
            onPaste={onPaste}
            userStickerUrl={userStickerUrl}
            size={options?.slotSize}
            autoOpenPaste={focusSlotId === slot.id}
          />
        </AlbumGridSlotCell>
      );
    });
}

function Grid6CtaPage({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const data = parseLayoutData(page.content) as Grid6CtaData;
  const ctaLabel = data.cta_label?.trim() ?? "";
  const ctaHref = data.cta_href?.trim() ?? "";
  const assigned = getAssignedAlbumSlots(page.album_slots, 6);
  const cols = 3;
  const rows = albumGridRows(assigned.length, cols);

  const footerContent =
    ctaLabel && ctaHref ? (
      <div className={cn("flex justify-center", inFlipBook ? "mt-3 sm:mt-5" : "mt-5 sm:mt-6")}>
        <AlbumPageCta label={ctaLabel} href={ctaHref} inFlipBook={inFlipBook} />
      </div>
    ) : null;

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <AlbumGridFrame inFlipBook={inFlipBook} afterGrid={footerContent}>
        {rows > 0 ? (
          <AlbumStickerGrid cols={cols} rows={rows} card={ALBUM_GRID6_CTA_CARD}>
            {renderGridSlots(
              page.album_slots,
              6,
              pastedSlotIds,
              ownedMap,
              onPaste,
              focusSlotId,
              userStickerUrl,
              { card: ALBUM_GRID6_CTA_CARD, slotSize: "cta" },
            )}
          </AlbumStickerGrid>
        ) : null}
      </AlbumGridFrame>
    </PageShell>
  );
}

function Grid6Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const data  = parseLayoutData(page.content) as Grid6Data;
  const title = data.title ?? page.title ?? null;
  const text  = data.text ?? null;
  const assigned = getAssignedAlbumSlots(page.album_slots, 6);
  const cols = 3;
  const rows = albumGridRows(assigned.length, cols);

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
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <AlbumGridFrame inFlipBook={inFlipBook} afterGrid={footerContent}>
        {rows > 0 ? (
          <AlbumStickerGrid cols={cols} rows={rows}>
            {renderGridSlots(page.album_slots, 6, pastedSlotIds, ownedMap, onPaste, focusSlotId, userStickerUrl)}
          </AlbumStickerGrid>
        ) : null}
      </AlbumGridFrame>
    </PageShell>
  );
}

/** Slot 1 = left center · slots 2–3 = top/bottom right (199×284 cards) */
function Tri3Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);
  const [left, topRight, bottomRight] = slots;

  const cellClass = "w-[clamp(112px,34vw,199px)] shrink-0";

  function renderSlot(slot: (typeof slots)[number] | undefined) {
    if (!slot || !isAssignedAlbumSlot(slot)) return null;
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
        userStickerUrl={userStickerUrl}
        size="large"
        autoOpenPaste={focusSlotId === slot.id}
      />
    );
  }

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex w-full flex-col",
          inFlipBook ? "px-4 py-3 sm:px-[8%] sm:py-5" : "px-5 py-6 sm:px-[8%]",
        )}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
            {isAssignedAlbumSlot(left) ? (
              <div className={cellClass}>{renderSlot(left)}</div>
            ) : null}
            {(isAssignedAlbumSlot(topRight) || isAssignedAlbumSlot(bottomRight)) ? (
              <div className="flex flex-col gap-5 sm:gap-6 md:gap-8">
                {isAssignedAlbumSlot(topRight) ? (
                  <div className={cellClass}>{renderSlot(topRight)}</div>
                ) : null}
                {isAssignedAlbumSlot(bottomRight) ? (
                  <div className={cellClass}>{renderSlot(bottomRight)}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Duo2Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const slots = getAssignedAlbumSlots(page.album_slots, 2);
  const data = parseLayoutData(page.content) as Duo2Data;
  const text = data.text ?? null;

  function renderSlot(slot: (typeof slots)[number]) {
    const stickerId = slot.stickers?.id;
    return (
      <div
        key={slot.id}
        className="shrink-0"
        style={{
          width: ALBUM_DUO2_DESIGN.cardWidth,
          height: ALBUM_DUO2_DESIGN.cardHeight,
        }}
      >
        <StickerSlot
          slotId={slot.id}
          slotNumber={slot.slot_number}
          sticker={slot.stickers}
          isPasted={pastedSlotIds.has(slot.id)}
          owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
          onPaste={onPaste}
          userStickerUrl={userStickerUrl}
          size="duo"
          autoOpenPaste={focusSlotId === slot.id}
        />
      </div>
    );
  }

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex max-h-full min-h-0 w-full flex-col",
          inFlipBook ? "px-4 sm:px-[6%]" : "px-6 sm:px-[8%]",
        )}
      >
        <AlbumDuo2Scaler inFlipBook={inFlipBook}>
          {text ? (
            <div
              className={cn(
                "w-full text-white",
                "**:text-white [&_p]:mb-0 [&_p]:leading-[30px] [&_p:last-child]:mb-0 [&_strong]:font-bold",
              )}
              style={{
                maxWidth: ALBUM_DUO2_DESIGN.textMaxWidth,
                fontSize: ALBUM_DUO2_DESIGN.textFontSize,
                lineHeight: `${ALBUM_DUO2_DESIGN.textLineHeight}px`,
              }}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          ) : null}

          {text ? (
            <div
              aria-hidden
              className="shrink-0"
              style={{ height: ALBUM_DUO2_DESIGN.textToCardsGap }}
            />
          ) : null}

          <div
            className="flex items-center justify-center"
            style={{ gap: ALBUM_DUO2_DESIGN.cardGap }}
          >
            {slots.length > 0 ? slots.map(renderSlot) : null}
          </div>
        </AlbumDuo2Scaler>
      </div>
    </PageShell>
  );
}

function Grid4Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const assigned = getAssignedAlbumSlots(page.album_slots, 4);
  const cols = 2;
  const rows = albumGridRows(assigned.length, cols);

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <AlbumGridFrame inFlipBook={inFlipBook}>
        {rows > 0 ? (
          <AlbumStickerGrid cols={cols} rows={rows}>
            {renderGridSlots(page.album_slots, 4, pastedSlotIds, ownedMap, onPaste, focusSlotId, userStickerUrl)}
          </AlbumStickerGrid>
        ) : null}
      </AlbumGridFrame>
    </PageShell>
  );
}

function Grid3x3Page({ page, side, pastedSlotIds, ownedMap, onPaste, userStickerUrl, inFlipBook, focusSlotId }: AlbumPageProps) {
  const assigned = getAssignedAlbumSlots(page.album_slots, 9);
  const cols = 3;
  const rows = albumGridRows(assigned.length, cols);

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <AlbumGridFrame inFlipBook={inFlipBook}>
        {rows > 0 ? (
          <AlbumStickerGrid cols={cols} rows={rows}>
            {renderGridSlots(page.album_slots, 9, pastedSlotIds, ownedMap, onPaste, focusSlotId, userStickerUrl)}
          </AlbumStickerGrid>
        ) : null}
      </AlbumGridFrame>
    </PageShell>
  );
}

function InfoPage({ page, side, inFlipBook }: AlbumPageProps) {
  const title = page.title;
  const imageUrl = page.background_url;
  const html = page.content ?? "";

  return (
    <PageShell side={side} pageNumber={page.page_number} inFlipBook={inFlipBook}>
      <div
        className={cn(
          "flex w-full flex-col",
          inFlipBook ? "px-4 py-5 sm:px-[8%] sm:py-8" : "px-6 py-8 sm:px-[8%]",
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-5">
          {imageUrl ? (
            <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-card sm:max-w-[380px]">
              <Image
                src={imageUrl}
                alt={title ?? "Imagem da página"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 380px"
              />
            </div>
          ) : null}
          {title ? (
            <h2
              className={cn(
                "text-center font-display font-bold text-white",
                inFlipBook ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl",
              )}
            >
              {title}
            </h2>
          ) : null}
          {html ? (
            inFlipBook ? (
              <FlipBookHtmlContent
                html={html}
                className={cn(
                  "max-w-[520px] text-center leading-[1.45] text-white **:text-white [&_a]:underline [&_p]:mb-2.5 [&_strong]:font-semibold",
                  "text-sm sm:text-base",
                )}
              />
            ) : (
              <div
                className={cn(
                  "max-w-[520px] text-center leading-[1.45] text-white **:text-white [&_a]:underline [&_p]:mb-2.5 [&_strong]:font-semibold",
                  "text-base",
                )}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

function SocialPage(props: AlbumPageProps) {
  return <AlbumSocialPage {...props} />;
}

export const AlbumPage = memo(function AlbumPage(props: AlbumPageProps) {
  if (props.page.page_type === "info") {
    return <InfoPage {...props} />;
  }
  if (props.page.layout_template === "profile") {
    return <ProfilePage {...props} />;
  }
  if (props.page.layout_template === "social") {
    return <SocialPage {...props} />;
  }
  if (props.page.layout_template === "title3") {
    return <Title3Page {...props} />;
  }
  if (props.page.layout_template === "grid6") {
    return <Grid6Page {...props} />;
  }
  if (props.page.layout_template === "grid6cta") {
    return <Grid6CtaPage {...props} />;
  }
  if (props.page.layout_template === "tri3") {
    return <Tri3Page {...props} />;
  }
  if (props.page.layout_template === "grid4") {
    return <Grid4Page {...props} />;
  }
  if (props.page.layout_template === "duo2") {
    return <Duo2Page {...props} />;
  }
  if (props.page.layout_template === "3x3") {
    return <Grid3x3Page {...props} />;
  }
  return <Grid3x3Page {...props} />;
});
