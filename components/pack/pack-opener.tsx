"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, Package, ChevronRight, Star } from "lucide-react";

interface PackSticker {
  position: number;
  stickers: {
    id: number;
    name: string;
    image_url: string | null;
    rarities: {
      name: string;
      slug: string;
      color_hex: string;
      animation_type: string;
    } | null;
  } | null;
}

type Phase = "idle" | "opening" | "revealing" | "summary";

interface PackOpenerProps {
  packId: number;
  source: string;
  onComplete: () => void;
  onClose: () => void;
}

const RARITY_GLOW: Record<string, string> = {
  common:       "shadow-gray-300/60",
  rare:         "shadow-yellow-300/80",
  "super-rare": "shadow-purple-400/80",
  legendary:    "shadow-rose-400/80",
};

const RARITY_BORDER: Record<string, string> = {
  common:       "border-gray-200",
  rare:         "border-yellow-400",
  "super-rare": "border-purple-400",
  legendary:    "border-rose-500",
};

const RARITY_BG: Record<string, string> = {
  common:       "bg-gray-50",
  rare:         "bg-yellow-50",
  "super-rare": "bg-purple-50",
  legendary:    "bg-rose-50",
};

const RARITY_LABEL: Record<string, string> = {
  common:       "Comum",
  rare:         "Raro",
  "super-rare": "Super Raro",
  legendary:    "Lendário",
};

export function PackOpener({ packId, source, onComplete, onClose }: PackOpenerProps) {
  const [phase, setPhase]       = useState<Phase>("idle");
  const [stickers, setStickers] = useState<PackSticker[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Auto-advance to summary once all cards are flipped
  useEffect(() => {
    if (phase === "revealing" && stickers.length > 0 && revealed.size === stickers.length) {
      const t = setTimeout(() => setPhase("summary"), 600);
      return () => clearTimeout(t);
    }
  }, [revealed, stickers.length, phase]);

  async function handleOpen() {
    if (loading) return;
    setLoading(true);
    setError("");

    // 1 — Switch to burst animation immediately (optimistic)
    setPhase("opening");

    try {
      const res = await fetch("/api/pack/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao abrir pacotinho");
        setPhase("idle");
        return;
      }

      // 2 — After animation plays (1 s), move to reveal
      setTimeout(() => {
        const list: PackSticker[] = (data.stickers ?? []).map(
          (ps: Record<string, unknown>) => ({
            position: ps.position as number,
            stickers: Array.isArray(ps.stickers)
              ? (ps.stickers[0] ?? null)
              : (ps.stickers ?? null),
          })
        );
        setStickers(list);
        setPhase("revealing");
      }, 1000);
    } catch {
      setError("Falha na conexão. Tente novamente.");
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }

  function revealCard(index: number) {
    setRevealed((prev) => new Set([...prev, index]));
  }

  function revealAll() {
    setRevealed(new Set(stickers.map((_, i) => i)));
  }

  const sourceLabel: Record<string, string> = {
    quiz:        "Quiz",
    mission:     "Missão",
    admin_grant: "Bônus",
    manual:      "Bônus",
  };

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <motion.div
        key="idle"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
        className="flex flex-col items-center gap-6"
      >
        {/* floating pack */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="relative flex h-56 w-40 flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-gb-green via-gb-green-deep to-emerald-900 p-4 shadow-2xl shadow-gb-green/40"
        >
          <div className="w-full rounded-lg border border-white/20 bg-white/10 py-1.5 text-center">
            <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-white/90">
              Grupo Boticário
            </span>
          </div>
          <Package className="text-white/50" size={52} />
          <div className="w-full rounded-lg bg-white/10 py-1.5 text-center">
            <span className="text-[10px] font-semibold text-white/80">
              {sourceLabel[source] ?? "Pacotinho"} · 5 figurinhas
            </span>
          </div>
          {/* shine */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        </motion.div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Depois
          </button>
          <button
            onClick={handleOpen}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gb-green/30 hover:bg-gb-green-dark disabled:opacity-60"
          >
            <Sparkles size={15} />
            {loading ? "Abrindo…" : "Abrir Pacotinho"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Opening burst ─────────────────────────────────────────────────────────
  if (phase === "opening") {
    return (
      <motion.div
        key="opening"
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* exploding pack */}
        <motion.div
          className="relative flex h-56 w-40 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gb-green via-gb-green-deep to-emerald-900 shadow-2xl shadow-gb-green/50"
          animate={{
            scale:   [1, 1.1, 1.15, 1.05, 0.5],
            opacity: [1, 1,   1,    1,    0],
            rotate:  [0, -3,  3,    -2,   0],
          }}
          transition={{ duration: 0.9, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Sparkles className="text-white" size={56} />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        </motion.div>

        {/* particles */}
        <div className="flex gap-2">
          {["✨", "⭐", "🌟", "✨", "⭐"].map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], y: -40, scale: [0.5, 1.2, 0.8], x: (i - 2) * 12 }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: "easeOut" }}
              className="text-lg"
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <p className="animate-pulse text-sm font-medium text-gb-green">Abrindo figurinhas…</p>
      </motion.div>
    );
  }

  // ── Revealing ─────────────────────────────────────────────────────────────
  if (phase === "revealing") {
    const allFlipped = stickers.length > 0 && revealed.size === stickers.length;

    return (
      <motion.div
        key="revealing"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex w-full flex-col items-center gap-5"
      >
        {stickers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Package size={40} className="text-gray-300" />
            <p className="text-sm text-gray-500">Nenhuma figurinha encontrada neste pacotinho.</p>
            <button
              onClick={onComplete}
              className="rounded-xl bg-gb-green px-5 py-2 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-500">
              Toque para revelar ·{" "}
              <span className="text-gb-green font-semibold">{revealed.size}/{stickers.length}</span>
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {stickers.map((ps, i) => {
                const isFlipped  = revealed.has(i);
                const sticker    = ps.stickers;
                const rarity     = sticker?.rarities ?? null;
                const raritySlug = rarity?.slug ?? "common";

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    onClick={() => !isFlipped && revealCard(i)}
                    className="relative h-40 w-28 cursor-pointer select-none"
                    style={{ perspective: 700 }}
                    aria-label={isFlipped ? sticker?.name : "Revelar figurinha"}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative h-full w-full"
                    >
                      {/* Card back */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-gb-green via-gb-green-deep to-emerald-900 shadow-lg"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <Package className="text-white/60" size={30} />
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-white/50">
                          Toque
                        </span>
                      </div>

                      {/* Card front */}
                      <div
                        className={[
                          "absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-2xl border-2 p-2 shadow-lg transition-shadow",
                          RARITY_BORDER[raritySlug],
                          RARITY_BG[raritySlug],
                          isFlipped ? `shadow-xl ${RARITY_GLOW[raritySlug]}` : "",
                        ].join(" ")}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        {sticker?.image_url ? (
                          <div className="relative h-24 w-full overflow-hidden rounded-xl">
                            <Image
                              src={sticker.image_url}
                              alt={sticker.name}
                              fill
                              className="object-cover"
                              sizes="112px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-24 w-full items-center justify-center rounded-xl bg-gray-100 text-3xl">
                            🖼
                          </div>
                        )}
                        <div className="w-full space-y-1 text-center">
                          <p className="truncate text-[11px] font-semibold text-gb-ink leading-tight">
                            {sticker?.name ?? "Figurinha"}
                          </p>
                          {rarity && (
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase text-white"
                              style={{ backgroundColor: rarity.color_hex ?? "#888" }}
                            >
                              {RARITY_LABEL[raritySlug] ?? rarity.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>

            {!allFlipped && (
              <button
                onClick={revealAll}
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
              >
                Revelar todas de uma vez
              </button>
            )}
          </>
        )}
      </motion.div>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-col items-center gap-5"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="mb-2 text-4xl"
        >
          🎉
        </motion.div>
        <h3 className="font-display text-xl font-semibold text-gb-ink">Figurinhas obtidas!</h3>
        <p className="mt-0.5 text-sm text-gray-500">Adicionadas à sua coleção</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {stickers.map((ps, i) => {
          const sticker    = ps.stickers;
          const rarity     = sticker?.rarities ?? null;
          const raritySlug = rarity?.slug ?? "common";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={[
                "flex w-20 flex-col items-center gap-1 rounded-xl border-2 p-1.5",
                RARITY_BORDER[raritySlug],
                RARITY_BG[raritySlug],
              ].join(" ")}
            >
              {sticker?.image_url ? (
                <div className="relative h-16 w-full overflow-hidden rounded-lg">
                  <Image
                    src={sticker.image_url}
                    alt={sticker.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-full items-center justify-center rounded-lg bg-gray-100 text-2xl">
                  🖼
                </div>
              )}
              <p className="w-full truncate text-center text-[9px] font-semibold text-gb-ink">
                {sticker?.name ?? "—"}
              </p>
              {rarity && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase text-white"
                  style={{ backgroundColor: rarity.color_hex ?? "#888" }}
                >
                  {RARITY_LABEL[raritySlug] ?? rarity.name}
                </span>
              )}
              {raritySlug === "legendary" && (
                <Star size={10} className="text-rose-500 fill-rose-500" />
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={onComplete}
        className="flex items-center gap-2 rounded-xl bg-gb-green px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gb-green/30 hover:bg-gb-green-dark"
      >
        Concluir <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
