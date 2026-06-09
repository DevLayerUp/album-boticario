"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Brain, CheckCircle, XCircle, Clock, Package, Loader2 } from "lucide-react";

interface QuizOption { id: number; text: string }
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
  | { type: "answered"; was_correct: boolean }
  | { type: "result"; is_correct: boolean; correct_option_id: number | null; packs_earned: number; selected_option_id: number };

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h  = Math.floor(diff / 3_600_000);
      const m  = Math.floor((diff % 3_600_000) / 60_000);
      const s  = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    }
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export function QuizClient() {
  const [state, setState]           = useState<PageState>({ type: "loading" });
  const [selected, setSelected]     = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const countdown = useCountdown();

  const loadQuiz = useCallback(async () => {
    setState({ type: "loading" });
    const res  = await fetch("/api/quiz/daily");
    const data = await res.json();

    if (data.already_answered) {
      setState({ type: "answered", was_correct: data.was_correct });
    } else if (data.no_quiz_available) {
      setState({ type: "no_quiz" });
    } else if (data.quiz) {
      setState({ type: "available", quiz: data.quiz });
    } else {
      setState({ type: "no_quiz" });
    }
  }, []);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  async function handleSubmit() {
    if (!selected || state.type !== "available") return;
    setSubmitting(true);
    try {
      const res  = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: state.quiz.id, option_id: selected }),
      });
      const data = await res.json();
      setState({
        type:              "result",
        is_correct:        data.is_correct,
        correct_option_id: data.correct_option_id,
        packs_earned:      data.packs_earned ?? 0,
        selected_option_id: selected,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gb-green/10">
          <Brain className="text-gb-green" size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-gb-ink">Quiz do Dia</h1>
          <p className="text-sm text-gray-500">Uma pergunta por dia · acerte e ganhe pacotinhos</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* LOADING */}
        {state.type === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gb-green" size={32} />
          </motion.div>
        )}

        {/* NO QUIZ */}
        {state.type === "no_quiz" && (
          <motion.div key="no_quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm"
          >
            <Brain className="mx-auto mb-3 text-gray-300" size={40} />
            <h2 className="font-display text-lg font-semibold text-gb-ink">Nenhum quiz disponível</h2>
            <p className="mt-1 text-sm text-gray-500">
              O admin ainda não cadastrou perguntas. Volte em breve!
            </p>
          </motion.div>
        )}

        {/* ALREADY ANSWERED TODAY */}
        {state.type === "answered" && (
          <motion.div key="answered" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm"
          >
            {state.was_correct ? (
              <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
            ) : (
              <XCircle className="mx-auto mb-3 text-red-400" size={40} />
            )}
            <h2 className="font-display text-lg font-semibold text-gb-ink">
              {state.was_correct ? "Você acertou hoje! 🎉" : "Você respondeu hoje"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {state.was_correct
                ? "Seus pacotinhos foram adicionados à sua conta."
                : "Não foi dessa vez. Tente novamente amanhã!"}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-medium text-gray-600">
              <Clock size={15} />
              Próximo quiz em: <span className="font-semibold text-gb-ink">{countdown}</span>
            </div>
            {state.was_correct && (
              <Link
                href="/pacotinhos"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gb-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark"
              >
                <Package size={15} /> Ver pacotinhos
              </Link>
            )}
          </motion.div>
        )}

        {/* QUIZ AVAILABLE */}
        {state.type === "available" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            {/* Reward badge */}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Pergunta de hoje
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-gb-green/10 px-2.5 py-1 text-xs font-semibold text-gb-green">
                <Package size={12} />
                {state.quiz.points} pacotinho{state.quiz.points > 1 ? "s" : ""} em jogo
              </span>
            </div>

            {/* Question image */}
            {state.quiz.image_url && (
              <div className="mb-4 overflow-hidden rounded-xl">
                <Image
                  src={state.quiz.image_url}
                  alt="Imagem da pergunta"
                  width={500}
                  height={220}
                  className="h-44 w-full object-cover"
                />
              </div>
            )}

            {/* Question */}
            <h2 className="mb-5 font-display text-lg font-semibold leading-snug text-gb-ink">
              {state.quiz.question}
            </h2>

            {/* Options — use radiogroup for better screen reader semantics */}
            <div role="radiogroup" aria-label="Escolha uma opção" className="space-y-2.5">
              {state.quiz.options.map((opt) => (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={selected === opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                    selected === opt.id
                      ? "border-gb-green bg-gb-green/5 text-gb-green"
                      : "border-border text-gb-ink hover:border-gb-green/40 hover:bg-gb-green/5"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mr-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${
                      selected === opt.id ? "border-gb-green bg-gb-green text-white" : "border-gray-300"
                    }`}
                  >
                    {selected === opt.id ? "✓" : ""}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              aria-disabled={!selected || submitting}
              className="mt-5 w-full rounded-xl bg-gb-green py-3 text-sm font-semibold text-white transition hover:bg-gb-green-dark disabled:opacity-40"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" aria-hidden size={16} /> Enviando…
                </span>
              ) : "Responder"}
            </button>
          </motion.div>
        )}

        {/* RESULT */}
        {state.type === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm"
          >
            {state.is_correct ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="mx-auto mb-3 text-green-500" size={52} />
                </motion.div>
                <h2 className="font-display text-2xl font-semibold text-gb-ink">Correto! 🎉</h2>
                <p className="mt-2 text-gray-500">
                  Você ganhou{" "}
                  <strong className="text-gb-ink">
                    {state.packs_earned} pacotinho{state.packs_earned > 1 ? "s" : ""}
                  </strong>
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/pacotinhos"
                    className="flex items-center gap-2 rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark"
                  >
                    <Package size={15} /> Abrir pacotinhos
                  </Link>
                  <Link
                    href="/album"
                    className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Ver álbum
                  </Link>
                </div>
              </>
            ) : (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5 }}>
                  <XCircle className="mx-auto mb-3 text-red-400" size={52} />
                </motion.div>
                <h2 className="font-display text-2xl font-semibold text-gb-ink">Ops! Não foi dessa vez</h2>
                {state.correct_option_id && (
                  <p className="mt-2 text-sm text-gray-500">
                    A resposta correta era:{" "}
                    {/* We'd need to look up the text — show id for now or fetch */}
                    <strong className="text-gb-ink">
                      {/* try to find from context – on submit we should store option text */}
                      a opção selecionada estava incorreta
                    </strong>
                  </p>
                )}
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-medium text-gray-600">
                  <Clock size={15} />
                  Próximo quiz em: <span className="font-semibold text-gb-ink">{countdown}</span>
                </div>
                <Link
                  href="/missoes"
                  className="mt-4 inline-block text-sm text-gb-green underline"
                >
                  Ver missões disponíveis
                </Link>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
