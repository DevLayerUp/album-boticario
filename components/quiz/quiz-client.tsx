"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { QuizCardShell } from "./quiz-card-shell";
import { QuizOptionRow, resolveOptionVisual } from "./quiz-option-row";
import {
  QuizAlreadyAnswered,
  QuizEmptyState,
  QuizLoadingState,
} from "./quiz-already-answered";

interface QuizOption {
  id: number;
  text: string;
}

interface Quiz {
  id: number;
  question: string;
  image_url: string | null;
  points: number;
  options: QuizOption[];
}

type PageState =
  | { type: "loading" }
  | { type: "available"; quiz: Quiz }
  | { type: "no_quiz" }
  | { type: "answered" }
  | {
      type: "result";
      quiz: Quiz;
      is_correct: boolean;
      correct_option_id: number | null;
      packs_earned: number;
      selected_option_id: number;
      redeemed: boolean;
    };

interface QuizClientProps {
  packImageUrl: string;
}

function useCountdownParts() {
  const [parts, setParts] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      setParts({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    }
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

function rewardLabel(points: number) {
  const n = Math.max(1, points);
  return `Acerte e Ganhe ${n} pacotinho${n > 1 ? "s" : ""}`;
}

/** Largura responsiva dos pacotinhos na tela de recompensa (proporção 392×560). */
function packRewardSizeClass(count: number) {
  if (count <= 1) {
    return "w-[72px] sm:w-[88px] lg:w-[100px] xl:w-[110px] 2xl:w-[266px]";
  }
  if (count === 2) {
    return "w-[64px] sm:w-[76px] lg:w-[88px] 2xl:w-[220px]";
  }
  return "w-[56px] sm:w-[64px] lg:w-[72px] 2xl:w-[180px]";
}

const QUIZ_BTN =
  "rounded-pill bg-verde-500 px-5 py-1.5 text-sm font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-6 sm:py-2 sm:text-base lg:text-lg 2xl:px-10 2xl:text-2xl";

const QUIZ_SECTION_GAP = "space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-10";
const QUIZ_QUESTION_TEXT =
  "text-center text-base leading-snug text-white sm:text-lg md:text-xl lg:text-2xl 2xl:text-[40px]";
const QUIZ_RESULT_TITLE = "text-lg sm:text-xl md:text-2xl lg:text-[28px] 2xl:text-[40px]";
const QUIZ_RESULT_SUBTITLE = "text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-[32px]";

export function QuizClient({ packImageUrl }: QuizClientProps) {
  const [state, setState] = useState<PageState>({ type: "loading" });
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const countdown = useCountdownParts();

  const loadQuiz = useCallback(async () => {
    setState({ type: "loading" });
    setSelected(null);
    const res = await fetch("/api/quiz/daily");
    const data = await res.json();

    if (data.already_answered) {
      setState({ type: "answered" });
    } else if (data.no_quiz_available) {
      setState({ type: "no_quiz" });
    } else if (data.quiz) {
      setState({ type: "available", quiz: data.quiz });
    } else {
      setState({ type: "no_quiz" });
    }
  }, []);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  async function handleSubmit() {
    if (!selected || state.type !== "available") return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: state.quiz.id, option_id: selected }),
      });
      const data = (await res.json()) as {
        is_correct?: boolean;
        correct_option_id?: number | null;
        packs_earned?: number;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (data.code === "already_answered") {
          setState({ type: "answered" });
          return;
        }
        if (data.code === "invalid_option") {
          setSubmitError("As alternativas foram atualizadas. Recarregando…");
          await loadQuiz();
          return;
        }
        setSubmitError(data.error ?? "Não foi possível enviar a resposta.");
        return;
      }

      setState({
        type: "result",
        quiz: state.quiz,
        is_correct: data.is_correct ?? false,
        correct_option_id: data.correct_option_id ?? null,
        packs_earned: data.packs_earned ?? 0,
        selected_option_id: selected,
        redeemed: false,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseWrong() {
    setState({ type: "answered" });
  }

  function handleRedeem() {
    if (state.type !== "result" || !state.is_correct) return;
    setState({ ...state, redeemed: true });
  }

  return (
    <div className="mx-auto w-full max-w-[1112px] space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-10">
      <header className="max-w-[686px] space-y-2 sm:space-y-3 lg:space-y-4 2xl:space-y-6">
        <h1 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-3xl lg:text-4xl 2xl:text-[48px]">
          Quiz do Dia
        </h1>
        <p className="text-sm leading-relaxed text-black sm:text-base lg:text-lg 2xl:text-[26px]">
          Responda 1 pergunta por dia e ganhe pacotinhos de figurinhas para
          completar seu álbum ou trocar.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {state.type === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizLoadingState />
          </motion.div>
        )}

        {state.type === "no_quiz" && (
          <motion.div key="no_quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizEmptyState />
          </motion.div>
        )}

        {state.type === "answered" && (
          <motion.div key="answered" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizAlreadyAnswered countdown={countdown} />
          </motion.div>
        )}

        {state.type === "available" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizCardShell rewardLabel={rewardLabel(state.quiz.points)}>
              <div className={QUIZ_SECTION_GAP}>
                {state.quiz.image_url ? (
                  <div className="mx-auto max-w-[180px] overflow-hidden rounded-xl border-2 border-white sm:max-w-[220px] lg:max-w-[260px] 2xl:max-w-md 2xl:rounded-2xl 2xl:border-4">
                    <Image
                      src={state.quiz.image_url}
                      alt="Imagem da pergunta"
                      width={500}
                      height={280}
                      className="h-auto max-h-[120px] w-full object-cover sm:max-h-[140px] lg:max-h-[160px] 2xl:max-h-none"
                    />
                  </div>
                ) : null}

                <p className={QUIZ_QUESTION_TEXT}>{state.quiz.question}</p>

                <div
                  role="radiogroup"
                  aria-label="Escolha uma opção"
                  className="mx-auto flex w-full max-w-[780px] flex-col gap-1.5 px-0 sm:gap-2 sm:px-4 lg:px-6"
                >
                  {state.quiz.options.map((opt) => (
                    <QuizOptionRow
                      key={opt.id}
                      text={opt.text}
                      visual={resolveOptionVisual(
                        opt.id,
                        selected,
                        null,
                        "question",
                      )}
                      onSelect={() => {
                        setSelected(opt.id);
                        setSubmitError(null);
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!selected || submitting}
                    className={`${QUIZ_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-5 animate-spin" aria-hidden />
                        Enviando…
                      </span>
                    ) : (
                      "Enviar resposta"
                    )}
                  </button>
                  {submitError ? (
                    <p className="mt-2 text-center text-xs text-red-200 sm:text-sm" role="alert">
                      {submitError}
                    </p>
                  ) : null}
                </div>
              </div>
            </QuizCardShell>
          </motion.div>
        )}

        {state.type === "result" && state.is_correct && !state.redeemed && (
          <motion.div key="result-correct" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizCardShell rewardLabel={rewardLabel(state.quiz.points)}>
              <div className={QUIZ_SECTION_GAP}>
                <div className="space-y-1 text-center text-white sm:space-y-1.5 2xl:space-y-2">
                  <p className={QUIZ_RESULT_TITLE}>
                    <span aria-hidden>🎉 </span>
                    <span className="font-bold">Resposta correta!</span>
                  </p>
                  <p className={QUIZ_RESULT_SUBTITLE}>
                    Você ganhou{" "}
                    <span className="font-bold">
                      {state.packs_earned} pacotinho
                      {state.packs_earned !== 1 ? "s" : ""}!
                    </span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <button type="button" onClick={handleRedeem} className={QUIZ_BTN}>
                    Resgatar Pacotinhos
                  </button>
                </div>

                <div className="mx-auto flex w-full max-w-[780px] flex-col gap-1.5 px-0 sm:gap-2 sm:px-4 lg:px-6" role="list">
                  {state.quiz.options.map((opt) => (
                    <QuizOptionRow
                      key={opt.id}
                      text={opt.text}
                      visual={resolveOptionVisual(
                        opt.id,
                        state.selected_option_id,
                        state.correct_option_id,
                        "result",
                      )}
                      disabled
                    />
                  ))}
                </div>
              </div>
            </QuizCardShell>
          </motion.div>
        )}

        {state.type === "result" && state.is_correct && state.redeemed && (
          <motion.div key="result-redeemed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizCardShell rewardLabel={rewardLabel(state.quiz.points)}>
              <div className="flex flex-col items-center gap-4 sm:gap-5 lg:gap-6 2xl:gap-16">
                <div className="space-y-1 text-center text-white sm:space-y-1.5 2xl:space-y-2">
                  <p className={QUIZ_RESULT_TITLE}>
                    <span aria-hidden>🎉 </span>
                    <span className="font-bold">Resposta correta!</span>
                  </p>
                  <p className={QUIZ_RESULT_SUBTITLE}>
                    Você ganhou{" "}
                    <span className="font-bold">
                      {state.packs_earned} pacotinho
                      {state.packs_earned !== 1 ? "s" : ""}!
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-5 2xl:gap-16">
                  {(() => {
                    const visiblePacks = Math.min(state.packs_earned, 4);
                    const sizeClass = packRewardSizeClass(visiblePacks);
                    return Array.from({ length: visiblePacks }, (_, i) => (
                      <div
                        key={i}
                        className={`relative aspect-[392/560] shrink-0 ${sizeClass}`}
                      >
                        <Image
                          src={packImageUrl}
                          alt={`Pacotinho ${i + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 110px, 266px"
                          unoptimized={packImageUrl.endsWith(".gif")}
                        />
                      </div>
                    ));
                  })()}
                </div>

                <Link href="/pacotinhos" className={QUIZ_BTN}>
                  Ver meus Pacotinhos
                </Link>
              </div>
            </QuizCardShell>
          </motion.div>
        )}

        {state.type === "result" && !state.is_correct && (
          <motion.div key="result-wrong" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizCardShell rewardLabel={rewardLabel(state.quiz.points)}>
              <div className={QUIZ_SECTION_GAP}>
                <div className="space-y-1 text-center text-white sm:space-y-1.5 2xl:space-y-2">
                  <p className={QUIZ_RESULT_TITLE}>
                    <span aria-hidden>❌ </span>
                    <span className="font-bold">Resposta errada!</span>
                  </p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-[32px]">
                    Aguarde o próximo Quiz para conquistar pacotinhos e completar
                    seu álbum.
                  </p>
                </div>

                <div className="mx-auto flex w-full max-w-[780px] flex-col gap-1.5 px-0 sm:gap-2 sm:px-4 lg:px-6" role="list">
                  {state.quiz.options.map((opt) => (
                    <QuizOptionRow
                      key={opt.id}
                      text={opt.text}
                      visual={resolveOptionVisual(
                        opt.id,
                        state.selected_option_id,
                        state.correct_option_id,
                        "result",
                      )}
                      disabled
                    />
                  ))}
                </div>

                <div className="flex justify-center">
                  <button type="button" onClick={handleCloseWrong} className={QUIZ_BTN}>
                    Fechar Quiz
                  </button>
                </div>
              </div>
            </QuizCardShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
