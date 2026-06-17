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
    <div className="mx-auto w-full max-w-[1112px] space-y-8 sm:space-y-10">
      <header className="max-w-[686px] space-y-4 sm:space-y-6">
        <h1 className="font-display text-3xl font-bold text-verde-escuro-500 sm:text-5xl lg:text-[48px]">
          Quiz do Dia
        </h1>
        <p className="text-lg leading-relaxed text-black sm:text-[26px]">
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
              <div className="space-y-8 sm:space-y-10">
                {state.quiz.image_url ? (
                  <div className="mx-auto max-w-md overflow-hidden rounded-2xl border-4 border-white">
                    <Image
                      src={state.quiz.image_url}
                      alt="Imagem da pergunta"
                      width={500}
                      height={280}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ) : null}

                <p className="text-center text-2xl leading-snug text-white sm:text-[40px]">
                  {state.quiz.question}
                </p>

                <div
                  role="radiogroup"
                  aria-label="Escolha uma opção"
                  className="mx-auto flex w-full max-w-[780px] flex-col gap-2 px-0 sm:gap-2 sm:px-6"
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

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!selected || submitting}
                    className="rounded-pill bg-verde-500 px-8 py-2 text-lg font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-10 sm:text-2xl"
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
                    <p className="mt-3 text-center text-sm text-red-200 sm:text-base" role="alert">
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
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-2 text-center text-white">
                  <p className="text-2xl sm:text-[40px]">
                    <span aria-hidden>🎉 </span>
                    <span className="font-bold">Resposta correta!</span>
                  </p>
                  <p className="text-xl sm:text-[32px]">
                    Você ganhou{" "}
                    <span className="font-bold">
                      {state.packs_earned} pacotinho
                      {state.packs_earned !== 1 ? "s" : ""}!
                    </span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleRedeem}
                    className="rounded-pill bg-verde-500 px-8 py-2 text-lg font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-10 sm:text-2xl"
                  >
                    Resgatar Pacotinhos
                  </button>
                </div>

                <div className="mx-auto flex w-full max-w-[780px] flex-col gap-2 px-0 sm:gap-2 sm:px-6" role="list">
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
              <div className="flex flex-col items-center gap-8 sm:gap-16">
                <div className="space-y-2 text-center text-white">
                  <p className="text-2xl sm:text-[40px]">
                    <span aria-hidden>🎉 </span>
                    <span className="font-bold">Resposta correta!</span>
                  </p>
                  <p className="text-xl sm:text-[32px]">
                    Você ganhou{" "}
                    <span className="font-bold">
                      {state.packs_earned} pacotinho
                      {state.packs_earned !== 1 ? "s" : ""}!
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-16">
                  {Array.from({ length: Math.min(state.packs_earned, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="relative h-[min(42vh,320px)] w-[min(42vw,266px)] overflow-hidden rounded-2xl border-[5px] border-white shadow-md"
                    >
                      <Image
                        src={packImageUrl}
                        alt={`Pacotinho ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="266px"
                        unoptimized={packImageUrl.endsWith(".gif")}
                      />
                    </div>
                  ))}
                </div>

                <Link
                  href="/pacotinhos"
                  className="rounded-pill bg-verde-500 px-8 py-2 text-lg font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-10 sm:text-2xl"
                >
                  Ver meus Pacotinhos
                </Link>
              </div>
            </QuizCardShell>
          </motion.div>
        )}

        {state.type === "result" && !state.is_correct && (
          <motion.div key="result-wrong" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizCardShell rewardLabel={rewardLabel(state.quiz.points)}>
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-2 text-center text-white">
                  <p className="text-2xl sm:text-[40px]">
                    <span aria-hidden>❌ </span>
                    <span className="font-bold">Resposta errada!</span>
                  </p>
                  <p className="text-lg sm:text-[32px]">
                    Aguarde o próximo Quiz para conquistar pacotinhos e completar
                    seu álbum.
                  </p>
                </div>

                <div className="mx-auto flex w-full max-w-[780px] flex-col gap-2 px-0 sm:gap-2 sm:px-6" role="list">
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
                  <button
                    type="button"
                    onClick={handleCloseWrong}
                    className="rounded-pill bg-verde-500 px-8 py-2 text-lg font-medium text-white shadow-paper transition-all duration-200 hover:bg-verde-600 active:scale-[0.98] sm:px-10 sm:text-2xl"
                  >
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
