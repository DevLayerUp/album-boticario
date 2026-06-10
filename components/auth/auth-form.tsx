"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const searchParams = useSearchParams();
  // Só aceita redirects para rotas internas do app (começa com /)
  // Rejeita recursos do browser como /manifest.webmanifest, /.well-known, etc.
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  const SAFE_REDIRECT_PREFIXES = [
    "/dashboard", "/album", "/colecao", "/pacotinhos",
    "/quiz", "/missoes", "/trocas", "/ranking", "/perfil", "/figurinha", "/admin",
  ];
  const redirectTo = SAFE_REDIRECT_PREFIXES.some((p) => rawRedirect.startsWith(p))
    ? rawRedirect
    : "/dashboard";

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Show error from OAuth callback (?error=auth) or session expiry
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError === "auth" ? "Ocorreu um erro na autenticação. Tente novamente." : null
  );
  const [message, setMessage] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (isLogin) {
        console.log("[AUTH] Tentando login com email:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error("[AUTH] Erro no signInWithPassword:", error.message, error.status);
          throw error;
        }
        console.log("[AUTH] Login OK — user id:", data.user?.id, "session:", !!data.session);
        console.log("[AUTH] Redirecionando para:", redirectTo);
        // Força reload completo para garantir que os cookies de sessão
        // sejam enviados corretamente ao servidor antes de renderizar.
        window.location.href = redirectTo;
      } else {
        const nome = fullName.trim();
        if (nome.length < 3) {
          throw new Error("Informe seu nome completo.");
        }
        if (!birthDate) {
          throw new Error("Informe sua data de nascimento.");
        }
        if (!isMaiorIdadeValida(birthDate)) {
          throw new Error("Data de nascimento inválida.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: nome,
              birth_date: birthDate,
            },
          },
        });
        if (error) throw error;
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
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {!isLogin && (
          <>
            <Input
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
            <Input
              label="Data de nascimento"
              type="date"
              name="birth_date"
              autoComplete="bday"
              required
              max={hojeISO()}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </>
        )}
        <Input
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />
        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded-lg bg-gb-green/10 px-3 py-2 text-sm font-medium text-gb-green-dark"
          >
            {message}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {isLogin ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-gb-green-dark underline-offset-2 hover:underline"
        >
          {isLogin ? "Cadastre-se" : "Entrar"}
        </Link>
      </p>
    </div>
  );
}

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
