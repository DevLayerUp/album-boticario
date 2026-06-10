"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Sparkles, X } from "lucide-react";

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

// ─── Detail modal — flip frente/verso ─────────────────────────────────────────
function StickerDetailModal({
  sticker,
  slotNumber,
  onClose,
}: {
  sticker: SlotSticker;
  slotNumber: number;
  onClose: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  const rarityColor = sticker.rarities?.color_hex ?? "#41ab5d";
  const rarityName  = sticker.rarities?.name      ?? "Comum";
  const animation   = sticker.rarities?.animation_type ?? "none";

  useEffect(() => {
    setShowBack(false);
  }, [sticker.id]);

  return (
    <motion.div
      key="sticker-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-[280px] rounded-2xl p-4 shadow-2xl"
        style={{ background: "#F5F0E6", border: "3px solid #E8E2D4" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-600 transition hover:bg-black/20"
        >
          <X size={16} />
        </button>

        {/* Flip card */}
        <div className="mx-auto mt-2 flex justify-center" style={{ perspective: "1000px" }}>
          <motion.div
            animate={{ rotateY: showBack ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{
              width: 200,
              height: 287.5,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Frente */}
            <div
              className="absolute inset-0 overflow-hidden rounded-xl shadow-lg"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <Image
                src={sticker.image_url}
                alt={sticker.name}
                fill
                className="object-cover"
                sizes="200px"
                priority
              />
              {animation === "holographic" && (
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  animate={{ backgroundPositionX: ["0%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.75) 45%, transparent 65%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              )}
              {(animation === "glow" || animation === "holographic") && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{ boxShadow: `inset 0 0 18px ${rarityColor}55` }}
                />
              )}
            </div>

            {/* Verso */}
            <div
              className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-[#1A5C35] shadow-lg"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="bg-[#74c476] px-3 py-2.5">
                <h3 className="text-center font-display text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white">
                  {sticker.name}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="text-center text-[11px] font-medium leading-relaxed text-white/90">
                  {sticker.description ??
                    "Figurinha exclusiva da coleção Grupo Boticário."}
                </p>
              </div>
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <span className="font-mono text-[9px] font-bold text-white/40">
                  #{String(slotNumber).padStart(3, "0")}
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                  style={{ background: rarityColor }}
                >
                  👍 {rarityName}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Frente / Verso toggle */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowBack(false)}
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              !showBack ? "text-[#1A5C35]" : "text-gray-400"
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={showBack}
            aria-label={showBack ? "Mostrando verso" : "Mostrando frente"}
            onClick={() => setShowBack((v) => !v)}
            className="relative h-7 w-14 rounded-full transition-colors"
            style={{ background: showBack ? "#1A5C35" : "#c8c0b0" }}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
              style={{ left: showBack ? "calc(100% - 1.625rem)" : "0.125rem" }}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowBack(true)}
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              showBack ? "text-[#1A5C35]" : "text-gray-400"
            }`}
          >
            Verso
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main StickerSlot component ───────────────────────────────────────────────
export function StickerSlot({
  slotId, slotNumber, sticker, isPasted, owned, onPaste,
}: StickerSlotProps) {
  const [showPasteModal, setShowPasteModal]   = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pasting, setPasting]                 = useState(false);
  const [justPasted, setJustPasted]           = useState(false);
  const [showBurst, setShowBurst]             = useState(false);
  const [error, setError]                     = useState("");

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
      setShowPasteModal(false);
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
          if (isComplete) setShowDetailModal(true);
          else if (canPaste) setShowPasteModal(true);
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
          <div className="relative aspect-[16/23] w-full overflow-hidden rounded-t-xl">
            <motion.div
              initial={justPasted ? { scale: 0.55, opacity: 0, rotateY: -95 } : false}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 20, delay: 0.05 }}
              className="relative h-full w-full"
            >
              {sticker && (
                <Image
                  src={sticker.image_url}
                  alt={sticker.name}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              )}

              {animation === "holographic" && (
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  animate={{ backgroundPositionX: ["0%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.7) 45%, transparent 65%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              )}

              {(animation === "glow" || animation === "holographic") && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-t-xl"
                  style={{ boxShadow: `inset 0 0 14px ${rarityColor}55` }}
                />
              )}

              <AnimatePresence>
                {showBurst && sticker && (
                  <PasteBurst color={rarityColor} slug={raritySlug} />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* ── NOT PASTED ──────────────────────────────────────────── */
          <div className="relative aspect-[16/23] w-full rounded-t-xl" style={{ perspective: "600px" }}>
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

      {/* ── Sticker detail modal (flip frente/verso) ─────────────────────────── */}
      <AnimatePresence>
        {showDetailModal && sticker && (
          <StickerDetailModal
            sticker={sticker}
            slotNumber={slotNumber}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── PASTE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPasteModal && sticker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            onClick={() => !pasting && setShowPasteModal(false)}
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
                  <button onClick={() => setShowPasteModal(false)} disabled={pasting}
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
