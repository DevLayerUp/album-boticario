"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FlipBook } from "@/components/album/flip-book";
import type { AlbumPageData } from "@/components/album/album-page";

interface Category {
  id: number;
  name: string;
  cover_image: string | null;
  description: string | null;
}

interface AlbumEntry {
  slot_id: number;
  sticker_id: number;
  pasted_at: string;
}

interface UserSticker {
  sticker_id: number;
  quantity: number;
}

interface AlbumClientProps {
  categories: Category[];
  initialUserAlbum: AlbumEntry[];
  initialUserStickers: UserSticker[];
  totalSlots: number;
}

export function AlbumClient({
  categories,
  initialUserAlbum,
  initialUserStickers,
  totalSlots,
}: AlbumClientProps) {
  const [activeCatId, setActiveCatId] = useState<number | null>(
    categories[0]?.id ?? null
  );
  const [pages, setPages]                   = useState<AlbumPageData[]>([]);
  const [loadingPages, setLoadingPages]     = useState(false);
  const [userAlbum, setUserAlbum]           = useState<AlbumEntry[]>(initialUserAlbum);
  const [userStickers, setUserStickers]     = useState<UserSticker[]>(initialUserStickers);

  // Derived sets / maps (re-computed on each render — cheap)
  const pastedSlotIds = new Set(userAlbum.map((e) => e.slot_id));
  const ownedMap      = new Map(
    userStickers.filter((s) => s.quantity > 0).map((s) => [s.sticker_id, s.quantity])
  );

  // Load pages when category changes
  const loadPages = useCallback(async (catId: number) => {
    setLoadingPages(true);
    try {
      const res = await fetch(`/api/album?category_id=${catId}`);
      if (!res.ok) return;
      const data = await res.json();
      setPages(data.pages ?? []);
    } finally {
      setLoadingPages(false);
    }
  }, []);

  useEffect(() => {
    if (activeCatId !== null) loadPages(activeCatId);
  }, [activeCatId, loadPages]);

  async function handlePaste(slotId: number, stickerId: number) {
    const res = await fetch("/api/album/paste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_id: slotId, sticker_id: stickerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Erro ao colar figurinha");
    }

    // Update album entries
    setUserAlbum((prev) => [
      ...prev,
      { slot_id: slotId, sticker_id: stickerId, pasted_at: new Date().toISOString() },
    ]);

    // Decrement sticker quantity in local state
    setUserStickers((prev) =>
      prev
        .map((s) =>
          s.sticker_id === stickerId
            ? { ...s, quantity: s.quantity - 1 }
            : s
        )
        .filter((s) => s.quantity > 0)
    );
  }

  // Progress
  const filledCount  = userAlbum.length;
  const progressPct  = totalSlots > 0 ? Math.round((filledCount / totalSlots) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
            <BookOpen size={18} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-gb-ink">
              Meu Álbum
            </h1>
            <p className="text-sm text-muted">
              {filledCount} de {totalSlots} figurinhas coladas
            </p>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gb-green"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPct}% do álbum completo`}
          />
        </div>
        <p className="mt-1 text-right text-xs font-semibold text-gb-green">
          {progressPct}%
        </p>
      </div>

      {/* ── Category tabs ───────────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Nenhuma categoria cadastrada ainda. O admin precisa criar as categorias e páginas do álbum.
        </div>
      ) : (
        <>
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
            role="tablist"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCatId === cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCatId === cat.id
                    ? "border-gb-green bg-gb-green text-white shadow-md shadow-gb-green/20"
                    : "border-border bg-surface text-muted hover:border-gb-green/40 hover:text-gb-green-dark"
                }`}
              >
                {cat.cover_image && (
                  <div className="relative h-5 w-5 overflow-hidden rounded-full">
                    <Image
                      src={cat.cover_image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </div>
                )}
                {cat.name}
              </button>
            ))}
          </div>

          {/* FlipBook */}
          {loadingPages ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-gb-green/50" />
            </div>
          ) : (
            <FlipBook
              pages={pages}
              pastedSlotIds={pastedSlotIds}
              ownedMap={ownedMap}
              onPaste={handlePaste}
            />
          )}
        </>
      )}
    </div>
  );
}
