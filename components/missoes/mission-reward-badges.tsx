import { Package, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionRewardBadgesProps {
  packs: number;
  points: number;
  className?: string;
}

export function MissionRewardBadges({ packs, points, className }: MissionRewardBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1.5 sm:gap-2", className)}>
      <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-gradient-to-r from-[#deaa00] to-[#ffe07a] px-2.5 text-[11px] font-medium text-[#71410a] sm:h-7 sm:gap-1.5 sm:px-3 sm:text-xs">
        <Package className="size-3.5 sm:size-4" aria-hidden />
        {packs} Pacotinho{packs !== 1 ? "s" : ""}
      </span>
      <span className="inline-flex h-6 items-center gap-1 rounded-pill bg-gradient-to-r from-[#deaa00] to-[#ffe07a] px-2.5 text-[11px] font-medium text-[#71410a] sm:h-7 sm:gap-1.5 sm:px-3 sm:text-xs">
        <Trophy className="size-3.5 sm:size-4" aria-hidden />
        +{points} pts no ranking
      </span>
    </div>
  );
}
