"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import { templateColsClass } from "@/lib/album-templates";

export interface AlbumPageData {
  id: number;
  page_number: number;
  title: string | null;
  background_url: string | null;
  layout_template: string;
  category_id: number;
  page_type?: "sticker" | "info" | string;
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
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>; // sticker_id -> quantity
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
}

// ─── Info page ────────────────────────────────────────────────────────────────
function InfoPage({ page }: { page: AlbumPageData }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-paper">
      {/* Cover image */}
      {page.background_url ? (
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <Image
            src={page.background_url}
            alt={page.title ?? "Imagem da página"}
            fill
            className="object-cover"
            sizes="600px"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Title over image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 text-white/80 mb-1">
              <Info size={12} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Pág. {page.page_number} · Informativo
              </span>
            </div>
            {page.title && (
              <h3 className="font-display text-lg font-bold text-white drop-shadow-md line-clamp-2">
                {page.title}
              </h3>
            )}
          </div>
        </div>
      ) : (
        /* No image — show header bar */
        <div className="relative flex h-16 items-center gap-3 bg-gb-green/8 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gb-green/15 text-gb-green">
            <Info size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gb-green">
              Pág. {page.page_number} · Informativo
            </p>
            {page.title && (
              <h3 className="font-display text-sm font-semibold text-gb-ink line-clamp-1">
                {page.title}
              </h3>
            )}
          </div>
        </div>
      )}

      {/* Scrollable HTML content */}
      <div className="flex-1 overflow-y-auto">
        {page.content ? (
          <div
            className="prose prose-sm max-w-none px-5 py-4
              prose-headings:font-display prose-headings:text-gb-ink
              prose-h2:text-base prose-h2:font-bold prose-h2:mt-4 prose-h2:mb-2
              prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-1
              prose-p:text-sm prose-p:text-gray-700 prose-p:leading-relaxed
              prose-ul:text-sm prose-ol:text-sm
              prose-a:text-gb-green prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gb-ink
            "
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <Info size={28} className="text-gray-300" />
            <p className="text-sm text-gray-400">Conteúdo informativo em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sticker page (original) ──────────────────────────────────────────────────
function StickerPage({ page, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots   = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);
  const filled  = slots.filter((s) => pastedSlotIds.has(s.id)).length;
  const total   = slots.length;
  const pct     = total > 0 ? Math.round((filled / total) * 100) : 0;
  const complete = total > 0 && filled === total;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-paper">
      {/* Page header */}
      <div className="relative flex h-16 items-center justify-between px-4">
        {page.background_url && (
          <Image
            src={page.background_url}
            alt=""
            fill
            className="object-cover opacity-15"
            sizes="600px"
          />
        )}
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-gb-green">
            Página {page.page_number}
          </p>
          {page.title && (
            <h3 className="font-display text-base font-semibold text-gb-ink line-clamp-1">
              {page.title}
            </h3>
          )}
        </div>
        <span className="relative rounded-full bg-gb-green/10 px-2.5 py-0.5 text-xs font-semibold text-gb-green-dark">
          {filled}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 w-full overflow-hidden bg-gray-100">
        <motion.div
          className="h-full bg-gb-green"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Slots grid */}
      {slots.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Nenhum slot nesta página
        </div>
      ) : (
        <div className={`grid flex-1 gap-2 overflow-y-auto p-4 ${templateColsClass(page.layout_template)}`}>
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
      )}

      {/* Completion overlay */}
      <AnimatePresence>
        {complete && (
          <motion.div
            key="complete-banner"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center gap-2 bg-gb-green py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <CheckCircle2 size={16} />
            Página completa!
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="text-base"
            >
              ✨
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export function AlbumPage({ page, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  if (page.page_type === "info") {
    return <InfoPage page={page} />;
  }
  return (
    <StickerPage
      page={page}
      pastedSlotIds={pastedSlotIds}
      ownedMap={ownedMap}
      onPaste={onPaste}
    />
  );
}
