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

const REST_INITIAL_SIZE = 7;
const REST_LOAD_MORE_SIZE = 40;

export function RankingClient() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restVisibleCount, setRestVisibleCount] = useState(REST_INITIAL_SIZE);

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

  useEffect(() => {
    setRestVisibleCount(REST_INITIAL_SIZE);
  }, [data?.entries]);

  const currentUser = data?.current_user_entry ?? null;
  const topThree = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3) ?? [];
  const visibleRest = rest.slice(0, restVisibleCount);
  const canLoadMoreRest = restVisibleCount < rest.length;
  const participantCount = data?.entries.length ?? 0;
  const updatedLabel = updatedAt ? formatUpdatedLabel(updatedAt) : "";

  if (loading) {
    return (
      <div className="flex justify-center py-12 2xl:py-24">
        <Loader2 className="size-8 animate-spin text-verde-500 sm:size-9 2xl:size-10" aria-label="Carregando ranking" />
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
    <div className="w-full space-y-5 sm:space-y-6 lg:space-y-8 2xl:space-y-10">
      <header className="max-w-[1005px] space-y-2 sm:space-y-3 2xl:space-y-6">
        <h1 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl lg:text-4xl 2xl:text-[48px]">
          Ranking dos Colecionadores
        </h1>
        <p className="text-sm leading-relaxed text-black sm:text-base lg:text-lg 2xl:text-[26px]">
          <span className="font-bold text-verde-400">
            {participantCount} participante{participantCount !== 1 ? "s" : ""}
          </span>
          {" · quem completa mais o álbum lidera"}
        </p>
      </header>

      {participantCount === 0 && !currentUser ? (
        <div className="rounded-card border border-verde-200 bg-surface-green px-4 py-10 text-center sm:px-6 sm:py-12 2xl:py-16">
          <p className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl 2xl:text-[32px]">
            Nenhum colecionador no ranking ainda
          </p>
          <p className="mt-1.5 text-sm text-verde-escuro-500 sm:mt-2 sm:text-base 2xl:text-lg">
            Complete seu álbum e apareça aqui.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 sm:space-y-6 lg:space-y-8 2xl:space-y-10"
        >
          <div className="grid grid-cols-1 gap-4 lg:gap-5 2xl:grid-cols-[minmax(0,1099fr)_minmax(0,557fr)] 2xl:gap-6">
            {topThree.length > 0 ? (
              <RankingTopThree entries={topThree} updatedLabel={updatedLabel} />
            ) : participantCount === 0 ? (
              <div className="rounded-card border border-verde-200 bg-surface-green px-4 py-10 text-center sm:px-6 sm:py-12 2xl:py-16">
                <p className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl 2xl:text-[32px]">
                  Nenhum colecionador no ranking ainda
                </p>
                <p className="mt-1.5 text-sm text-verde-escuro-500 sm:mt-2 sm:text-base 2xl:text-lg">
                  Complete seu álbum e apareça aqui.
                </p>
              </div>
            ) : null}

            <div className="flex min-w-0 flex-col gap-4 lg:gap-5 2xl:max-w-[557px] 2xl:justify-self-end 2xl:gap-6">
              {currentUser ? <RankingUserPosition entry={currentUser} /> : null}
              <RankingScoringInfo />
            </div>
          </div>

          {rest.length > 0 ? (
            <section className="space-y-4 sm:space-y-5 2xl:space-y-6">
              <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-3xl 2xl:text-[48px]">
                Demais posições
              </h2>

              <div className="overflow-hidden rounded-card border border-verde-200 bg-surface-green px-2 sm:px-4 lg:px-6 2xl:px-8">
                <div className="divide-y divide-verde-200">
                  {visibleRest.map((entry) => (
                    <RankingRow
                      key={entry.user_id}
                      entry={entry}
                      isCurrentUser={entry.user_id === data.current_user_id}
                    />
                  ))}
                </div>
              </div>

              {canLoadMoreRest ? (
                <div className="flex justify-center pt-1 sm:pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRestVisibleCount((count) =>
                        Math.min(count + REST_LOAD_MORE_SIZE, rest.length),
                      )
                    }
                    className="rounded-pill border border-verde-400 px-5 py-2 text-sm font-medium text-verde-escuro-500 transition-all duration-200 hover:border-verde-500 hover:bg-verde-500/10 hover:text-verde-500 active:scale-[0.98] sm:px-6 sm:text-base 2xl:px-8 2xl:py-2.5"
                  >
                    Carregar mais
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
