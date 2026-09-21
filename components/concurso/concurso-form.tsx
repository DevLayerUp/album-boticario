"use client";

import { useState } from "react";
import {
  CONCURSO_ANSWER_MAX,
  CONCURSO_ANSWER_MIN,
  formatCpf,
  isValidCpf,
  type ContestEntry,
} from "@/lib/concurso";
import {
  resolveConcursoRegulamentoUrl,
  type ConcursoPageConfig,
} from "@/lib/concurso-page";
import { formatPhoneBR, isValidPhoneBR } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { ConcursoConfirmCard, ConcursoConfirmModal } from "./concurso-confirm-modal";

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
  const [fullName, setFullName] = useState(prefill.fullName);
  const [email, setEmail] = useState(prefill.email);
  const [phone, setPhone] = useState(prefill.phone);
  const [cpf, setCpf] = useState("");
  const [answer, setAnswer] = useState(initialEntry?.answer ?? "");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState<ContestEntry | null>(initialEntry);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const regulamentoUrl = resolveConcursoRegulamentoUrl(config);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  if (entry) {
    return showConfirmModal ? (
      <ConcursoConfirmModal config={config} onClose={() => setShowConfirmModal(false)} />
    ) : (
      <ConcursoConfirmCard config={config} />
    );
  }

  if (!open) {
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
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center gap-8 rounded-[40px] bg-white px-5 py-8 shadow-paper sm:px-8 sm:py-10 md:px-12"
      noValidate
    >
      <Field
        id="concurso-nome"
        label="Nome:"
        value={fullName}
        onChange={setFullName}
        placeholder="Seu Nome"
        autoComplete="name"
      />
      <Field
        id="concurso-email"
        label="E-mail:"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="email@email.com.br"
        autoComplete="email"
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
      />
      <Field
        id="concurso-cpf"
        label="CPF:"
        value={cpf}
        onChange={(v) => setCpf(formatCpf(v))}
        placeholder="000.000.000-00"
        autoComplete="off"
        inputMode="numeric"
      />

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
            className={inputClassName("min-h-[220px] resize-y py-4")}
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
        >
          {config.formConsentRulesPrefix}{" "}
          <a
            href={regulamentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-verde-escuro-500 underline underline-offset-2"
          >
            {config.formConsentLinkLabel}
          </a>
          .
        </CheckRow>
        <CheckRow
          id="concurso-dados"
          checked={acceptedData}
          onChange={setAcceptedData}
        >
          {config.formConsentData}
        </CheckRow>
      </div>

      {error ? (
        <p className="w-full text-center text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex min-h-12 w-full max-w-[520px] cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 py-3 text-center text-lg font-bold text-verde-escuro-500 shadow-paper transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl"
      >
        {saving ? "Enviando…" : config.formSubmitLabel}
      </button>
    </form>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
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
        className={inputClassName("h-[52px] sm:h-[60px]")}
      />
    </div>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 sm:items-center sm:gap-4">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-7 shrink-0 cursor-pointer rounded-lg border-2 border-verde-300 accent-verde-500"
      />
      <span className="text-left text-sm leading-snug text-foreground sm:text-base sm:leading-relaxed">
        {children}
      </span>
    </label>
  );
}
