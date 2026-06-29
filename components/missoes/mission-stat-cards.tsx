"use client";

import Image from "next/image";
import { CheckCircle, Flag, Package, Trophy } from "lucide-react";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";

interface MissionStatCardsProps {
  completed: number;
  available: number;
  packsEarned: number;
  rankPosition: number | null;
}

const STATS = [
  { key: "completed", label: "Missões Concluídas", icon: CheckCircle },
  { key: "available", label: "Missões Disponíveis", icon: Flag },
  { key: "packs", label: "Pacotinhos Conquistados", icon: Package },
  { key: "rank", label: "Sua Posição no Ranking", icon: Trophy },
] as const;

type StatKey = (typeof STATS)[number]["key"];

function StatCard({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: typeof CheckCircle;
  value: string | number;
}) {
  return (
    <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-block bg-verde-escuro-500 p-4 sm:min-h-[110px] sm:p-5 lg:min-h-[120px] 2xl:min-h-[160px] 2xl:p-6">
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 2xl:gap-4">
        <Icon className="size-5 shrink-0 text-verde-200 sm:size-5 2xl:size-6" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide text-verde-200 sm:text-sm 2xl:text-xl">
          {label}
        </span>
      </div>
      <p className="relative z-10 text-right font-display text-3xl font-bold leading-none text-verde-100 sm:text-4xl lg:text-5xl 2xl:text-[80px]">
        {value}
      </p>
    </div>
  );
}

export function MissionStatCards({
  completed,
  available,
  packsEarned,
  rankPosition,
}: MissionStatCardsProps) {
  const values: Record<StatKey, string | number> = {
    completed,
    available,
    packs: packsEarned,
    rank: rankPosition ? `${rankPosition}º` : "—",
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 2xl:gap-4">
      {STATS.map(({ key, label, icon }) => (
        <StatCard key={key} label={label} icon={icon} value={values[key]} />
      ))}
    </div>
  );
}
