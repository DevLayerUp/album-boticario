"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import {
  missionIcon,
  missionProgressLabel,
  missionProgressPercent,
  missionStatus,
  missionTheme,
} from "@/lib/mission-theme";
import { resolveMissionAction } from "@/lib/mission-actions";
import { CUSTOM_MISSION_TITLES } from "@/lib/missions";
import { cn } from "@/lib/utils";
import { MissionInvitePanel } from "./mission-invite-panel";
import { MissionFollowPanel } from "./mission-follow-panel";
import { MissionSharePanel } from "./mission-share-panel";
import { MissionRewardBadges } from "./mission-reward-badges";
import type { Mission } from "./types";

interface MissionDetailModalProps {
  mission: Mission;
  claiming: boolean;
  onClose: () => void;
  onClaim: (missionId: number) => void;
  onShareComplete?: () => void;
  onFollowComplete?: () => void;
}

export function MissionDetailModal({
  mission,
  claiming,
  onClose,
  onClaim,
  onShareComplete,
  onFollowComplete,
}: MissionDetailModalProps) {
  const theme = missionTheme(mission.theme);
  const Icon = missionIcon(mission.title, mission.type);
  const status = missionStatus(
    mission.progress,
    mission.target_value,
    mission.completed_at,
  );
  const percent = missionProgressPercent(mission.progress, mission.target_value);
  const { label: actionLabel, href: actionHref } = resolveMissionAction(mission);
  const canClaim = Boolean(mission.completed_at) && !mission.reward_claimed;
  const isClaimed = Boolean(mission.completed_at) && mission.reward_claimed;
  const showProgress = status === "EM ANDAMENTO";

  const isShareMission = mission.title === CUSTOM_MISSION_TITLES.shareSocial;
  const isFollowMission = mission.title === CUSTOM_MISSION_TITLES.followSocial;
  const isInviteMission = mission.title === CUSTOM_MISSION_TITLES.inviteFriends;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handlePrimaryAction() {
    if (canClaim) {
      onClaim(mission.id);
      return;
    }
    if (actionHref.startsWith("http")) {
      window.open(actionHref, "_blank", "noopener,noreferrer");
      return;
    }
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-modal-title"
    >
      <div className="absolute inset-0 bg-verde-escuro-500/20 backdrop-blur-[10px]" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={cn(
          "relative flex w-full max-w-[min(100%,440px)] flex-col items-center gap-2.5 overflow-hidden rounded-block px-4 py-3 shadow-[0_4px_5px_rgba(0,0,0,0.1)] sm:max-w-[480px] sm:gap-3 sm:px-4 sm:py-4 md:max-w-[500px] lg:max-w-[520px] lg:gap-3.5 lg:px-5 lg:py-4 2xl:max-w-[680px] 2xl:gap-6 2xl:px-7 2xl:py-6",
          theme.modalSurface,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-verde-escuro-500 transition-opacity hover:opacity-70 sm:right-4 sm:top-4"
          aria-label="Fechar"
        >
          <X className="size-5 sm:size-6 2xl:size-8" />
        </button>

        <div className="flex w-full flex-col items-center gap-2.5 sm:gap-3 lg:gap-3.5 2xl:gap-6">
          <div className="relative flex size-11 items-center justify-center sm:size-12 md:size-14 lg:size-16 2xl:size-20">
            <span className={cn("absolute inset-0 rounded-full opacity-20", theme.iconBg)} />
            <span
              className={cn(
                "relative flex size-full items-center justify-center rounded-full",
                theme.iconBg,
              )}
            >
              <Icon className="size-4 text-white sm:size-5 md:size-6 lg:size-7 2xl:size-9" strokeWidth={1.8} aria-hidden />
            </span>
          </div>

          <div className="space-y-1 text-center">
            <h2
              id="mission-modal-title"
              className={cn(
                "font-display text-base font-bold sm:text-lg md:text-xl lg:text-xl 2xl:text-[28px]",
                theme.title,
              )}
            >
              {mission.title}
            </h2>
            <p className="text-[11px] leading-snug text-black sm:text-xs md:text-sm lg:leading-normal 2xl:text-lg">
              <span className="font-bold">Instruções</span>{" "}
              {mission.instructions ?? mission.description}
            </p>
          </div>

          {showProgress ? (
            <div className="w-full space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-1 sm:gap-1.5">
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-0.5 sm:text-[11px] 2xl:px-3 2xl:py-1 2xl:text-xs",
                    theme.badge,
                  )}
                >
                  EM ANDAMENTO
                </span>
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-end gap-1 text-[11px] sm:gap-1.5 sm:text-xs lg:text-sm 2xl:gap-2 2xl:text-base",
                    theme.progressText,
                  )}
                >
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
              <div className="h-2.5 overflow-hidden rounded-pill bg-white sm:h-3 2xl:h-4">
                <div
                  className={cn("h-full rounded-pill", theme.progressFill)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ) : null}

          {isInviteMission && !canClaim && !isClaimed ? (
            <MissionInvitePanel
              progress={mission.progress}
              targetValue={mission.target_value}
            />
          ) : null}

          {isShareMission && !canClaim && !isClaimed ? (
            <MissionSharePanel onComplete={onShareComplete} />
          ) : null}

          {isFollowMission && !canClaim && !isClaimed ? (
            <MissionFollowPanel onComplete={onFollowComplete} />
          ) : null}

          <MissionRewardBadges
            packs={mission.reward_packs}
            points={mission.ranking_points}
          />
        </div>

        {canClaim ? (
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={claiming}
            className={cn(
              "flex w-full max-w-[min(100%,320px)] items-center justify-center rounded-pill px-4 py-1.5 text-[11px] font-medium text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 sm:max-w-[360px] sm:px-5 sm:py-2 sm:text-sm lg:text-base 2xl:max-w-[420px]",
              theme.button,
            )}
          >
            {claiming ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin sm:size-5" aria-hidden />
                Resgatando…
              </span>
            ) : (
              "Resgatar Recompensa"
            )}
          </button>
        ) : isClaimed ? (
          <button
            type="button"
            disabled
            className={cn(
              "flex w-full max-w-[min(100%,320px)] cursor-default items-center justify-center rounded-pill px-4 py-1.5 text-[11px] font-medium text-white opacity-80 sm:max-w-[360px] sm:px-5 sm:py-2 sm:text-sm lg:text-base 2xl:max-w-[420px]",
              theme.button,
            )}
          >
            Recompensa Resgatada
          </button>
        ) : isInviteMission || isShareMission || isFollowMission ? null : (
          <Link
            href={actionHref}
            onClick={onClose}
            className={cn(
              "flex w-full max-w-[min(100%,320px)] items-center justify-center rounded-pill px-4 py-1.5 text-[11px] font-medium text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] sm:max-w-[360px] sm:px-5 sm:py-2 sm:text-sm lg:text-base 2xl:max-w-[420px]",
              theme.button,
            )}
          >
            {actionLabel}
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
