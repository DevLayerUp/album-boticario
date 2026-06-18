"use client";

import { Loader2 } from "lucide-react";
import {
  missionCardButtonLabel,
  missionIcon,
  missionProgressLabel,
  missionProgressPercent,
  missionStatus,
  missionTheme,
} from "@/lib/mission-theme";
import { cn } from "@/lib/utils";
import { MissionRewardBadges } from "./mission-reward-badges";
import type { Mission } from "./types";

interface MissionCardProps {
  mission: Mission;
  claiming?: boolean;
  onOpen: (mission: Mission) => void;
  onClaim: (missionId: number) => void;
}

export function MissionCard({
  mission,
  claiming = false,
  onOpen,
  onClaim,
}: MissionCardProps) {
  const theme = missionTheme(mission.theme);
  const Icon = missionIcon(mission.title, mission.type);
  const status = missionStatus(
    mission.progress,
    mission.target_value,
    mission.completed_at,
  );
  const showProgress = status === "EM ANDAMENTO";
  const percent = missionProgressPercent(mission.progress, mission.target_value);
  const canClaim = status === "COMPLETA" && !mission.reward_claimed;
  const isClaimed = status === "COMPLETA" && mission.reward_claimed;
  const buttonLabel = missionCardButtonLabel(status, mission.reward_claimed);

  function handleActionClick() {
    if (canClaim) {
      onClaim(mission.id);
      return;
    }
    onOpen(mission);
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-8 rounded-block p-6 shadow-[0_4px_5px_rgba(0,0,0,0.1)]",
        theme.surface,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-sm font-medium uppercase", theme.statusLabel)}>
          Status da missão
        </p>
        <span className={cn("rounded-pill px-5 py-1.5 text-sm font-medium", theme.badge)}>
          {status}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(mission)}
        className="flex w-full flex-1 items-center gap-8 text-left"
      >
        <div className="relative flex size-[105px] shrink-0 items-center justify-center">
          <span
            className={cn(
              "absolute inset-0 rounded-full opacity-20",
              theme.iconBg,
            )}
            aria-hidden
          />
          <span
            className={cn(
              "relative flex size-[105px] items-center justify-center rounded-full",
              theme.iconBg,
            )}
          >
            <Icon className="size-10 text-white sm:size-11" strokeWidth={1.8} aria-hidden />
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <h3 className={cn("font-display text-2xl font-bold leading-tight sm:text-[32px]", theme.title)}>
            {mission.title}
          </h3>
          {mission.description ? (
            <p className="text-base text-black">{mission.description}</p>
          ) : null}
        </div>
      </button>

      <div
        className={cn("space-y-4", !showProgress && "invisible")}
        aria-hidden={!showProgress}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("rounded-pill px-5 py-1.5 text-sm font-medium", theme.badge)}>
            EM ANDAMENTO
          </span>
          <div className={cn("flex flex-wrap items-center justify-end gap-4 text-base sm:text-xl", theme.progressText)}>
            <span className="font-bold">{percent}% Concluída</span>
            <span aria-hidden>•</span>
            <span>
              {missionProgressLabel(
                mission.progress,
                mission.target_value,
                mission.progress_unit,
              )}
            </span>
          </div>
        </div>
        <div className="h-[23px] overflow-hidden rounded-pill bg-white">
          <div
            className={cn("h-full rounded-pill transition-[width] duration-700", theme.progressFill)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-auto space-y-8">
        <MissionRewardBadges packs={mission.reward_packs} points={mission.reward_points} />

        <button
          type="button"
          onClick={handleActionClick}
          disabled={claiming || isClaimed}
          className={cn(
            "w-full rounded-pill px-10 py-2 text-lg font-medium text-white shadow-paper transition-all duration-200 active:scale-[0.98] disabled:cursor-default disabled:opacity-70",
            theme.button,
            isClaimed && "opacity-80",
          )}
        >
          {claiming ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Resgatando…
            </span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </article>
  );
}
