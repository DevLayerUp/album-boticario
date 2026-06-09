"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Sparkles, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SlotSticker {
  id: number;
  name: string;
  description?: string | null;
  image_url: string;
  is_user_type: boolean;
  rarities: {
    name: string;
    slug: string;
    color_hex: string;
    animation_type: string;
  } | null;
}

export interface StickerSlotProps {
  slotId: number;
  slotNumber: number;
  sticker: SlotSticker | null;
  isPasted: boolean;
  owned: number;
  onPaste?: (slotId: number, stickerId: number) => Promise<void>;
}

// ─── Rarity config ────────────────────────────────────────────────────────────
const RARITY_STARS: Record<string, number> = {
  legendary: 4, "super-rare": 3, rare: 2, common: 1,
};

/** Darkens a hex color by mixing it toward black */
function darkenHex(hex: string, amount = 0.3): string {
  const c = hex.replace("#", "");
  const r = Math.round(parseInt(c.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(c.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(c.slice(4, 6), 16) * (1 - amount));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ─── Particle burst ───────────────────────────────────────────────────────────
function PasteBurst({ color, slug }: { color: string; slug: string }) {
  const count  = slug === "legendary" ? 22 : slug === "super-rare" ? 16 : 10;
  const emojis = slug === "legendary"  ? ["⭐", "✨", "🌟", "💫"] :
                 slug === "super-rare" ? ["✨", "💜", "✨"] : ["✨", "🟢"];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist  = 40 + Math.random() * 45;
        const dx    = Math.cos((angle * Math.PI) / 180) * dist;
        const dy    = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.span key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: dx, y: dy, scale: 1.3 }}
            transition={{ duration: 0.65 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute select-none text-xs"
          >
            {emojis[i % emojis.length]}
          </motion.span>
        );
      })}
      <motion.div
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute h-10 w-10 rounded-full"
        style={{ border: `2px solid ${color}` }}
      />
    </div>
  );
}

// ─── Card back — rarity-colored gradient with highlighted description ──────────
function CardBack({ sticker, slotNumber }: { sticker: SlotSticker; slotNumber: number }) {
  const hex    = sticker.rarities?.color_hex ?? "#9ca3af";
  const slug   = sticker.rarities?.slug      ?? "common";
  const rarity = sticker.rarities?.name      ?? "Comum";
  const stars  = RARITY_STARS[slug] ?? 1;
  const dark   = darkenHex(hex, 0.38);
  const mid    = darkenHex(hex, 0.18);
  const shimmer = slug === "legendary" || slug === "super-rare";
  const numStr  = String(slotNumber).padStart(3, "0");

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-t-xl"
      style={{
        background: `linear-gradient(158deg, ${hex} 0%, ${mid} 48%, ${dark} 100%)`,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      {/* Subtle diagonal light sweep for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)",
        }}
      />

      {/* Fine dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />

      {/* ── Header: stars + card number ── */}
      <div className="relative z-10 flex items-center justify-between px-2.5 pt-2 pb-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Star
              key={i}
              size={8}
              className={i < stars ? "fill-white text-white drop-shadow" : "text-white/20"}
            />
          ))}
        </div>
        <span className="font-mono text-[8px] font-bold tracking-widest text-white/70">
          #{numStr}
        </span>
      </div>

      {/* ── Stamp image ── */}
      <div className="relative z-10 flex justify-center">
        <div
          className="relative h-[52px] w-[52px] overflow-hidden rounded-full"
          style={{
            border: "2.5px solid rgba(255,255,255,0.75)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.2)",
          }}
        >
          <Image
            src={sticker.image_url}
            alt={sticker.name}
            fill
            className="object-cover scale-110"
            sizes="52px"
          />
          {shimmer && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{ backgroundPositionX: ["0%", "220%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
              style={{
                background:
                  "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.8) 42%, transparent 62%)",
                backgroundSize: "220% 100%",
              }}
            />
          )}
        </div>
      </div>

      {/* ── Sticker name ── */}
      <div className="relative z-10 mt-2 px-2 text-center">
        <h4 className="font-display text-[11px] font-extrabold leading-tight tracking-tight text-white drop-shadow">
          {sticker.name}
        </h4>
      </div>

      {/* ── Description box — em destaque ── */}
      <div className="relative z-10 mx-2 mt-2 flex-1 overflow-hidden">
        <div
          className="h-full rounded-xl px-2.5 py-2"
          style={{
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <p className="line-clamp-4 text-center text-[9px] font-medium leading-relaxed text-white/95">
            {sticker.description ?? "Figurinha exclusiva da coleção Grupo Boticário."}
          </p>
        </div>
      </div>

      {/* ── Footer: brand + rarity ── */}
      <div className="relative z-10 flex items-center justify-between px-2.5 pb-2 pt-1.5">
        <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-white/50">
          Grupo Boticário
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          {rarity}
        </span>
      </div>
    </div>
  );
}

// ─── Main StickerSlot component ───────────────────────────────────────────────
export function StickerSlot({
  slotId, slotNumber, sticker, isPasted, owned, onPaste,
}: StickerSlotProps) {
  const [showModal, setShowModal]   = useState(false);
  const [pasting, setPasting]       = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const [showBurst, setShowBurst]   = useState(false);
  const [error, setError]           = useState("");
  const [flipped, setFlipped]       = useState(false);

  const rarityColor = sticker?.rarities?.color_hex  ?? "#9ca3af";
  const raritySlug  = sticker?.rarities?.slug        ?? "common";
  const animation   = sticker?.rarities?.animation_type ?? "none";
  const isOwned     = owned > 0;
  const canPaste    = isOwned && !isPasted && sticker !== null;
  const isComplete  = isPasted || justPasted;

  async function handlePaste() {
    if (!sticker || !onPaste) return;
    setPasting(true);
    setError("");
    try {
      await onPaste(slotId, sticker.id);
      setJustPasted(true);
      setShowModal(false);
      setTimeout(() => { setShowBurst(true); setTimeout(() => setShowBurst(false), 1400); }, 120);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao colar figurinha");
    } finally {
      setPasting(false);
    }
  }

  return (
    <>
      <motion.div
        layout
        className={[
          "relative flex flex-col items-center rounded-xl border-2 transition-colors duration-300",
          isComplete
            ? "cursor-pointer bg-white shadow-md"
            : canPaste
            ? "cursor-pointer border-dashed border-gb-green/60 bg-gb-green/5 hover:border-gb-green hover:bg-gb-green/10"
            : "border-gray-200 bg-gray-50",
        ].join(" ")}
        style={isComplete ? { borderColor: rarityColor + "70" } : undefined}
        onClick={() => {
          if (isComplete) setFlipped((f) => !f);
          else if (canPaste) setShowModal(true);
        }}
        whileHover={!isComplete && canPaste ? { scale: 1.04, y: -2 } : undefined}
        whileTap={!isComplete && canPaste ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Slot number badge */}
        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/25 px-1.5 py-0.5 text-[9px] font-bold text-white">
          #{slotNumber}
        </span>

        {/* Duplicate badge */}
        {owned > 1 && !isComplete && (
          <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            {owned}×
          </span>
        )}

        {/* ── CARD AREA ──────────────────────────────────────────── */}
        {isComplete ? (
          <div className="relative aspect-[3/4] w-full" style={{ perspective: "700px" }}>
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* ── FRONT ── */}
              <div
                className="absolute inset-0 overflow-hidden rounded-t-xl"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <motion.div
                  initial={justPasted ? { scale: 0.55, opacity: 0, rotateY: -95 } : false}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 210, damping: 20, delay: 0.05 }}
                  className="h-full w-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {sticker && (
                    <Image src={sticker.image_url} alt={sticker.name} fill
                      className="object-cover" sizes="120px" />
                  )}
                </motion.div>

                {/* Holographic shimmer for legendary/super-rare */}
                {animation === "holographic" && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 opacity-25"
                    animate={{ backgroundPositionX: ["0%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.7) 45%, transparent 65%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                )}

                {/* Rarity glow inset */}
                {(animation === "glow" || animation === "holographic") && (
                  <div className="pointer-events-none absolute inset-0 rounded-t-xl"
                    style={{ boxShadow: `inset 0 0 14px ${rarityColor}55` }} />
                )}

                {/* Corner fold / tap hint */}
                <div className="pointer-events-none absolute bottom-0 right-0">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M18 18 L0 18 L18 0 Z" fill={rarityColor + "50"} />
                    <path d="M18 18 L0 18 L18 0 Z" fill={rarityColor + "30"} />
                  </svg>
                </div>

                <AnimatePresence>
                  {showBurst && sticker && (
                    <PasteBurst color={rarityColor} slug={raritySlug} />
                  )}
                </AnimatePresence>
              </div>

              {/* ── BACK ── */}
              {sticker && (
                <CardBack sticker={sticker} slotNumber={slotNumber} />
              )}
            </motion.div>

            {/* Flip indicator pill below card (visible, not on the card) */}
            <motion.div
              animate={{ opacity: flipped ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-3 left-0 right-0 flex justify-center pointer-events-none"
            >
              <span className="rounded-full border px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-widest"
                style={{ borderColor: rarityColor + "60", color: rarityColor + "cc", background: "white" }}>
                ver info
              </span>
            </motion.div>
          </div>
        ) : (
          /* ── NOT PASTED ──────────────────────────────────────────── */
          <div className="relative aspect-[3/4] w-full rounded-t-xl" style={{ perspective: "600px" }}>
            {isOwned ? (
              <div className="relative h-full w-full overflow-hidden rounded-t-xl">
                {sticker ? (
                  <>
                    <Image src={sticker.image_url} alt={sticker.name} fill
                      className="object-cover opacity-50" sizes="120px" />
                    <div className="absolute inset-0 flex items-center justify-center bg-gb-green/12">
                      <motion.div
                        animate={{ scale: [1, 1.18, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gb-green/90 shadow-lg shadow-gb-green/40"
                      >
                        <Plus size={16} className="text-white" />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Plus size={20} className="text-gb-green" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center overflow-hidden rounded-t-xl bg-gray-100/80">
                <Lock size={14} className="text-gray-300" />
              </div>
            )}
          </div>
        )}

        {/* Sticker label */}
        <p className="mt-1 line-clamp-1 px-1 pb-1.5 text-center text-[10px] leading-tight text-gray-500">
          {isComplete || isOwned ? (sticker?.name ?? `Slot ${slotNumber}`) : `Slot ${slotNumber}`}
        </p>
      </motion.div>

      {/* ── PASTE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && sticker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            onClick={() => !pasting && setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 70, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rarity accent bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: rarityColor }} />

              <div className="p-6">
                {/* Card preview with flip-in */}
                <div className="mb-5 flex justify-center" style={{ perspective: "900px" }}>
                  <motion.div
                    initial={{ rotateY: -80, scale: 0.72, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 175, damping: 18, delay: 0.06 }}
                    className="relative h-44 w-32 overflow-hidden rounded-2xl"
                    style={{
                      boxShadow: `0 12px 40px ${rarityColor}50, 0 2px 8px rgba(0,0,0,0.15)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <Image src={sticker.image_url} alt={sticker.name} fill
                      className="object-cover" sizes="128px" />
                    {animation === "holographic" && (
                      <motion.div
                        className="pointer-events-none absolute inset-0 opacity-35"
                        animate={{ backgroundPositionX: ["0%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        style={{
                          background: "linear-gradient(130deg, transparent 20%, rgba(255,255,255,0.9) 42%, transparent 62%)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    )}
                    {/* Foil border */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{ boxShadow: `inset 0 0 0 1.5px ${rarityColor}60` }} />
                  </motion.div>
                </div>

                {/* Info */}
                <div className="space-y-1 text-center">
                  <h3 className="font-display text-xl font-semibold text-gb-ink">{sticker.name}</h3>
                  {sticker.rarities && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.22 }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase text-white"
                      style={{ backgroundColor: rarityColor }}
                    >
                      {raritySlug === "legendary" && <Sparkles size={10} />}
                      {sticker.rarities.name}
                    </motion.span>
                  )}
                  <p className="text-sm text-gray-400">Slot #{slotNumber}</p>
                  {sticker.description && (
                    <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-gb-slate">
                      {sticker.description}
                    </p>
                  )}
                </div>

                {owned > 1 && (
                  <p className="mt-3 text-center text-xs text-amber-600">
                    Você tem {owned}× — uma será colada, restará {owned - 1}
                  </p>
                )}
                <p className="mt-1.5 text-center text-xs text-gray-400">
                  Esta ação não pode ser desfeita.
                </p>

                {error && (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setShowModal(false)} disabled={pasting}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handlePaste} disabled={pasting}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 overflow-hidden rounded-2xl py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                    style={{ backgroundColor: rarityColor, boxShadow: `0 4px 18px ${rarityColor}55` }}
                  >
                    {pasting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                        Colando…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <Sparkles size={14} /> Colar!
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
