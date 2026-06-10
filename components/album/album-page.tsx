"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { StickerSlot, type SlotSticker } from "./sticker-slot";
import { parseLayoutData, type Title3Data } from "@/lib/album-templates";

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
  pastedSlotIds: Set<number>;
  ownedMap: Map<number, number>;
  onPaste: (slotId: number, stickerId: number) => Promise<void>;
}

// ─── Shared decorative background ─────────────────────────────────────────────
function PageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 420 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path d="M-60 180 C 80 -20, 340 380, 500 120" stroke="#74c476" fill="none" strokeWidth="90" strokeLinecap="round" />
        <path d="M-80 420 C 60 220, 340 80, 520 340"  stroke="#41ab5d" fill="none" strokeWidth="70" strokeLinecap="round" />
        <path d="M50 580 C 180 440, 280 520, 440 380"  stroke="#238b45" fill="none" strokeWidth="50" strokeLinecap="round" />
      </svg>
      {/* Yellow accent */}
      <div className="absolute right-4 top-[38%] h-14 w-14 rounded-full opacity-90" style={{ background: "#D6E44A" }} />
      {/* Teal accent (clipped) */}
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full opacity-75" style={{ background: "#26C6DA" }} />
      {/* Small yellow dot */}
      <div className="absolute bottom-12 left-3 h-7 w-7 rounded-full opacity-80" style={{ background: "#D6E44A" }} />
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct      = total > 0 ? Math.round((filled / total) * 100) : 0;
  const complete = total > 0 && filled === total;
  return (
    <div className="relative flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-[#D6E44A]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{
          background: complete ? "#D6E44A" : "rgba(255,255,255,0.15)",
          color: complete ? "#1A5C35" : "rgba(255,255,255,0.8)",
        }}
      >
        {filled}/{total}
      </span>
    </div>
  );
}

// ─── Completion banner ─────────────────────────────────────────────────────────
function CompleteBanner() {
  return (
    <AnimatePresence>
      <motion.div
        key="complete"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 rounded-b-2xl py-2.5 text-sm font-semibold"
        style={{ background: "#D6E44A", color: "#1A5C35" }}
      >
        <CheckCircle2 size={15} />
        Página completa!
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-base"
        >
          ✨
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Template: title3 ─────────────────────────────────────────────────────────
function Title3Page({ page, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots    = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);
  const filled   = slots.filter((s) => pastedSlotIds.has(s.id)).length;
  const total    = slots.length;
  const complete = total > 0 && filled === total;

  // Parse JSON layout data stored in `content`
  const data      = parseLayoutData(page.content) as Title3Data;
  const title     = data.title    ?? page.title ?? null;
  const text      = data.text     ?? null;
  const imageUrl  = data.image_url ?? page.background_url ?? null;

  return (
    <div
      className="relative flex min-h-[480px] flex-col overflow-hidden rounded-2xl p-5"
      style={{ background: "#1A5C35" }}
    >
      <PageBackground />

      {/* ── Header ── */}
      <div className="relative z-10 mb-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Pág. {page.page_number}
        </p>

        {/* Optional banner image */}
        {imageUrl && (
          <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={title ?? "Imagem da página"}
              fill
              className="object-cover"
              sizes="600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {title && (
          <h2 className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow">
            {title}
          </h2>
        )}

        <div className="mt-2">
          <ProgressBar filled={filled} total={total} />
        </div>
      </div>

      {/* ── Rich-text paragraph ── */}
      {text && (
        <div
          className="prose prose-sm prose-invert relative z-10 mb-4 max-w-none
            prose-p:text-sm prose-p:leading-relaxed prose-p:text-white/80
            prose-headings:text-white prose-strong:text-white/90"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}

      {/* ── 3 sticker slots ── */}
      <div className="relative z-10 mt-auto flex justify-center gap-3 overflow-x-auto pb-1">
        {slots.slice(0, 3).map((slot) => {
          const stickerId = slot.stickers?.id;
          return (
            <div key={slot.id} style={{ width: 160, flexShrink: 0 }}>
              <StickerSlot
                slotId={slot.id}
                slotNumber={slot.slot_number}
                sticker={slot.stickers}
                isPasted={pastedSlotIds.has(slot.id)}
                owned={stickerId ? (ownedMap.get(stickerId) ?? 0) : 0}
                onPaste={onPaste}
              />
            </div>
          );
        })}
      </div>

      {complete && <CompleteBanner />}
    </div>
  );
}

// ─── Template: 3x3 ────────────────────────────────────────────────────────────
function Grid3x3Page({ page, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  const slots    = [...page.album_slots].sort((a, b) => a.slot_number - b.slot_number);
  const filled   = slots.filter((s) => pastedSlotIds.has(s.id)).length;
  const total    = slots.length;
  const complete = total > 0 && filled === total;

  const data  = parseLayoutData(page.content);
  const title = (data as { title?: string }).title ?? page.title ?? null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4"
      style={{ background: "#1A5C35" }}
    >
      <PageBackground />

      {/* Header row */}
      <div className="relative z-10 mb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Pág. {page.page_number}
            {title ? ` · ${title}` : ""}
          </p>
        </div>
        <ProgressBar filled={filled} total={total} />
      </div>

      {/* 3 × 3 grid — fixed 160 px columns */}
      <div className="relative z-10 overflow-x-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 160px)" }}>
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

      {complete && <CompleteBanner />}
    </div>
  );
}

// ─── Exported component ────────────────────────────────────────────────────────
export function AlbumPage({ page, pastedSlotIds, ownedMap, onPaste }: AlbumPageProps) {
  if (page.layout_template === "title3") {
    return (
      <Title3Page
        page={page}
        pastedSlotIds={pastedSlotIds}
        ownedMap={ownedMap}
        onPaste={onPaste}
      />
    );
  }
  return (
    <Grid3x3Page
      page={page}
      pastedSlotIds={pastedSlotIds}
      ownedMap={ownedMap}
      onPaste={onPaste}
    />
  );
}
