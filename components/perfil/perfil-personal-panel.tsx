"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { ProfilePageData } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { formatPhoneBR, isValidPhoneBR } from "@/lib/phone";
import { PerfilFormActions } from "./perfil-form-actions";
import { usePerfilToast } from "./perfil-toast";

interface PerfilPersonalPanelProps {
  data: ProfilePageData;
  saving: boolean;
  onSave: (payload: {
    display_name: string;
    bio: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
  }) => Promise<void>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-verde-escuro-500 sm:text-sm lg:text-xl">
      {children}
    </p>
  );
}

function PillInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-pill border border-verde-200 bg-white px-5 text-base text-[#5a5a5a]",
        "focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500",
        className,
      )}
      {...props}
    />
  );
}

export function PerfilPersonalPanel({
  data,
  saving,
  onSave,
}: PerfilPersonalPanelProps) {
  const initialName = data.profile.display_name ?? "";
  const initialBio = data.profile.bio ?? "";
  const initialPhone = data.profile.phone ?? "";
  const initialCity = data.profile.city ?? "";
  const initialState = data.profile.state ?? "";

  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const { showToast } = usePerfilToast();

  function handleCancel() {
    setDisplayName(initialName);
    setBio(initialBio);
    setPhone(initialPhone);
    setCity(initialCity);
    setState(initialState);
  }

  async function handleSave() {
    if (!displayName.trim()) {
      showToast({ message: "Informe seu nome completo.", variant: "warning" });
      return;
    }
    if (phone.trim() && !isValidPhoneBR(phone)) {
      showToast({
        message: "Informe um telefone válido: (00) 0000-0000 ou (00) 00000-0000.",
        variant: "warning",
      });
      return;
    }
    try {
      await onSave({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
      });
      showToast("Dados pessoais atualizados.");
    } catch (err) {
      showToast({
        message:
          err instanceof Error ? err.message : "Não foi possível salvar as alterações.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
        Dados pessoais
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,672px)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <FieldLabel>Nome completo</FieldLabel>
            <PillInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>E-mail</FieldLabel>
            <div className="relative">
              <PillInput
                value={data.profile.email}
                readOnly
                className="pr-12"
                aria-readonly
              />
              <Pencil
                className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-verde-escuro-300"
                aria-hidden
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Telefone</FieldLabel>
            <PillInput
              value={phone}
              onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-3">
              <FieldLabel>Estado</FieldLabel>
              <PillInput
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
                placeholder="Ex.: São Paulo"
                maxLength={60}
              />
            </div>

            <div className="space-y-3">
              <FieldLabel>Cidade</FieldLabel>
              <PillInput
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                placeholder="Ex.: Curitiba"
                maxLength={80}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <FieldLabel>Sobre você</FieldLabel>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Conte um pouco sobre você..."
            className="min-h-[120px] w-full resize-y rounded-block border border-verde-200 bg-white px-4 py-3 text-base text-[#5a5a5a] sm:min-h-[158px] sm:px-5 sm:py-4 focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500"
          />
        </div>
      </div>

      <PerfilFormActions saving={saving} onCancel={handleCancel} onSave={() => void handleSave()} />
    </div>
  );
}
