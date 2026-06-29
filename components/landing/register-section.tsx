"use client";

import { LandingImage } from "@/components/landing/landing-image";
import { GBG_PRIVACY_URL } from "@/lib/landing-urls";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveLandingSignupDraft } from "@/lib/landing-signup";
import { submitLandingLead } from "@/lib/submit-landing-lead";

export interface LandingRegisterProps {
  backgroundUrl?:        string | null;
  heading?:              string;
  paragraph1?:           string;
  paragraph1Highlight?:  string;
  paragraph2?:           string;
  formTitle?:            string;
  ctaLabel?:             string;
  privacyUrl?:           string;
}

function renderWithHighlight(text: string, highlight: string) {
  if (!highlight || !text) return <>{text}</>;
  const idx = text.indexOf(highlight);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold">{highlight}</strong>
      {text.slice(idx + highlight.length)}
    </>
  );
}

export function LandingRegister({
  backgroundUrl,
  heading             = "Entre para o nosso Fandom agora!",
  paragraph1          = "Cadastre-se, faça parte do maior fã-clube da natureza e libere o seu acesso ao nosso álbum digital.",
  paragraph1Highlight = "acesso ao nosso álbum digital",
  paragraph2          = "Bora abrir seus primeiros pacotinhos e começar uma jornada cheia de espécies incríveis, curiosidades e desafios?",
  formTitle,
  ctaLabel            = "Comece a colecionar agora!",
  privacyUrl          = GBG_PRIVACY_URL,
}: LandingRegisterProps) {
  return (
    <section
      id="registro"
      className="relative overflow-hidden bg-verde-escuro-500 py-16 md:py-20 lg:py-24"
      aria-label="Cadastro"
    >
      {backgroundUrl && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <LandingImage
            src={backgroundUrl}
            alt=""
            fill
            className="object-cover opacity-50"
            sizes="100vw"
          />
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -right-[28%] bottom-[-18%] h-[min(110vw,920px)] w-[min(130vw,1100px)] rounded-full bg-verde-500/25 mix-blend-hard-light blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1680px] px-6 md:px-12 2xl:px-[120px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 xl:flex-row xl:items-center xl:justify-between xl:gap-12 2xl:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full min-w-0 flex-col gap-8 text-center xl:max-w-[754px] xl:gap-[82px] xl:text-left"
          >
            <h2 className="font-display text-[2rem] font-bold leading-[1.12] text-amarelo sm:text-[2.75rem] md:text-5xl lg:text-[3.25rem] lg:leading-[1.1] xl:text-[68px] xl:leading-[76px]">
              {heading}
            </h2>

            <div className="space-y-5 text-white sm:space-y-6">
              {paragraph1 && (
                <p className="text-lg leading-[1.35] sm:text-xl md:text-2xl md:leading-[34px] lg:text-[26px]">
                  {renderWithHighlight(paragraph1, paragraph1Highlight)}
                </p>
              )}
              {paragraph2 && (
                <p className="text-base leading-[1.45] text-white/90 sm:text-lg md:text-xl lg:text-[22px] lg:leading-[30px]">
                  {paragraph2}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[544px] shrink-0"
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

interface RegisterFormProps {
  formTitle?: string;
  ctaLabel:   string;
  privacyUrl: string;
}

function RegisterForm({ formTitle, ctaLabel, privacyUrl }: RegisterFormProps) {
  const router = useRouter();

  const [nome,      setNome]      = useState("");
  const [email,     setEmail]     = useState("");
  const [estado,    setEstado]    = useState("");
  const [cidade,    setCidade]    = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [privacy,   setPrivacy]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) { setError("Informe seu nome completo."); return; }
    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("E-mail inválido.");
      return;
    }
    if (!privacy) {
      setError("Aceite a Política de Privacidade para continuar.");
      return;
    }

    setLoading(true);

    try {
      const draft = {
        email: email.trim(),
        name: nome.trim(),
        estado: estado.trim() || undefined,
        cidade: cidade.trim() || undefined,
        birthDate: birthDate || undefined,
        newsletter: true,
      };

      await submitLandingLead({
        name: draft.name,
        email: draft.email,
        estado: draft.estado,
        cidade: draft.cidade,
        birthDate: draft.birthDate,
        newsletterOptIn: draft.newsletter,
        privacyAccepted: true,
      });

      saveLandingSignupDraft(draft);
      router.push("/register/senha");
    } catch {
      setError("Não foi possível continuar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[24px] bg-verde-100 px-6 py-10 md:px-6 md:py-10">
      {formTitle?.trim() ? (
        <h3 className="mb-8 text-center font-display text-xl font-bold leading-tight text-verde-escuro-500 sm:text-2xl">
          {formTitle}
        </h3>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <FormField
            id="reg-nome"
            label="Nome completo"
            type="text"
            value={nome}
            onChange={setNome}
            placeholder="Seu Nome"
            autoComplete="name"
            required
          />
          <FormField
            id="reg-email"
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="email@email.com.br"
            autoComplete="email"
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
            <FormField
              id="reg-estado"
              label="Estado"
              type="text"
              value={estado}
              onChange={setEstado}
              placeholder="Inserir texto"
              autoComplete="address-level1"
            />
            <FormField
              id="reg-cidade"
              label="Cidade"
              type="text"
              value={cidade}
              onChange={setCidade}
              placeholder="Inserir texto"
              autoComplete="address-level2"
            />
          </div>
          <FormField
            id="reg-nascimento"
            label="Data de Nascimento"
            type="date"
            value={birthDate}
            onChange={setBirthDate}
            autoComplete="bday"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            required
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border border-verde-500/40 bg-[#f3fff0] accent-verde-500"
          />
          <span className="text-left text-sm leading-[1.4] text-black sm:text-base">
            Ao prosseguir você estará ciente de que os dados informados serão tratados de acordo com a{" "}
            <a
              href={privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-verde-escuro-500"
            >
              Política de Privacidade do Grupo Boticário
            </a>
            *
          </span>
        </label>

        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 self-center rounded-pill bg-verde-500 px-[34px] py-3 text-lg font-bold text-verde-100 transition-colors hover:bg-verde-400 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl lg:text-2xl lg:leading-[1.4]"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {ctaLabel}
          </button>

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-pill border border-verde-500 bg-transparent px-[34px] py-3 text-center text-lg font-medium text-verde-escuro-500 transition-colors hover:bg-verde-500/10 sm:text-xl"
          >
            Já tenho cadastro
          </Link>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  id:           string;
  label:        string;
  type:         string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?:    boolean;
}

function FormField({
  id, label, type, value, onChange, placeholder, autoComplete, required,
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
        className="rounded-pill border border-verde-500 bg-[#f3fff0] px-6 py-[10px] text-base leading-[1.4] text-verde-escuro-500 outline-none transition placeholder:text-verde-300 focus:ring-2 focus:ring-verde-500/30 sm:text-lg lg:text-[22px] lg:leading-[30px]"
      />
    </div>
  );
}
