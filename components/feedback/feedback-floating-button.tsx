"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeedbackToastOptional } from "@/components/ui/feedback-toast";
import {
  USER_FEEDBACK_MAX_LENGTH,
  USER_FEEDBACK_MIN_LENGTH,
  USER_FEEDBACK_TYPE_LABELS,
  USER_FEEDBACK_TYPES,
  type UserFeedbackType,
} from "@/lib/user-feedback";
import { cn } from "@/lib/utils";

export function FeedbackFloatingButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<UserFeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaId = useId();
  const feedbackToast = useFeedbackToastOptional();

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => {
      setMessage("");
      setType("suggestion");
      setSent(false);
      setError(null);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = message.trim();
    if (trimmed.length < USER_FEEDBACK_MIN_LENGTH) {
      setError(`Descreva com pelo menos ${USER_FEEDBACK_MIN_LENGTH} caracteres.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: trimmed }),
      });
      const payload = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(payload.error ?? "Não foi possível enviar.");
      }

      setSent(true);
      if (feedbackToast) {
        feedbackToast.showToast({
          message: "Obrigado! Seu feedback foi enviado.",
          variant: "success",
        });
      }
      window.setTimeout(() => close(), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="feedback-dialog"
        className={cn(
          "fixed z-30 flex size-14 cursor-pointer items-center justify-center rounded-full",
          "bg-verde-escuro-500 text-amarelo shadow-paper",
          "transition-transform duration-200 hover:brightness-110 active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-500",
          "right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:right-6 md:bottom-6",
        )}
        aria-label="Enviar feedback"
      >
        <MessageSquarePlus className="size-6" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 cursor-pointer bg-verde-escuro-500/35 backdrop-blur-[2px]"
            onClick={close}
          />

          <div
            ref={panelRef}
            id="feedback-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-card border border-verde-500/15 bg-surface shadow-paper",
              "transition-all duration-200",
            )}
          >
            <div className="border-b border-border bg-verde-100/60 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-escuro-300">
                    Sua opinião importa
                  </p>
                  <h2
                    id="feedback-dialog-title"
                    className="mt-1 text-lg font-bold text-verde-escuro-500"
                  >
                    Enviar feedback
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Conte o que podemos melhorar na sua experiência no álbum.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-500/10 hover:text-verde-escuro-500"
                  aria-label="Fechar formulário"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            {sent ? (
              <div className="px-5 py-10 text-center" role="status">
                <p className="text-base font-semibold text-verde-escuro-500">
                  Feedback enviado com sucesso!
                </p>
                <p className="mt-2 text-sm text-muted">
                  Obrigado por ajudar a melhorar o Fãs por Natureza.
                </p>
              </div>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5 px-5 py-5">
                <fieldset>
                  <legend className="mb-2.5 text-sm font-semibold text-gb-ink">
                    Tipo de feedback
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {USER_FEEDBACK_TYPES.map((option) => {
                      const selected = type === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setType(option)}
                          aria-pressed={selected}
                          className={cn(
                            "min-h-11 cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-200",
                            selected
                              ? "border-verde-500 bg-verde-500/10 text-verde-escuro-500"
                              : "border-border bg-surface text-muted hover:border-verde-500/40 hover:text-gb-ink",
                          )}
                        >
                          {USER_FEEDBACK_TYPE_LABELS[option]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={textareaId} className="text-sm font-semibold text-gb-ink">
                    Mensagem
                  </label>
                  <textarea
                    id={textareaId}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    maxLength={USER_FEEDBACK_MAX_LENGTH}
                    placeholder="Descreva sua experiência, sugestão ou problema com o máximo de detalhes possível…"
                    className={cn(
                      "w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-base text-gb-ink",
                      "placeholder:text-muted/70 transition-colors duration-200",
                      "focus:border-gb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-gb-green",
                      error && "border-red-500",
                    )}
                  />
                  <p className="text-xs text-muted">
                    {message.trim().length}/{USER_FEEDBACK_MAX_LENGTH} caracteres
                  </p>
                </div>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={close} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="yellow" loading={loading}>
                    Enviar feedback
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
