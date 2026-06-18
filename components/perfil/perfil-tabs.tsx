"use client";

import { Bell, Lock, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerfilTab } from "./types";
import { PERFIL_TABS } from "./types";

const TAB_ICONS = {
  personal: User,
  security: Shield,
  notifications: Bell,
  privacy: Lock,
} as const;

interface PerfilTabsProps {
  active: PerfilTab;
  onChange: (tab: PerfilTab) => void;
}

export function PerfilTabs({ active, onChange }: PerfilTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        aria-label="Configurações do perfil"
        className="inline-flex w-max min-w-full snap-x snap-mandatory gap-2 rounded-3xl bg-verde-100 p-2 sm:gap-3 sm:rounded-[48px] sm:p-3 lg:gap-6 lg:rounded-[67px] lg:px-6 lg:py-5"
      >
        {PERFIL_TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const isActive = active === id;
          const tabId = `perfil-tab-${id}`;
          const panelId = `perfil-panel-${id}`;

          return (
            <button
              key={id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => onChange(id)}
              className={cn(
                "inline-flex shrink-0 snap-start items-center justify-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors sm:gap-3 sm:px-5 sm:py-2 sm:text-base lg:gap-5 lg:px-8 lg:text-xl",
                isActive
                  ? "border-verde-200 bg-white text-verde-escuro-500 shadow-sm"
                  : "border-verde-200 bg-transparent text-verde-escuro-500 hover:bg-white/60",
              )}
            >
              <Icon className="size-4 shrink-0 sm:size-5 lg:size-6" aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getPerfilPanelId(tab: PerfilTab) {
  return `perfil-panel-${tab}`;
}
