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
  const [claimingMissionId, setClaimingMissionId] = useState<number | null>(null);
  const [completedReward, setCompletedReward] = useState<CompletedReward | null>(null);

  const loadMissions = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch("/api/missions");
      const data = (await res.json()) as MissionsResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível carregar as missões");
      }
      const nextMissions = data.missions ?? [];
      setMissions(nextMissions);
      setSummary(data.summary ?? EMPTY_SUMMARY);
      setSelectedMission((current) => {
        if (!current) return null;
        return nextMissions.find((mission) => mission.id === current.id) ?? null;
      });
      return nextMissions;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar missões");
      if (!options?.silent) {
        setMissions([]);
        setSummary(EMPTY_SUMMARY);
      }
      return null;
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  async function handleClaim(missionId: number) {
    setClaimingMissionId(missionId);
    setError(null);
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
        pointsEarned: data.points_earned ?? mission?.ranking_points ?? 40,
      });
      await loadMissions({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao resgatar recompensa");
    } finally {
      setClaimingMissionId(null);
    }
  }

  const totalMissions = missions.length;
  const completedForLevel = missions.filter((m) => m.completed_at).length;

  return (
    <div className="mx-auto w-full max-w-[1112px] space-y-5 sm:space-y-6 lg:space-y-8 2xl:space-y-10">
      <header className="max-w-[686px] space-y-2 sm:space-y-3 2xl:space-y-6">
        <h1 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl lg:text-4xl 2xl:text-[48px]">
          Missões
        </h1>
        <p className="text-sm leading-relaxed text-black sm:text-base lg:text-lg 2xl:text-[26px]">
          Complete missões, suba de nível e ganhe pacotinhos e pontos para o ranking.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-block bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12 2xl:py-20">
          <Loader2 className="size-8 animate-spin text-verde-500 sm:size-9 2xl:size-10" aria-label="Carregando missões" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 sm:space-y-6 lg:space-y-8 2xl:space-y-10"
        >
          <MissionStatCards
            completed={summary.completed_count}
            available={summary.available_count}
            packsEarned={summary.packs_earned}
            rankPosition={summary.rank_position}
          />

          <MissionLevelProgress completed={completedForLevel} total={totalMissions} />

          {missions.length === 0 ? (
            <div className="rounded-card bg-verde-100 px-4 py-10 text-center sm:px-6 sm:py-12 2xl:py-16">
              <p className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl 2xl:text-[32px]">
                Nenhuma missão disponível
              </p>
              <p className="mt-1.5 text-sm text-verde-escuro-500 sm:mt-2 sm:text-base 2xl:text-lg">
                Volte em breve — novas missões serão adicionadas em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:gap-6">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MissionCard
                    mission={mission}
                    claiming={claimingMissionId === mission.id}
                    onOpen={setSelectedMission}
                    onClaim={handleClaim}
                  />
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
            claiming={claimingMissionId === selectedMission.id}
            onClose={() => setSelectedMission(null)}
            onClaim={handleClaim}
            onShareComplete={() => void loadMissions({ silent: true })}
            onFollowComplete={() => void loadMissions({ silent: true })}
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
