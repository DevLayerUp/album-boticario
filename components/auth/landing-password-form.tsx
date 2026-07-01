"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  clearLandingSignupDraft,
  readLandingSignupDraft,
  type LandingSignupDraft,
} from "@/lib/landing-signup";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";
import { sendAccountCreatedEmail } from "@/lib/email/send-account-created-email";

const INPUT_BASE =
  "h-12 w-full rounded-xl border border-border bg-surface text-base text-gb-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-gb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-gb-green";

const EASE = [0.22, 1, 0.36, 1] as const;

function traduzErro(message: string) {
  if (message.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (message.includes("already registered"))
    return "Este e-mail já está cadastrado.";
  if (message.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (message.includes("Password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  return message;
}

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
          aria-hidden="true"
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
          className={cn(INPUT_BASE, "pl-11 pr-11", error && "border-red-500")}
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

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gb-ink">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-verde-escuro-300"
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          readOnly
          value={value}
          className={cn(
            INPUT_BASE,
            "cursor-default bg-verde-500/5 pl-11 pr-4 text-muted",
          )}
        />
      </div>
    </div>
  );
}

function getStoredReferralCode(): string | null {
  try {
    return normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function LandingPasswordForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<LandingSignupDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLandingSignupDraft();
    if (!stored?.email || !stored.name) {
      router.replace("/#registro");
      return;
    }
    setDraft(stored);
    setReady(true);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;

    setError(null);
    setMessage(null);
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
    const referralCode = getStoredReferralCode();

    const signUpData: Record<string, string> = {
      full_name: draft.name,
      signup_source: "landing",
      newsletter_opt_in: draft.newsletter ? "true" : "false",
    };
    if (draft.estado) signUpData.state = draft.estado;
    if (draft.cidade) signUpData.city = draft.cidade;
    if (draft.birthDate) signUpData.birth_date = draft.birthDate;
    else if (draft.idade) signUpData.age = draft.idade;
    if (referralCode) signUpData.referral_code = referralCode;

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: draft.email,
        password,
        options: {
          data: signUpData,
        },
      });
      if (signUpError) throw signUpError;

      void sendAccountCreatedEmail(draft.email, draft.name);

      clearLandingSignupDraft();
      try {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
      } catch {
        /* ignore */
      }

      setMessage(
        "Conta criada! Enviamos um e-mail de boas-vindas. Você já pode entrar.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? traduzErro(err.message)
          : "Algo deu errado. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="h-64 w-full animate-pulse rounded-xl bg-border" />;
  }

  if (!draft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex w-full flex-col gap-5"
    >
      <Link
        href="/#registro"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-verde-escuro-500"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar e editar dados
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <ReadOnlyField icon={User} label="Nome" value={draft.name} />
        <ReadOnlyField icon={Mail} label="E-mail" value={draft.email} />

        <PasswordField
          label="Crie sua senha"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirme sua senha"
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

        {message && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl bg-verde-500/10 px-3.5 py-2.5 text-sm font-medium text-verde-escuro-500"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {message}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          variant="secondary"
          className="w-full"
          disabled={Boolean(message)}
        >
          {!loading && <ArrowRight className="size-4" />}
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-verde-escuro-500 underline-offset-2 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </motion.div>
  );
}
