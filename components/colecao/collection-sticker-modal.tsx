"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftRight, Layers, Tag, X } from "lucide-react";
import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { CollectionSticker } from "./types";

interface CollectionStickerModalProps {
  sticker: CollectionSticker;
  quantity: number;
  onClose: () => void;
}

/**
 * Modal de detalhe de figurinha na coleção.
 *
 * Layout: overlay escuro + painel central.
 * Desktop: imagem à esquerda + infos à direita.
 * Mobile: empilhado verticalmente.
 *
 * Segue guia-visual.md: tipografia hierárquica, paleta verde-institucional,
 * espaçamento generoso, CTAs sóbrios com rótulos curtos.
 */
export function CollectionStickerModal({
  sticker,
  quantity,
  onClose,
}: CollectionStickerModalProps) {
  const theme = rarityTheme(sticker.rarities?.slug, sticker.rarities?.color_hex);
  const rarityName = sticker.rarities?.name ?? "Comum";
  const categoryName = sticker.sticker_categories?.name;
  const isDuplicate = quantity > 1;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 bg-verde-escuro-capa/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden
      />

      {/* Painel */}
      <motion.div
        role="dialog"
        aria-modal
        aria-label={`Detalhes de ${sticker.name}`}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2",
          "overflow-hidden rounded-card bg-surface shadow-[0_24px_60px_rgba(5,46,4,0.35)]",
        )}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Faixa de cor de raridade no topo */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: theme.border }}
          aria-hidden
        />

        <div className="flex flex-col sm:flex-row">
          {/* ── Coluna da imagem ─────────────────────────────────── */}
          <div
            className="relative flex shrink-0 items-center justify-center overflow-hidden sm:w-[220px]"
            style={{ backgroundColor: theme.backBg }}
          >
            <div className="relative m-5 aspect-2/3 w-[140px] sm:w-[160px]">
              <Image
                src={sticker.image_url}
                alt={sticker.name}
                fill
                sizes="200px"
                className="rounded-[12px] object-cover shadow-lg"
                style={{ border: `3px solid ${theme.border}` }}
                priority
              />
            </div>

            {/* Badge de quantidade absoluto sobre a imagem */}
            {quantity > 0 && (
              <div
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: theme.border,
                  color: "#fff",
                }}
              >
                <Layers size={11} strokeWidth={2.5} aria-hidden />
                {quantity}×
              </div>
            )}
          </div>

          {/* ── Coluna de detalhes ───────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* Label institucional — caixa-alta pequena */}
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-verde-escuro-400/60">
                  Figurinha
                </p>
                <h2 className="mt-0.5 font-display text-2xl font-bold leading-tight text-verde-escuro-500">
                  {sticker.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="mt-0.5 flex shrink-0 size-8 items-center justify-center rounded-full border border-border bg-surface text-verde-escuro-400 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500"
              >
                <X size={15} strokeWidth={2.5} aria-hidden />
              </button>
            </div>

            {/* Badges — raridade + categoria */}
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background:
                    theme.badge.kind === "gradient"
                      ? `linear-gradient(135deg, ${theme.badge.gradientFrom}, ${theme.badge.gradientTo})`
                      : (theme.badge.background ?? theme.border),
                  color: theme.badge.text,
                  boxShadow: theme.badge.shadow,
                }}
              >
                {rarityName}
              </span>

              {categoryName && (
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold-500/30 bg-surface-gold px-3 py-1 text-[11px] font-semibold text-gold-700">
                  <Tag size={10} strokeWidth={2} aria-hidden />
                  {categoryName}
                </span>
              )}
            </div>

            {/* Descrição */}
            {sticker.description && (
              <p className="text-sm leading-relaxed text-verde-escuro-capa/65">
                {sticker.description}
              </p>
            )}

            {/* Status de posse */}
            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
              {quantity === 0 ? (
                <p className="text-sm text-verde-escuro-400/70">
                  Você ainda não tem esta figurinha.
                </p>
              ) : (
                <p className="text-sm text-verde-escuro-500">
                  Você tem{" "}
                  <strong className="font-bold">
                    {quantity} cópia{quantity > 1 ? "s" : ""}
                  </strong>{" "}
                  desta figurinha.
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-2">
                {isDuplicate && (
                  <Link
                    href="/trocas"
                    onClick={onClose}
                    className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-verde-500 px-4 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-500"
                  >
                    <ArrowLeftRight size={13} aria-hidden />
                    Oferecer para troca
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 items-center rounded-pill border border-border bg-surface px-4 text-sm font-medium text-verde-escuro-400 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
