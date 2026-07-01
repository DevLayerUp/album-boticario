"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { traduzErroAuth } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const INPUT_BASE =
  "h-12 w-full rounded-xl border border-transparent bg-verde-100 pl-11 pr-4 text-base text-gb-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-verde-500 focus:bg-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-verde-500";

const LINK_ERROR_MESSAGES: Record<string, string> = {
  "link-expirado":
    "Este link expirou ou já foi usado. Solicite um novo e-mail de recuperação abaixo.",
  "link-invalido":
    "Link inválido. Informe seu e-mail para receber um novo link de recuperação.",
};

export function ForgotPasswordForm({
  linkError,
}: {
  linkError?: string;
}) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError ? (LINK_ERROR_MESSAGES[linkError] ?? null) : null,
  );
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const payload = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(payload.error ?? "Não foi possível enviar o e-mail.");
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? traduzErroAuth(err.message)
          : "Não foi possível enviar o e-mail. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl bg-verde-500/10 px-3.5 py-3 text-sm font-medium text-verde-escuro-500"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>
            Se existir uma conta com <strong>{email}</strong>, você receberá um
            e-mail com o link para redefinir sua senha. Verifique também a caixa
            de spam.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-verde-escuro-500 underline-offset-2 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <p className="text-sm leading-relaxed text-muted">
        Informe o e-mail da sua conta. Enviaremos um link para você criar uma
        nova senha.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-gb-ink">
          E-mail
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-verde-escuro-300"
            aria-hidden
          />
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className={cn(INPUT_BASE, error && "border-red-500")}
          />
        </div>
      </div>

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
        {!loading && <ArrowRight className="size-4" />}
        Enviar link de recuperação
      </Button>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-verde-escuro-500 underline-offset-2 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para o login
      </Link>
    </form>
  );
}
