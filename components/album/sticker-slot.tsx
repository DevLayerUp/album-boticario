"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Lock, Plus, Sparkles, ThumbsUp, Trophy, X, ExternalLink } from "lucide-react";
import { PasteFlight, type PasteFlightConfig } from "@/components/album/paste-flight";
import { FigurinhaNameTag } from "@/components/sticker/figurinha-name-tag";
import { StickerRarityEffects } from "@/components/sticker/sticker-rarity-effects";
import { playPasteSound } from "@/lib/play-paste-sound";
import { rarityColor, rarityTheme, type RarityTheme } from "@/lib/rarity";
import { resolveUserStickerImageUrl } from "@/lib/user-sticker";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SlotSticker {
  id: number;
  name: string;
  description?: string | null;
  image_url: string;
  redirect_url?: string | null;
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
  /** URL atual da figurinha personalizada (profiles.sticker_url) */
  userStickerUrl?: string | null;
  /** default 160×229 — large 199×284 (tri3) — duo 267×381 (duo2) — cta 170×243 (grid6cta) */
  size?: "default" | "large" | "duo" | "cta";
  /** Abre o modal de colagem ao montar (deep link do estoque). */
  autoOpenPaste?: boolean;
}

// ─── Subtle landing ring (replaces emoji burst) ───────────────────────────────
function PasteLandRing({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0.7 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute h-12 w-12 rounded-full"
        style={{ border: `2px solid ${color}` }}
      />
    </motion.div>
  );
}

// ─── Tag de nome da figurinha (Figma 28:1531) ─────────────────────────────────
function StickerNameTag({
  name,
  fullWidth,
  bgColor,
  compact,
}: {
  name: string;
  fullWidth?: boolean;
  bgColor: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-end justify-center rounded-card rounded-br-none px-4 py-2 text-center font-display font-bold uppercase leading-tight text-white",
        fullWidth ? "w-full" : "",
        compact ? "px-3 py-1.5 text-sm leading-snug sm:text-base" : "text-lg sm:text-2xl sm:leading-8",
      )}
      style={{ backgroundColor: bgColor }}
    >
      {name}
    </span>
  );
}

function RarityBadge({
  name,
  slug,
  theme,
  compact,
}: {
  name: string;
  slug: string;
  theme: RarityTheme;
  compact?: boolean;
}) {
  const { badge } = theme;
  const Icon = slug === "super_rare" ? Trophy : ThumbsUp;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-pill font-medium",
        compact ? "gap-1.5 px-5 py-1.5 text-xs sm:text-sm" : "px-10 py-2 text-base",
      )}
      style={{
        color: badge.text,
        background:
          badge.kind === "gradient"
            ? `linear-gradient(to right, ${badge.gradientFrom}, ${badge.gradientTo})`
            : badge.background,
        boxShadow: badge.shadow,
      }}
    >
      <Icon size={compact ? (slug === "super_rare" ? 15 : 13) : slug === "super_rare" ? 20 : 17} />
      {name}
    </span>
  );
}

// ─── Detail modal — flip frente/verso (Figma 28:1191 / 28:1364) ───────────────
function StickerDetailModal({
  sticker,
  userStickerUrl,
  onClose,
}: {
  sticker: SlotSticker;
  userStickerUrl?: string | null;
  onClose: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  const slug       = sticker.rarities?.slug ?? "common";
  const theme      = rarityTheme(slug, sticker.rarities?.color_hex);
  const rarityName = sticker.rarities?.name ?? "Comum";
  const animation  = sticker.rarities?.animation_type ?? "none";
  const materialUrl = sticker.redirect_url?.trim() || null;
  const imageUrl = resolveUserStickerImageUrl(sticker, userStickerUrl) ?? sticker.image_url;

  useEffect(() => {
    setShowBack(false);
  }, [sticker.id]);

  return (
    <motion.div
      key="sticker-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop: tint verde + blur (Figma 28:1510) */}
      <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative flex w-full max-w-[497px] flex-col overflow-hidden rounded-card bg-[#ebffe6] p-4 shadow-card sm:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center text-black transition-colors hover:text-verde-escuro-500 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        >
          <X className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
        </button>

        {/* Flip card — altura limitada ao viewport para evitar scroll no modal */}
        <div
          className="mx-auto mt-6 w-[min(100%,392px,calc((92dvh-10.5rem)*392/560))] shrink-0"
          style={{ perspective: "1200px" }}
        >
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
                borderColor: theme.border,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <Image
                src={imageUrl}
                alt={sticker.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 280px, 392px"
                priority
              />
              <StickerRarityEffects
                slug={slug}
                animationType={animation}
                color={theme.border}
                intensity="strong"
              />
              <div className="absolute inset-x-2 bottom-6 flex justify-center sm:bottom-10">
                <StickerNameTag name={sticker.name} bgColor={theme.nameTag} compact />
              </div>
            </div>

            {/* ── Verso ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-between gap-2 overflow-hidden rounded-block border-[5px] px-4 py-5 sm:gap-3 sm:px-5 sm:py-6"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.backBg,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <StickerNameTag name={sticker.name} fullWidth bgColor={theme.nameTag} compact />

              <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-hidden sm:gap-2.5">
                <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30">
                  <p className="wrap-break-word px-0.5 text-center text-[11px] leading-[1.45] text-white sm:text-xs md:text-sm">
                    {sticker.description ??
                      "Figurinha exclusiva da coleção Fãs da Natureza."}
                  </p>
                </div>

                {materialUrl ? (
                  <a
                    href={materialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-pill bg-white px-4 py-2 text-xs font-semibold text-verde-escuro-500 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-verde-100 sm:min-h-10 sm:gap-2 sm:px-5 sm:text-sm"
                  >
                    <ExternalLink size={14} className="sm:h-4 sm:w-4" aria-hidden />
                    Acessar material
                  </a>
                ) : null}
              </div>

              <RarityBadge name={rarityName} slug={slug} theme={theme} compact />
            </div>
          </motion.div>
        </div>

        {/* Frente / Verso toggle (Figma 28:1535) */}
        <div className="mt-4 flex shrink-0 items-center justify-center gap-3 pb-0.5 sm:mt-5 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowBack(false)}
            className="cursor-pointer text-sm font-medium uppercase text-verde-500 transition-opacity hover:opacity-80 sm:text-base"
          >
            Frente
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={showBack}
            aria-label={showBack ? "Mostrando verso" : "Mostrando frente"}
            onClick={() => setShowBack((v) => !v)}
            className={`relative h-7 w-[76px] cursor-pointer rounded-pill transition-colors sm:h-8 sm:w-[87px] ${
              showBack ? "bg-verde-escuro-500" : "bg-verde-500"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "absolute top-[3px] h-[22px] w-[22px] rounded-full sm:h-[26px] sm:w-[26px]",
                showBack ? "right-[3px] bg-verde-500" : "left-[3px] bg-verde-escuro-500",
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowBack(true)}
            className="cursor-pointer text-sm font-medium uppercase text-verde-escuro-500 transition-opacity hover:opacity-80 sm:text-base"
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
  slotId, slotNumber, sticker, isPasted, owned, onPaste, userStickerUrl = null, size = "default", autoOpenPaste = false,
}: StickerSlotProps) {
  const aspectClass =
    size === "cta"
      ? "aspect-[170/243]"
      : size === "duo"
        ? "aspect-[267/381]"
        : size === "large"
          ? "aspect-[199/284]"
          : "aspect-160/229";
  const radiusClass =
    size === "cta" || size === "duo" ? "rounded-[16px]" : "rounded-input";
  const imageSizes  =
    size === "cta"
      ? "170px"
      : size === "duo"
        ? "267px"
        : size === "large"
          ? "199px"
          : "(max-width: 768px) 30vw, 200px";
  const isBigCard   = size === "large" || size === "duo" || size === "cta";
  const [showPasteModal, setShowPasteModal]   = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pasting, setPasting]                 = useState(false);
  const [justPasted, setJustPasted]           = useState(false);
  const [isFlying, setIsFlying]               = useState(false);
  const [flightConfig, setFlightConfig]       = useState<PasteFlightConfig | null>(null);
  const [showLandRing, setShowLandRing]       = useState(false);
  const [error, setError]                     = useState("");
  const slotRef    = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Guard: portals need the DOM — only render after mount (avoids SSR mismatch)
  const [mounted, setMounted]                 = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stickerImageUrl =
    resolveUserStickerImageUrl(sticker, userStickerUrl) ?? sticker?.image_url ?? null;

  const color       = rarityColor(sticker?.rarities?.slug, sticker?.rarities?.color_hex);
  const raritySlug  = sticker?.rarities?.slug ?? "common";
  const theme       = rarityTheme(raritySlug, sticker?.rarities?.color_hex);
  const animation   = sticker?.rarities?.animation_type ?? "none";
  const isOwned     = owned > 0;
  const canPaste    = isOwned && !isPasted && !isFlying && sticker !== null;
  const isMissing   = !isOwned && sticker !== null;
  const isComplete  = (isPasted || justPasted) && !isFlying;
  const isAwaitingLand = isFlying;

  const slotLabel = isComplete
    ? sticker?.name
    : canPaste
      ? `Colar ${sticker?.name ?? `figurinha ${slotNumber}`}`
      : isMissing
        ? `${sticker.name}, ainda não obtida`
        : `Espaço ${slotNumber}`;

  useEffect(() => {
    if (!autoOpenPaste || !canPaste) return;
    const timeout = window.setTimeout(() => setShowPasteModal(true), 500);
    return () => window.clearTimeout(timeout);
  }, [autoOpenPaste, canPaste]);

  const onFlightComplete = useCallback(() => {
    setIsFlying(false);
    setFlightConfig(null);
    setJustPasted(true);
    setShowLandRing(true);
    setTimeout(() => setShowLandRing(false), 700);
  }, []);

  async function handlePaste() {
    if (!sticker || !onPaste) return;

    const fromRect = previewRef.current?.getBoundingClientRect();

    setPasting(true);
    setError("");
    try {
      await onPaste(slotId, sticker.id);
      setShowPasteModal(false);

      const toRect = slotRef.current?.getBoundingClientRect();
      const canFly =
        !reducedMotion && fromRect && toRect && fromRect.width > 0 && toRect.width > 0;

      if (canFly && stickerImageUrl) {
        setFlightConfig({
          imageUrl: stickerImageUrl,
          borderColor: color,
          from: fromRect,
          to: toRect,
        });
        setIsFlying(true);
      } else {
        setJustPasted(true);
        playPasteSound();
        setShowLandRing(true);
        setTimeout(() => setShowLandRing(false), 700);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao colar figurinha");
    } finally {
      setPasting(false);
    }
  }

  return (
    <>
      {/* ── Slot 160×229, raio 8px, borda 5px na cor da raridade (Figma 28:1120) ──
           Rendered as <button> so the flip-book library treats it as an
           interactive target (clickEventForward): taps open the modal and never
           trigger a page flip. Inner content is pointer-events-none so the touch
           target is always the button itself, not a child img/div/span. */}
      <motion.button
        ref={slotRef}
        type="button"
        layout
        data-slot-id={slotId}
        aria-label={slotLabel}
        className={[
          `relative block ${aspectClass} w-full overflow-hidden ${radiusClass} border-[5px] text-left transition-colors duration-300`,
          isComplete
            ? "cursor-pointer"
            : isAwaitingLand
            ? "border-dashed bg-white/5"
            : canPaste
            ? "cursor-pointer border-dashed bg-white/10 hover:bg-white/20"
            : isMissing
            ? "cursor-default border-dashed bg-black/15"
            : "cursor-default border-white/15 bg-black/20",
          autoOpenPaste && canPaste && "ring-2 ring-verde-500 ring-offset-2 ring-offset-transparent",
        ].join(" ")}
        style={
          isComplete
            ? { borderColor: color }
            : isAwaitingLand || canPaste
            ? { borderColor: `${color}b3` }
            : isMissing
            ? { borderColor: `${color}55` }
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
            initial={justPasted ? { filter: "brightness(1.25)" } : false}
            animate={{ filter: "brightness(1)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none relative h-full w-full"
            style={{
              boxShadow: "0 1px 2px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.06)",
            }}
          >
            {sticker && stickerImageUrl && (
              <Image
                src={stickerImageUrl}
                alt={sticker.name}
                fill
                className="object-cover"
                sizes={imageSizes}
              />
            )}

            <StickerRarityEffects
              slug={raritySlug}
              animationType={animation}
              color={color}
              intensity={isBigCard ? "strong" : "normal"}
            />

            {sticker && (
              <FigurinhaNameTag
                name={sticker.name}
                bgColor={theme.nameTag}
                overlay
                compact
                pinBottom
              />
            )}

            <AnimatePresence>
              {showLandRing && <PasteLandRing color={color} />}
            </AnimatePresence>
          </motion.div>
        ) : isAwaitingLand ? (
          /* ── AGUARDANDO POUSO (voo em andamento) ───────────────────── */
          <div className="pointer-events-none relative h-full w-full">
            <span className="absolute left-1.5 top-1.5 z-10 rounded-pill bg-black/25 px-1.5 py-0.5 text-[10px] font-bold text-white">
              #{slotNumber}
            </span>
          </div>
        ) : (
          /* ── NÃO COLADA ─────────────────────────────────────────────── */
          <div className="pointer-events-none relative h-full w-full">
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
                {sticker && stickerImageUrl ? (
                  <>
                    <Image src={stickerImageUrl} alt={sticker.name} fill
                      className="object-cover opacity-50" sizes={imageSizes} />
                    <StickerRarityEffects
                      slug={raritySlug}
                      animationType={animation}
                      color={color}
                      intensity={isBigCard ? "normal" : "subtle"}
                    />
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
              <div className="relative h-full w-full">
                {sticker && stickerImageUrl ? (
                  <>
                    <Image
                      src={stickerImageUrl}
                      alt=""
                      fill
                      className="object-cover grayscale opacity-35"
                      sizes={imageSizes}
                    />
                    <StickerRarityEffects
                      slug={raritySlug}
                      animationType={animation}
                      color={color}
                      intensity="subtle"
                      muted
                    />
                    <div className="absolute inset-0 bg-verde-escuro-capa/25" aria-hidden />
                    <div
                      className={cn(
                        "absolute inset-x-0 z-[5] flex -translate-y-1/2 justify-center",
                        isBigCard ? "top-[32%]" : "top-[30%]",
                      )}
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-surface/90 shadow-sm sm:size-8">
                        <Lock
                          size={isBigCard ? 14 : 12}
                          className="text-verde-escuro-300"
                          aria-hidden
                        />
                      </span>
                    </div>
                    <FigurinhaNameTag
                      name={sticker.name}
                      bgColor={theme.nameTag}
                      overlay
                      compact
                      pinBottom
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Lock size={16} className="text-white/30" aria-hidden />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.button>

      {/* ── Sticker detail modal (flip frente/verso) ─────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {showDetailModal && sticker && (
            <StickerDetailModal
              sticker={sticker}
              userStickerUrl={userStickerUrl}
              onClose={() => setShowDetailModal(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── PASTE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
        {showPasteModal && sticker && stickerImageUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => !pasting && setShowPasteModal(false)}
          >
            <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-card bg-[#ebffe6] shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Card preview with flip-in */}
                <div className="mb-5 flex justify-center" style={{ perspective: "900px" }}>
                  <motion.div
                    ref={previewRef}
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
                    <Image src={stickerImageUrl} alt={sticker.name} fill
                      className="object-cover" sizes="144px" />
                    <StickerRarityEffects
                      slug={raritySlug}
                      animationType={animation}
                      color={color}
                      intensity="normal"
                    />
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
                        Colar!
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

      {/* ── FLIP flight overlay (modal → slot) ─────────────────────────────────── */}
      {mounted && flightConfig && isFlying && (
        <PasteFlight config={flightConfig} onComplete={onFlightComplete} />
      )}
    </>
  );
}
