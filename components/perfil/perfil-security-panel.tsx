"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PerfilFormActions } from "./perfil-form-actions";

interface PerfilSecurityPanelProps {
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-verde-escuro-500 sm:text-sm lg:text-xl">
      {children}
    </p>
  );
}

function PasswordInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="h-12 w-full rounded-pill border border-verde-200 bg-white px-5 pr-12 text-base text-[#5a5a5a] tracking-widest focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-verde-escuro-400"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden />
        ) : (
          <Eye className="size-5" aria-hidden />
        )}
      </button>
    </div>
  );
}

export function PerfilSecurityPanel({
  saving,
  onSavingChange,
}: PerfilSecurityPanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleCancel() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação não coincide com a nova senha.");
      return;
    }

    onSavingChange(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível atualizar a senha.");
      }

      setSuccess("Senha atualizada com sucesso.");
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a senha.");
    } finally {
      onSavingChange(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
        Conta e Segurança
      </h2>

      <div className="space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <FieldLabel>Senha atual</FieldLabel>
          <PasswordInput value={currentPassword} onChange={setCurrentPassword} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-3">
            <FieldLabel>Nova senha</FieldLabel>
            <PasswordInput value={newPassword} onChange={setNewPassword} />
          </div>
          <div className="space-y-3">
            <FieldLabel>Confirmar senha</FieldLabel>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm font-medium text-verde-500" role="status">
          {success}
        </p>
      ) : null}

      <PerfilFormActions
        saving={saving}
        onCancel={handleCancel}
        onSave={() => void handleSave()}
        saveLabel="Atualizar senha"
      />
    </div>
  );
}
