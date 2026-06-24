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
import { MissionRewardBadges } from "./mission-reward-badges";
import type { Mission } from "./types";

interface MissionDetailModalProps {
  mission: Mission;
  claiming: boolean;
  onClose: () => void;
  onClaim: (missionId: number) => void;
  onShareComplete?: () => void;
}

export function MissionDetailModal({
  mission,
  claiming,
  onClose,
  onClaim,
  onShareComplete,
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

  async function handleShareMission() {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/album`
        : "/album";
    const shareText = "Confira meu álbum de figurinhas Fãs da Natureza!";

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Meu Álbum — Fãs da Natureza",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    const res = await fetch("/api/missions/share", { method: "POST" });
    if (!res.ok) return;

    onShareComplete?.();
    onClose();
  }

  function handlePrimaryAction() {
    if (canClaim) {
      onClaim(mission.id);
      return;
    }
    if (isShareMission) {
      void handleShareMission();
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
          "relative flex w-full max-w-[min(100%,480px)] flex-col items-center gap-3 overflow-hidden rounded-block px-4 py-4 shadow-[0_4px_5px_rgba(0,0,0,0.1)] sm:max-w-[520px] sm:gap-4 sm:px-5 sm:py-5 md:max-w-[560px] lg:max-w-[600px] lg:gap-5 xl:max-w-[680px] xl:gap-6 xl:px-7 xl:py-6",
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
          <X className="size-6 sm:size-7 xl:size-8" />
        </button>

        <div className="flex w-full flex-col items-center gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
          <div className="relative flex size-12 items-center justify-center sm:size-14 md:size-16 lg:size-[72px] xl:size-20">
            <span className={cn("absolute inset-0 rounded-full opacity-20", theme.iconBg)} />
            <span
              className={cn(
                "relative flex size-full items-center justify-center rounded-full",
                theme.iconBg,
              )}
            >
              <Icon className="size-5 text-white sm:size-6 md:size-7 lg:size-8 xl:size-9" strokeWidth={1.8} aria-hidden />
            </span>
          </div>

          <div className="space-y-1 text-center">
            <h2
              id="mission-modal-title"
              className={cn(
                "font-display text-lg font-bold sm:text-xl md:text-[22px] lg:text-2xl xl:text-[28px]",
                theme.title,
              )}
            >
              {mission.title}
            </h2>
            <p className="text-xs leading-snug text-black sm:text-sm md:text-base lg:leading-normal xl:text-lg">
              <span className="font-bold">Instruções</span>{" "}
              {mission.instructions ?? mission.description}
            </p>
          </div>

          {showProgress ? (
            <div className="w-full space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                <span
                  className={cn(
                    "rounded-pill px-2.5 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs",
                    theme.badge,
                  )}
                >
                  EM ANDAMENTO
                </span>
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-end gap-1.5 text-xs sm:gap-2 sm:text-sm lg:text-base",
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
              <div className="h-3 overflow-hidden rounded-pill bg-white sm:h-3.5 lg:h-4">
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

          <MissionRewardBadges
            packs={mission.reward_packs}
            points={mission.reward_points}
          />
        </div>

        {canClaim ? (
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={claiming}
            className={cn(
              "flex w-full max-w-[min(100%,360px)] items-center justify-center rounded-pill px-5 py-1.5 text-xs font-medium text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 sm:max-w-[380px] sm:px-6 sm:py-2 sm:text-sm lg:text-base xl:max-w-[420px]",
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
              "flex w-full max-w-[min(100%,360px)] cursor-default items-center justify-center rounded-pill px-5 py-1.5 text-xs font-medium text-white opacity-80 sm:max-w-[380px] sm:px-6 sm:py-2 sm:text-sm lg:text-base xl:max-w-[420px]",
              theme.button,
            )}
          >
            Recompensa Resgatada
          </button>
        ) : isShareMission ? (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className={cn(
              "flex w-full max-w-[min(100%,360px)] items-center justify-center rounded-pill px-5 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] sm:max-w-[380px] sm:px-6 sm:py-2 sm:text-sm lg:text-base xl:max-w-[420px]",
              theme.button,
            )}
          >
            {actionLabel}
          </button>
        ) : isInviteMission ? null : (
          <Link
            href={actionHref}
            onClick={onClose}
            className={cn(
              "flex w-full max-w-[min(100%,360px)] items-center justify-center rounded-pill px-5 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] sm:max-w-[380px] sm:px-6 sm:py-2 sm:text-sm lg:text-base xl:max-w-[420px]",
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
