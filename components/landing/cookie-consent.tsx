"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import {
  defaultPreferences,
  OPEN_COOKIE_PREFERENCES_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";
import { GBG_PRIVACY_URL } from "@/lib/landing-urls";

const EASE = [0.22, 1, 0.36, 1] as const;

interface LandingCookieConsentProps {
  privacyHref?: string;
}

export function LandingCookieConsent({
  privacyHref = GBG_PRIVACY_URL,
}: LandingCookieConsentProps) {
  const dialogTitleId = useId();
  const reducedMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<CookieConsentPreferences>(
    defaultPreferences(),
  );

  useEffect(() => {
    setMounted(true);
    const existing = readCookieConsent();
    if (existing) {
      setDraft(existing);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    function handleOpenPreferences() {
      const current = readCookieConsent() ?? defaultPreferences();
      setDraft(current);
      setShowModal(true);
    }

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showModal]);

  function persist(prefs: CookieConsentPreferences) {
    saveCookieConsent(prefs);
    setDraft(prefs);
    setShowBanner(false);
    setShowModal(false);
  }

  function acceptAll() {
    persist(defaultPreferences({ analytics: true, marketing: true }));
  }

  function acceptNecessaryOnly() {
    persist(defaultPreferences({ analytics: false, marketing: false }));
  }

  function savePreferences() {
    persist(defaultPreferences({ analytics: draft.analytics, marketing: draft.marketing }));
  }

  if (!mounted) return null;

  const instant = reducedMotion ? { duration: 0 } : undefined;

  return (
    <>
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.aside
            role="dialog"
            aria-labelledby={dialogTitleId}
            aria-live="polite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={instant ?? { duration: 0.35, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6"
          >
            <div className="mx-auto flex max-w-[920px] flex-col gap-4 rounded-[24px] border border-verde-200 bg-verde-100 p-5 shadow-[0_12px_40px_rgba(5,46,4,0.18)] sm:flex-row sm:items-center sm:gap-6 sm:p-6">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-verde-500 text-white">
                  <Cookie className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 space-y-1.5">
                  <h2
                    id={dialogTitleId}
                    className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl"
                  >
                    Sua privacidade importa
                  </h2>
                  <p className="text-sm leading-relaxed text-verde-escuro-capa/85 sm:text-base">
                    Usamos cookies necessários para o funcionamento da plataforma e,
                    com sua autorização, cookies analíticos e de marketing.
                    Saiba mais na nossa{" "}
                    <a
                      href={privacyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-verde-500 underline hover:text-verde-escuro-500"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:shrink-0 sm:min-w-[240px]">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex min-h-11 items-center justify-center rounded-pill bg-verde-escuro-500 px-5 py-2.5 text-sm font-semibold text-verde-100 transition-colors hover:bg-verde-500"
                >
                  Aceitar todos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(readCookieConsent() ?? defaultPreferences());
                    setShowModal(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-pill border border-verde-500/30 bg-white px-5 py-2.5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-white/80"
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={acceptNecessaryOnly}
                  className="text-center text-sm font-medium text-verde-escuro-500/80 underline-offset-2 hover:text-verde-escuro-500 hover:underline"
                >
                  Apenas necessários
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.button
              type="button"
              aria-label="Fechar preferências de cookies"
              className="fixed inset-0 z-[90] bg-verde-escuro-500/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={instant ?? { duration: 0.25 }}
              onClick={() => setShowModal(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${dialogTitleId}-modal`}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={instant ?? { duration: 0.28, ease: EASE }}
              className="fixed inset-x-4 top-[50%] z-[100] mx-auto max-h-[min(90vh,720px)] w-full max-w-[560px] -translate-y-1/2 overflow-y-auto rounded-[24px] border border-verde-200 bg-surface shadow-[0_20px_60px_rgba(5,46,4,0.2)] sm:inset-x-auto"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-verde-100 bg-surface px-5 py-4 sm:px-6">
                <h2
                  id={`${dialogTitleId}-modal`}
                  className="font-display text-xl font-bold text-verde-escuro-500"
                >
                  Preferências de cookies
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Fechar"
                  className="flex size-10 items-center justify-center rounded-xl text-verde-escuro-500 transition-colors hover:bg-verde-100"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                <p className="text-sm leading-relaxed text-muted sm:text-base">
                  Escolha quais categorias autorizar. Cookies necessários permanecem
                  ativos para autenticação, segurança e registro do seu consentimento.
                </p>

                <PreferenceCard
                  title="Necessários"
                  description="Essenciais para login, sessão e funcionamento básico da plataforma."
                  checked
                  disabled
                />

                <PreferenceCard
                  title="Analíticos"
                  description="Ajudam a entender como a plataforma é usada para melhorar a experiência."
                  checked={draft.analytics}
                  onChange={(checked) =>
                    setDraft((d) => ({ ...d, analytics: checked }))
                  }
                />

                <PreferenceCard
                  title="Marketing"
                  description="Permitem comunicações e personalização relacionadas à campanha."
                  checked={draft.marketing}
                  onChange={(checked) =>
                    setDraft((d) => ({ ...d, marketing: checked }))
                  }
                />

                <p className="text-xs leading-relaxed text-muted">
                  Consulte a{" "}
                  <a
                    href={privacyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-verde-500 underline hover:text-verde-escuro-500"
                  >
                    Política de Privacidade
                  </a>{" "}
                  para mais detalhes sobre bases legais e seus direitos sob a LGPD.
                </p>
              </div>

              <div className="flex flex-col gap-2 border-t border-verde-100 px-5 py-4 sm:flex-row sm:px-6">
                <button
                  type="button"
                  onClick={savePreferences}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-pill bg-verde-500 px-5 py-2.5 text-sm font-bold text-verde-100 transition-colors hover:bg-verde-400"
                >
                  Salvar preferências
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-pill border border-verde-500/30 bg-white px-5 py-2.5 text-sm font-semibold text-verde-escuro-500 transition-colors hover:bg-verde-100/60"
                >
                  Aceitar todos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function PreferenceCard({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-block border px-4 py-4",
        disabled
          ? "border-verde-200 bg-verde-100/40"
          : "border-verde-200 bg-verde-100/20",
      )}
    >
      <label
        className={cn(
          "flex items-start gap-3",
          disabled ? "cursor-default" : "cursor-pointer",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-1 size-5 shrink-0 rounded border border-verde-500/40 bg-[#f3fff0] accent-verde-500 disabled:opacity-70"
        />
        <span className="min-w-0">
          <span className="block font-semibold text-verde-escuro-500">{title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">
            {description}
          </span>
          {disabled ? (
            <span className="mt-2 inline-block text-xs font-medium uppercase tracking-wide text-verde-500">
              Sempre ativo
            </span>
          ) : null}
        </span>
      </label>
    </div>
  );
}
