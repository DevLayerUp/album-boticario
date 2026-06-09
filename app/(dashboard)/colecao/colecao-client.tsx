"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Layers, Lock, Star } from "lucide-react";

interface Sticker {
  id: number;
  name: string;
  image_url: string;
  is_user_type: boolean;
  sticker_categories: { id: number; name: string } | null;
  rarities: {
    id: number;
    name: string;
    slug: string;
    color_hex: string;
    animation_type: string;
  } | null;
}

interface Category { id: number; name: string }
interface Rarity   { id: number; name: string; slug: string; color_hex: string }

interface ColecaoClientProps {
  allStickers: Sticker[];
  ownedMap: Record<number, number>;
  categories: Category[];
  rarities: Rarity[];
}

export function ColecaoClient({ allStickers, ownedMap, categories, rarities }: ColecaoClientProps) {
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [rarFilter, setRarFilter] = useState<number | null>(null);
  const [onlyOwned, setOnlyOwned] = useState(false);

  const filtered = useMemo(() => {
    return allStickers.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter && s.sticker_categories?.id !== catFilter) return false;
      if (rarFilter && s.rarities?.id !== rarFilter) return false;
      if (onlyOwned && !ownedMap[s.id]) return false;
      return true;
    });
  }, [allStickers, search, catFilter, rarFilter, onlyOwned, ownedMap]);

  const ownedTotal = allStickers.filter((s) => ownedMap[s.id] > 0).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
            <Layers size={18} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-gb-ink">
              Minha Coleção
            </h1>
            <p className="text-sm text-muted">
              {ownedTotal} de {allStickers.length} figurinhas
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            aria-label="Buscar figurinha"
            placeholder="Buscar figurinha…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-border bg-surface py-2 pl-8 pr-3 text-sm outline-none focus:border-gb-green w-full sm:w-48"
          />
        </div>

        {/* Category filter */}
        <label className="sr-only" htmlFor="cat-filter">Filtrar por categoria</label>
        <select
          id="cat-filter"
          value={catFilter ?? ""}
          onChange={(e) => setCatFilter(e.target.value ? Number(e.target.value) : null)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gb-green text-muted"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Rarity filter */}
        <label className="sr-only" htmlFor="rar-filter">Filtrar por raridade</label>
        <select
          id="rar-filter"
          value={rarFilter ?? ""}
          onChange={(e) => setRarFilter(e.target.value ? Number(e.target.value) : null)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gb-green text-muted"
        >
          <option value="">Todas as raridades</option>
          {rarities.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* Only owned toggle */}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted hover:border-gb-green/40 transition-colors">
          <input
            type="checkbox"
            checked={onlyOwned}
            onChange={(e) => setOnlyOwned(e.target.checked)}
            className="accent-gb-green"
          />
          Somente minhas
        </label>
      </div>

      {/* Count */}
      <p aria-live="polite" aria-atomic="true" className="text-xs text-gray-400">
        Mostrando {filtered.length} figurinha{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
          Nenhuma figurinha encontrada.
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        >
          {filtered.map((sticker) => {
            const qty       = ownedMap[sticker.id] ?? 0;
            const owned     = qty > 0;
            const rarColor  = sticker.rarities?.color_hex ?? "#9ca3af";
            const animType  = sticker.rarities?.animation_type ?? "none";

            return (
              <motion.div
                key={sticker.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={`group relative flex flex-col rounded-xl border-2 transition-shadow duration-200 ${
                  owned
                    ? "bg-white shadow-sm hover:shadow-md"
                    : "border-gray-100 bg-gray-50"
                }`}
                style={owned ? { borderColor: rarColor + "60" } : undefined}
              >
                {/* Duplicate badge */}
                {qty > 1 && (
                  <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                    {qty}x
                  </span>
                )}

                {/* Super rare star */}
                {animType === "holographic" && owned && (
                  <span className="absolute left-1.5 top-1.5 z-10 text-yellow-400">
                    <Star size={12} fill="currentColor" />
                  </span>
                )}

                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[10px]">
                  {owned ? (
                    <>
                      <Image
                        src={sticker.image_url}
                        alt={sticker.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="140px"
                      />
                      {animType === "holographic" && (
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                          style={{
                            background:
                              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <Lock size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="px-1.5 pb-2 pt-1.5">
                  <p className="truncate text-center text-[10px] font-medium leading-tight text-gb-ink">
                    {owned ? sticker.name : "???"}
                  </p>
                  {sticker.rarities && (
                    <p
                      className="mt-0.5 text-center text-[9px] font-semibold"
                      style={{ color: owned ? rarColor : "#9ca3af" }}
                    >
                      {owned ? sticker.rarities.name : "—"}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
