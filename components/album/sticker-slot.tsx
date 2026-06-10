"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Sparkles, ThumbsUp, X } from "lucide-react";
import { rarityColor } from "@/lib/rarity";

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
  const count  = slug === "legendary" ? 22 : slug === "super_rare" ? 16 : 10;
  const emojis = slug === "legendary"  ? ["⭐", "✨", "🌟", "💫"] :
                 slug === "super_rare" ? ["✨", "💛", "✨"] : ["✨", "🟢"];
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

// ─── Tag de nome da figurinha (Figma 28:1531) ─────────────────────────────────
function StickerNameTag({ name, fullWidth }: { name: string; fullWidth?: boolean }) {
  return (
    <span
      className={`flex items-end justify-center rounded-card rounded-br-none bg-verde-500 px-4 py-2 text-center font-display text-lg font-bold uppercase leading-tight text-white sm:text-2xl sm:leading-8 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {name}
    </span>
  );
}

// ─── Detail modal — flip frente/verso (Figma 28:1191 / 28:1364) ───────────────
function StickerDetailModal({
  sticker,
  onClose,
}: {
  sticker: SlotSticker;
  onClose: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  const color      = rarityColor(sticker.rarities?.slug, sticker.rarities?.color_hex);
  const rarityName = sticker.rarities?.name ?? "Comum";
  const animation  = sticker.rarities?.animation_type ?? "none";

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
      {/* Backdrop: tint verde + blur (Figma 28:1510) */}
      <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative flex max-h-[92dvh] w-full max-w-[497px] flex-col overflow-y-auto rounded-card bg-[#ebffe6] p-6 shadow-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center text-black transition-colors hover:text-verde-escuro-500"
        >
          <X size={32} strokeWidth={2.5} />
        </button>

        {/* Flip card */}
        <div className="mx-auto mt-8 w-full max-w-[392px]" style={{ perspective: "1200px" }}>
          <motion.div
            animate={{ rotateY: showBack ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-392/560 w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ── Frente ── */}
            <div
              className="absolute inset-0 overflow-hidden rounded-block border-[5px]"
              style={{
                borderColor: color,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Image
                src={sticker.image_url}
                alt={sticker.name}
                fill
                className="object-cover"
                sizes="392px"
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
              {/* Nome sobre a imagem, próximo da base */}
              <div className="absolute inset-x-2 bottom-10 flex justify-center sm:bottom-16">
                <StickerNameTag name={sticker.name} />
              </div>
            </div>

            {/* ── Verso ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-block border-[5px] bg-[#1d501f] px-6 py-8 sm:py-10"
              style={{
                borderColor: color,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <StickerNameTag name={sticker.name} fullWidth />

              <div className="flex min-h-0 flex-1 items-center overflow-y-auto">
                <p className="text-center text-base leading-[1.4] text-white sm:text-xl">
                  {sticker.description ??
                    "Figurinha exclusiva da coleção Fãs da Natureza."}
                </p>
              </div>

              <span
                className="inline-flex items-center gap-2.5 rounded-pill px-10 py-2 text-base font-medium text-verde-100"
                style={{ background: "var(--color-verde-500)" }}
              >
                <ThumbsUp size={17} />
                {rarityName}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Frente / Verso toggle (Figma 28:1535) */}
        <div className="mb-1 mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowBack(false)}
            className="cursor-pointer text-base font-medium uppercase text-verde-500 transition-opacity hover:opacity-80"
          >
            Frente
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={showBack}
            aria-label={showBack ? "Mostrando verso" : "Mostrando frente"}
            onClick={() => setShowBack((v) => !v)}
            className={`relative h-8 w-[87px] cursor-pointer rounded-pill transition-colors ${
              showBack ? "bg-verde-escuro-500" : "bg-verde-500"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute top-[3px] h-[26px] w-[26px] rounded-full ${
                showBack ? "bg-verde-500" : "bg-verde-escuro-500"
              }`}
              style={{ left: showBack ? "calc(100% - 29px)" : "3px" }}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowBack(true)}
            className="cursor-pointer text-base font-medium uppercase text-verde-escuro-500 transition-opacity hover:opacity-80"
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
  // Guard: portals need the DOM — only render after mount (avoids SSR mismatch)
  const [mounted, setMounted]                 = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const color       = rarityColor(sticker?.rarities?.slug, sticker?.rarities?.color_hex);
  const raritySlug  = sticker?.rarities?.slug ?? "common";
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
      {/* ── Slot 160×229, raio 8px, borda 5px na cor da raridade (Figma 28:1120) ── */}
      <motion.div
        layout
        className={[
          "relative aspect-160/229 w-full overflow-hidden rounded-input border-[5px] transition-colors duration-300",
          isComplete
            ? "cursor-pointer"
            : canPaste
            ? "cursor-pointer border-dashed bg-white/10 hover:bg-white/20"
            : "border-white/15 bg-black/20",
        ].join(" ")}
        style={
          isComplete
            ? { borderColor: color }
            : canPaste
            ? { borderColor: `${color}b3` }
            : undefined
        }
        onClick={() => {
          if (isComplete) setShowDetailModal(true);
          else if (canPaste) setShowPasteModal(true);
        }}
        whileHover={!isComplete && canPaste ? { scale: 1.04, y: -2 } : undefined}
        whileTap={!isComplete && canPaste ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isComplete ? (
          /* ── COLADA: imagem ocupa todo o card ─────────────────────── */
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
                sizes="(max-width: 768px) 30vw, 200px"
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
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: `inset 0 0 14px ${color}55` }}
              />
            )}

            <AnimatePresence>
              {showBurst && sticker && (
                <PasteBurst color={color} slug={raritySlug} />
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── NÃO COLADA ─────────────────────────────────────────────── */
          <div className="relative h-full w-full">
            {/* Número do slot */}
            <span className="absolute left-1.5 top-1.5 z-10 rounded-pill bg-black/25 px-1.5 py-0.5 text-[10px] font-bold text-white">
              #{slotNumber}
            </span>

            {/* Repetidas */}
            {owned > 1 && (
              <span className="absolute right-1.5 top-1.5 z-10 rounded-pill bg-amarelo px-1.5 py-0.5 text-[10px] font-bold text-verde-escuro-500">
                {owned}×
              </span>
            )}

            {isOwned ? (
              <div className="relative h-full w-full">
                {sticker ? (
                  <>
                    <Image src={sticker.image_url} alt={sticker.name} fill
                      className="object-cover opacity-50" sizes="(max-width: 768px) 30vw, 200px" />
                    <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-500/30">
                      <motion.div
                        animate={{ scale: [1, 1.18, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-verde-500 shadow-lg shadow-verde-escuro-500/40"
                      >
                        <Plus size={18} className="text-white" />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Plus size={20} className="text-verde-genz" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Lock size={16} className="text-white/30" />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Sticker detail modal (flip frente/verso) ─────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {showDetailModal && sticker && (
            <StickerDetailModal
              sticker={sticker}
              onClose={() => setShowDetailModal(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── PASTE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
        {showPasteModal && sticker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            onClick={() => !pasting && setShowPasteModal(false)}
          >
            <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

            <motion.div
              initial={{ y: 70, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-sm overflow-hidden rounded-card bg-[#ebffe6] shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Card preview with flip-in */}
                <div className="mb-5 flex justify-center" style={{ perspective: "900px" }}>
                  <motion.div
                    initial={{ rotateY: -80, scale: 0.72, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 175, damping: 18, delay: 0.06 }}
                    className="relative aspect-160/229 w-36 overflow-hidden rounded-input border-[5px]"
                    style={{
                      borderColor: color,
                      boxShadow: `0 12px 40px ${color}50, 0 2px 8px rgba(0,0,0,0.15)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <Image src={sticker.image_url} alt={sticker.name} fill
                      className="object-cover" sizes="144px" />
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
                  </motion.div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-center">
                  <h3 className="font-display text-2xl font-bold uppercase text-verde-escuro-500">
                    {sticker.name}
                  </h3>
                  {sticker.rarities && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.22 }}
                      className="inline-flex items-center gap-1.5 rounded-pill px-4 py-1 text-xs font-medium uppercase text-white"
                      style={{ backgroundColor: color }}
                    >
                      {raritySlug === "super_rare" && <Sparkles size={10} />}
                      {sticker.rarities.name}
                    </motion.span>
                  )}
                  <p className="text-sm text-verde-escuro-300">Slot #{slotNumber}</p>
                  {sticker.description && (
                    <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-verde-escuro-400">
                      {sticker.description}
                    </p>
                  )}
                </div>

                {owned > 1 && (
                  <p className="mt-3 text-center text-xs font-medium text-gold-700">
                    Você tem {owned}× — uma será colada, restará {owned - 1}
                  </p>
                )}
                <p className="mt-1.5 text-center text-xs text-verde-escuro-300">
                  Esta ação não pode ser desfeita.
                </p>

                {error && (
                  <p className="mt-2 rounded-input bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setShowPasteModal(false)} disabled={pasting}
                    className="flex-1 cursor-pointer rounded-pill border border-verde-500 py-3 text-sm font-medium text-verde-escuro-500 transition hover:bg-verde-500/10 disabled:opacity-50">
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handlePaste} disabled={pasting}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 cursor-pointer overflow-hidden rounded-pill bg-verde-500 py-3 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-500 disabled:opacity-60"
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
