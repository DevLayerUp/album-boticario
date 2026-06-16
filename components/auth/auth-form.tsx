"use client";

import { useState, useEffect, useId } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";

const INPUT_BASE =
  "h-12 w-full rounded-xl border border-border bg-surface text-base text-gb-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-gb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-gb-green";

type Mode = "login" | "register";

const EASE = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const slideDown = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 0,
    transition: { duration: 0.38, ease: EASE },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.28, ease: EASE },
  },
};

/* ── Subcomponents ──────────────────────────────────────────────────── */

/**
 * Input com ícone prefixado. Renderiza label + div.relative > [ícone + input]
 * para que o top-1/2 do ícone seja relativo apenas ao campo, não ao label.
 */
function IconInput({
  icon: Icon,
  label,
  id: externalId,
  error,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  icon: React.ElementType;
  label?: string;
  error?: string;
}) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gb-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-verde-escuro-300"
          aria-hidden="true"
        />
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(INPUT_BASE, "pl-11 pr-4", error && "border-red-500", className)}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function PasswordInput({
  label,
  autoComplete,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
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
          name="password"
          autoComplete={autoComplete}
          required
          minLength={6}
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? "••••••••"}
          className={cn(INPUT_BASE, "pl-11 pr-11")}
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
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export function AuthForm({ mode }: { mode: Mode }) {
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  const SAFE_REDIRECT_PREFIXES = [
    "/dashboard", "/album", "/colecao", "/pacotinhos",
    "/quiz", "/missoes", "/trocas", "/ranking", "/perfil", "/figurinha", "/admin",
  ];
  const redirectTo = SAFE_REDIRECT_PREFIXES.some((p) =>
    rawRedirect.startsWith(p)
  )
    ? rawRedirect
    : "/dashboard";

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError === "auth"
      ? "Ocorreu um erro na autenticação. Tente novamente."
      : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const isLogin = mode === "login";
  const refFromUrl = normalizeReferralCode(searchParams.get("ref"));

  useEffect(() => {
    if (!refFromUrl) return;
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, refFromUrl);
    } catch {
      /* ignore */
    }
  }, [refFromUrl]);

  function getStoredReferralCode(): string | null {
    if (refFromUrl) return refFromUrl;
    try {
      return normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        console.log("[AUTH] Login OK — user id:", data.user?.id);
        window.location.href = redirectTo;
      } else {
        const nome = fullName.trim();
        if (nome.length < 3) throw new Error("Informe seu nome completo.");
        if (!birthDate) throw new Error("Informe sua data de nascimento.");
        if (!isMaiorIdadeValida(birthDate))
          throw new Error("Data de nascimento inválida.");

        const referralCode = getStoredReferralCode();
        const signUpData: Record<string, string> = {
          full_name: nome,
          birth_date: birthDate,
        };
        if (referralCode) signUpData.referral_code = referralCode;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: signUpData,
          },
        });
        if (error) throw error;
        try {
          localStorage.removeItem(REFERRAL_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setMessage(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
        );
      }
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

  async function handleGoogle() {
    setError(null);
    setOauthLoading(true);
    const referralCode = getStoredReferralCode();
    if (referralCode) {
      try {
        localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
      } catch {
        /* ignore */
      }
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(traduzErro(error.message));
      setOauthLoading(false);
    }
  }

  return (
    <motion.div
      key={mode}
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-5"
    >
      {/* Referral banner */}
      <AnimatePresence>
        {!isLogin && refFromUrl && (
          <motion.p
            variants={slideDown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-xl bg-verde-500/10 px-3.5 py-2.5 text-sm text-verde-escuro-500"
          >
            Você está entrando com um convite de amigo. O cadastro será
            vinculado automaticamente.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Register-only fields */}
        <AnimatePresence initial={false}>
          {!isLogin && (
            <motion.div
              key="register-fields"
              variants={slideDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-4 overflow-hidden"
            >
              <motion.div variants={item}>
                <IconInput
                  icon={User}
                  label="Nome completo"
                  type="text"
                  name="full_name"
                  autoComplete="name"
                  required
                  minLength={3}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maria da Silva"
                />
              </motion.div>

              <motion.div variants={item}>
                <IconInput
                  icon={CalendarDays}
                  label="Data de nascimento"
                  type="date"
                  name="birth_date"
                  autoComplete="bday"
                  required
                  max={hojeISO()}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <motion.div variants={item}>
          <IconInput
            icon={Mail}
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={item}>
          <PasswordInput
            label="Senha"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </motion.div>

        {/* Error / success */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </motion.div>
          )}
          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              role="status"
              className="flex items-start gap-2.5 rounded-xl bg-verde-500/10 px-3.5 py-2.5 text-sm font-medium text-verde-escuro-500"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div variants={item}>
          <Button
            type="submit"
            loading={loading}
            variant="secondary"
            className="w-full"
          >
            {!loading && <ArrowRight className="size-4" />}
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </motion.div>
      </form>

      {/* Divider + Google */}
      <motion.div variants={item} className="flex flex-col gap-4">
        <Divider label="ou continue com" />

        <button
          type="button"
          onClick={handleGoogle}
          disabled={oauthLoading}
          aria-busy={oauthLoading}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-surface font-medium text-gb-ink transition-all duration-200 hover:border-verde-500/50 hover:bg-verde-500/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {oauthLoading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-verde-escuro-500 border-t-transparent" />
          ) : (
            <GoogleIcon />
          )}
          <span className="text-sm">Continuar com Google</span>
        </button>
      </motion.div>

      {/* Switch mode link */}
      <motion.p
        variants={item}
        className="text-center text-sm text-muted"
      >
        {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
        <Link
          href={
            isLogin
              ? refFromUrl
                ? `/register?ref=${encodeURIComponent(refFromUrl)}`
                : "/register"
              : "/login"
          }
          className="font-semibold text-verde-escuro-500 underline-offset-2 hover:underline"
        >
          {isLogin ? "Cadastre-se" : "Entrar"}
        </Link>
      </motion.p>
    </motion.div>
  );
}

/* ── Utilities ──────────────────────────────────────────────────────── */

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function isMaiorIdadeValida(birthDate: string) {
  const data = new Date(birthDate);
  if (Number.isNaN(data.getTime())) return false;
  const hoje = new Date();
  if (data > hoje) return false;
  const anoMin = hoje.getFullYear() - 120;
  return data.getFullYear() >= anoMin;
}

function traduzErro(message: string) {
  if (message.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (message.includes("already registered"))
    return "Este e-mail já está cadastrado.";
  if (message.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  return message;
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
