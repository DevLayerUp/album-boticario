"use client";

import { useEffect, useState } from "react";
import {
  CONCURSO_ANSWER_MAX,
  CONCURSO_ANSWER_MIN,
  formatCpf,
  getCpfDigits,
  isValidCpf,
  type ContestEntry,
} from "@/lib/concurso";
import { type ConcursoPageConfig } from "@/lib/concurso-page";
import { formatPhoneBR, isValidPhoneBR } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { ConcursoConfirmModal } from "./concurso-confirm-modal";
import { ConcursoRegulamentoLink } from "./concurso-regulamento-modal";

export interface ConcursoFormPrefill {
  fullName: string;
  email: string;
  phone: string;
}

export function ConcursoForm({
  prefill,
  initialEntry,
  open,
  config,
}: {
  prefill: ConcursoFormPrefill;
  initialEntry: ContestEntry | null;
  open: boolean;
  config: ConcursoPageConfig;
}) {
  const [fullName, setFullName] = useState(initialEntry?.full_name ?? prefill.fullName);
  const [email, setEmail] = useState(initialEntry?.email ?? prefill.email);
  const [phone, setPhone] = useState(initialEntry?.phone ?? prefill.phone);
  const [cpf, setCpf] = useState("");
  const [cpfTaken, setCpfTaken] = useState(false);
  const [answer, setAnswer] = useState(initialEntry?.answer ?? "");
  const [acceptedRules, setAcceptedRules] = useState(Boolean(initialEntry));
  const [acceptedData, setAcceptedData] = useState(Boolean(initialEntry));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState<ContestEntry | null>(initialEntry);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const submitted = Boolean(entry);

  useEffect(() => {
    if (submitted || !isValidCpf(cpf)) {
      setCpfTaken(false);
      return;
    }

    const digits = getCpfDigits(cpf);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/concurso?cpf=${encodeURIComponent(digits)}`);
        const data = (await res.json()) as { cpfTaken?: boolean };
        if (res.ok) setCpfTaken(Boolean(data.cpfTaken));
      } catch {
        /* a validação definitiva acontece no envio */
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [cpf, submitted]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    setError("");

    if (fullName.trim().length < 2) {
      setError("Informe o nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!isValidPhoneBR(phone)) {
      setError("Informe um celular válido.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    if (cpfTaken) {
      setError("Este CPF já possui uma inscrição. Só é permitida uma resposta por CPF.");
      return;
    }
    if (answer.trim().length < CONCURSO_ANSWER_MIN) {
      setError(`A resposta precisa ter pelo menos ${CONCURSO_ANSWER_MIN} caracteres.`);
      return;
    }
    if (!acceptedRules) {
      setError("É preciso aceitar o regulamento.");
      return;
    }
    if (!acceptedData) {
      setError("É preciso autorizar o uso dos dados.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/concurso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          cpf,
          answer,
          accepted_rules: acceptedRules,
          accepted_data: acceptedData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar a resposta.");
        return;
      }
      setEntry(data.entry);
      setShowConfirmModal(true);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (!open && !submitted) {
    return (
      <div className="rounded-[40px] bg-white px-6 py-10 text-center shadow-paper sm:px-10">
        <p className="font-display text-2xl font-bold text-verde-escuro-500">
          {config.formClosedTitle}
        </p>
        <p className="mt-3 text-base text-muted">
          {config.formClosedBody}
        </p>
      </div>
    );
  }

  return (
    <>
    {showConfirmModal ? (
      <ConcursoConfirmModal config={config} onClose={() => setShowConfirmModal(false)} />
    ) : null}
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center gap-8 rounded-[40px] bg-white px-5 py-8 shadow-paper sm:px-8 sm:py-10 md:px-12"
      noValidate
    >
      {submitted ? (
        <p className="w-full rounded-2xl bg-verde-100 px-4 py-3 text-center text-sm font-medium text-verde-escuro-500 sm:text-base">
          Sua resposta já foi enviada. A comissão julgadora recebe apenas uma inscrição por CPF.
        </p>
      ) : null}
      <Field
        id="concurso-nome"
        label="Nome:"
        value={fullName}
        onChange={setFullName}
        placeholder="Seu Nome"
        autoComplete="name"
        disabled={submitted}
      />
      <Field
        id="concurso-email"
        label="E-mail:"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="email@email.com.br"
        autoComplete="email"
        disabled={submitted}
      />
      <Field
        id="concurso-celular"
        label="Celular:"
        type="tel"
        value={phone}
        onChange={(v) => setPhone(formatPhoneBR(v))}
        placeholder="(11) 99999-9999"
        autoComplete="tel"
        inputMode="tel"
        disabled={submitted}
      />
      {submitted ? null : (
        <div className="flex w-full flex-col gap-2">
          <Field
            id="concurso-cpf"
            label="CPF:"
            value={cpf}
            onChange={(v) => {
              setCpf(formatCpf(v));
              setError("");
            }}
            placeholder="000.000.000-00"
            autoComplete="off"
            inputMode="numeric"
          />
          <p className="px-4 text-sm leading-snug text-muted">
            Só é permitida uma resposta por CPF, conforme o regulamento.
          </p>
          {cpfTaken ? (
            <p className="px-4 text-sm font-medium text-red-600" role="alert">
              Este CPF já possui uma inscrição. Só é permitida uma resposta por CPF.
            </p>
          ) : null}
        </div>
      )}

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="concurso-resposta" className="px-4 text-base font-medium text-verde-escuro-500 sm:text-lg">
          Resposta:
        </label>
        <div className="relative">
          <textarea
            id="concurso-resposta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, CONCURSO_ANSWER_MAX))}
            maxLength={CONCURSO_ANSWER_MAX}
            rows={8}
            placeholder={config.formQuestion}
            disabled={submitted}
            className={inputClassName("min-h-[220px] resize-y py-4 disabled:cursor-not-allowed disabled:opacity-80")}
          />
          <p className="pointer-events-none absolute bottom-3 right-6 text-sm text-verde-300">
            {answer.length}/{CONCURSO_ANSWER_MAX} caracteres
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-1 sm:px-4">
        <CheckRow
          id="concurso-regras"
          checked={acceptedRules}
          onChange={setAcceptedRules}
          disabled={submitted}
        >
          {config.formConsentRulesPrefix}{" "}
          <ConcursoRegulamentoLink className="inline font-semibold text-verde-escuro-500 underline underline-offset-2">
            {config.formConsentLinkLabel}
          </ConcursoRegulamentoLink>
          .
        </CheckRow>
        <CheckRow
          id="concurso-dados"
          checked={acceptedData}
          onChange={setAcceptedData}
          disabled={submitted}
        >
          {config.formConsentData}
        </CheckRow>
      </div>

      {error ? (
        <p className="w-full text-center text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {submitted ? null : (
      <button
        type="submit"
        disabled={saving || cpfTaken}
        className="inline-flex min-h-12 w-full max-w-[520px] cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 py-3 text-center text-lg font-bold text-verde-escuro-500 shadow-paper transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl"
      >
        {saving ? "Enviando…" : config.formSubmitLabel}
      </button>
      )}
    </form>
    </>
  );
}

function inputClassName(extra = "") {
  return cn(
    "w-full rounded-block border-2 border-verde-300 bg-[#fcfcfb] px-6 text-base text-verde-escuro-500 placeholder:text-verde-300",
    "focus:border-verde-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-500",
    extra,
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="px-4 text-base font-medium text-verde-escuro-500 sm:text-lg">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        className={inputClassName("h-[52px] sm:h-[60px] disabled:cursor-not-allowed disabled:opacity-80")}
      />
    </div>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  disabled = false,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 sm:items-center sm:gap-4",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 size-7 shrink-0 rounded-lg border-2 border-verde-300 accent-verde-500 disabled:cursor-not-allowed"
      />
      <span className="text-left text-sm leading-snug text-foreground sm:text-base sm:leading-relaxed">
        {children}
      </span>
    </label>
  );
}
