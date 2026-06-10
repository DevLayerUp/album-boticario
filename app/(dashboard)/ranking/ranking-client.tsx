"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Trophy,
  Loader2,
  BookOpen,
  Package,
  Target,
  ArrowLeftRight,
  Sparkles,
  Info,
} from "lucide-react";
import type { LeaderboardResponse, RankingEntry } from "@/lib/ranking";
import { cn } from "@/lib/utils";

function displayName(entry: RankingEntry) {
  return entry.display_name || entry.username || "Colecionador";
}

function Avatar({ entry, size = 40 }: { entry: RankingEntry; size?: number }) {
  const src = entry.sticker_url || entry.avatar_url;
  const initials = displayName(entry).slice(0, 1).toUpperCase();

  if (src) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full bg-verde-100 ring-2 ring-white"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt="" fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-verde-500 font-bold text-white ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl" aria-hidden>🥇</span>;
  if (rank === 2) return <span className="text-xl" aria-hidden>🥈</span>;
  if (rank === 3) return <span className="text-xl" aria-hidden>🥉</span>;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-100 text-sm font-bold text-verde-escuro-500">
      {rank}
    </span>
  );
}

function PodiumCard({
  entry,
  place,
  isCurrentUser,
}: {
  entry: RankingEntry;
  place: 1 | 2 | 3;
  isCurrentUser?: boolean;
}) {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" } as const;
  const colors = {
    1: "from-amarelo to-amber-400",
    2: "from-slate-200 to-slate-300",
    3: "from-amber-700/30 to-amber-800/40",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.08 }}
      className={cn(
        "flex flex-1 flex-col items-center",
        place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3",
      )}
    >
      <Avatar entry={entry} size={place === 1 ? 56 : 44} />
      <p className="mt-2 max-w-[100px] truncate text-center text-xs font-bold text-verde-escuro-500">
        {displayName(entry)}
        {isCurrentUser && (
          <span className="mt-0.5 block text-[9px] font-bold uppercase text-verde-500">
            Você
          </span>
        )}
      </p>
      <p className="text-[10px] font-semibold text-verde-500">{entry.album_pct}% álbum</p>
      <div
        className={cn(
          "mt-2 flex w-full flex-col items-center justify-end rounded-t-xl bg-gradient-to-b px-2 pb-2 pt-3",
          heights[place],
          colors[place],
        )}
      >
        <RankBadge rank={place} />
        <p className="mt-1 text-[10px] font-bold text-verde-escuro-500">
          {entry.score.toLocaleString("pt-BR")} pts
        </p>
      </div>
    </motion.div>
  );
}

function RankingRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-block border px-4 py-3 transition-colors",
        isCurrentUser
          ? "border-verde-500 bg-verde-500/8 shadow-sm"
          : "border-border bg-surface hover:bg-verde-100/30",
      )}
    >
      <RankBadge rank={entry.rank} />
      <Avatar entry={entry} size={40} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-verde-escuro-500">
            {displayName(entry)}
          </p>
          {isCurrentUser && (
            <span className="shrink-0 rounded-full bg-verde-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Você
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-verde-escuro-500/70">
          <span className="inline-flex items-center gap-1">
            <BookOpen size={11} />
            {entry.filled_slots}/{entry.total_slots} ({entry.album_pct}%)
          </span>
          <span className="inline-flex items-center gap-1">
            <Package size={11} />
            {entry.packs_opened} abertos
          </span>
          <span className="inline-flex items-center gap-1">
            <Target size={11} />
            {entry.missions_completed} missões
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowLeftRight size={11} />
            {entry.trades_accepted} trocas
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-lg font-bold text-verde-escuro-500">
          {entry.score.toLocaleString("pt-BR")}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-verde-500/70">
          pontos
        </p>
      </div>
    </div>
  );
}

export function RankingClient() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ranking");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao carregar ranking");
        return;
      }
      setData(json);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currentUser =
    data?.entries.find((e) => e.user_id === data.current_user_id) ?? null;
  const topThree = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3) ?? [];

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-verde-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-block border border-red-200 bg-red-50 px-5 py-8 text-center">
        <p className="text-sm text-red-600">{error || "Ranking indisponível"}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-pill bg-verde-500 px-5 py-2 text-sm font-semibold text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amarelo/20 text-amarelo">
          <Trophy size={28} strokeWidth={2} />
        </div>
        <h1 className="font-display text-3xl font-bold text-verde-escuro-500">
          Ranking dos Colecionadores
        </h1>
        <p className="mt-2 text-sm text-verde-escuro-500/70">
          {data.entries.length} participantes · quem completa mais o álbum lidera
        </p>
      </div>

      {/* Score rules */}
      <div className="rounded-block border border-verde-500/20 bg-verde-100/40 px-4 py-3">
        <div className="flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0 text-verde-500" />
          <div className="text-xs leading-relaxed text-verde-escuro-500/80">
            <p className="font-semibold text-verde-escuro-500">Como funciona a pontuação</p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              <li>Álbum mais completo vale mais pontos (principal critério)</li>
              <li>Missões concluídas e trocas aceitas dão bônus</li>
              <li>Menos pacotinhos abertos = colecionador mais eficiente = mais pontos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current user highlight */}
      {currentUser && currentUser.rank > 3 && (
        <div className="rounded-block border-2 border-dashed border-verde-500/40 bg-verde-500/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-verde-500">
            <Sparkles size={13} />
            Sua posição
          </p>
          <RankingRow entry={currentUser} isCurrentUser />
        </div>
      )}

      {/* Podium */}
      {topThree.length > 0 && (
        <section>
          <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-verde-escuro-500/60">
            Top 3
          </h2>
          <div className="flex items-end justify-center gap-3 px-2">
            {topThree[1] && (
              <PodiumCard
                entry={topThree[1]}
                place={2}
                isCurrentUser={topThree[1].user_id === data.current_user_id}
              />
            )}
            {topThree[0] && (
              <PodiumCard
                entry={topThree[0]}
                place={1}
                isCurrentUser={topThree[0].user_id === data.current_user_id}
              />
            )}
            {topThree[2] && (
              <PodiumCard
                entry={topThree[2]}
                place={3}
                isCurrentUser={topThree[2].user_id === data.current_user_id}
              />
            )}
          </div>
        </section>
      )}

      {/* Remaining positions */}
      {rest.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-verde-escuro-500/60">
            Demais posições
          </h2>
          {rest.map((entry) => (
            <RankingRow
              key={entry.user_id}
              entry={entry}
              isCurrentUser={entry.user_id === data.current_user_id}
            />
          ))}
        </section>
      )}

      {data.entries.length === 0 && (
        <p className="py-12 text-center text-sm text-verde-escuro-500/50">
          Nenhum colecionador no ranking ainda.
        </p>
      )}
    </div>
  );
}
