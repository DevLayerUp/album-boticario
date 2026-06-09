import type { Metadata } from "next";
import { QuizForm } from "@/components/admin/quiz-form";

export const metadata: Metadata = { title: "Nova Pergunta" };

export default function NovoQuizPage() {
  return <QuizForm />;
}
