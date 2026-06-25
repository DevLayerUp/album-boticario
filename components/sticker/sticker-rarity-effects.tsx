"use client";

import { motion, useReducedMotion } from "framer-motion";
import { rarityColorAlpha, resolveStickerAnimation } from "@/lib/sticker-animation";
import { cn } from "@/lib/utils";

export type StickerEffectIntensity = "subtle" | "normal" | "strong";

interface StickerRarityEffectsProps {
  slug?: string | null;
  animationType?: string | null;
  /** Cor da raridade (borda) — usada no brilho das raras. */
  color: string;
  intensity?: StickerEffectIntensity;
  /** Reduz opacidade (ex.: figurinha em grayscale / faltante). */
  muted?: boolean;
  className?: string;
}

const OPACITY = {
  subtle: { glow: 0.45, holo: 0.18, holoGlow: 0.35 },
  normal: { glow: 0.7, holo: 0.28, holoGlow: 0.5 },
  strong: { glow: 0.9, holo: 0.38, holoGlow: 0.65 },
} as const;

function GlowEffect({
  color,
  intensity,
  muted,
  reducedMotion,
}: {
  color: string;
  intensity: StickerEffectIntensity;
  muted: boolean;
  reducedMotion: boolean;
}) {
  const o = OPACITY[intensity].glow * (muted ? 0.45 : 1);

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: `inset 0 0 12px ${rarityColorAlpha(color, o * 0.55)}` }}
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      animate={{
        boxShadow: [
          `inset 0 0 6px ${rarityColorAlpha(color, o * 0.28)}`,
          `inset 0 0 16px ${rarityColorAlpha(color, o * 0.62)}`,
          `inset 0 0 6px ${rarityColorAlpha(color, o * 0.28)}`,
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function HolographicEffect({
  intensity,
  muted,
  reducedMotion,
}: {
  intensity: StickerEffectIntensity;
  muted: boolean;
  reducedMotion: boolean;
}) {
  const holoOpacity = OPACITY[intensity].holo * (muted ? 0.5 : 1);
  const duration = intensity === "subtle" ? 5 : intensity === "strong" ? 3 : 4;

  return (
    <>
      {/* Faixa prateada em movimento */}
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        aria-hidden
        animate={reducedMotion ? undefined : { backgroundPositionX: ["0%", "200%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        style={{
          opacity: holoOpacity,
          background:
            "linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.92) 40%, rgba(255,240,180,0.55) 48%, transparent 68%)",
          backgroundSize: "200% 100%",
        }}
      />
      {/* Iridescência dourada / azul — sentido oposto */}
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        aria-hidden
        animate={reducedMotion ? undefined : { backgroundPositionX: ["200%", "0%"] }}
        transition={{ duration: duration * 1.35, repeat: Infinity, ease: "linear" }}
        style={{
          opacity: holoOpacity * 0.85,
          background:
            "linear-gradient(125deg, rgba(0,174,219,0.35) 0%, rgba(255,224,122,0.45) 45%, rgba(181,125,2,0.4) 100%)",
          backgroundSize: "220% 100%",
        }}
      />
    </>
  );
}

function HolographicAura({
  color,
  intensity,
  muted,
  reducedMotion,
}: {
  color: string;
  intensity: StickerEffectIntensity;
  muted: boolean;
  reducedMotion: boolean;
}) {
  const o = OPACITY[intensity].holoGlow * (muted ? 0.45 : 1);

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: `inset 0 0 14px ${rarityColorAlpha(color, o * 0.5)}` }}
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      animate={{
        boxShadow: [
          `inset 0 0 10px ${rarityColorAlpha(color, o * 0.38)}`,
          `inset 0 0 22px rgba(227, 179, 22, ${o * 0.35})`,
          `inset 0 0 10px ${rarityColorAlpha(color, o * 0.38)}`,
        ],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/**
 * Overlays de raridade sobre figurinhas.
 * - Rara: pulso de brilho (glow) na cor da raridade.
 * - Super rara: shimmer holográfico + aura dourada.
 */
export function StickerRarityEffects({
  slug,
  animationType,
  color,
  intensity = "normal",
  muted = false,
  className,
}: StickerRarityEffectsProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const animation = resolveStickerAnimation(slug, animationType);

  if (animation === "none") return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {animation === "glow" ? (
        <GlowEffect
          color={color}
          intensity={intensity}
          muted={muted}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {animation === "holographic" ? (
        <>
          <HolographicEffect
            intensity={intensity}
            muted={muted}
            reducedMotion={reducedMotion}
          />
          <HolographicAura
            color={color}
            intensity={intensity}
            muted={muted}
            reducedMotion={reducedMotion}
          />
        </>
      ) : null}
    </div>
  );
}
