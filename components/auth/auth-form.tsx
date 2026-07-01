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
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { traduzErroAuth } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";
import { sendAccountCreatedEmail } from "@/lib/email/send-account-created-email";

const INPUT_BASE =
  "h-12 w-full rounded-xl border border-transparent bg-verde-100 text-base text-gb-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-verde-500 focus:bg-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500";

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
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        if (estado.trim()) signUpData.state = estado.trim();
        if (cidade.trim()) signUpData.city = cidade.trim();
        if (referralCode) signUpData.referral_code = referralCode;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: signUpData,
          },
        });
        if (error) throw error;
        void sendAccountCreatedEmail(email, nome);
        try {
          localStorage.removeItem(REFERRAL_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setMessage(
          "Conta criada! Enviamos um e-mail de boas-vindas. Você já pode entrar.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? traduzErroAuth(err.message)
          : "Algo deu errado. Tente novamente.",
      );
    } finally {
      setLoading(false);
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

              <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IconInput
                  icon={MapPin}
                  label="Estado"
                  type="text"
                  name="state"
                  autoComplete="address-level1"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="Inserir texto"
                />
                <IconInput
                  icon={Building2}
                  label="Cidade"
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Inserir texto"
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

        {isLogin && (
          <motion.div variants={item} className="-mt-1 flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-sm font-semibold text-verde-escuro-500 underline-offset-2 transition-colors hover:text-verde-genz hover:underline"
            >
              Esqueci minha senha
            </Link>
          </motion.div>
        )}

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
          className={cn(
            "font-semibold underline-offset-2 hover:underline",
            isLogin ? "text-verde-genz" : "text-verde-escuro-500",
          )}
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
