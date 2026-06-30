"use client";

import { useState } from "react";
import type { ProfilePageData } from "@/lib/profile";
import { PerfilFormActions } from "./perfil-form-actions";
import { usePerfilToast } from "./perfil-toast";
import { PerfilToggle } from "./perfil-toggle";

interface PerfilNotificationsPanelProps {
  data: ProfilePageData;
  saving: boolean;
  onSave: (payload: {
    notify_new_packs: boolean;
    notify_trades: boolean;
    notify_marketing: boolean;
  }) => Promise<void>;
}

const NOTIFICATION_ITEMS = [
  {
    key: "notify_new_packs" as const,
    title: "Novos pacotinhos disponíveis",
    description: "Avisar quando um novo pacote aparecer na sua conta.",
  },
  {
    key: "notify_trades" as const,
    title: "Trocas e propostas",
    description: "Receba avisos quando alguém quiser trocar com você.",
  },
  {
    key: "notify_marketing" as const,
    title: "E-mail de marketing",
    description: "Novidades, campanhas e conteúdos dos Fãs por Natureza.",
  },
];

export function PerfilNotificationsPanel({
  data,
  saving,
  onSave,
}: PerfilNotificationsPanelProps) {
  const [prefs, setPrefs] = useState({
    notify_new_packs: data.profile.notify_new_packs,
    notify_trades: data.profile.notify_trades,
    notify_marketing: data.profile.notify_marketing,
  });
  const { showToast } = usePerfilToast();

  function handleCancel() {
    setPrefs({
      notify_new_packs: data.profile.notify_new_packs,
      notify_trades: data.profile.notify_trades,
      notify_marketing: data.profile.notify_marketing,
    });
  }

  async function handleSave() {
    try {
      await onSave(prefs);
      showToast("Preferências de notificação salvas.");
    } catch (err) {
      showToast({
        message:
          err instanceof Error ? err.message : "Não foi possível salvar as preferências.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
        Preferências de notificação
      </h2>

      <div className="divide-y divide-verde-300">
        {NOTIFICATION_ITEMS.map(({ key, title, description }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 py-4 sm:items-center sm:gap-8 sm:py-5"
          >
            <div className="min-w-0 flex-1 space-y-0.5 sm:max-w-xl sm:space-y-1">
              <p className="text-base font-medium text-verde-escuro-500 sm:text-lg lg:text-xl">
                {title}
              </p>
              <p className="text-sm leading-snug text-[#5d5d5d] sm:text-base lg:text-lg">
                {description}
              </p>
            </div>
            <PerfilToggle
              label={title}
              checked={prefs[key]}
              disabled={saving}
              onChange={(checked) =>
                setPrefs((current) => ({ ...current, [key]: checked }))
              }
            />
          </div>
        ))}
      </div>

      <PerfilFormActions
        saving={saving}
        onCancel={handleCancel}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
