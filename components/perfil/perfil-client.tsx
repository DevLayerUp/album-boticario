"use client";

import { useCallback, useState } from "react";
import type { ProfilePageData } from "@/lib/profile";
import { PerfilHero } from "./perfil-hero";
import { PerfilNotificationsPanel } from "./perfil-notifications-panel";
import { PerfilPersonalPanel } from "./perfil-personal-panel";
import { PerfilPrivacyPanel } from "./perfil-privacy-panel";
import { PerfilSecurityPanel } from "./perfil-security-panel";
import { PerfilToastProvider } from "./perfil-toast";
import { getPerfilPanelId, PerfilTabs } from "./perfil-tabs";
import type { PerfilClientProps, PerfilTab } from "./types";

async function patchProfile(body: Record<string, unknown>): Promise<ProfilePageData> {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ProfilePageData & { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? "Não foi possível salvar as alterações");
  }
  return json;
}

function PerfilClientContent({ initialData }: PerfilClientProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<PerfilTab>("personal");
  const [saving, setSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  const saveProfile = useCallback(async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const updated = await patchProfile(body);
      setData(updated);
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <>
      <PerfilHero data={data} />

      <div className="mx-auto w-full max-w-[1680px] space-y-6 px-6 py-6 sm:space-y-8 sm:px-12 sm:py-8 2xl:px-[120px]">
        <PerfilTabs active={activeTab} onChange={setActiveTab} />

        <div
          role="tabpanel"
          id={getPerfilPanelId(activeTab)}
          aria-labelledby={`perfil-tab-${activeTab}`}
        >
          {activeTab === "personal" ? (
            <PerfilPersonalPanel
              key={`personal-${data.profile.display_name}-${data.profile.bio}-${data.profile.phone}-${data.profile.city}-${data.profile.state}`}
              data={data}
              saving={saving}
              onSave={async (payload) => {
                await saveProfile(payload);
              }}
            />
          ) : null}

          {activeTab === "security" ? (
            <PerfilSecurityPanel
              saving={securitySaving}
              onSavingChange={setSecuritySaving}
            />
          ) : null}

          {activeTab === "notifications" ? (
            <PerfilNotificationsPanel
              key={`notifications-${data.profile.notify_new_packs}-${data.profile.notify_trades}-${data.profile.notify_marketing}`}
              data={data}
              saving={saving}
              onSave={async (payload) => {
                await saveProfile(payload);
              }}
            />
          ) : null}

          {activeTab === "privacy" ? (
            <PerfilPrivacyPanel
              key={`privacy-${data.profile.show_in_ranking}-${data.profile.language}-${data.profile.timezone}`}
              data={data}
              saving={saving}
              onSave={async (payload) => {
                await saveProfile(payload);
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export function PerfilClient({ initialData }: PerfilClientProps) {
  return (
    <PerfilToastProvider>
      <PerfilClientContent initialData={initialData} />
    </PerfilToastProvider>
  );
}
