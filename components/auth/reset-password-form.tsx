"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { traduzErroAuth } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const INPUT_BASE =
  "h-12 w-full rounded-xl border border-transparent bg-verde-100 pl-11 pr-11 text-base text-gb-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-verde-500 focus:bg-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gb-ink">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-verde-escuro-300"
          aria-hidden
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          aria-invalid={error ? true : undefined}
          className={cn(INPUT_BASE, error && "border-red-500")}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-verde-escuro-300 transition-colors hover:bg-verde-500/10 hover:text-verde-escuro-500"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function verifySession() {
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
      setCheckingSession(false);
    }

    void verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? traduzErroAuth(err.message)
          : "Não foi possível atualizar a senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-12 rounded-xl bg-border" />
        <div className="h-12 rounded-xl bg-border" />
        <div className="h-12 rounded-full bg-border" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col gap-5">
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Este link é inválido ou expirou. Solicite um novo e-mail de
            recuperação.
          </p>
        </div>
        <Link
          href="/esqueci-senha"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-verde-genz underline-offset-2 hover:underline"
        >
          Solicitar novo link
        </Link>
        <Link
          href="/login"
          className="text-center text-sm font-semibold text-verde-escuro-500 underline-offset-2 hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <p className="text-sm leading-relaxed text-muted">
        Escolha uma nova senha para acessar sua conta.
      </p>

      <PasswordField
        label="Nova senha"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />

      <PasswordField
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        error={confirmError ?? undefined}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} variant="secondary" className="w-full">
        {!loading && <CheckCircle2 className="size-4" />}
        Salvar nova senha
      </Button>
    </form>
  );
}
