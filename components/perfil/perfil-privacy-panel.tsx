"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import type { ProfilePageData } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { PerfilFormActions } from "./perfil-form-actions";
import { PerfilToggle } from "./perfil-toggle";
import { LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from "./types";

interface PerfilPrivacyPanelProps {
  data: ProfilePageData;
  saving: boolean;
  onSave: (payload: {
    show_in_ranking: boolean;
    language: string;
    timezone: string;
  }) => Promise<void>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Globe className="size-4 shrink-0 text-verde-escuro-500 sm:size-5" aria-hidden />
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-verde-escuro-500 sm:text-sm lg:text-xl">
        {children}
      </p>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-pill border border-verde-200 bg-white px-5 pr-12 text-base text-[#5a5a5a]",
          "focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-verde-escuro-400"
        aria-hidden
      />
    </div>
  );
}

export function PerfilPrivacyPanel({ data, saving, onSave }: PerfilPrivacyPanelProps) {
  const [showInRanking, setShowInRanking] = useState(data.profile.show_in_ranking);
  const [language, setLanguage] = useState(data.profile.language);
  const [timezone, setTimezone] = useState(data.profile.timezone);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    setShowInRanking(data.profile.show_in_ranking);
    setLanguage(data.profile.language);
    setTimezone(data.profile.timezone);
    setError(null);
  }

  async function handleSave() {
    setError(null);
    try {
      await onSave({
        show_in_ranking: showInRanking,
        language,
        timezone,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar as alterações.",
      );
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
        Privacidade e Idioma
      </h2>

      <div className="flex items-start justify-between gap-4 border-b border-verde-300 pb-4 sm:items-center sm:pb-5">
        <div className="min-w-0 flex-1 space-y-0.5 sm:max-w-xl sm:space-y-1">
          <p className="text-base font-medium text-verde-escuro-500 sm:text-lg lg:text-xl">
            Aparecer no ranking
          </p>
          <p className="text-sm leading-snug text-[#5d5d5d] sm:text-base lg:text-lg">
            Mostrar seu nome na classificação geral.
          </p>
        </div>
        <PerfilToggle
          label="Aparecer no ranking"
          checked={showInRanking}
          disabled={saving}
          onChange={setShowInRanking}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <div className="space-y-3">
          <FieldLabel>Idioma</FieldLabel>
          <SelectField
            value={language}
            onChange={setLanguage}
            options={LANGUAGE_OPTIONS}
            disabled={saving}
          />
        </div>
        <div className="space-y-3">
          <FieldLabel>Fuso horário</FieldLabel>
          <SelectField
            value={timezone}
            onChange={setTimezone}
            options={TIMEZONE_OPTIONS}
            disabled={saving}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <PerfilFormActions
        saving={saving}
        onCancel={handleCancel}
        onSave={() => void handleSave()}
      />
    </div>
  );
}
