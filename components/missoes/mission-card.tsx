"use client";

import { Loader2 } from "lucide-react";
import { resolveMissionAction } from "@/lib/mission-actions";
import { CUSTOM_MISSION_TITLES } from "@/lib/missions";
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
  const { label: actionLabel } = resolveMissionAction(mission);
  const isShareMission = mission.title === CUSTOM_MISSION_TITLES.shareSocial;
  const isInviteMission = mission.title === CUSTOM_MISSION_TITLES.inviteFriends;
  const buttonLabel =
    status === "COMPLETA"
      ? missionCardButtonLabel(status, mission.reward_claimed)
      : isShareMission || isInviteMission
        ? actionLabel
        : missionCardButtonLabel(status, mission.reward_claimed);

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
        "flex h-full flex-col gap-4 rounded-block p-4 shadow-[0_4px_5px_rgba(0,0,0,0.1)] sm:gap-5 sm:p-5 2xl:gap-8 2xl:p-6",
        theme.surface,
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <p className={cn("text-xs font-medium uppercase sm:text-sm", theme.statusLabel)}>
          Status da missão
        </p>
        <span className={cn("rounded-pill px-3 py-1 text-xs font-medium sm:px-4 sm:py-1.5 sm:text-sm 2xl:px-5", theme.badge)}>
          {status}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(mission)}
        className="flex w-full flex-1 items-center gap-4 text-left sm:gap-5 2xl:gap-8"
      >
        <div className="relative flex size-[72px] shrink-0 items-center justify-center sm:size-[84px] lg:size-[92px] 2xl:size-[105px]">
          <span
            className={cn(
              "absolute inset-0 rounded-full opacity-20",
              theme.iconBg,
            )}
            aria-hidden
          />
          <span
            className={cn(
              "relative flex size-full items-center justify-center rounded-full",
              theme.iconBg,
            )}
          >
            <Icon className="size-7 text-white sm:size-8 2xl:size-11" strokeWidth={1.8} aria-hidden />
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2 2xl:space-y-2.5">
          <h3 className={cn("font-display text-lg font-bold leading-tight sm:text-xl lg:text-2xl 2xl:text-[32px]", theme.title)}>
            {mission.title}
          </h3>
          {mission.description ? (
            <p className="text-sm text-black 2xl:text-base">{mission.description}</p>
          ) : null}
        </div>
      </button>

      <div
        className={cn("space-y-2.5 sm:space-y-3 2xl:space-y-4", !showProgress && "invisible")}
        aria-hidden={!showProgress}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <span className={cn("rounded-pill px-3 py-1 text-xs font-medium sm:px-4 sm:py-1.5 sm:text-sm 2xl:px-5", theme.badge)}>
            EM ANDAMENTO
          </span>
          <div className={cn("flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3 sm:text-base lg:text-lg 2xl:gap-4 2xl:text-xl", theme.progressText)}>
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
        <div className="h-4 overflow-hidden rounded-pill bg-white sm:h-5 2xl:h-[23px]">
          <div
            className={cn("h-full rounded-pill transition-[width] duration-700", theme.progressFill)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-auto space-y-4 2xl:space-y-8">
        <MissionRewardBadges
          packs={mission.reward_packs}
          points={mission.ranking_points}
        />

        <button
          type="button"
          onClick={handleActionClick}
          disabled={claiming || isClaimed}
          className={cn(
            "w-full rounded-pill px-6 py-1.5 text-sm font-medium text-white shadow-paper transition-all duration-200 active:scale-[0.98] disabled:cursor-default disabled:opacity-70 sm:px-8 sm:py-2 sm:text-base 2xl:px-10 2xl:text-lg",
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
