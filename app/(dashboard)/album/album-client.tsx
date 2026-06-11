"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftRight, Flag, HelpCircle, Loader2 } from "lucide-react";
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
  userStickerUrl?: string | null;
  coverUrl?: string | null;
}

export function AlbumClient({
  categories,
  initialUserAlbum,
  initialUserStickers,
  totalSlots,
  userStickerUrl = null,
  coverUrl = null,
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
    <div className="flex flex-col gap-[60px]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Título + progresso */}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl font-bold leading-[1.4] text-verde-escuro-500 md:text-5xl">
            Meu Álbum
          </h1>
          <p className="mt-2 text-lg text-black md:text-xl">
            {filledCount} de {totalSlots} figurinhas coladas
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-2 w-full max-w-[525px] overflow-hidden rounded-pill bg-verde-100">
              <motion.div
                className="h-full rounded-pill bg-verde-500"
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
            <span className="shrink-0 text-lg font-bold text-verde-escuro-500 md:text-xl">
              {progressPct}% concluído
            </span>
          </div>
        </div>

        {/* CTAs — conquiste mais figurinhas */}
        <div className="flex shrink-0 flex-col gap-3">
          <p className="text-base font-medium text-[#3d3d3d]">
            Conquiste mais figurinhas:
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/quiz"
              className="inline-flex h-10 items-center justify-center gap-2.5 rounded-pill bg-azul-500 px-10 py-2 text-base font-medium text-azul-100 transition-colors hover:bg-azul-escuro-500"
            >
              <HelpCircle size={24} />
              Responder Quizz
            </Link>
            <Link
              href="/missoes"
              className="inline-flex h-10 items-center justify-center gap-2.5 rounded-pill border border-azul-500 px-10 py-2 text-base font-medium text-azul-500 transition-colors hover:bg-azul-500/10"
            >
              <Flag size={24} />
              Minhas missões
            </Link>
            <Link
              href="/trocas"
              className="inline-flex h-10 items-center justify-center gap-2.5 rounded-pill border border-azul-500 px-10 py-2 text-base font-medium text-azul-500 transition-colors hover:bg-azul-500/10"
            >
              <ArrowLeftRight size={24} />
              Trocar
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category tabs ───────────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="rounded-card border border-dashed border-verde-300 p-8 text-center text-sm text-verde-escuro-300">
          Nenhuma categoria cadastrada ainda. O admin precisa criar as categorias e páginas do álbum.
        </div>
      ) : (
        <>
          {categories.length > 1 && (
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
                  className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-pill border px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCatId === cat.id
                      ? "border-verde-500 bg-verde-500 text-white"
                      : "border-verde-300 bg-white text-verde-500 hover:border-verde-500 hover:text-verde-escuro-500"
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
          )}

          {/* FlipBook */}
          {loadingPages ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-verde-500" />
            </div>
          ) : (
            <FlipBook
              pages={pages}
              pastedSlotIds={pastedSlotIds}
              ownedMap={ownedMap}
              onPaste={handlePaste}
              userStickerUrl={userStickerUrl}
              coverUrl={coverUrl}
            />
          )}
        </>
      )}
    </div>
  );
}
