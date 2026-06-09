"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Sparkles } from "lucide-react";

export interface SlotSticker {
  id: number;
  name: string;
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
  /** quantity the user owns (0 = not owned) */
  owned: number;
  onPaste?: (slotId: number, stickerId: number) => Promise<void>;
}

// ─── Particle burst component ────────────────────────────────────────────────
function PasteBurst({
  color,
  slug,
}: {
  color: string;
  slug: string;
}) {
  const count = slug === "legendary" ? 20 : slug === "super-rare" ? 14 : 10;
  const emojis = slug === "legendary"
    ? ["⭐", "✨", "🌟", "💫", "⭐"]
    : slug === "super-rare"
    ? ["✨", "💜", "✨"]
    : ["✨", "🟢", "✨"];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist  = 40 + Math.random() * 40;
        const dx    = Math.cos((angle * Math.PI) / 180) * dist;
        const dy    = Math.sin((angle * Math.PI) / 180) * dist;
        const emoji = emojis[i % emojis.length];
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: dx, y: dy, scale: 1.2 }}
            transition={{ duration: 0.6 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute text-sm select-none"
          >
            {emoji}
          </motion.span>
        );
      })}
      {/* Ring pulse */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute h-12 w-12 rounded-full"
        style={{ border: `3px solid ${color}` }}
      />
    </div>
  );
}

// ─── Holographic shimmer overlay ─────────────────────────────────────────────
function HolographicShimmer() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0, 0.4, 0] }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.7) 40%, transparent 60%, rgba(200,160,255,0.4) 75%, transparent 90%)",
        }}
      />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function StickerSlot({
  slotId,
  slotNumber,
  sticker,
  isPasted,
  owned,
  onPaste,
}: StickerSlotProps) {
  const slotRef              = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal]   = useState(false);
  const [pasting, setPasting]       = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const [showBurst, setShowBurst]   = useState(false);
  const [error, setError]           = useState("");

  const rarityColor  = sticker?.rarities?.color_hex  ?? "#9ca3af";
  const raritySlug   = sticker?.rarities?.slug        ?? "common";
  const animation    = sticker?.rarities?.animation_type ?? "none";
  const isOwned      = owned > 0;
  const canPaste     = isOwned && !isPasted && sticker !== null;
  const isComplete   = isPasted || justPasted;

  async function handlePaste() {
    if (!sticker || !onPaste) return;
    setPasting(true);
    setError("");
    try {
      await onPaste(slotId, sticker.id);
      setJustPasted(true);
      setShowModal(false);
      // Trigger burst after modal closes
      setTimeout(() => {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 1200);
      }, 120);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao colar figurinha");
    } finally {
      setPasting(false);
    }
  }

  // Border style
  const borderStyle = isComplete
    ? { borderColor: rarityColor + "80" }
    : undefined;

  const containerClass = [
    "relative flex flex-col items-center rounded-xl border-2 transition-colors duration-300",
    isComplete
      ? "bg-white shadow-md"
      : canPaste
      ? "cursor-pointer border-dashed border-gb-green/60 bg-gb-green/5 hover:border-gb-green hover:bg-gb-green/10"
      : "border-gray-200 bg-gray-50",
  ].join(" ");

  return (
    <>
      <motion.div
        ref={slotRef}
        layout
        className={containerClass}
        style={borderStyle}
        onClick={() => canPaste && setShowModal(true)}
        whileHover={canPaste ? { scale: 1.04, y: -2 } : undefined}
        whileTap={canPaste ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Slot number */}
        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/25 px-1.5 py-0.5 text-[9px] font-bold text-white">
          #{slotNumber}
        </span>

        {/* Duplicate badge */}
        {owned > 1 && !isComplete && (
          <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            {owned}×
          </span>
        )}

        {/* Image area */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
          {isComplete ? (
            /* ── Pasted ── */
            <div className="relative h-full w-full">
              <motion.div
                initial={justPasted ? { scale: 0.3, opacity: 0, rotateY: -90 } : false}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                className="h-full w-full"
              >
                {sticker && (
                  <Image
                    src={sticker.image_url}
                    alt={sticker.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                    priority={false}
                  />
                )}
              </motion.div>

              {/* Holographic shimmer on paste */}
              {justPasted && animation === "holographic" && <HolographicShimmer />}

              {/* Persistent holographic overlay */}
              {animation === "holographic" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                  }}
                />
              )}

              {/* Glow for rare+ */}
              {(animation === "glow" || animation === "holographic") && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-t-xl"
                  style={{ boxShadow: `inset 0 0 12px ${rarityColor}50` }}
                />
              )}
            </div>
          ) : isOwned ? (
            /* ── Owned, not yet pasted ── */
            <div className="relative h-full w-full">
              {sticker ? (
                <>
                  <Image
                    src={sticker.image_url}
                    alt={sticker.name}
                    fill
                    className="object-cover opacity-55"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gb-green/15">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
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
            /* ── Not owned ── */
            <div className="flex h-full items-center justify-center bg-gray-100/80">
              <Lock size={15} className="text-gray-300" />
            </div>
          )}

          {/* Burst overlay — renders INSIDE the slot after paste */}
          <AnimatePresence>
            {showBurst && sticker && (
              <PasteBurst color={rarityColor} slug={raritySlug} />
            )}
          </AnimatePresence>
        </div>

        {/* Sticker name */}
        <p className="mt-1 px-1 pb-1.5 text-center text-[10px] leading-tight text-gray-500 line-clamp-1">
          {isComplete || isOwned
            ? (sticker?.name ?? `Slot ${slotNumber}`)
            : `Slot ${slotNumber}`}
        </p>
      </motion.div>

      {/* ── Paste Confirmation Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && sticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            onClick={() => !pasting && setShowModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rarity header strip */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: rarityColor }}
              />

              <div className="p-6">
                {/* Sticker large preview */}
                <div className="mb-5 flex justify-center">
                  <motion.div
                    initial={{ rotateY: -60, scale: 0.7, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                    className="relative h-44 w-32 overflow-hidden rounded-2xl shadow-xl"
                    style={{ boxShadow: `0 8px 32px ${rarityColor}40` }}
                  >
                    <Image
                      src={sticker.image_url}
                      alt={sticker.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                    {animation === "holographic" && (
                      <div
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                          background:
                            "linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.8) 45%, transparent 65%, rgba(200,160,255,0.5) 80%, transparent 95%)",
                        }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Info */}
                <div className="space-y-1 text-center">
                  <h3 className="font-display text-xl font-semibold text-gb-ink">
                    {sticker.name}
                  </h3>
                  <p className="text-sm text-gray-400">Slot #{slotNumber} do álbum</p>
                </div>

                {/* Rarity badge */}
                {sticker.rarities && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
                    className="mt-3 flex justify-center"
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase text-white"
                      style={{ backgroundColor: rarityColor }}
                    >
                      {raritySlug === "legendary" && <Sparkles size={11} />}
                      {sticker.rarities.name}
                    </span>
                  </motion.div>
                )}

                {/* Owned count info */}
                {owned > 1 && (
                  <p className="mt-2 text-center text-xs text-amber-600">
                    Você tem {owned}× — uma será colada, restará {owned - 1}
                  </p>
                )}

                {/* Warning */}
                <p className="mt-2 text-center text-xs text-gray-400">
                  Esta ação não pode ser desfeita.
                </p>

                {error && (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={pasting}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handlePaste}
                    disabled={pasting}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 overflow-hidden rounded-2xl py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                    style={{
                      backgroundColor: rarityColor,
                      boxShadow: `0 4px 16px ${rarityColor}50`,
                    }}
                  >
                    {pasting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Colando…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <Sparkles size={14} />
                        Colar!
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
