"use client";

import Image from "next/image";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import { parseLayoutData, type Title3Data } from "@/lib/album-templates";
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
}

// ─── Page shell — fundo verde escuro + blobs decorativos (Figma 28:583) ───────
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
      {/* Elementos decorativos importados manualmente (fallback: verde sólido) */}
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

// ─── Badge do logo (caixa branca no rodapé da página, Figma 28:1130) ──────────
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

// ─── Template: title3 — título + texto + 3 figurinhas + logo ──────────────────
function Title3Page({ page, side, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);

  // Parse JSON layout data stored in `content`
  const data     = parseLayoutData(page.content) as Title3Data;
  const title    = data.title ?? page.title ?? null;
  const text     = data.text ?? null;

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

        {/* 3 figurinhas em linha */}
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

        {/* Logo no rodapé */}
        <div className="mt-auto flex justify-center pt-10">
          <LogoBadge />
        </div>
      </div>
    </PageShell>
  );
}

// ─── Template: 3x3 — grade de 9 figurinhas ────────────────────────────────────
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

// ─── Exported component ────────────────────────────────────────────────────────
export function AlbumPage(props: AlbumPageProps) {
  if (props.page.layout_template === "title3") {
    return <Title3Page {...props} />;
  }
  return <Grid3x3Page {...props} />;
}
