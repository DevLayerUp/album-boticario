"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { MissionCard } from "./mission-card";
import { MissionCompletedModal } from "./mission-completed-modal";
import { MissionDetailModal } from "./mission-detail-modal";
import { MissionLevelProgress } from "./mission-level-progress";
import { MissionStatCards } from "./mission-stat-cards";
import type { Mission, MissionsResponse } from "./types";

interface MissoesClientProps {
  packImageUrl: string;
}

interface CompletedReward {
  packsEarned: number;
  pointsEarned: number;
}

const EMPTY_SUMMARY: MissionsResponse["summary"] = {
  completed_count: 0,
  available_count: 0,
  packs_earned: 0,
  rank_position: null,
};

export function MissoesClient({ packImageUrl }: MissoesClientProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [summary, setSummary] = useState<MissionsResponse["summary"]>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [completedReward, setCompletedReward] = useState<CompletedReward | null>(null);

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/missions");
      const data = (await res.json()) as MissionsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível carregar as missões");
      }
      setMissions(data.missions ?? []);
      setSummary(data.summary ?? EMPTY_SUMMARY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar missões");
      setMissions([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  async function handleClaim(missionId: number) {
    setClaiming(true);
    try {
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission_id: missionId }),
      });
      const data = (await res.json()) as {
        packs_earned?: number;
        points_earned?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível resgatar a recompensa");
      }

      const mission = missions.find((m) => m.id === missionId);
      setSelectedMission(null);
      setCompletedReward({
        packsEarned: data.packs_earned ?? mission?.reward_packs ?? 1,
        pointsEarned: data.points_earned ?? mission?.reward_points ?? 100,
      });
      await loadMissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao resgatar recompensa");
    } finally {
      setClaiming(false);
    }
  }

  const totalMissions = missions.length;
  const completedForLevel = missions.filter((m) => m.completed_at).length;

  return (
    <div className="mx-auto w-full max-w-[1112px] space-y-8 sm:space-y-10">
      <header className="max-w-[686px] space-y-4 sm:space-y-6">
        <h1 className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-5xl lg:text-[48px]">
          Missões
        </h1>
        <p className="text-lg leading-relaxed text-black sm:text-[26px]">
          Complete missões, suba de nível e ganhe pacotinhos e pontos para o ranking.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-block bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-10 animate-spin text-verde-500" aria-label="Carregando missões" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 sm:space-y-10"
        >
          <MissionStatCards
            completed={summary.completed_count}
            available={summary.available_count}
            packsEarned={summary.packs_earned}
            rankPosition={summary.rank_position}
          />

          <MissionLevelProgress completed={completedForLevel} total={totalMissions} />

          {missions.length === 0 ? (
            <div className="rounded-card bg-verde-100 px-6 py-16 text-center">
              <p className="font-display text-2xl font-bold text-verde-escuro-500">
                Nenhuma missão disponível
              </p>
              <p className="mt-2 text-base text-verde-escuro-500">
                Volte em breve — novas missões serão adicionadas em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MissionCard mission={mission} onOpen={setSelectedMission} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedMission ? (
          <MissionDetailModal
            key={selectedMission.id}
            mission={selectedMission}
            claiming={claiming}
            onClose={() => setSelectedMission(null)}
            onClaim={handleClaim}
            onShareComplete={loadMissions}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {completedReward ? (
          <MissionCompletedModal
            packsEarned={completedReward.packsEarned}
            pointsEarned={completedReward.pointsEarned}
            packImageUrl={packImageUrl}
            onClose={() => setCompletedReward(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
