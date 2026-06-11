"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  BookOpen,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { CollectionStickerCard } from "@/components/colecao/collection-sticker-card";
import { CollectionStickerModal } from "@/components/colecao/collection-sticker-modal";
import { CollectionStatCard } from "@/components/colecao/collection-stat-card";
import type {
  CollectionCategory,
  CollectionRarity,
  CollectionSticker,
} from "@/components/colecao/types";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { rarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";

interface ColecaoClientProps {
  allStickers: CollectionSticker[];
  ownedMap: Record<number, number>;
  categories: CollectionCategory[];
  rarities: CollectionRarity[];
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 cursor-pointer rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
        active
          ? "border-transparent text-white shadow-sm"
          : "border-gold-500/40 bg-surface text-verde-escuro-400 hover:border-gold-500/70 hover:text-verde-escuro-500",
      )}
      style={
        active
          ? {
              backgroundColor: color ?? "var(--color-gold-500)",
              boxShadow: color ? `0 0 10px ${color}55` : undefined,
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

export function ColecaoClient({
  allStickers,
  ownedMap,
  categories,
  rarities,
}: ColecaoClientProps) {
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState<number | null>(null);
  const [rarFilter, setRarFilter]     = useState<number | null>(null);
  const [onlyOwned, setOnlyOwned]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<CollectionSticker | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = useMemo(
    () =>
      allStickers.filter((s) => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (catFilter && s.sticker_categories?.id !== catFilter) return false;
        if (rarFilter && s.rarities?.id !== rarFilter) return false;
        if (onlyOwned && !ownedMap[s.id]) return false;
        return true;
      }),
    [allStickers, search, catFilter, rarFilter, onlyOwned, ownedMap],
  );

  const ownedTotal     = allStickers.filter((s) => (ownedMap[s.id] ?? 0) > 0).length;
  const missingTotal   = allStickers.length - ownedTotal;
  const duplicateTotal = allStickers.reduce((acc, s) => {
    const q = ownedMap[s.id] ?? 0;
    return acc + (q > 1 ? q - 1 : 0);
  }, 0);
  const progressPct =
    allStickers.length > 0 ? Math.round((ownedTotal / allStickers.length) * 100) : 0;

  const hasActiveFilters =
    Boolean(search) || catFilter !== null || rarFilter !== null || onlyOwned;

  function clearFilters() {
    setSearch("");
    setCatFilter(null);
    setRarFilter(null);
    setOnlyOwned(false);
  }

  const activeFilterCount =
    (search ? 1 : 0) +
    (catFilter !== null ? 1 : 0) +
    (rarFilter !== null ? 1 : 0) +
    (onlyOwned ? 1 : 0);

  const selectedQty = selectedSticker ? (ownedMap[selectedSticker.id] ?? 0) : 0;

  return (
    <div className="flex flex-col gap-8 md:gap-10">

      {/* ── Hero (tema gold — FeatureCard pattern) ───────────────────────── */}
      <section className="overflow-hidden rounded-card shadow-card">
        <div className="relative h-[140px] overflow-hidden bg-gold-500 md:h-[168px]">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${dashboardAssets.cards.colecao})` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-gold-700/75 via-gold-700/20 to-transparent" />
        </div>

        <div className="bg-surface-gold px-6 py-5 md:px-8 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-700/80">
                Inventário
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold leading-[1.2] text-verde-escuro-500 md:text-5xl">
                Minha Coleção
              </h1>
              <p className="mt-2 text-base text-verde-escuro-capa/65 md:text-lg">
                {ownedTotal} de {allStickers.length} figurinhas descobertas
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className="relative h-2.5 w-full max-w-[280px] overflow-hidden rounded-pill bg-gold-500/25"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${progressPct}% da coleção descoberta`}
                >
                  <motion.div
                    className="h-full rounded-pill bg-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/35 to-transparent"
                  />
                </div>
                <span className="shrink-0 font-display text-xl font-bold text-gold-700">
                  {progressPct}%
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/album"
                className="inline-flex h-10 items-center gap-2 rounded-pill bg-verde-500 px-6 text-sm font-medium text-white transition-colors hover:bg-verde-escuro-500"
              >
                <BookOpen size={15} aria-hidden />
                Ver álbum
              </Link>
              {duplicateTotal > 0 && (
                <Link
                  href="/trocas"
                  className="inline-flex h-10 items-center gap-2 rounded-pill border border-gold-500/60 bg-surface px-5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-gold-500/10"
                >
                  <ArrowLeftRight size={15} aria-hidden />
                  Trocar repetidas
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats (Design System §4 Stat card — tema gold) ─────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CollectionStatCard
          label="Descobertas"
          value={ownedTotal}
          icon={Sparkles}
          accent="var(--color-verde-escuro-500)"
        />
        <CollectionStatCard
          label="Repetidas"
          value={duplicateTotal}
          hint={duplicateTotal > 0 ? "disponíveis para troca" : undefined}
          icon={Layers}
          accent="var(--color-gold-700)"
          href={duplicateTotal > 0 ? "/trocas" : undefined}
        />
        <CollectionStatCard
          label="Faltam"
          value={missingTotal}
          icon={Target}
          accent="var(--color-verde-escuro-400)"
        />
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <section aria-label="Filtros da coleção" className="rounded-block border border-gold-500/20 bg-surface p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-verde-escuro-300"
              aria-hidden
            />
            <input
              type="search"
              aria-label="Buscar figurinha"
              placeholder="Buscar por nome…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-input border border-border bg-surface py-2 pl-9 pr-3 text-sm text-verde-escuro-500 outline-none transition-colors placeholder:text-verde-escuro-300 focus:border-gold-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "relative flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-input border px-3.5 text-sm font-medium transition-colors",
                showFilters || activeFilterCount > 0
                  ? "border-gold-500 bg-gold-500/10 text-verde-escuro-500"
                  : "border-border bg-surface text-verde-escuro-400 hover:border-gold-500/50",
              )}
              aria-expanded={showFilters}
              aria-label="Filtros avançados"
            >
              <SlidersHorizontal size={14} aria-hidden />
              <span className="hidden sm:inline">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label
              className={cn(
                "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-input border px-3.5 text-sm font-medium transition-colors",
                onlyOwned
                  ? "border-gold-500 bg-gold-500/10 text-verde-escuro-500"
                  : "border-border bg-surface text-verde-escuro-400 hover:border-gold-500/50",
              )}
            >
              <input
                type="checkbox"
                checked={onlyOwned}
                onChange={(e) => setOnlyOwned(e.target.checked)}
                className="size-3.5 rounded border-gold-500/40 accent-gold-500"
              />
              <span className="hidden sm:inline">Minhas</span>
            </label>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-col gap-4 border-t border-gold-500/15 pt-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gold-700/80">
                    Raridade
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="Todas"
                      active={rarFilter === null}
                      onClick={() => setRarFilter(null)}
                    />
                    {rarities.map((r) => (
                      <FilterChip
                        key={r.id}
                        label={r.name}
                        active={rarFilter === r.id}
                        color={rarityColor(r.slug, r.color_hex)}
                        onClick={() => setRarFilter(rarFilter === r.id ? null : r.id)}
                      />
                    ))}
                  </div>
                </div>

                {categories.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gold-700/80">
                      Categoria
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="Todas"
                        active={catFilter === null}
                        onClick={() => setCatFilter(null)}
                      />
                      {categories.map((c) => (
                        <FilterChip
                          key={c.id}
                          label={c.name}
                          active={catFilter === c.id}
                          onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-verde-escuro-400 underline-offset-2 hover:text-verde-escuro-500 hover:underline"
                  >
                    <X size={11} aria-hidden />
                    Limpar filtros
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Grid (cards colecionáveis — DS-2 §7–10) ───────────────────────── */}
      <section aria-label="Figurinhas da coleção">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="sr-only">Figurinhas</h2>
          <p aria-live="polite" aria-atomic="true" className="text-sm text-verde-escuro-400">
            <span className="font-semibold text-verde-escuro-500">{filtered.length}</span>{" "}
            de {allStickers.length} figurinhas
          </p>
          {!onlyOwned && duplicateTotal === 0 && ownedTotal > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-verde-escuro-300">
              <Package size={12} aria-hidden />
              Abra pacotinhos para ganhar repetidas
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 rounded-block border border-dashed border-gold-500/35 bg-surface-gold/60 px-6 py-16 text-center"
          >
            <Layers className="text-gold-700/35" size={36} strokeWidth={1.5} aria-hidden />
            <p className="font-display text-xl font-bold text-verde-escuro-500">
              Nenhuma figurinha encontrada
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-verde-escuro-capa/60">
              {hasActiveFilters
                ? "Tente outros filtros ou limpe a busca."
                : "Sua coleção ainda está vazia. Comece abrindo pacotinhos ou respondendo o quizz."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-pill bg-verde-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-verde-escuro-500"
              >
                <X size={13} aria-hidden />
                Limpar filtros
              </button>
            ) : (
              <Link
                href="/pacotinhos"
                className="mt-1 inline-flex rounded-pill bg-gold-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-700"
              >
                Ver pacotinhos
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {filtered.map((sticker, i) => (
              <CollectionStickerCard
                key={sticker.id}
                sticker={sticker}
                quantity={ownedMap[sticker.id] ?? 0}
                index={i}
                onSelect={() => setSelectedSticker(sticker)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedSticker && (
              <CollectionStickerModal
                sticker={selectedSticker}
                quantity={selectedQty}
                onClose={() => setSelectedSticker(null)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
