import { Package, Trophy } from "lucide-react";

interface MissionRewardBadgesProps {
  packs: number;
  points: number;
  className?: string;
}

export function MissionRewardBadges({ packs, points, className }: MissionRewardBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className ?? ""}`}>
      <span className="inline-flex h-8 items-center gap-2.5 rounded-pill bg-gradient-to-r from-[#deaa00] to-[#ffe07a] px-5 text-sm font-medium text-[#71410a]">
        <Package className="size-5" aria-hidden />
        {packs} Pacotinho{packs !== 1 ? "s" : ""}
      </span>
      <span className="inline-flex h-8 items-center gap-2.5 rounded-pill bg-gradient-to-r from-[#deaa00] to-[#ffe07a] px-5 text-sm font-medium text-[#71410a]">
        <Trophy className="size-5" aria-hidden />
        {points} pontos
      </span>
    </div>
  );
}
