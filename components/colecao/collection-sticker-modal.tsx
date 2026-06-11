"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Package, ThumbsUp, Trophy, X } from "lucide-react";
import { rarityTheme } from "@/lib/rarity";
import type { RarityTheme } from "@/lib/rarity";
import type { CollectionSticker } from "./types";

function StickerNameTag({
  name,
  fullWidth,
  bgColor,
}: {
  name: string;
  fullWidth?: boolean;
  bgColor: string;
}) {
  return (
    <span
      className={`flex items-end justify-center rounded-card rounded-br-none px-4 py-2 text-center font-display text-lg font-bold uppercase leading-tight text-white sm:text-2xl sm:leading-8 ${
        fullWidth ? "w-full" : ""
      }`}
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
}: {
  name: string;
  slug: string;
  theme: RarityTheme;
}) {
  const { badge } = theme;
  const Icon = slug === "super_rare" ? Trophy : ThumbsUp;

  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-pill px-10 py-2 text-base font-medium"
      style={{
        color: badge.text,
        background:
          badge.kind === "gradient"
            ? `linear-gradient(to right, ${badge.gradientFrom}, ${badge.gradientTo})`
            : badge.background,
        boxShadow: badge.shadow,
      }}
    >
      <Icon size={slug === "super_rare" ? 20 : 17} />
      {name}
    </span>
  );
}

interface CollectionStickerModalProps {
  sticker: CollectionSticker;
  quantity: number;
  onClose: () => void;
}

export function CollectionStickerModal({
  sticker,
  quantity,
  onClose,
}: CollectionStickerModalProps) {
  const [showBack, setShowBack] = useState(false);
  const owned = quantity > 0;

  const slug       = sticker.rarities?.slug ?? "common";
  const theme      = rarityTheme(slug, sticker.rarities?.color_hex);
  const rarityName = sticker.rarities?.name ?? "Comum";
  const animation  = sticker.rarities?.animation_type ?? "none";

  useEffect(() => {
    setShowBack(false);
  }, [sticker.id]);

  return (
    <motion.div
      key="collection-sticker-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative flex max-h-[92dvh] w-full max-w-[497px] flex-col overflow-y-auto rounded-card bg-surface-gold p-6 shadow-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center text-verde-escuro-500 transition-colors hover:text-gold-700"
        >
          <X size={32} strokeWidth={2.5} />
        </button>

        {!owned ? (
          /* ── Não descoberta ── */
          <div className="mt-8 flex flex-col items-center gap-5 text-center">
            <div className="relative aspect-160/229 w-40 overflow-hidden rounded-block border-[5px] border-white/25">
              <Image
                src={sticker.image_url}
                alt=""
                fill
                className="object-cover blur-sm grayscale brightness-50"
                sizes="160px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-capa/50">
                <Lock size={28} className="text-white/80" aria-hidden />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700/70">
                Ainda não descoberta
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase text-verde-escuro-500">
                {sticker.name}
              </h2>
              {sticker.sticker_categories && (
                <p className="mt-1 text-sm text-verde-escuro-400">
                  {sticker.sticker_categories.name}
                </p>
              )}
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-verde-escuro-capa/65">
              Abra pacotinhos ou complete missões para encontrar esta figurinha na sua coleção.
            </p>
            <Link
              href="/pacotinhos"
              className="inline-flex h-10 items-center gap-2 rounded-pill bg-gold-500 px-8 text-sm font-semibold text-white transition-colors hover:bg-gold-700"
            >
              <Package size={15} aria-hidden />
              Ver pacotinhos
            </Link>
          </div>
        ) : (
          <>
            {/* Quantidade */}
            {quantity > 1 && (
              <p className="mt-2 text-center text-xs font-medium text-gold-700">
                Você possui {quantity} cópias
              </p>
            )}

            {/* Flip card */}
            <div className="mx-auto mt-4 w-full max-w-[392px]" style={{ perspective: "1200px" }}>
              <motion.div
                animate={{ rotateY: showBack ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-392/560 w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-block border-[5px]"
                  style={{
                    borderColor: theme.border,
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
                  <div className="absolute inset-x-2 bottom-10 flex justify-center sm:bottom-16">
                    <StickerNameTag name={sticker.name} bgColor={theme.nameTag} />
                  </div>
                </div>

                <div
                  className="absolute inset-0 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-block border-[5px] px-6 py-8 sm:py-10"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.backBg,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <StickerNameTag name={sticker.name} fullWidth bgColor={theme.nameTag} />
                  <div className="flex min-h-0 flex-1 items-center overflow-y-auto">
                    <p className="text-center text-base leading-[1.4] text-white sm:text-xl">
                      {sticker.description ??
                        "Figurinha exclusiva da coleção Fãs da Natureza."}
                    </p>
                  </div>
                  <RarityBadge name={rarityName} slug={slug} theme={theme} />
                </div>
              </motion.div>
            </div>

            {/* Frente / Verso */}
            <div className="mb-1 mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowBack(false)}
                className="cursor-pointer text-base font-medium uppercase text-gold-700 transition-opacity hover:opacity-80"
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
                  showBack ? "bg-gold-700" : "bg-gold-500"
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white`}
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
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
