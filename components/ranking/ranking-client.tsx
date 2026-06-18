"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { LeaderboardResponse } from "@/lib/ranking";
import { RankingRow } from "./ranking-row";
import { RankingScoringInfo } from "./ranking-scoring-info";
import { RankingTopThree } from "./ranking-top-three";
import { RankingUserPosition } from "./ranking-user-position";
import { formatUpdatedLabel } from "./ranking-utils";

export function RankingClient() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ranking");
      const json = (await res.json()) as LeaderboardResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Erro ao carregar ranking");
      }
      setData(json);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentUser =
    data?.entries.find((entry) => entry.user_id === data.current_user_id) ?? null;
  const topThree = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3) ?? [];
  const participantCount = data?.entries.length ?? 0;
  const updatedLabel = updatedAt ? formatUpdatedLabel(updatedAt) : "";

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-verde-500" aria-label="Carregando ranking" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-block border border-red-200 bg-red-50 px-5 py-8 text-center">
        <p className="text-sm text-red-600">{error ?? "Ranking indisponível"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-pill bg-verde-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-verde-600 active:scale-[0.98]"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      <header className="max-w-[1005px] space-y-4 sm:space-y-6">
        <h1 className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-5xl lg:text-[48px]">
          Ranking dos Colecionadores
        </h1>
        <p className="text-base leading-relaxed text-black sm:text-xl lg:text-[26px]">
          <span className="font-bold text-verde-400">
            {participantCount} participante{participantCount !== 1 ? "s" : ""}
          </span>
          {" · quem completa mais o álbum lidera"}
        </p>
      </header>

      {participantCount === 0 ? (
        <div className="rounded-card border border-verde-200 bg-surface-green px-6 py-16 text-center">
          <p className="font-display text-2xl font-bold text-verde-escuro-500">
            Nenhum colecionador no ranking ainda
          </p>
          <p className="mt-2 text-base text-verde-escuro-500">
            Complete seu álbum e apareça aqui.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 sm:space-y-10"
        >
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1099fr)_minmax(0,557fr)]">
            {topThree.length > 0 ? (
              <RankingTopThree entries={topThree} updatedLabel={updatedLabel} />
            ) : null}

            <div className="flex min-w-0 flex-col gap-6 2xl:max-w-[557px] 2xl:justify-self-end">
              {currentUser ? <RankingUserPosition entry={currentUser} /> : null}
              <RankingScoringInfo />
            </div>
          </div>

          {rest.length > 0 ? (
            <section className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-4xl lg:text-[48px]">
                Demais posições
              </h2>

              <div className="overflow-hidden rounded-card border border-verde-200 bg-surface-green px-3 sm:px-8">
                <div className="divide-y divide-verde-200">
                  {rest.map((entry) => (
                    <RankingRow
                      key={entry.user_id}
                      entry={entry}
                      isCurrentUser={entry.user_id === data.current_user_id}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
