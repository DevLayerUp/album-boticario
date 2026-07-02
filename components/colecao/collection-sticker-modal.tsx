"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BookOpen,
  Lock,
  Sparkles,
  ThumbsUp,
  Trophy,
  X,
} from "lucide-react";
import { rarityTheme } from "@/lib/rarity";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import { cn } from "@/lib/utils";
import { StickerFormattedText } from "@/components/sticker/sticker-formatted-text";
import { AutoFitText } from "@/components/sticker/auto-fit-text";
import { StickerRarityEffects } from "@/components/sticker/sticker-rarity-effects";
import type { CollectionSticker } from "./types";

interface CollectionStickerModalProps {
  sticker: CollectionSticker;
  quantity: number;
  onClose: () => void;
}

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
      className={cn(
        "flex items-end justify-center rounded-card rounded-br-none px-4 py-2 text-center font-display text-lg font-bold uppercase leading-tight text-white sm:text-2xl sm:leading-8",
        fullWidth && "w-full",
      )}
      style={{ backgroundColor: bgColor }}
    >
      <StickerFormattedText text={name} uppercasePlain />
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
  theme: ReturnType<typeof rarityTheme>;
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

export function CollectionStickerModal({
  sticker,
  quantity,
  onClose,
}: CollectionStickerModalProps) {
  const [showBack, setShowBack] = useState(false);
  const owned = quantity > 0;
  const slug  = sticker.rarities?.slug ?? "common";
  const theme = rarityTheme(slug, sticker.rarities?.color_hex);
  const rarityName = sticker.rarities?.name ?? "Comum";
  const animation  = sticker.rarities?.animation_type ?? "none";

  useEffect(() => {
    setShowBack(false);
  }, [sticker.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      key="collection-sticker-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-modal-title"
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
          className="absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center text-verde-escuro-500 transition-colors hover:text-verde-escuro-capa"
        >
          <X size={32} strokeWidth={2.5} />
        </button>

        {/* Status + meta */}
        <div className="pr-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700/80">
            {owned ? "Na sua coleção" : "Ainda não obtida"}
          </p>
          <h2
            id="collection-modal-title"
            className="mt-1 font-display text-2xl font-bold uppercase text-verde-escuro-500 sm:text-3xl"
          >
            <StickerFormattedText text={sticker.name} uppercasePlain />
          </h2>
          {sticker.sticker_categories && (
            <p className="mt-1 text-sm text-verde-escuro-capa/60">
              {sticker.sticker_categories.name}
            </p>
          )}
        </div>

        {!owned ? (
          <div className="mx-auto mt-8 flex w-full max-w-[280px] flex-col items-center gap-4 text-center">
            <div
              className="relative aspect-160/229 w-full overflow-hidden rounded-block border-[5px] border-dashed opacity-80"
              style={{ borderColor: `${theme.border}88` }}
            >
              <Image
                src={sticker.image_url}
                alt={stickerTextToPlain(sticker.name)}
                fill
                className="object-cover grayscale opacity-40"
                sizes="280px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-verde-escuro-capa/20">
                <Lock size={32} className="text-verde-escuro-300" aria-hidden />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-verde-escuro-capa/65">
              Abra pacotinhos, complete missões ou participe de trocas para
              descobrir esta figurinha.
            </p>
            <Link
              href="/pacotinhos"
              className="inline-flex h-10 items-center gap-2 rounded-pill bg-gold-500 px-8 text-sm font-medium text-white transition-colors hover:bg-gold-700"
            >
              Ver pacotinhos
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto mt-6 w-full max-w-[392px]" style={{ perspective: "1200px" }}>
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
                    alt={stickerTextToPlain(sticker.name)}
                    fill
                    className="object-cover"
                    sizes="392px"
                    priority
                  />
                  <StickerRarityEffects
                    slug={slug}
                    animationType={animation}
                    color={theme.border}
                    intensity="strong"
                  />
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
                  <AutoFitText
                    contentKey={sticker.description ?? ""}
                    minFontSize={12}
                    maxFontSize={20}
                    lineHeight={1.4}
                    className="min-h-0 w-full flex-1"
                    textClassName="text-white"
                  >
                    <StickerFormattedText
                      text={
                        sticker.description ??
                        "Figurinha exclusiva da coleção Fãs por Natureza."
                      }
                    />
                  </AutoFitText>
                  <RarityBadge name={rarityName} slug={slug} theme={theme} />
                </div>
              </motion.div>
            </div>

            <div className="mb-1 mt-6 flex items-center justify-center gap-4">
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
                className={cn(
                  "relative h-8 w-[87px] cursor-pointer rounded-pill transition-colors",
                  showBack ? "bg-gold-700" : "bg-gold-500",
                )}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "absolute top-[3px] h-[26px] w-[26px] rounded-full bg-surface",
                  )}
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

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-gold-500/20 pt-5">
              {quantity > 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-amarelo/90 px-3 py-1 text-xs font-bold text-verde-escuro-500">
                  <Sparkles size={11} aria-hidden />
                  {quantity}× no inventário
                </span>
              )}
              <Link
                href="/album"
                className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-verde-500 px-5 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-500"
              >
                <BookOpen size={14} aria-hidden />
                Ver álbum
              </Link>
              {quantity > 1 && (
                <Link
                  href="/trocas"
                  className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-gold-500/50 bg-surface px-5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-gold-500/10"
                >
                  <ArrowLeftRight size={14} aria-hidden />
                  Trocar
                </Link>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
