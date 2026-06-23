"use client";

import { LandingImage } from "@/components/landing/landing-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveLandingSignupDraft } from "@/lib/landing-signup";

export interface LandingRegisterProps {
  backgroundUrl?: string | null;
  heading?:       string;
  paragraph1?:    string;
  paragraph2?:    string;
  formTitle?:     string;
  ctaLabel?:      string;
  privacyUrl?:    string;
}

export function LandingRegister({
  backgroundUrl,
  heading    = "Comece sua coleção agora",
  paragraph1 = "Cadastre-se para acessar o álbum digital Colecionando Natureza, abrir seus primeiros pacotinhos e começar uma jornada cheia de espécies incríveis, curiosidades e desafios.",
  paragraph2 = "Preencha seus dados para receber acesso ao álbum digital e fazer parte da comunidade de Fãs por Natureza.",
  formTitle  = "Preencha o formulário e comece a colecionar",
  ctaLabel   = "Comece a colecionar agora!",
  privacyUrl = "/privacidade",
}: LandingRegisterProps) {
  return (
    <section
      id="registro"
      className="relative overflow-hidden bg-verde-escuro-500 py-16 md:py-24"
      aria-label="Cadastro"
    >
      {/* Background pattern */}
      {backgroundUrl && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <LandingImage
            src={backgroundUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="grid grid-cols-12 items-center gap-y-12 lg:gap-6">

          {/* ── Left: text ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex flex-col gap-6 lg:col-span-6"
          >
            <h2 className="font-display text-[32px] font-bold leading-tight text-white sm:text-[36px] md:text-[40px] lg:text-[44px] xl:text-[48px] xl:leading-[1.4]">
              {heading}
            </h2>
            <div className="space-y-4 text-base leading-[1.6] text-white/85 sm:text-lg md:text-lg lg:text-xl xl:text-[22px] xl:leading-[30px]">
              {paragraph1 && <p>{paragraph1}</p>}
              {paragraph2 && <p>{paragraph2}</p>}
            </div>
          </motion.div>

          {/* ── Right: form card ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-5 lg:col-start-8"
          >
            <RegisterForm
              formTitle={formTitle}
              ctaLabel={ctaLabel}
              privacyUrl={privacyUrl}
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ── Register form ─────────────────────────────────────────────────── */
interface RegisterFormProps {
  formTitle:  string;
  ctaLabel:   string;
  privacyUrl: string;
}

function RegisterForm({ formTitle, ctaLabel, privacyUrl }: RegisterFormProps) {
  const router = useRouter();

  const [nome,    setNome]    = useState("");
  const [email,   setEmail]   = useState("");
  const [cidade,  setCidade]  = useState("");
  const [idade,   setIdade]   = useState("");
  const [privacy,     setPrivacy]     = useState(false);
  const [newsletter,  setNewsletter]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nome.trim())  { setError("Informe seu nome."); return; }
    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("E-mail inválido.");
      return;
    }
    if (!privacy) { setError("Aceite a Política de Privacidade para continuar."); return; }

    setLoading(true);

    try {
      saveLandingSignupDraft({
        email: email.trim(),
        name: nome.trim(),
        cidade: cidade.trim() || undefined,
        idade: idade.trim() || undefined,
        newsletter,
      });
      router.push("/register/senha");
    } catch {
      setError("Não foi possível continuar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card bg-verde-100 px-6 py-10 md:px-8 md:py-10">
      {/* Form heading */}
      <h3 className="mb-8 text-center font-display text-xl font-bold leading-tight text-verde-escuro-500 sm:text-2xl md:text-[26px] lg:text-2xl">
        {formTitle}
      </h3>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
        {/* Fields */}
        <div className="flex flex-col gap-4">
          <FormField
            id="reg-nome"
            label="Nome:"
            type="text"
            value={nome}
            onChange={setNome}
            placeholder="Seu Nome"
            autoComplete="name"
            required
          />
          <FormField
            id="reg-email"
            label="E-mail:"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="email@email.com.br"
            autoComplete="email"
            required
          />
          <FormField
            id="reg-cidade"
            label="Cidade:"
            type="text"
            value={cidade}
            onChange={setCidade}
            placeholder="Inserir texto"
            autoComplete="address-level2"
          />
          <FormField
            id="reg-idade"
            label="Idade:"
            type="number"
            value={idade}
            onChange={setIdade}
            placeholder="Inserir texto"
            inputMode="numeric"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-4 px-1">
          <label className="flex cursor-pointer items-center gap-4 text-sm text-foreground sm:text-base">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
              required
              className="size-5 shrink-0 cursor-pointer rounded-chip border border-verde-500 accent-verde-500"
            />
            <span className="leading-[1.4]">
              Li e aceito os termos da{" "}
              <Link
                href={privacyUrl}
                target="_blank"
                className="underline hover:text-verde-escuro-500"
              >
                Política de privacidade
              </Link>
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-4 text-sm text-foreground sm:text-base">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="size-5 shrink-0 cursor-pointer rounded-chip border border-verde-500 accent-verde-500"
            />
            <span className="leading-[1.4]">Aceito receber novidades.</span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-verde-500 px-8 py-3 text-lg font-bold text-verde-100 transition-colors hover:bg-verde-400 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {ctaLabel}
        </button>
      </form>
    </div>
  );
}

/* ── Reusable field ────────────────────────────────────────────────── */
interface FormFieldProps {
  id:           string;
  label:        string;
  type:         string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?:    boolean;
  inputMode?:   React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}

function FormField({
  id, label, type, value, onChange, placeholder, autoComplete, required, inputMode,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="px-4 text-base font-medium leading-[1.4] text-verde-escuro-500 sm:text-lg lg:text-[20px]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        className="rounded-pill border border-verde-500 bg-[#f3fff0] px-6 py-[10px] text-base leading-[1.4] text-verde-escuro-500 outline-none transition placeholder:text-verde-300 focus:ring-2 focus:ring-verde-500/30 sm:text-lg lg:text-xl lg:leading-[30px]"
      />
    </div>
  );
}
