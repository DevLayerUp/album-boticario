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
import { cn } from "@/lib/utils";
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
  const canClaim = Boolean(mission.completed_at) && !mission.reward_claimed;
  const showProgress = status === "EM ANDAMENTO";

  const actionLabel =
    mission.action_label ??
    (canClaim ? "Resgatar Recompensa" : "Completar Missão");
  const actionHref = mission.action_href ?? "/missoes";
  const isShareMission = mission.title === "Compartilhar nas redes";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          "relative flex w-full max-w-[827px] flex-col items-center gap-8 rounded-block p-8 shadow-[0_4px_5px_rgba(0,0,0,0.1)] sm:gap-16 sm:p-10",
          theme.modalSurface,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-verde-escuro-500 transition-opacity hover:opacity-70"
          aria-label="Fechar"
        >
          <X className="size-8" />
        </button>

        <div className="flex flex-col items-center gap-16 pt-4">
          <div className="relative flex size-[105px] items-center justify-center">
            <span className={cn("absolute inset-0 rounded-full opacity-20", theme.iconBg)} />
            <span
              className={cn(
                "relative flex size-[105px] items-center justify-center rounded-full",
                theme.iconBg,
              )}
            >
              <Icon className="size-11 text-white" strokeWidth={1.8} aria-hidden />
            </span>
          </div>

          <div className="space-y-2.5 text-center">
            <h2
              id="mission-modal-title"
              className={cn("font-display text-2xl font-bold sm:text-[32px]", theme.title)}
            >
              {mission.title}
            </h2>
            <p className="text-base text-black sm:text-xl">
              <span className="font-bold">Instruções</span>{" "}
              {mission.instructions ?? mission.description}
            </p>
          </div>

          {showProgress ? (
            <div className="w-full space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                  className={cn("h-full rounded-pill", theme.progressFill)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
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
              "flex w-full max-w-[500px] items-center justify-center rounded-pill px-10 py-2 text-lg font-medium text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 sm:text-xl",
              theme.button,
            )}
          >
            {claiming ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Resgatando…
              </span>
            ) : (
              actionLabel
            )}
          </button>
        ) : (
          isShareMission ? (
            <button
              type="button"
              onClick={handlePrimaryAction}
              className={cn(
                "flex w-full max-w-[500px] items-center justify-center rounded-pill px-10 py-2 text-lg font-medium text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] sm:text-xl",
                theme.button,
              )}
            >
              {actionLabel}
            </button>
          ) : (
          <Link
            href={actionHref}
            onClick={onClose}
            className={cn(
              "flex w-full max-w-[500px] items-center justify-center rounded-pill px-10 py-2 text-lg font-medium text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] sm:text-xl",
              theme.button,
            )}
          >
            {actionLabel}
          </Link>
          )
        )}
      </motion.div>
    </motion.div>
  );
}
