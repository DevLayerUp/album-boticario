"use client";

import { useId, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Image,
  Layers,
  Package,
  ShieldAlert,
  Trophy,
  UserX,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DELETE_CONFIRM_PHRASE = "EXCLUIR";

const DELETED_ITEMS = [
  { icon: UserX, label: "Perfil e figurinha personalizada" },
  { icon: Layers, label: "Álbum e coleção" },
  { icon: Package, label: "Pacotinhos e inventário" },
  { icon: Trophy, label: "Missões e ranking" },
  { icon: Image, label: "Trocas e notificações" },
] as const;

function DangerFieldLabel({
  htmlFor,
  children,
  description,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-[0.08em] text-verde-escuro-500 sm:text-sm"
      >
        {children}
      </label>
      {description ? (
        <p className="text-sm leading-snug text-[#5d5d5d]">{description}</p>
      ) : null}
    </div>
  );
}

function DeleteConfirmPhraseInput({
  id,
  value,
  onChange,
  disabled,
  phraseMatches,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  phraseMatches: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
      placeholder={DELETE_CONFIRM_PHRASE}
      aria-invalid={value.length > 0 && !phraseMatches}
      className={cn(
        "h-12 w-full rounded-pill border bg-white px-5 text-base uppercase tracking-widest text-[#5a5a5a]",
        "placeholder:normal-case placeholder:tracking-normal placeholder:text-verde-escuro-300",
        "focus:outline-none focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60",
        value.length > 0 && !phraseMatches
          ? "border-red-300 focus:border-red-400 focus-visible:outline-red-400"
          : phraseMatches
            ? "border-verde-500 focus:border-verde-500 focus-visible:outline-verde-500"
            : "border-verde-200 focus:border-verde-500 focus-visible:outline-verde-500",
      )}
    />
  );
}

const DELETE_CONFIRM_HINT = (
  <>
    Digite{" "}
    <kbd className="rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 font-mono text-xs font-bold text-red-700">
      {DELETE_CONFIRM_PHRASE}
    </kbd>{" "}
    no campo abaixo
  </>
);

function DeletePasswordInput({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="current-password"
        className={cn(
          "h-12 w-full rounded-pill border border-verde-200 bg-white px-5 pr-12 text-base text-[#5a5a5a]",
          "tracking-wide focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-verde-escuro-400 transition-colors hover:bg-verde-100/80 hover:text-verde-escuro-500 disabled:cursor-not-allowed disabled:opacity-60"
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

function DeleteConfirmDialog({
  open,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-verde-escuro-500/40 backdrop-blur-[2px]"
        aria-label="Fechar confirmação"
        onClick={onCancel}
        disabled={loading}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-block border border-red-200/90 bg-white",
          "shadow-[0_20px_60px_rgba(5,46,4,0.18)] ring-1 ring-red-100",
        )}
      >
        <div className="border-l-[5px] border-l-red-500 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 sm:size-12">
              <ShieldAlert className="size-5 sm:size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h4
                id="delete-dialog-title"
                className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl"
              >
                Confirmar exclusão
              </h4>
              <p
                id="delete-dialog-desc"
                className="mt-2 text-sm leading-relaxed text-[#5d5d5d] sm:text-base"
              >
                Sua conta e todo o progresso serão apagados de forma permanente.
                Não será possível recuperar depois.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500 disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="h-11 cursor-pointer rounded-pill px-6 text-sm font-medium text-verde-escuro-400 transition-colors hover:text-verde-escuro-500 disabled:opacity-60 sm:h-12 sm:px-8 sm:text-base"
            >
              Voltar
            </button>
            <Button
              type="button"
              size="md"
              loading={loading}
              onClick={onConfirm}
              className="w-full cursor-pointer bg-red-600 px-6 text-white hover:bg-red-700 sm:w-auto sm:px-8"
            >
              Sim, excluir conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerfilDeleteAccount() {
  const passwordId = useId();
  const confirmId = useId();
  const understandId = useId();

  const [password, setPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const phraseMatches =
    confirmPhrase.trim().toUpperCase() === DELETE_CONFIRM_PHRASE;
  const canProceed =
    password.length > 0 && phraseMatches && understood && !deleting;

  function handleClear() {
    setPassword("");
    setConfirmPhrase("");
    setUnderstood(false);
    setError(null);
    setDialogOpen(false);
  }

  function handleRequestDelete() {
    setError(null);

    if (!password) {
      setError("Informe sua senha para confirmar a exclusão.");
      return;
    }

    if (!phraseMatches) {
      setError(`Digite ${DELETE_CONFIRM_PHRASE} para confirmar a exclusão da conta.`);
      return;
    }

    if (!understood) {
      setError("Marque que você entende que esta ação é permanente.");
      return;
    }

    setDialogOpen(true);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmPhrase,
        }),
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível excluir a conta.");
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      setDialogOpen(false);
      setError(
        err instanceof Error ? err.message : "Não foi possível excluir a conta.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section
        aria-labelledby="delete-account-heading"
        className={cn(
          "relative overflow-hidden rounded-block border border-red-200/80",
          "bg-gradient-to-br from-red-50/70 via-white to-verde-100/25",
          "p-5 shadow-[0_8px_32px_rgba(220,38,38,0.05)] ring-1 ring-red-100/80 sm:p-6 lg:p-8",
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-red-100/40 blur-2xl" aria-hidden />

        <div className="relative flex flex-col gap-5 sm:gap-6 lg:gap-8">
          <header className="flex items-start gap-3 sm:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 sm:size-12">
              <AlertTriangle className="size-5 sm:size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3
                  id="delete-account-heading"
                  className="font-display text-lg font-bold leading-tight text-verde-escuro-500 sm:text-xl lg:text-2xl"
                >
                  Excluir conta
                </h3>
                <span className="inline-flex shrink-0 items-center rounded-pill border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 sm:text-xs">
                  Irreversível
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-[#5d5d5d] sm:text-base">
                Esta ação remove permanentemente sua participação no álbum.
                Confirme abaixo para prosseguir.
              </p>
            </div>
          </header>

          <ul className="flex flex-col gap-2 sm:gap-2.5">
            {DELETED_ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex min-h-11 items-center gap-2.5 rounded-pill border border-red-100/90 bg-white/80 px-3 py-2.5 text-sm text-verde-escuro-500 sm:min-h-12 sm:px-4"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="font-medium leading-snug">{label}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-red-100 pt-5 sm:pt-6">
            <div className="flex flex-col gap-5 sm:hidden">
              <div className="space-y-3">
                <DangerFieldLabel htmlFor={passwordId}>Senha atual</DangerFieldLabel>
                <DeletePasswordInput
                  id={passwordId}
                  value={password}
                  onChange={setPassword}
                  disabled={deleting}
                />
              </div>
              <div className="space-y-3">
                <DangerFieldLabel
                  htmlFor={confirmId}
                  description={DELETE_CONFIRM_HINT}
                >
                  Confirmação de segurança
                </DangerFieldLabel>
                <DeleteConfirmPhraseInput
                  id={confirmId}
                  value={confirmPhrase}
                  onChange={setConfirmPhrase}
                  disabled={deleting}
                  phraseMatches={phraseMatches}
                />
              </div>
            </div>

            <div className="hidden gap-x-6 gap-y-3 sm:grid sm:grid-cols-2">
              <DangerFieldLabel htmlFor={`${passwordId}-desktop`}>Senha atual</DangerFieldLabel>
              <DangerFieldLabel
                htmlFor={`${confirmId}-desktop`}
                description={DELETE_CONFIRM_HINT}
              >
                Confirmação de segurança
              </DangerFieldLabel>

              <DeletePasswordInput
                id={`${passwordId}-desktop`}
                value={password}
                onChange={setPassword}
                disabled={deleting}
              />

              <DeleteConfirmPhraseInput
                id={`${confirmId}-desktop`}
                value={confirmPhrase}
                onChange={setConfirmPhrase}
                disabled={deleting}
                phraseMatches={phraseMatches}
              />
            </div>
          </div>

          <label
            htmlFor={understandId}
            className="flex cursor-pointer items-start gap-3 rounded-block border border-red-100/80 bg-white/70 px-4 py-3.5 transition-colors hover:bg-white sm:items-center sm:px-5"
          >
            <input
              id={understandId}
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              disabled={deleting}
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-verde-300 text-red-600 focus:ring-red-400 sm:mt-0"
            />
            <span className="text-sm leading-snug text-verde-escuro-500 sm:text-base">
              Entendo que todos os meus dados serão apagados e não poderei recuperar
              minha conta depois.
            </span>
          </label>

          {error ? (
            <p
              className="rounded-block border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
            <button
              type="button"
              onClick={handleClear}
              disabled={deleting}
              className="h-11 cursor-pointer rounded-pill px-6 text-sm font-medium text-verde-300 transition-colors hover:text-verde-400 disabled:opacity-60 sm:h-auto sm:px-10 sm:text-base"
            >
              Limpar campos
            </button>
            <Button
              type="button"
              size="md"
              disabled={!canProceed}
              onClick={() => void handleRequestDelete()}
              className={cn(
                "w-full cursor-pointer px-6 sm:w-auto sm:px-10",
                canProceed
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-verde-100 text-verde-escuro-300",
              )}
            >
              Excluir minha conta
            </Button>
          </div>
        </div>
      </section>

      <DeleteConfirmDialog
        open={dialogOpen}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDialogOpen(false);
        }}
      />
    </>
  );
}
